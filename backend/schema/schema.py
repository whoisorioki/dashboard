import strawberry
from typing import List, Optional
from backend.services.sales_data import fetch_sales_data, get_data_range_from_druid
from backend.services.kpi_service import calculate_revenue_summary, _ensure_time_is_datetime
import asyncio
import logging
import polars as pl
import httpx
import os
from datetime import date, timezone, datetime
import math


def sanitize(val):
    if val is None or (isinstance(val, float) and (math.isinf(val) or math.isnan(val))):
        return None
    return val


def log_empty_df(context: str, df, **filters):
    if df.is_empty():
        logging.warning(f"{context}: DataFrame is empty for filters: {filters}")
        return True
    return False


def log_missing_column(context: str, df, column: str, **filters):
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
    sales: float


@strawberry.type
class BranchProductHeatmap:
    branch: str
    product: str
    sales: float


@strawberry.type
class BranchPerformance:
    branch: str
    total_sales: float = strawberry.field(name="totalSales")
    transaction_count: int = strawberry.field(name="transactionCount")
    average_sale: float = strawberry.field(name="averageSale")
    unique_customers: int = strawberry.field(name="uniqueCustomers")
    unique_products: int = strawberry.field(name="uniqueProducts")


@strawberry.type
class BranchGrowth:
    branch: str
    month_year: str = strawberry.field(name="monthYear")
    monthly_sales: float = strawberry.field(name="monthlySales")
    growth_pct: float = strawberry.field(name="growthPct")


@strawberry.type
class SalesPerformance:
    sales_person: str = strawberry.field(name="salesPerson")
    total_sales: float = strawberry.field(name="totalSales")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")
    avg_margin: Optional[float] = strawberry.field(name="avgMargin")
    transaction_count: int = strawberry.field(name="transactionCount")
    average_sale: float = strawberry.field(name="averageSale")
    unique_branches: int = strawberry.field(name="uniqueBranches")
    unique_products: int = strawberry.field(name="uniqueProducts")


@strawberry.type
class ProductAnalytics:
    item_name: str = strawberry.field(name="itemName")
    product_line: str = strawberry.field(name="productLine")
    item_group: str = strawberry.field(name="itemGroup")
    total_sales: float = strawberry.field(name="totalSales")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")
    margin: Optional[float] = strawberry.field(name="margin")
    total_qty: float = strawberry.field(name="totalQty")
    transaction_count: int = strawberry.field(name="transactionCount")
    unique_branches: int = strawberry.field(name="uniqueBranches")
    average_price: float = strawberry.field(name="averagePrice")


@strawberry.type
class TargetAttainment:
    attainment_percentage: float = strawberry.field(name="attainmentPercentage")
    total_sales: float = strawberry.field(name="totalSales")
    target: float


@strawberry.type
class RevenueSummary:
    total_revenue: Optional[float] = strawberry.field(name="totalRevenue")
    net_sales: Optional[float] = strawberry.field(name="netSales")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")
    line_item_count: Optional[int] = strawberry.field(name="lineItemCount")
    returns_value: Optional[float] = strawberry.field(name="returnsValue")
    total_transactions: int = strawberry.field(name="totalTransactions")
    average_transaction: Optional[float] = strawberry.field(name="averageTransaction")
    unique_products: int = strawberry.field(name="uniqueProducts")
    unique_branches: int = strawberry.field(name="uniqueBranches")
    unique_employees: int = strawberry.field(name="uniqueEmployees")
    net_units_sold: Optional[float] = strawberry.field(name="netUnitsSold")


@strawberry.type
class EnvelopeMetadata:
    request_id: Optional[str]


@strawberry.type
class EnvelopeError:
    code: str
    message: str


@strawberry.type
class Envelope:
    data: Optional[object]
    error: Optional[EnvelopeError]
    metadata: Optional[EnvelopeMetadata]


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
    count: int


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
class ProductProfitabilityEntry:
    product_line: str = strawberry.field(name="productLine")
    item_name: str = strawberry.field(name="itemName")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")


@strawberry.type
class SalespersonLeaderboardEntry:
    salesperson: str
    sales_amount: Optional[float] = strawberry.field(name="salesAmount")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")
    quota: Optional[float] = strawberry.field(name="quota")
    attainment_percentage: Optional[float] = strawberry.field(
        name="attainmentPercentage"
    )


@strawberry.type
class SalespersonProductMixEntry:
    salesperson: str
    product_line: str = strawberry.field(name="productLine")
    avg_profit_margin: Optional[float] = strawberry.field(name="avgProfitMargin")


@strawberry.type
class CustomerValueEntry:
    card_name: str = strawberry.field(name="cardName")
    sales_amount: Optional[float] = strawberry.field(name="salesAmount")
    gross_profit: Optional[float] = strawberry.field(name="grossProfit")


@strawberry.type
class SystemHealth:
    status: str


@strawberry.type
class DruidHealth:
    druid_status: str
    is_available: bool


@strawberry.type
class DruidDatasources:
    datasources: List[str]
    count: int


@strawberry.type
class DataVersion:
    last_ingestion_time: str = strawberry.field(name="lastIngestionTime")


@strawberry.type
class DashboardData:
    """Composite type for all dashboard data blocks.

    Aggregates all dashboard analytics, KPIs, and lists into a single object for efficient frontend data loading.

    Args:
        None (fields are resolved via sub-resolvers)

    Returns:
        DashboardData: Composite dashboard data object.

    Example:
        >>> dashboard_data(start_date="2024-01-01", end_date="2024-01-31")
    """

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
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] monthly_sales_growth called with self=None! Using Query class directly."
            )
            return await Query.monthly_sales_growth(
                Query(), start_date, end_date, branch, product_line
            )
        from backend.services.kpi_service import calculate_monthly_sales_growth

        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        # Await the async aggregation logic
        result = await calculate_monthly_sales_growth(
            start_date=start, end_date=end, branch=branch, product_line=product_line
        )
        return [
            MonthlySalesGrowth(
                date=row["date"],
                total_sales=row["totalSales"],
                gross_profit=row["grossProfit"],
            )
            for row in result
        ]

    @strawberry.field
    async def product_performance(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        n: Optional[int] = 10,
        item_groups: Optional[List[str]] = None,
    ) -> List[ProductPerformance]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] product_performance called with self=None! Using Query class directly."
            )
            return await Query.product_performance(
                Query(), start_date, end_date, branch, product_line, n, item_groups
            )
        """Fetches product performance, filtered by date, branch, product line, and item groups.

        Aggregates product performance metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            n (int, optional): Number of top products to return.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[ProductPerformance]: List of product performance entries.

        Raises:
            None

        Example:
            >>> product_performance(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Parts"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "product_performance",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return []
        performance_df = (
            df.lazy()
            .group_by("ItemName")
            .agg([pl.sum("grossRevenue").alias("sales")])
            .sort("sales", descending=True)
            .head(n)
            .collect()
        )
        return [
            ProductPerformance(
                product=row["ItemName"],
                sales=sanitize(row["sales"]),
            )
            for row in performance_df.to_dicts()
        ]

    @strawberry.field
    async def branch_product_heatmap(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[BranchProductHeatmap]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] branch_product_heatmap called with self=None! Using Query class directly."
            )
            return await Query.branch_product_heatmap(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        """Fetches branch product heatmap, filtered by date, branch, product line, and item groups.

        Aggregates branch product heatmap metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[BranchProductHeatmap]: List of branch product heatmap entries.

        Raises:
            None

        Example:
            >>> branch_product_heatmap(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Units"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "branch_product_heatmap",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return []
        heatmap_df = (
            df.lazy()
            .group_by(["Branch", "ProductLine"])
            .agg([pl.sum("grossRevenue").alias("sales")])
            .collect()
        )
        return [
            BranchProductHeatmap(
                branch=row["Branch"],
                product=row["ProductLine"],
                sales=sanitize(row["sales"]),
            )
            for row in heatmap_df.to_dicts()
        ]

    @strawberry.field
    async def branch_performance(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[BranchPerformance]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] branch_performance called with self=None! Using Query class directly."
            )
            return await Query.branch_performance(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        """Fetches branch performance, filtered by date, branch, product line, and item groups.

        Aggregates branch performance metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[BranchPerformance]: List of branch performance entries.

        Raises:
            None

        Example:
            >>> branch_performance(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Units"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()

        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )

        if log_empty_df(
            "branch_performance",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return []

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))

        performance_df = (
            df.lazy()
            .group_by("Branch")
            .agg(
                [
                    pl.sum("grossRevenue").alias("total_sales"),
                    pl.count("Branch").alias("transaction_count"),
                    pl.mean("grossRevenue").alias("average_sale"),
                    pl.n_unique("CardName").alias("unique_customers"),
                    pl.n_unique("ItemName").alias("unique_products"),
                ]
            )
            .collect()
        )

        return [
            BranchPerformance(
                branch=row["Branch"],
                total_sales=sanitize(row["total_sales"]),
                transaction_count=row["transaction_count"],
                average_sale=sanitize(row["average_sale"]),
                unique_customers=row["unique_customers"],
                unique_products=row["unique_products"],
            )
            for row in performance_df.to_dicts()
        ]

    @strawberry.field
    async def sales_performance(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[SalesPerformance]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] sales_performance called with self=None! Using Query class directly."
            )
            return await Query.sales_performance(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        """Fetches sales performance, filtered by date, branch, product line, and item groups.

        Aggregates sales performance metrics for each salesperson, with support for filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[SalesPerformance]: List of sales performance entries.

        Raises:
            None

        Example:
            >>> sales_performance(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Units"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()

        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
        )

        if log_empty_df(
            "sales_performance",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return []

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))

        performance_df = (
            df.lazy()
            .group_by("SalesPerson")
            .agg(
                [
                    pl.sum("grossRevenue").alias("total_sales"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias(
                        "gross_profit"
                    ),
                    (
                        (pl.sum("grossRevenue") - pl.sum("totalCost"))
                        / pl.sum("grossRevenue")
                    ).alias("avg_margin"),
                    pl.count("SalesPerson").alias("transaction_count"),
                    pl.mean("grossRevenue").alias("average_sale"),
                    pl.n_unique("Branch").alias("unique_branches"),
                    pl.n_unique("ItemName").alias("unique_products"),
                ]
            )
            .collect()
        )

        return [
            SalesPerformance(
                sales_person=row["SalesPerson"],
                total_sales=sanitize(row["total_sales"]),
                gross_profit=sanitize(row["gross_profit"]),
                avg_margin=sanitize(row["avg_margin"]),
                transaction_count=row["transaction_count"],
                average_sale=sanitize(row["average_sale"]),
                unique_branches=row["unique_branches"],
                unique_products=row["unique_products"],
            )
            for row in performance_df.to_dicts()
        ]

    @strawberry.field
    async def product_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[ProductAnalytics]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] product_analytics called with self=None! Using Query class directly."
            )
            return await Query.product_analytics(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        """Fetches product analytics, filtered by date, branch, product line, and item groups.

        Retrieves sales analytics data and aggregates by item, product line, and item group. Filters can be applied for date range, branch, product line, and item groups. The logic ensures only relevant data is returned for the requested filters.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[ProductAnalytics]: List of product analytics entries.

        Raises:
            None

        Example:
            >>> product_analytics(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Parts"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()

        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
        )

        if log_empty_df(
            "product_analytics",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return []

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))

        # Use only columns that exist in Druid schema (see md/args.md)
        # unitsSold, unitsReturned, grossRevenue, totalCost, etc.
        agg_exprs = [
            pl.sum("grossRevenue").alias("total_sales"),
            (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("gross_profit"),
            (
                (pl.sum("grossRevenue") - pl.sum("totalCost")) / pl.sum("grossRevenue")
            ).alias("margin"),
            pl.sum("unitsSold").alias("total_qty"),
            pl.count("ItemName").alias("transaction_count"),
            pl.n_unique("Branch").alias("unique_branches"),
            pl.mean("grossRevenue").alias("average_price"),
        ]

        analytics_df = (
            df.lazy()
            .group_by(["ItemName", "ProductLine", "ItemGroup"])
            .agg(agg_exprs)
            .collect()
        )

        return [
            ProductAnalytics(
                item_name=row["ItemName"],
                product_line=row["ProductLine"],
                item_group=row["ItemGroup"],
                total_sales=sanitize(row["total_sales"]),
                gross_profit=sanitize(row["gross_profit"]),
                margin=sanitize(row["margin"]),
                total_qty=sanitize(row.get("total_qty", 0)),
                transaction_count=row["transaction_count"],
                unique_branches=row["unique_branches"],
                average_price=sanitize(row["average_price"]),
            )
            for row in analytics_df.to_dicts()
        ]

    @strawberry.field
    async def target_attainment(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        target: Optional[float] = None,
        item_groups: Optional[List[str]] = None,
    ) -> TargetAttainment:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] target_attainment called with self=None! Using Query class directly."
            )
            return await Query.target_attainment(
                Query(), start_date, end_date, branch, product_line, target, item_groups
            )
        """Fetches target attainment, filtered by date, branch, product line, target, and item groups.

        Aggregates target attainment metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            target (float, optional): Sales target value.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            TargetAttainment: Target attainment entry.

        Raises:
            None

        Example:
            >>> target_attainment(start_date="2024-01-01", end_date="2024-01-31", target=100000, item_groups=["Units"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()
        target_val = target if target is not None else 0.0
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "target_attainment",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            target=target,
            item_groups=item_groups,
        ):
            return TargetAttainment(
                attainment_percentage=0,
                total_sales=0,
                target=target_val,
            )
        total_sales = 0
        if not df.is_empty():
            total_sales = df.select(pl.sum("grossRevenue")).item() or 0
        attainment_percentage = (
            (total_sales / target_val) * 100 if target_val > 0 else 0
        )
        return TargetAttainment(
            attainment_percentage=sanitize(attainment_percentage),
            total_sales=sanitize(total_sales),
            target=target_val,
        )

    @strawberry.field
    async def revenue_summary(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> RevenueSummary:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] revenue_summary called with self=None! Using Query class directly."
            )
            return await Query.revenue_summary(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        """Returns revenue summary, filtered by date, branch, product line, and item groups.

        Aggregates revenue, profit, and other summary statistics for the given filters. Supports filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            RevenueSummary: Revenue summary object.

        Raises:
            None

        Example:
            >>> revenue_summary(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Units"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()

        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
        )

        if log_empty_df(
            "revenue_summary",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return RevenueSummary(
                total_revenue=0,
                net_sales=0,
                gross_profit=0,
                line_item_count=0,
                returns_value=0,
                total_transactions=0,
                average_transaction=0,
                unique_products=0,
                unique_branches=0,
                unique_employees=0,
                net_units_sold=0,
            )

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))

        summary = calculate_revenue_summary(df)
        return RevenueSummary(
            total_revenue=sanitize(summary["total_revenue"]),
            net_sales=sanitize(summary["net_sales"]),
            gross_profit=sanitize(summary.get("gross_profit", 0.0)),
            line_item_count=sanitize(summary["line_item_count"]),
            returns_value=sanitize(summary["returns_value"]),
            total_transactions=summary["line_item_count"],
            average_transaction=sanitize(summary["average_transaction"]),
            unique_products=summary["unique_products"],
            unique_branches=summary["unique_branches"],
            unique_employees=summary["unique_employees"],
            net_units_sold=sanitize(summary["net_units_sold"]),
        )

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
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] profitability_by_dimension called with self=None! Using Query class directly."
            )
            return await Query.profitability_by_dimension(
                Query(),
                dimension,
                start_date,
                end_date,
                branch,
                product_line,
                item_groups,
            )
        """Fetches profitability by dimension, filtered by date, branch, product line, and item groups.

        Aggregates profitability metrics by the specified dimension, supporting filtering by item groups for more granular analysis.

        Args:
            dimension (str): The dimension to group by (e.g., 'Branch', 'ProductLine', 'ItemGroup').
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[ProfitabilityByDimension]: List of profitability entries by dimension.

        Raises:
            None

        Example:
            >>> profitability_by_dimension(dimension="Branch", start_date="2024-01-01", end_date="2024-01-31", item_groups=["Units"])
        """
        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start,
            end_date=end,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "profitability_by_dimension",
            df,
            start=start,
            end=end,
            branch=branch,
            product_line=product_line,
            dimension=dimension,
            item_groups=item_groups,
        ):
            return []
        if dimension not in df.columns:
            logging.warning(
                f"profitability_by_dimension: DataFrame missing dimension column '{dimension}' for filters: start={start}, end={end}, branch={branch}, product_line={product_line}, item_groups={item_groups}"
            )
            return []
        result_df = (
            df.lazy()
            .group_by(dimension)
            .agg(
                [
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias(
                        "gross_profit"
                    ),
                    (pl.sum("grossRevenue") / pl.sum("totalCost") - 1).alias(
                        "gross_margin"
                    ),
                ]
            )
            .collect()
        )
        # Map dimension to snake_case field name
        dim_map = {
            "Branch": "branch",
            "ProductLine": "productLine",
            "ItemGroup": "itemGroup",
        }
        field_name = dim_map.get(dimension, dimension.lower())
        return [
            ProfitabilityByDimension(
                **{field_name: row[dimension]},
                gross_profit=sanitize(row["gross_profit"]),
                gross_margin=sanitize(row["gross_margin"]),
            )
            for row in result_df.to_dicts()
        ]

    @strawberry.field
    async def returns_analysis(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        item_names: Optional[List[str]] = None,
        sales_persons: Optional[List[str]] = None,
        branch_names: Optional[List[str]] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[ReturnsAnalysisEntry]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] returns_analysis called with self=None! Using Query class directly."
            )
            return await Query.returns_analysis(
                Query(),
                start_date,
                end_date,
                item_names,
                sales_persons,
                branch_names,
                branch,
                product_line,
                item_groups,
            )
        """Fetches returns analysis, filtered by date, branch, product line, item names, sales persons, branch names, and item groups.

        Aggregates returns analysis metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            item_names (List[str], optional): List of item names to filter by.
            sales_persons (List[str], optional): List of sales persons to filter by.
            branch_names (List[str], optional): List of branch names to filter by.
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[ReturnsAnalysisEntry]: List of returns analysis entries.

        Raises:
            None

        Example:
            >>> returns_analysis(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Parts"])
        """
        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start,
            end_date=end,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names or ([branch] if branch else None),
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "returns_analysis",
            df,
            start=start,
            end=end,
            branch=branch,
            product_line=product_line,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names,
            item_groups=item_groups,
        ):
            return []
        if "returnsValue" not in df.columns:
            logging.warning(
                f"returns_analysis: DataFrame missing 'returnsValue' column for filters: start={start}, end={end}, branch={branch}, product_line={product_line}, item_names={item_names}, sales_persons={sales_persons}, branch_names={branch_names}, item_groups={item_groups}"
            )
            return []
        # Assume returns reason is not available, so group by ItemName as a proxy
        result_df = (
            df.lazy()
            .filter(pl.col("returnsValue") < 0)
            .group_by("ItemName")
            .agg(
                [
                    pl.count().alias("count"),
                ]
            )
            .sort("count", descending=True)
            .limit(20)
            .collect()
        )
        return [
            ReturnsAnalysisEntry(reason=row["ItemName"], count=row["count"])
            for row in result_df.to_dicts()
        ]

    @strawberry.field
    async def top_customers(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        n: Optional[int] = 100,
        item_names: Optional[List[str]] = None,
        sales_persons: Optional[List[str]] = None,
        branch_names: Optional[List[str]] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[TopCustomerEntry]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] top_customers called with self=None! Using Query class directly."
            )
            return await Query.top_customers(
                Query(),
                start_date,
                end_date,
                branch,
                n,
                item_names,
                sales_persons,
                branch_names,
                product_line,
                item_groups,
            )
        """Fetches top customers, filtered by date, branch, product line, item names, sales persons, branch names, and item groups.

        Aggregates top customer metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            n (int, optional): Number of top customers to return.
            item_names (List[str], optional): List of item names to filter by.
            sales_persons (List[str], optional): List of sales persons to filter by.
            branch_names (List[str], optional): List of branch names to filter by.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[TopCustomerEntry]: List of top customer entries.

        Raises:
            None

        Example:
            >>> top_customers(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Parts"])
        """
        # Provide default dates if not supplied
        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start,
            end_date=end,
            branch_names=branch_names or ([branch] if branch else None),
            item_names=item_names,
            sales_persons=sales_persons,
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "top_customers",
            df,
            start=start,
            end=end,
            branch=branch,
            product_line=product_line,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names,
            item_groups=item_groups,
        ):
            return []
            # Get ALL customers - no filtering by n
        all_customers_df = (
            df.lazy()
            .group_by("CardName")
            .agg(
                [
                    pl.sum("grossRevenue").alias("salesAmount"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit"),
                    pl.sum("totalCost").alias("totalCostSum"),  # Keep for debugging
                ]
            )
            .sort("salesAmount", descending=True)
            .collect()
        )

        # Log the total number of customers found
        total_customers = len(all_customers_df)
        logging.info(f"top_customers: Found {total_customers} total customers")

        # Debug: Check for cases where grossProfit > salesAmount (due to negative costs)
        customers_with_negative_costs = all_customers_df.filter(
            (pl.col("grossProfit") > pl.col("salesAmount"))
            & (pl.col("salesAmount") > 0)
        )
        if len(customers_with_negative_costs) > 0:
            logging.info(
                f"top_customers: Found {len(customers_with_negative_costs)} customers with negative costs (legitimate business scenario)"
            )
            for row in customers_with_negative_costs.head(3).to_dicts():
                margin_pct = (row["grossProfit"] / row["salesAmount"]) * 100
                logging.info(
                    f"Customer: {row['CardName']}, Sales: {row['salesAmount']:.2f}, Profit: {row['grossProfit']:.2f}, "
                    f"Cost: {row['totalCostSum']:.2f}, Margin: {margin_pct:.1f}%"
                )

        # Return all customers if n is None, otherwise limit to n
        if n is None:
            result_df = all_customers_df
            logging.info(f"top_customers: Returning ALL customers (n=None)")
        else:
            result_df = all_customers_df.head(n)
            logging.info(f"top_customers: Returning top {n} customers")
        return [
            TopCustomerEntry(
                card_name=row["CardName"],
                sales_amount=sanitize(row["salesAmount"]),
                gross_profit=sanitize(row["grossProfit"]),
            )
            for row in result_df.to_dicts()
        ]

    @strawberry.field
    async def branch_list(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[BranchListEntry]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] branch_list called with self=None! Using Query class directly."
            )
            return await Query.branch_list(Query(), start_date, end_date, item_groups)
        """Fetches branch list, filtered by date and item groups.

        Returns a list of branches for the given date range and item groups.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[BranchListEntry]: List of branch entries.

        Raises:
            None

        Example:
            >>> branch_list(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Units"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_groups=item_groups,
        )
        if log_empty_df(
            "branch_list",
            df,
            start=start_date,
            end=end_date,
            item_groups=item_groups,
        ):
            return []
        if "Branch" not in df.columns:
            logging.warning(
                f"branch_list: DataFrame missing 'Branch' column for filters: start={start_date}, end={end_date}, item_groups={item_groups}"
            )
            return []
        branches = df["Branch"].unique().to_list()
        return [BranchListEntry(branch=b) for b in branches if b]

    @strawberry.field
    async def margin_trends(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[MarginTrendEntry]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] margin_trends called with self=None! Using Query class directly."
            )
            return await Query.margin_trends(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        """Fetches margin trends, filtered by date, branch, product line, and item groups.

        Aggregates margin trend metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[MarginTrendEntry]: List of margin trend entries.

        Raises:
            None

        Example:
            >>> margin_trends(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Parts"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "margin_trends",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return []

        df = _ensure_time_is_datetime(df)
        # Group by date and calculate margin
        df = df.with_columns([pl.col("__time").dt.strftime("%Y-%m").alias("month")])
        grouped = (
            df.lazy()
            .group_by("month")
            .agg(
                [
                    (
                        (pl.sum("grossRevenue") - pl.sum("totalCost"))
                        / pl.sum("grossRevenue")
                    ).alias("marginPct")
                ]
            )
            .sort("month")
            .collect()
        )
        return [
            MarginTrendEntry(date=row["month"], margin_pct=sanitize(row["marginPct"]))
            for row in grouped.to_dicts()
        ]

    @strawberry.field
    async def product_profitability(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[ProductProfitabilityEntry]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] product_profitability called with self=None! Using Query class directly."
            )
            return await Query.product_profitability(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        """Fetches product profitability, filtered by date, branch, product line, and item groups.

        Aggregates product profitability metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[ProductProfitabilityEntry]: List of product profitability entries.

        Raises:
            None

        Example:
            >>> product_profitability(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Parts"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "product_profitability",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return []
        performance_df = (
            df.lazy()
            .group_by(["ProductLine", "ItemName"])
            .agg([pl.sum("grossRevenue").alias("grossProfit")])
            .collect()
        )
        return [
            ProductProfitabilityEntry(
                product_line=row["ProductLine"],
                item_name=row["ItemName"],
                gross_profit=sanitize(row["grossProfit"]),
            )
            for row in performance_df.to_dicts()
        ]

    @strawberry.field
    async def salesperson_leaderboard(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[SalespersonLeaderboardEntry]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] salesperson_leaderboard called with self=None! Using Query class directly."
            )
            return await Query.salesperson_leaderboard(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        """Fetches salesperson leaderboard, filtered by date, branch, product line, and item groups.

        Aggregates salesperson leaderboard metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[SalespersonLeaderboardEntry]: List of salesperson leaderboard entries.

        Raises:
            None

        Example:
            >>> salesperson_leaderboard(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Units"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "salesperson_leaderboard",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return []
        leaderboard_df = (
            df.lazy()
            .group_by("SalesPerson")
            .agg(
                [
                    pl.sum("grossRevenue").alias("salesAmount"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit"),
                ]
            )
            .sort("grossProfit", descending=True)
            .collect()
        )
        return [
            SalespersonLeaderboardEntry(
                salesperson=row["SalesPerson"],
                sales_amount=sanitize(row["salesAmount"]),
                gross_profit=sanitize(row["grossProfit"]),
            )
            for row in leaderboard_df.to_dicts()
        ]

    @strawberry.field
    async def salesperson_product_mix(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[SalespersonProductMixEntry]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] salesperson_product_mix called with self=None! Using Query class directly."
            )
            return await Query.salesperson_product_mix(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        """Fetches salesperson product mix, filtered by date, branch, product line, and item groups.

        Aggregates salesperson product mix metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[SalespersonProductMixEntry]: List of salesperson product mix entries.

        Raises:
            None

        Example:
            >>> salesperson_product_mix(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Parts"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "salesperson_product_mix",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_groups=item_groups,
        ):
            return []
        result_df = (
            df.lazy()
            .group_by(["SalesPerson", "ProductLine"])
            .agg(
                [
                    (
                        (pl.sum("grossRevenue") - pl.sum("totalCost"))
                        / pl.sum("grossRevenue")
                    ).alias("avg_profit_margin")
                ]
            )
            .collect()
        )
        return [
            SalespersonProductMixEntry(
                salesperson=row["SalesPerson"],
                product_line=row["ProductLine"],
                avg_profit_margin=sanitize(row["avg_profit_margin"]),
            )
            for row in result_df.to_dicts()
        ]

    @strawberry.field
    async def customer_value(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        item_names: Optional[List[str]] = None,
        sales_persons: Optional[List[str]] = None,
        branch_names: Optional[List[str]] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
    ) -> List[CustomerValueEntry]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] customer_value called with self=None! Using Query class directly."
            )
            return await Query.customer_value(
                Query(),
                start_date,
                end_date,
                item_names,
                sales_persons,
                branch_names,
                branch,
                product_line,
                item_groups,
            )
        """Fetches customer value, filtered by date, branch, product line, item names, sales persons, branch names, and item groups.

        Aggregates customer value metrics, supporting filtering by item groups for more granular analysis.

        Args:
            start_date (str, optional): Start date (YYYY-MM-DD).
            end_date (str, optional): End date (YYYY-MM-DD).
            item_names (List[str], optional): List of item names to filter by.
            sales_persons (List[str], optional): List of sales persons to filter by.
            branch_names (List[str], optional): List of branch names to filter by.
            branch (str, optional): Branch name.
            product_line (str, optional): Product line name.
            item_groups (List[str], optional): List of item groups to filter by.

        Returns:
            List[CustomerValueEntry]: List of customer value entries.

        Raises:
            None

        Example:
            >>> customer_value(start_date="2024-01-01", end_date="2024-01-31", item_groups=["Units"])
        """
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names or ([branch] if branch else None),
            item_groups=item_groups,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if item_groups:
            df = df.filter(pl.col("ItemGroup").is_in(item_groups))
        if log_empty_df(
            "customer_value",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names,
            item_groups=item_groups,
        ):
            return []
        result_df = (
            df.lazy()
            .group_by("CardName")
            .agg(
                [
                    pl.sum("grossRevenue").alias("salesAmount"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit"),
                ]
            )
            .sort("grossProfit", descending=True)
            .collect()
        )
        return [
            CustomerValueEntry(
                card_name=row["CardName"],
                sales_amount=sanitize(row["salesAmount"]),
                gross_profit=sanitize(row["grossProfit"]),
            )
            for row in result_df.to_dicts()
        ]

    @strawberry.field
    async def system_health(self) -> SystemHealth:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] system_health called with self=None! Using Query class directly."
            )
            return await Query.system_health(Query())
        import httpx

        base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{base_url}/api/health")
            data = res.json()
            return SystemHealth(status=data.get("data", {}).get("status", "unknown"))

    @strawberry.field
    async def druid_health(self) -> DruidHealth:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] druid_health called with self=None! Using Query class directly."
            )
            return await Query.druid_health(Query())
        import httpx

        base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{base_url}/api/health/druid")
            data = res.json()
            return DruidHealth(
                druid_status=data.get("data", {}).get("druid_status", "unknown"),
                is_available=data.get("data", {}).get("is_available", False),
            )

    @strawberry.field
    async def druid_datasources(self) -> DruidDatasources:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] druid_datasources called with self=None! Using Query class directly."
            )
            return await Query.druid_datasources(Query())
        import httpx

        base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{base_url}/api/druid/datasources")
            data = res.json()
            datasources = data.get("data", {}).get("datasources", [])
            count = data.get("data", {}).get("count", 0)
            return DruidDatasources(datasources=datasources, count=count)

    @strawberry.field
    async def data_version(self) -> DataVersion:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] data_version called with self=None! Using Query class directly."
            )
            return await Query.data_version(Query())
        import httpx

        base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{base_url}/api/health/data-version")
            data = res.json()
            return DataVersion(last_ingestion_time=data.get("lastIngestionTime", ""))

    @strawberry.field
    async def data_range(self) -> DataRange:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] data_range called with self=None! Using Query class directly."
            )
            return await Query.data_range(Query())

        def to_iso8601(val):
            if isinstance(val, int) or (isinstance(val, str) and str(val).isdigit()):
                ts = int(val) / 1000
                return (
                    datetime.fromtimestamp(ts, tz=timezone.utc)
                    .isoformat()
                    .replace("+00:00", "Z")
                )
            if isinstance(val, str) and "T" in val:
                return val
            return str(val)

        druid_url = os.getenv("DRUID_BROKER_URL", "http://localhost:8888/druid/v2/")
        headers = {"Content-Type": "application/json"}
        try:
            # Query for earliest date
            query = {
                "queryType": "scan",
                "dataSource": "sales_analytics",
                "intervals": ["1900-01-01/2100-01-01"],
                "columns": ["__time"],
                "resultFormat": "compactedList",
                "limit": 1,
                "order": "ascending",
            }
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(druid_url, json=query, headers=headers)
                response.raise_for_status()
                earliest_result = response.json()

                # Query for latest date
                query["order"] = "descending"
                response = await client.post(druid_url, json=query, headers=headers)
                response.raise_for_status()
                latest_result = response.json()

                # Extract dates
                earliest_date = None
                latest_date = None
                if (
                    earliest_result
                    and len(earliest_result) > 0
                    and "events" in earliest_result[0]
                ):
                    if len(earliest_result[0]["events"]) > 0:
                        earliest_date = earliest_result[0]["events"][0][0]
                if (
                    latest_result
                    and len(latest_result) > 0
                    and "events" in latest_result[0]
                ):
                    if len(latest_result[0]["events"]) > 0:
                        latest_date = latest_result[0]["events"][0][0]

                # Query for total record count
                count_query = {
                    "queryType": "scan",
                    "dataSource": "sales_analytics",
                    "intervals": ["1900-01-01/2100-01-01"],
                    "columns": [],
                    "resultFormat": "compactedList",
                }
                response = await client.post(
                    druid_url, json=count_query, headers=headers
                )
                response.raise_for_status()
                total_records = 0
                count_result = response.json()
                for segment in count_result:
                    if "events" in segment:
                        total_records += len(segment["events"])

            # Convert to ISO8601
            earliest_date = to_iso8601(earliest_date)
            latest_date = to_iso8601(latest_date)
            return DataRange(
                earliest_date=earliest_date,
                latest_date=latest_date,
                total_records=total_records,
            )
        except Exception:
            # Fallback to hardcoded values if Druid query fails
            return DataRange(
                earliest_date="2023-01-01T00:00:00.000Z",
                latest_date="2025-06-01T00:00:00.000Z",
                total_records=51685,
            )

    @strawberry.field
    async def branch_growth(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[BranchGrowth]:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] branch_growth called with self=None! Using Query class directly."
            )
            return await Query.branch_growth(
                Query(), start_date, end_date, branch, product_line
            )
        from backend.services.kpi_service import calculate_branch_growth

        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()

        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
        )

        if df.is_empty():
            return []

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

        growth_df = calculate_branch_growth(df)

        return [
            BranchGrowth(
                branch=row["Branch"],
                month_year=row["month_year"],
                monthly_sales=sanitize(row["monthly_sales"]),
                growth_pct=sanitize(row["growth_pct"]),
            )
            for row in growth_df.to_dicts()
        ]

    @strawberry.field(name="dashboardData")
    async def dashboardData(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        item_groups: Optional[List[str]] = None,
        target: Optional[float] = None,
    ) -> DashboardData:
        import logging

        if self is None:
            logging.error(
                "[DEFENSIVE] dashboardData called with self=None! Using Query class methods directly."
            )
            revenue_summary = await Query.revenue_summary(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
            monthly_sales_growth = await Query.monthly_sales_growth(
                Query(), start_date, end_date, branch, product_line
            )
            target_attainment = await Query.target_attainment(
                Query(), start_date, end_date, branch, product_line, target, item_groups
            )
            product_performance = await Query.product_performance(
                Query(), start_date, end_date, branch, product_line, 10, item_groups
            )
            branch_product_heatmap = await Query.branch_product_heatmap(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
            top_customers = await Query.top_customers(
                Query(),
                start_date,
                end_date,
                branch,
                100,
                None,
                None,
                None,
                product_line,
                item_groups,
            )
            margin_trends = await Query.margin_trends(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
            returns_analysis = await Query.returns_analysis(
                Query(),
                start_date,
                end_date,
                None,
                None,
                None,
                branch,
                product_line,
                item_groups,
            )
            profitability_by_dimension = await Query.profitability_by_dimension(
                Query(),
                "Branch",
                start_date,
                end_date,
                branch,
                product_line,
                item_groups,
            )
            branch_list = await Query.branch_list(
                Query(), start_date, end_date, item_groups
            )
            product_analytics = await Query.product_analytics(
                Query(), start_date, end_date, branch, product_line, item_groups
            )
        else:
            logging.error(
                f"[DEBUG] dashboardData: self={self}, type(self)={type(self)}"
            )
            revenue_summary = await self.revenue_summary(
                start_date, end_date, branch, product_line, item_groups
            )
            monthly_sales_growth = await self.monthly_sales_growth(
                start_date, end_date, branch, product_line
            )
            target_attainment = await self.target_attainment(
                start_date, end_date, branch, product_line, target, item_groups
            )
            product_performance = await self.product_performance(
                start_date, end_date, branch, product_line, 10, item_groups
            )
            branch_product_heatmap = await self.branch_product_heatmap(
                start_date, end_date, branch, product_line, item_groups
            )
            top_customers = await self.top_customers(
                start_date,
                end_date,
                branch,
                100,
                None,
                None,
                None,
                product_line,
                item_groups,
            )
            margin_trends = await self.margin_trends(
                start_date, end_date, branch, product_line, item_groups
            )
            returns_analysis = await self.returns_analysis(
                start_date,
                end_date,
                None,
                None,
                None,
                branch,
                product_line,
                item_groups,
            )
            profitability_by_dimension = await self.profitability_by_dimension(
                "Branch", start_date, end_date, branch, product_line, item_groups
            )
            branch_list = await self.branch_list(start_date, end_date, item_groups)
            product_analytics = await self.product_analytics(
                start_date, end_date, branch, product_line, item_groups
            )
        return DashboardData(
            revenue_summary=revenue_summary,
            monthly_sales_growth=monthly_sales_growth,
            target_attainment=target_attainment,
            product_performance=product_performance,
            branch_product_heatmap=branch_product_heatmap,
            top_customers=top_customers,
            margin_trends=margin_trends,
            returns_analysis=returns_analysis,
            profitability_by_dimension=profitability_by_dimension,
            branch_list=branch_list,
            product_analytics=product_analytics,
        )

    @strawberry.field
    def hello(self) -> str:
        import logging

        logging.error(f"[DEBUG] hello: self={self}, type(self)={type(self)}")
        return "world"


def safe_parse_datetime_column(df, col="__time"):
    import polars as pl

    # If already Datetime, do nothing
    if df[col].dtype == pl.Datetime:
        return df
    # If integer, cast to Datetime (assume ms since epoch, adjust if needed)
    if df[col].dtype in [pl.Int64, pl.UInt64]:
        # Polars expects microseconds for Datetime, so multiply ms by 1000 if needed
        # If your data is already in us, remove the multiplication
        return df.with_columns([(pl.col(col) * 1000).cast(pl.Datetime).alias(col)])
    try:
        return df.with_columns(
            [
                pl.col(col)
                .str.strptime(pl.Datetime, format="%Y-%m-%dT%H:%M:%S.%fZ", strict=False)
                .alias(col)
            ]
        )
    except Exception:
        # Fallback: try without ms
        return df.with_columns(
            [
                pl.col(col)
                .str.strptime(pl.Datetime, format="%Y-%m-%dT%H:%M:%S%z", strict=False)
                .alias(col)
            ]
        )


schema = strawberry.Schema(query=Query)
