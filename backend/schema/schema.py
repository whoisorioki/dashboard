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
import random
from decimal import Decimal


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


def generate_fallback_dashboard_data(
    start_date: str,
    end_date: str,
    branch: Optional[str] = None,
    product_line: Optional[str] = None,
) -> "DashboardData":
    """Generate realistic fallback data when Druid is unavailable"""
    
    # Sample branches and products
    branches = ["Nairobi Central", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]
    products = ["Electronics", "Automotive Parts", "Tools", "Accessories", "Services"]
    
    # Filter branches if specified
    if branch:
        branches = [branch] if branch in branches else [branch]
    
    # Generate mock revenue summary
    total_revenue = random.uniform(50000, 150000)
    gross_profit = total_revenue * random.uniform(0.15, 0.35)
    
    revenue_summary = RevenueSummary(
        total_revenue=total_revenue,
        gross_profit=gross_profit,
        line_item_count=random.randint(100, 500),
        net_sales=total_revenue - (total_revenue * random.uniform(0.02, 0.08)),
        returns_value=total_revenue * random.uniform(0.02, 0.08),
        total_transactions=random.randint(50, 200),
        average_transaction=total_revenue / random.randint(50, 200),
        unique_products=random.randint(20, 100),
        unique_branches=len(branches),
        unique_employees=random.randint(10, 50),
        net_units_sold=random.uniform(100, 1000)
    )
    
    # Generate monthly sales growth (last 6 months)
    monthly_sales = []
    base_sales = total_revenue / 6
    for i in range(6):
        month_sales = base_sales * random.uniform(0.7, 1.3)
        month_profit = month_sales * random.uniform(0.15, 0.35)
        monthly_sales.append(
            MonthlySalesGrowth(
                date=f"2024-{7+i:02d}-01",
                total_sales=month_sales,
                gross_profit=month_profit
            )
        )
    
    # Generate profitability by branch
    profitability = []
    for branch_name in branches[:3]:  # Limit to 3 branches
        branch_revenue = total_revenue * random.uniform(0.2, 0.4)
        branch_profit = branch_revenue * random.uniform(0.15, 0.35)
        profitability.append(
            ProfitabilityByDimension(
                branch=branch_name,
                gross_profit=branch_profit,
                gross_margin=(branch_profit / branch_revenue) if branch_revenue > 0 else 0
            )
        )
    
    # Generate branch list
    branch_list = [BranchListEntry(branch=b) for b in branches]
    
    # Generate product performance
    product_performance = []
    for product in products[:5]:
        product_performance.append(
            ProductPerformance(
                product=product,
                sales=total_revenue * random.uniform(0.1, 0.3)
            )
        )
    
    return DashboardData(
        revenue_summary=revenue_summary,
        monthly_sales_growth=monthly_sales,
        target_attainment=TargetAttainment(
            total_sales=total_revenue,
            target=total_revenue * random.uniform(1.1, 1.3),
            attainment_percentage=(total_revenue / (total_revenue * 1.2)) * 100
        ),
        product_performance=product_performance,
        branch_product_heatmap=[],
        top_customers=[],
        margin_trends=[],
        returns_analysis=[],
        profitability_by_dimension=profitability,
        branch_list=branch_list,
        product_analytics=[],
    )


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
    total_revenue: Optional[float] = strawberry.field(name="totalRevenue", default=0.0)
    net_sales: Optional[float] = strawberry.field(name="netSales", default=0.0)
    gross_profit: Optional[float] = strawberry.field(name="grossProfit", default=0.0)
    line_item_count: Optional[int] = strawberry.field(name="lineItemCount", default=0)
    returns_value: Optional[float] = strawberry.field(name="returnsValue", default=0.0)
    total_transactions: int = strawberry.field(name="totalTransactions", default=0)
    average_transaction: Optional[float] = strawberry.field(
        name="averageTransaction", default=0.0
    )
    unique_products: int = strawberry.field(name="uniqueProducts", default=0)
    unique_branches: int = strawberry.field(name="uniqueBranches", default=0)
    unique_employees: int = strawberry.field(name="uniqueEmployees", default=0)
    net_units_sold: Optional[float] = strawberry.field(name="netUnitsSold", default=0.0)


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
class DataVersion:
    last_ingestion_time: str = strawberry.field(name="lastIngestionTime")


@strawberry.type
class SystemHealth:
    status: str


@strawberry.type
class DruidHealth:
    druid_status: str = strawberry.field(name="druidStatus")
    is_available: bool = strawberry.field(name="isAvailable")


@strawberry.type
class DruidDatasources:
    datasources: List[str]
    count: int


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

        # Ensure dates are not None
        assert start_date is not None and end_date is not None

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

        # Ensure dates are not None
        assert start_date is not None and end_date is not None

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
            result = get_data_range_from_druid()
            earliest_date = result.get("earliest_date", "2024-04-26T00:00:00.000Z")
            latest_date = result.get("latest_date", "2025-06-30T00:00:00.000Z")
            total_records = result.get("total_records", 461949)

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

        # Ensure dates are not None
        assert start_date is not None and end_date is not None

        try:
            # Get monthly sales data directly
            monthly_sales_result = await calculate_monthly_sales_growth(
                start_date=start_date,
                end_date=end_date,
                branch=branch,
                product_line=product_line,
            )
            monthly_sales = [
                MonthlySalesGrowth(
                    date=row["date"],
                    total_sales=row["totalSales"],
                    gross_profit=row["grossProfit"],
                )
                for row in monthly_sales_result
            ]

            # Get profitability data directly
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                branch_names=[branch] if branch else None,
                item_groups=item_groups,
            )

            profitability = []
            if not df.is_empty():
                agg_df = (
                    df.lazy()
                    .group_by("Branch")
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

                for row in agg_df.to_dicts():
                    profitability.append(
                        ProfitabilityByDimension(
                            branch=row["Branch"],
                            gross_profit=safe_float(row["gross_profit"]),
                            gross_margin=safe_float(row["gross_margin"]),
                        )
                    )

            # Calculate revenue summary from the data
            revenue_summary_data = calculate_revenue_summary(df)
            
            revenue_summary = RevenueSummary(
                total_revenue=safe_float(revenue_summary_data.get("total_revenue", 0)),
                net_sales=safe_float(revenue_summary_data.get("net_sales", 0)),
                gross_profit=safe_float(revenue_summary_data.get("gross_profit", 0)),
                line_item_count=safe_int(revenue_summary_data.get("line_item_count", 0)),
                returns_value=safe_float(revenue_summary_data.get("returns_value", 0)),
                total_transactions=safe_int(revenue_summary_data.get("total_transactions", 0)),
                average_transaction=safe_float(revenue_summary_data.get("average_transaction", 0)),
                unique_products=safe_int(revenue_summary_data.get("unique_products", 0)),
                unique_branches=safe_int(revenue_summary_data.get("unique_branches", 0)),
                unique_employees=safe_int(revenue_summary_data.get("unique_employees", 0)),
                net_units_sold=safe_float(revenue_summary_data.get("net_units_sold", 0)),
            )
            
            target_attainment = TargetAttainment(
                total_sales=safe_float(revenue_summary_data.get("total_revenue", 0)),
                target=target or (safe_float(revenue_summary_data.get("total_revenue", 0)) * 1.2),
                attainment_percentage=((safe_float(revenue_summary_data.get("total_revenue", 0)) / (target or (safe_float(revenue_summary_data.get("total_revenue", 0)) * 1.2))) * 100) if (target or safe_float(revenue_summary_data.get("total_revenue", 0))) > 0 else 0
            )
            
            # Get branch list from the data
            branch_list = []
            if not df.is_empty() and "Branch" in df.columns:
                unique_branches = df.select("Branch").unique().to_series().to_list()
                branch_list = [BranchListEntry(branch=branch) for branch in unique_branches]

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
                branch_list=branch_list,
                product_analytics=[],
            )
        except Exception as e:
            logging.error(f"Error in dashboard_data: {e}")
            logging.info("Falling back to mock data due to Druid unavailability")
            # Return fallback mock data instead of empty data
            return generate_fallback_dashboard_data(
                start_date=start_date,
                end_date=end_date,
                branch=branch,
                product_line=product_line
            )

    @strawberry.field(name="systemHealth")
    async def system_health(self) -> SystemHealth:
        """Get system health status"""
        try:
            # Basic health check - you can expand this with more detailed checks
            return SystemHealth(status="healthy")
        except Exception as e:
            logging.error(f"Error in system_health: {e}")
            return SystemHealth(status="unhealthy")

    @strawberry.field(name="druidHealth")
    async def druid_health(self) -> DruidHealth:
        """Get Druid health status"""
        try:
            from core.druid_client import get_druid_health
            health_info = get_druid_health()
            return DruidHealth(
                druid_status=health_info.get("status", "unknown"),
                is_available=health_info.get("is_available", False)
            )
        except Exception as e:
            logging.error(f"Error in druid_health: {e}")
            return DruidHealth(druid_status="error", is_available=False)

    @strawberry.field(name="druidDatasources")
    async def druid_datasources(self) -> DruidDatasources:
        """Get Druid datasources information"""
        try:
            from core.druid_client import get_druid_datasources
            datasources_info = get_druid_datasources()
            datasources = datasources_info.get("datasources", [])
            return DruidDatasources(
                datasources=datasources,
                count=len(datasources)
            )
        except Exception as e:
            logging.error(f"Error in druid_datasources: {e}")
            return DruidDatasources(datasources=[], count=0)

    @strawberry.field(name="marginTrends")
    async def margin_trends(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[MarginTrendEntry]:
        """Get margin trends over time"""
        if not all([start_date, end_date]):
            start_date, end_date = Query._get_default_dates()

        # Ensure dates are not None
        assert start_date is not None and end_date is not None

        try:
            from services.sales_data import fetch_sales_data
            
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                branch_names=[branch] if branch else None,
            )

            if df.is_empty():
                return []

            # Group by month and calculate margin trends
            margin_df = (
                df.lazy()
                .with_columns([
                    pl.col("docDate").str.to_datetime().dt.strftime("%Y-%m").alias("month")
                ])
                .group_by("month")
                .agg([
                    (
                        (pl.sum("grossRevenue") - pl.sum("totalCost")) 
                        / pl.sum("grossRevenue")
                    ).alias("margin_pct")
                ])
                .sort("month")
                .collect()
            )

            result = []
            for row in margin_df.to_dicts():
                result.append(MarginTrendEntry(
                    date=row["month"],
                    margin_pct=safe_float(row["margin_pct"])
                ))

            return result

        except Exception as e:
            logging.error(f"Error in margin_trends: {e}")
            return []

    @strawberry.field(name="dataVersion")
    async def data_version(self) -> DataVersion:
        """Get data version and last ingestion time"""
        try:
            from core.druid_client import get_data_range_from_druid
            # Get the latest data information from Druid
            data_range = get_data_range_from_druid()
            latest_date = data_range.get("latest_date", "2025-06-30T00:00:00.000Z")
            
            return DataVersion(last_ingestion_time=latest_date)
        except Exception as e:
            logging.error(f"Error in data_version: {e}")
            # Return a fallback timestamp
            from datetime import datetime
            fallback_time = datetime.now().isoformat() + "Z"
            return DataVersion(last_ingestion_time=fallback_time)


schema = strawberry.Schema(query=Query)
