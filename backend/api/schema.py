import strawberry
import typing
from backend.services.sales_data import fetch_sales_data


@strawberry.type
class SalesReportItem:
    """Represents a single line item from a sales report."""

    timestamp: str
    itemCode: str
    description: typing.Optional[str]
    customerName: typing.Optional[str]
    salesEmployee: typing.Optional[str]
    quantity: float
    price: float
    lineTotal: float


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
        item_codes: typing.Optional[list[str]] = None,
        sales_employees: typing.Optional[list[str]] = None,
        customer_names: typing.Optional[list[str]] = None,
    ) -> typing.List[SalesReportItem]:
        """
        Fetches sales report data based on a set of filter criteria.
        """
        df = await fetch_sales_data(
            start_date=time_range.start,
            end_date=time_range.end,
            item_codes=item_codes,
            sales_employees=sales_employees,
            customer_names=customer_names,
        )

        # Convert the DataFrame to a list of SalesReportItem objects
        return [
            SalesReportItem(
                timestamp=row["timestamp"],
                itemCode=row["itemCode"],
                description=row.get("description"),  # Use get() for optional fields
                customerName=row.get("customerName"),
                salesEmployee=row.get("salesEmployee"),
                quantity=float(row["quantity"]),
                price=float(row["price"]),
                lineTotal=float(row["lineTotal"]),
            )
            for row in df.to_dicts()
        ]


# Create the executable schema
schema = strawberry.Schema(query=Query)
