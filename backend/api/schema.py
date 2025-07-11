import strawberry
import typing
from backend.services.sales_data import fetch_sales_data


@strawberry.type
class SalesReportItem:
    """Represents a single line item from a sales report - matches exact Druid schema."""

    time: str  # Mapped from __time
    ProductLine: typing.Optional[str]
    ItemGroup: typing.Optional[str]
    Branch: typing.Optional[str]
    SalesPerson: typing.Optional[str]
    AcctName: typing.Optional[str]
    ItemName: typing.Optional[str]
    CardName: typing.Optional[str]
    grossRevenue: typing.Optional[float]
    returnsValue: typing.Optional[float]
    unitsSold: typing.Optional[float]
    unitsReturned: typing.Optional[float]
    totalCost: typing.Optional[float]
    lineItemCount: typing.Optional[int]


@strawberry.input
class TimeRangeInput:
    """Input for specifying a time range for queries."""

    start: str
    end: str


@strawberry.type
class Query:
    """The root query for the dashboard API."""

    @strawberry.field
    async def sales_report(
        self,
        time_range: TimeRangeInput,
        item_names: typing.Optional[list[str]] = None,
        sales_persons: typing.Optional[list[str]] = None,
        branch_names: typing.Optional[list[str]] = None,
    ) -> typing.List[SalesReportItem]:
        """
        Fetches sales report data based on a set of filter criteria.
        """
        df = await fetch_sales_data(
            start_date=time_range.start,
            end_date=time_range.end,
            item_names=item_names,
            sales_persons=sales_persons,
            branch_names=branch_names,
        )

        # Convert the DataFrame to a list of SalesReportItem objects
        return [
            SalesReportItem(
                time=row.get("__time", ""),
                ProductLine=row.get("ProductLine"),
                ItemGroup=row.get("ItemGroup"),
                Branch=row.get("Branch"),
                SalesPerson=row.get("SalesPerson"),
                AcctName=row.get("AcctName"),
                ItemName=row.get("ItemName"),
                CardName=row.get("CardName"),
                grossRevenue=row.get("grossRevenue"),
                returnsValue=row.get("returnsValue"),
                unitsSold=row.get("unitsSold"),
                unitsReturned=row.get("unitsReturned"),
                totalCost=row.get("totalCost"),
                lineItemCount=row.get("lineItemCount"),
            )
            for row in df.to_dicts()
        ]


# Create the executable schema
schema = strawberry.Schema(query=Query)
