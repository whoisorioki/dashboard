import strawberry
from typing import List, Optional
from backend.services.sales_data import fetch_sales_data
from backend.services.kpi_service import calculate_revenue_summary
import asyncio
import datetime


@strawberry.type
class MonthlySalesGrowth:
    date: str
    sales: float


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
    total_sales: float
    transaction_count: int
    average_sale: float
    unique_customers: int
    unique_products: int


@strawberry.type
class BranchGrowth:
    branch: str
    month_year: str
    monthly_sales: float
    growth_pct: float


@strawberry.type
class SalesPerformance:
    sales_person: str
    total_sales: float
    transaction_count: int
    average_sale: float
    unique_branches: int
    unique_products: int


@strawberry.type
class ProductAnalytics:
    item_name: str
    product_line: str
    item_group: str
    total_sales: float
    total_qty: float
    transaction_count: int
    unique_branches: int
    average_price: float


@strawberry.type
class TargetAttainment:
    attainment_percentage: float
    total_sales: float
    target: float


@strawberry.type
class RevenueSummary:
    total_revenue: float
    gross_profit: float
    net_profit: float
    total_transactions: int
    average_transaction: float
    unique_products: int
    unique_branches: int
    unique_employees: int


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
    using_mock_data: Optional[bool]


@strawberry.type
class ProfitabilityByDimension:
    branch: Optional[str] = None
    product_line: Optional[str] = None
    item_group: Optional[str] = None
    gross_margin: Optional[float] = None
    gross_profit: Optional[float] = None


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
    sales_amount: float = strawberry.field(name="salesAmount")
    gross_profit: float = strawberry.field(name="grossProfit")


@strawberry.type
class BranchListEntry:
    branch: str


@strawberry.type
class MarginTrendEntry:
    date: str
    margin_pct: float = strawberry.field(name="marginPct")


@strawberry.type
class ProductProfitabilityEntry:
    product_line: str = strawberry.field(name="productLine")
    item_name: str = strawberry.field(name="itemName")
    gross_profit: float = strawberry.field(name="grossProfit")


@strawberry.type
class SalespersonLeaderboardEntry:
    salesperson: str
    sales_amount: float = strawberry.field(name="salesAmount")
    gross_profit: float = strawberry.field(name="grossProfit")


@strawberry.type
class SalespersonProductMixEntry:
    salesperson: str
    product_line: str = strawberry.field(name="productLine")
    avg_profit_margin: float = strawberry.field(name="avgProfitMargin")


@strawberry.type
class CustomerValueEntry:
    card_name: str = strawberry.field(name="cardName")
    sales_amount: float = strawberry.field(name="salesAmount")
    gross_profit: float = strawberry.field(name="grossProfit")


@strawberry.type
class Query:
    @strawberry.field
    def monthly_sales_growth(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[MonthlySalesGrowth]:
        return []

    @strawberry.field
    def product_performance(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        n: Optional[int] = None,
    ) -> List[ProductPerformance]:
        return []

    @strawberry.field
    def branch_product_heatmap(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[BranchProductHeatmap]:
        return []

    @strawberry.field
    def branch_performance(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[BranchPerformance]:
        return []

    @strawberry.field
    def branch_growth(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[BranchGrowth]:
        return []

    @strawberry.field
    def sales_performance(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[SalesPerformance]:
        return []

    @strawberry.field
    def product_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[ProductAnalytics]:
        return []

    @strawberry.field
    def target_attainment(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        target: Optional[float] = None,
    ) -> TargetAttainment:
        return TargetAttainment(attainment_percentage=0, total_sales=0, target=0)

    @strawberry.field
    async def revenue_summary(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> RevenueSummary:
        # Provide default dates if not supplied
        today = datetime.date.today().isoformat()
        start = start_date or today
        end = end_date or today
        df = await fetch_sales_data(start, end)
        summary = calculate_revenue_summary(df)
        return RevenueSummary(
            total_revenue=summary["total_revenue"],
            gross_profit=summary.get("gross_profit", 0.0),
            net_profit=summary.get("net_profit", 0.0),
            total_transactions=summary["total_transactions"],
            average_transaction=summary["average_transaction"],
            unique_products=summary["unique_products"],
            unique_branches=summary["unique_branches"],
            unique_employees=summary["unique_employees"],
        )

    @strawberry.field
    def profitability_by_dimension(
        self,
        dimension: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
    ) -> List[ProfitabilityByDimension]:
        return []

    @strawberry.field
    def data_range(self) -> DataRange:
        # Replace with real logic
        return DataRange(
            earliest_date="2023-01-01", latest_date="2023-12-31", total_records=1000
        )

    @strawberry.field
    def returns_analysis(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        item_names: Optional[List[str]] = None,
        sales_persons: Optional[List[str]] = None,
        branch_names: Optional[List[str]] = None,
        branch: Optional[str] = None,
        product_line: Optional[str] = None,
        mock_data: Optional[bool] = False,
    ) -> List[ReturnsAnalysisEntry]:
        # Replace with real logic
        return [ReturnsAnalysisEntry(reason="Damaged", count=5)]

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
        today = datetime.date.today().isoformat()
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
        if df.is_empty():
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
                sales_amount=row["salesAmount"],
                gross_profit=row["grossProfit"],
            )
            for row in result_df.to_dicts()
        ]

    @strawberry.field
    def branch_list(
        self, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> List[BranchListEntry]:
        return [BranchListEntry(branch="Nairobi"), BranchListEntry(branch="Mombasa")]

    @strawberry.field
    def margin_trends(
        self, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> List[MarginTrendEntry]:
        return [MarginTrendEntry(date="2024-06-01", margin_pct=12.5)]

    @strawberry.field
    def product_profitability(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
    ) -> List[ProductProfitabilityEntry]:
        return [
            ProductProfitabilityEntry(
                product_line="TVs", item_name="Samsung QLED", gross_profit=10000.0
            )
        ]

    @strawberry.field
    def salesperson_leaderboard(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
    ) -> List[SalespersonLeaderboardEntry]:
        return [
            SalespersonLeaderboardEntry(
                salesperson="Jane Doe", sales_amount=200000.0, gross_profit=50000.0
            )
        ]

    @strawberry.field
    def salesperson_product_mix(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        branch: Optional[str] = None,
    ) -> List[SalespersonProductMixEntry]:
        return [
            SalespersonProductMixEntry(
                salesperson="Jane Doe", product_line="TVs", avg_profit_margin=0.25
            )
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
        today = datetime.date.today().isoformat()
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
        if df.is_empty():
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
                sales_amount=row["salesAmount"],
                gross_profit=row["grossProfit"],
            )
            for row in result_df.to_dicts()
        ]


schema = strawberry.Schema(query=Query)
