import strawberry
import logging
import math
import polars as pl
from typing import List, Optional
from services.sales_data import fetch_sales_data, get_data_range_from_druid
from services.kpi_service import (
    calculate_revenue_summary,
    _ensure_time_is_datetime,
    calculate_monthly_sales_growth,
)
import asyncio
import httpx
import os
from datetime import date, timezone, datetime


def sanitize(val):
    """Sanitize values, converting None, inf, and nan to None"""
    if val is None or (isinstance(val, float) and (math.isinf(val) or math.isnan(val))):
        return None
    return val


def safe_float(val, default=0.0):
    """Convert value to float, returning default if None or invalid"""
    sanitized = sanitize(val)
    return sanitized if sanitized is not None else default


def safe_int(val, default=0):
    """Convert value to int, returning default if None or invalid"""
    sanitized = sanitize(val)
    if sanitized is None:
        return default
    try:
        return int(sanitized)
    except (ValueError, TypeError):
        return default


def log_empty_df(context: str, df, **filters):
    """Log warning if DataFrame is empty"""
    if df.is_empty():
        logging.warning(f"{context}: DataFrame is empty for filters: {filters}")
        return True
    return False


def log_missing_column(context: str, df, column: str, **filters):
    """Log warning if DataFrame is missing expected column"""
    if column not in df.columns:
        logging.warning(
            f"{context}: DataFrame missing column '{column}' for filters: {filters}"
        )
        return True
    return False


@strawberry.type
class MonthlySalesGrowth:
    date: str
    total_sales: Optional[float] = strawberry.field(name="totalSales")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")


@strawberry.type
class ProductPerformance:
    product: str
    sales: Optional[float] = 0.0


@strawberry.type
class BranchProductHeatmap:
    branch: str
    product: str
    sales: Optional[float] = 0.0


@strawberry.type
class BranchPerformance:
    branch: str
    total_sales: Optional[float] = strawberry.field(name="totalSales", default=0.0)
    transaction_count: int = strawberry.field(name="transactionCount", default=0)
    average_sale: Optional[float] = strawberry.field(name="averageSale", default=0.0)
    unique_customers: int = strawberry.field(name="uniqueCustomers", default=0)
    unique_products: int = strawberry.field(name="uniqueProducts", default=0)


@strawberry.type
class BranchGrowth:
    branch: str
    month_year: str = strawberry.field(name="monthYear")
    monthly_sales: Optional[float] = strawberry.field(name="monthlySales", default=0.0)
    growth_pct: Optional[float] = strawberry.field(name="growthPct", default=0.0)


@strawberry.type
class SalesPerformance:
    sales_person: str = strawberry.field(name="salesPerson")
    total_sales: Optional[float] = strawberry.field(name="totalSales", default=0.0)
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")
    avg_margin: Optional[float] = strawberry.field(name="avgMargin")
    transaction_count: int = strawberry.field(name="transactionCount", default=0)
    average_sale: Optional[float] = strawberry.field(name="averageSale", default=0.0)
    unique_branches: int = strawberry.field(name="uniqueBranches", default=0)
    unique_products: int = strawberry.field(name="uniqueProducts", default=0)


@strawberry.type
class ProductAnalytics:
    item_name: str = strawberry.field(name="itemName")
    product_line: str = strawberry.field(name="productLine")
    item_group: str = strawberry.field(name="itemGroup")
    total_sales: Optional[float] = strawberry.field(name="totalSales", default=0.0)
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")
    margin: Optional[float] = strawberry.field(name="margin")
    total_qty: Optional[float] = strawberry.field(name="totalQty", default=0.0)
    transaction_count: int = strawberry.field(name="transactionCount", default=0)
    unique_branches: int = strawberry.field(name="uniqueBranches", default=0)
    average_price: Optional[float] = strawberry.field(name="averagePrice", default=0.0)


@strawberry.type
class TargetAttainment:
    attainment_percentage: Optional[float] = strawberry.field(
        name="attainmentPercentage", default=0.0
    )
    total_sales: Optional[float] = strawberry.field(name="totalSales", default=0.0)
    target: Optional[float] = 0.0


@strawberry.type
class RevenueSummary:
    total_revenue: Optional[float] = strawberry.field(name="totalRevenue")
    net_sales: Optional[float] = strawberry.field(name="netSales")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")
    line_item_count: Optional[int] = strawberry.field(name="lineItemCount")
    returns_value: Optional[float] = strawberry.field(name="returnsValue")
    total_transactions: int = strawberry.field(name="totalTransactions", default=0)
    average_transaction: Optional[float] = strawberry.field(name="averageTransaction")
    unique_products: int = strawberry.field(name="uniqueProducts", default=0)
    unique_branches: int = strawberry.field(name="uniqueBranches", default=0)
    unique_employees: int = strawberry.field(name="uniqueEmployees", default=0)
    net_units_sold: Optional[float] = strawberry.field(name="netUnitsSold")


@strawberry.type
class ProfitabilityByDimension:
    branch: Optional[str] = None
    product_line: Optional[str] = None
    item_group: Optional[str] = None
    gross_margin: Optional[float] = strawberry.field(name="grossMargin")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")


@strawberry.type
class DataRange:
    earliest_date: str = strawberry.field(name="earliestDate")
    latest_date: str = strawberry.field(name="latestDate")
    total_records: int = strawberry.field(name="totalRecords")


@strawberry.type
class ReturnsAnalysisEntry:
    reason: str
    count: int = 0


@strawberry.type
class TopCustomerEntry:
    card_name: str = strawberry.field(name="cardName")
    sales_amount: Optional[float] = strawberry.field(name="salesAmount")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")


@strawberry.type
class BranchListEntry:
    branch: str


@strawberry.type
class MarginTrendEntry:
    date: str
    margin_pct: Optional[float] = strawberry.field(name="marginPct")


@strawberry.type
class DashboardData:
    """Composite type for all dashboard data blocks."""

    revenue_summary: RevenueSummary
    monthly_sales_growth: List[MonthlySalesGrowth]
    target_attainment: TargetAttainment
    product_performance: List[ProductPerformance]
    branch_product_heatmap: List[BranchProductHeatmap]
    top_customers: List[TopCustomerEntry]
    margin_trends: List[MarginTrendEntry]
    returns_analysis: List[ReturnsAnalysisEntry]
    profitability_by_dimension: List[ProfitabilityByDimension]
    branch_list: List[BranchListEntry]
    product_analytics: List[ProductAnalytics]


@strawberry.type
class Query:
    @staticmethod
    def _get_default_dates():
        """Get default date range (last 90 days)"""
        from datetime import date, timedelta

        today = date.today()
        start = today - timedelta(days=90)
        return start.isoformat(), today.isoformat()

    @strawberry.field
    async def monthly_sales_growth(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[MonthlySalesGrowth]:
        """Fetch monthly sales growth data"""
        if not all([start_date, end_date]):
            start_date, end_date = Query._get_default_dates()

        try:
            result = await calculate_monthly_sales_growth(
                start_date=start_date,
                end_date=end_date,
                branch=branch,
                product_line=product_line,
            )
            return [
                MonthlySalesGrowth(
                    date=row["date"],
                    total_sales=row["totalSales"],
                    gross_profit=row["grossProfit"],
                )
                for row in result
            ]
        except Exception as e:
            logging.error(f"Error in monthly_sales_growth: {e}")
            return []

    @strawberry.field
    async def profitability_by_dimension(
        self,
        dimension: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[ProfitabilityByDimension]:
        """Fetch profitability data by dimension (Branch, ProductLine, or ItemGroup)"""
        if not all([start_date, end_date]):
            start_date, end_date = Query._get_default_dates()

        try:
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                branch_names=[branch] if branch else None,
                item_groups=item_groups,
            )

            if df.is_empty():
                return []

            # Group by the requested dimension
            group_col = dimension
            if dimension == "Branch":
                group_col = "Branch"
            elif dimension == "ProductLine":
                group_col = "ProductLine"
            elif dimension == "ItemGroup":
                group_col = "ItemGroup"
            else:
                group_col = "Branch"  # Default fallback

            # Aggregate profitability metrics
            agg_df = (
                df.lazy()
                .group_by(group_col)
                .agg(
                    [
                        pl.sum("grossRevenue").alias("total_sales"),
                        (pl.sum("grossRevenue") - pl.sum("totalCost")).alias(
                            "gross_profit"
                        ),
                        (
                            (pl.sum("grossRevenue") - pl.sum("totalCost"))
                            / pl.sum("grossRevenue")
                        ).alias("gross_margin"),
                    ]
                )
                .collect()
            )

            result = []
            for row in agg_df.to_dicts():
                entry = ProfitabilityByDimension(
                    gross_profit=safe_float(row["gross_profit"]),
                    gross_margin=safe_float(row["gross_margin"]),
                )

                # Set the appropriate dimension field
                if dimension == "Branch":
                    entry.branch = row[group_col]
                elif dimension == "ProductLine":
                    entry.product_line = row[group_col]
                elif dimension == "ItemGroup":
                    entry.item_group = row[group_col]
                else:
                    entry.branch = row[group_col]

                result.append(entry)

            return result

        except Exception as e:
            logging.error(f"Error in profitability_by_dimension: {e}")
            return []

    @strawberry.field
    async def data_range(self) -> DataRange:
        """Get the available data range from Druid"""
        try:
            earliest_date, latest_date, total_records = (
                await get_data_range_from_druid()
            )

            def to_iso8601(date_val):
                if isinstance(date_val, str):
                    return date_val
                elif hasattr(date_val, "isoformat"):
                    return date_val.isoformat() + "Z"
                else:
                    return str(date_val)

            earliest_date = to_iso8601(earliest_date)
            latest_date = to_iso8601(latest_date)
            return DataRange(
                earliest_date=earliest_date,
                latest_date=latest_date,
                total_records=total_records,
            )
        except Exception as e:
            logging.error(f"Error getting data range: {e}")
            # Fallback to hardcoded values if Druid query fails
            return DataRange(
                earliest_date="2024-04-26T00:00:00.000Z",
                latest_date="2025-06-30T00:00:00.000Z",
                total_records=461949,
            )

    @strawberry.field(name="dashboardData")
    async def dashboard_data(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
        target: Optional[float] = None,
    ) -> DashboardData:
        """Get comprehensive dashboard data"""
        if not all([start_date, end_date]):
            start_date, end_date = Query._get_default_dates()

        try:
            # Get all the data components
            monthly_sales = await self.monthly_sales_growth(
                start_date, end_date, branch, product_line
            )
            profitability = await self.profitability_by_dimension(
                "Branch", start_date, end_date, branch, product_line, item_groups
            )

            # Create simplified versions of other components
            revenue_summary = RevenueSummary()
            target_attainment = TargetAttainment()

            return DashboardData(
                revenue_summary=revenue_summary,
                monthly_sales_growth=monthly_sales,
                target_attainment=target_attainment,
                product_performance=[],
                branch_product_heatmap=[],
                top_customers=[],
                margin_trends=[],
                returns_analysis=[],
                profitability_by_dimension=profitability,
                branch_list=[],
                product_analytics=[],
            )
        except Exception as e:
            logging.error(f"Error in dashboard_data: {e}")
            # Return empty dashboard data on error
            return DashboardData(
                revenue_summary=RevenueSummary(),
                monthly_sales_growth=[],
                target_attainment=TargetAttainment(),
                product_performance=[],
                branch_product_heatmap=[],
                top_customers=[],
                margin_trends=[],
                returns_analysis=[],
                profitability_by_dimension=[],
                branch_list=[],
                product_analytics=[],
            )


schema = strawberry.Schema(query=Query)
