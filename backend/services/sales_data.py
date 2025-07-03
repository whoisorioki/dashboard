import polars as pl
from starlette.concurrency import run_in_threadpool
from typing import Optional, List, Dict, Any
from backend.core.druid_client import druid_conn
from pydruid.utils.filters import Dimension


async def fetch_sales_data(
    start_date: str,
    end_date: str,
    item_codes: Optional[List[str]] = None,
    sales_employees: Optional[List[str]] = None,
    customer_names: Optional[List[str]] = None,
) -> pl.DataFrame:
    """
    Asynchronously fetches sales data from Druid and returns it as a Polars DataFrame.

    Args:
        start_date: Start date in ISO format
        end_date: End date in ISO format
        item_codes: Optional list of item codes to filter by
        sales_employees: Optional list of sales employees to filter by
        customer_names: Optional list of customer names to filter by

    Returns:
        pl.DataFrame: A Polars DataFrame containing the filtered sales data
    """

    def _build_filter() -> Optional[Dict[str, Any]]:
        """Helper function to build Druid filter based on provided parameters"""
        filters = []

        if item_codes:
            filters.append(
                {"type": "in", "dimension": "itemcode", "values": item_codes}
            )
        if sales_employees:
            filters.append(
                {
                    "type": "in",
                    "dimension": "a.sales_employee",
                    "values": sales_employees,
                }
            )
        if customer_names:
            filters.append(
                {"type": "in", "dimension": "ocname", "values": customer_names}
            )

        if not filters:
            return None
        if len(filters) == 1:
            return filters[0]

        # Combine multiple filters with an 'and' condition
        return {"type": "and", "fields": filters}

    def _query_druid() -> List[Dict[str, Any]]:
        """Execute the synchronous Druid query in a thread pool"""
        if druid_conn.client is None:
            raise RuntimeError(
                "Druid client is not initialized. Make sure the FastAPI app is running with the lifespan context manager."
            )

        druid_filter = _build_filter()

        query = druid_conn.client.scan(
            datasource="sales_data",
            granularity="all",
            intervals=f"{start_date}/{end_date}",
            filter=druid_filter,
            columns=[
                "__time",
                "itemcode",
                "description",
                "ocname",
                "a.sales_employee",
                "quantity",
                "price",
                "total",
            ],
        )
        # The raw result is a list of dictionaries within the query object
        # The actual events are nested in the response
        if query.result and "events" in query.result:
            return query.result["events"]
        return []

    # Execute the synchronous pydruid call in a thread pool
    sales_data_dicts = await run_in_threadpool(_query_druid)

    if not sales_data_dicts:
        return pl.DataFrame()  # Return empty DataFrame if no data

    # Directly construct Polars DataFrame from the list of dictionaries
    sales_df = pl.from_dicts(sales_data_dicts)

    # Rename columns to match the GraphQL schema
    sales_df = sales_df.rename(
        {
            "__time": "timestamp",
            "itemcode": "itemCode",
            "ocname": "customerName",
            "a.sales_employee": "salesEmployee",
            "total": "lineTotal",
        }
    )

    return sales_df
