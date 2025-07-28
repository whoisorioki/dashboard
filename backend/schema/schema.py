import strawberry
from typing import List, Optional
from backend.services.sales_data import fetch_sales_data, get_data_range_from_druid
from backend.services.kpi_service import calculate_revenue_summary
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
    ) -> List[ProductPerformance]:
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()

        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
        )

        if log_empty_df(
            "product_performance",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
        ):
            return []

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

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
    ) -> List[BranchProductHeatmap]:
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()

        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
        )

        if log_empty_df(
            "branch_product_heatmap",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
        ):
            return []

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

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
    ) -> List[BranchPerformance]:
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()

        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
        )

        if log_empty_df(
            "branch_performance",
            df,
            start=start_date,
            end=end_date,
            branch=branch,
            product_line=product_line,
        ):
            return []

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

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
    ) -> List[SalesPerformance]:
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
        ):
            return []

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

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
    ) -> List[ProductAnalytics]:
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
        ):
            return []

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

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
    ) -> TargetAttainment:
        if not all([start_date, end_date]):
            start_date, end_date = self._get_default_dates()

        target_val = target if target is not None else 0.0

        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            branch_names=[branch] if branch else None,
        )

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

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
    ) -> RevenueSummary:
        """
        Returns revenue summary including gross revenue, net sales, net units sold, returns value, and line item count.
        """
        default_start, default_end = Query._get_default_dates()
        start = start_date or (
            default_start
            if isinstance(default_start, str) and default_start
            else "1970-01-01T00:00:00.000Z"
        )
        end = end_date or (
            default_end
            if isinstance(default_end, str) and default_end
            else "2100-01-01T00:00:00.000Z"
        )

        df = await fetch_sales_data(
            start_date=start, end_date=end, branch_names=[branch] if branch else None
        )

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

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
    ) -> List[ProfitabilityByDimension]:
        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start,
            end_date=end,
            branch_names=[branch] if branch else None,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if log_empty_df(
            "profitability_by_dimension",
            df,
            start=start,
            end=end,
            branch=branch,
            product_line=product_line,
            dimension=dimension,
        ):
            return []
        if dimension not in df.columns:
            logging.warning(
                f"profitability_by_dimension: DataFrame missing dimension column '{dimension}' for filters: start={start}, end={end}, branch={branch}, product_line={product_line}"
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
            "ProductLine": "product_line",
            "ItemGroup": "item_group",
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
    ) -> List[ReturnsAnalysisEntry]:
        from backend.services.sales_data import fetch_sales_data
        import polars as pl
        import datetime

        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start,
            end_date=end,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names or ([branch] if branch else None),
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
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
        ):
            return []
        if "returnsValue" not in df.columns:
            logging.warning(
                f"returns_analysis: DataFrame missing 'returnsValue' column for filters: start={start}, end={end}, branch={branch}, product_line={product_line}, item_names={item_names}, sales_persons={sales_persons}, branch_names={branch_names}"
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
        n: Optional[int] = 5,
        item_names: Optional[List[str]] = None,
        sales_persons: Optional[List[str]] = None,
        branch_names: Optional[List[str]] = None,
        product_line: Optional[str] = None,
    ) -> List[TopCustomerEntry]:
        from backend.services.sales_data import fetch_sales_data
        import polars as pl
        import datetime

        # Provide default dates if not supplied
        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start,
            end_date=end,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
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
        ):
            return []
        n_val = n if n is not None else 5
        result_df = (
            df.lazy()
            .group_by("CardName")
            .agg(
                [
                    pl.sum("grossRevenue").alias("salesAmount"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit"),
                ]
            )
            .sort("salesAmount", descending=True)
            .head(n_val)
            .collect()
        )
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
        self, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> List[BranchListEntry]:
        from backend.services.sales_data import fetch_sales_data
        import polars as pl
        import datetime

        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(start_date=start, end_date=end)
        if log_empty_df("branch_list", df, start=start, end=end):
            return []
        if "Branch" not in df.columns:
            logging.warning(
                f"branch_list: DataFrame missing 'Branch' column for filters: start={start}, end={end}"
            )
            return []
        branches = df["Branch"].unique().to_list()
        return [BranchListEntry(branch=b) for b in branches]

    @strawberry.field
    async def margin_trends(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[MarginTrendEntry]:

        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start, end_date=end, branch_names=[branch] if branch else None
        )

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

        if log_empty_df(
            "margin_trends",
            df,
            start=start,
            end=end,
            branch=branch,
            product_line=product_line,
        ):
            return []
        if "__time" not in df.columns:
            logging.warning(
                f"margin_trends: DataFrame missing '__time' column for filters: start={start}, end={end}, branch={branch}, product_line={product_line}"
            )
            return []
        df = safe_parse_datetime_column(df, "__time")
        df = df.with_columns(
            [
                pl.col("__time").dt.strftime("%Y-%m-%d").alias("date"),
                (
                    (pl.col("grossRevenue") - pl.col("totalCost"))
                    / pl.col("grossRevenue")
                ).alias("margin_pct"),
            ]
        )
        result_df = (
            df.lazy()
            .group_by("date")
            .agg(
                [
                    pl.mean("margin_pct").alias("margin_pct"),
                ]
            )
            .sort("date")
            .collect()
        )
        return [
            MarginTrendEntry(date=row["date"], margin_pct=sanitize(row["margin_pct"]))
            for row in result_df.to_dicts()
        ]

    @strawberry.field
    async def product_profitability(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[ProductProfitabilityEntry]:
        from backend.services.sales_data import fetch_sales_data
        import polars as pl
        import datetime

        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start, end_date=end, branch_names=[branch] if branch else None
        )

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

        if log_empty_df(
            "product_profitability",
            df,
            start=start,
            end=end,
            branch=branch,
            product_line=product_line,
        ):
            return []
        result_df = (
            df.lazy()
            .group_by(["ProductLine", "ItemName"])
            .agg(
                [
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias(
                        "gross_profit"
                    ),
                ]
            )
            .sort("gross_profit", descending=True)
            .collect()
        )
        return [
            ProductProfitabilityEntry(
                product_line=row["ProductLine"],
                item_name=row["ItemName"],
                gross_profit=sanitize(row["gross_profit"]),
            )
            for row in result_df.to_dicts()
        ]

    @strawberry.field
    async def salesperson_leaderboard(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[SalespersonLeaderboardEntry]:
        from backend.services.sales_data import fetch_sales_data, get_employee_quotas
        import polars as pl
        import datetime

        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start, end_date=end, branch_names=[branch] if branch else None
        )

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

        if log_empty_df(
            "salesperson_leaderboard",
            df,
            start=start,
            end=end,
            branch=branch,
            product_line=product_line,
        ):
            return []
        quotas_df = get_employee_quotas(start, end)
        leaderboard = (
            df.lazy()
            .group_by("SalesPerson")
            .agg(
                [
                    pl.sum("grossRevenue").alias("sales_amount"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias(
                        "gross_profit"
                    ),
                ]
            )
            .collect()
        )
        # Join quotas
        leaderboard = leaderboard.join(quotas_df, on="SalesPerson", how="left")
        return [
            SalespersonLeaderboardEntry(
                salesperson=row["SalesPerson"],
                sales_amount=sanitize(row["sales_amount"]),
                gross_profit=sanitize(row["gross_profit"]),
                quota=sanitize(row["quota"]),
                attainment_percentage=sanitize(row["attainmentPercentage"]),
            )
            for row in leaderboard.to_dicts()
        ]

    @strawberry.field
    async def salesperson_product_mix(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[SalespersonProductMixEntry]:
        from backend.services.sales_data import fetch_sales_data
        import polars as pl
        import datetime

        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start, end_date=end, branch_names=[branch] if branch else None
        )

        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)

        if log_empty_df(
            "salesperson_product_mix",
            df,
            start=start,
            end=end,
            branch=branch,
            product_line=product_line,
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
                    ).alias("avg_profit_margin"),
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
    ) -> List[CustomerValueEntry]:
        from backend.services.sales_data import fetch_sales_data
        import polars as pl
        import datetime

        # Provide default dates if not supplied
        today = date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(
            start_date=start,
            end_date=end,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if log_empty_df(
            "customer_value",
            df,
            start=start,
            end=end,
            branch=branch,
            product_line=product_line,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names,
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
        import httpx

        base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{base_url}/api/health")
            data = res.json()
            return SystemHealth(status=data.get("data", {}).get("status", "unknown"))

    @strawberry.field
    async def druid_health(self) -> DruidHealth:
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
        import httpx

        base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{base_url}/api/health/data-version")
            data = res.json()
            return DataVersion(last_ingestion_time=data.get("lastIngestionTime", ""))

    @strawberry.field
    async def data_range(self) -> DataRange:
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
