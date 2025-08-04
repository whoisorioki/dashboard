import os
import polars as pl
import asyncio
from datetime import datetime, timedelta
from core.druid_client import druid_conn, DRUID_DATASOURCE
from starlette.concurrency import run_in_threadpool
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
import requests
import json
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def fetch_sales_data(
    start_date: str,
    end_date: str,
    item_names: Optional[List[str]] = None,
    sales_persons: Optional[List[str]] = None,
    branch_names: Optional[List[str]] = None,
    item_groups: Optional[List[str]] = None,
) -> pl.DataFrame:
    """Asynchronously fetches sales data from Druid and returns it as a Polars DataFrame.

    Raises HTTPException if Druid is unavailable or returns no data. Supports filtering by item names, sales persons, branch names, and item groups.

    Args:
        start_date (str): Start date (YYYY-MM-DD).
        end_date (str): End date (YYYY-MM-DD).
        item_names (List[str], optional): List of item names to filter by.
        sales_persons (List[str], optional): List of sales persons to filter by.
        branch_names (List[str], optional): List of branch names to filter by.
        item_groups (List[str], optional): List of item groups to filter by.

    Returns:
        pl.DataFrame: Polars DataFrame with sales data.

    Raises:
        HTTPException: If Druid is unavailable or returns no data.

    Example:
        >>> fetch_sales_data('2024-01-01', '2024-01-31', item_groups=['Parts'])
    """

    def _build_filter() -> Optional[Dict[str, Any]]:
        filters = []
        filters.append(
            {
                "type": "interval",
                "dimension": "__time",
                "intervals": [f"{start_date}T00:00:00.000Z/{end_date}T23:59:59.999Z"],
            }
        )
        if item_names:
            filters.append(
                {"type": "in", "dimension": "ItemName", "values": item_names}
            )
        if sales_persons:
            filters.append(
                {"type": "in", "dimension": "SalesPerson", "values": sales_persons}
            )
        if branch_names:
            filters.append(
                {"type": "in", "dimension": "Branch", "values": branch_names}
            )
        if item_groups:
            filters.append(
                {"type": "in", "dimension": "ItemGroup", "values": item_groups}
            )
        if not filters:
            return None
        if len(filters) == 1:
            return filters[0]
        return {"type": "and", "fields": filters}

    def _query_druid() -> List[Dict[str, Any]]:
        try:
            druid_filter = _build_filter()
            query = {
                "queryType": "scan",
                "dataSource": "sales_analytics",
                "intervals": [f"{start_date}/{end_date}"],
                "columns": [
                    "__time",
                    "ProductLine",
                    "ItemGroup",
                    "Branch",
                    "SalesPerson",
                    "AcctName",
                    "ItemName",
                    "CardName",
                    "grossRevenue",
                    "returnsValue",
                    "unitsSold",
                    "unitsReturned",
                    "totalCost",
                    "lineItemCount",
                ],
                "resultFormat": "compactedList",
            }
            if druid_filter:
                query["filter"] = druid_filter
            url = "http://localhost:8888/druid/v2/"
            headers = {"Content-Type": "application/json"}
            print(f"Sending Druid query to {url}:")
            print(query)
            start_time = time.time()
            response = requests.post(url, json=query, headers=headers, timeout=30)
            elapsed = time.time() - start_time
            print(f"Time Elapsed: {elapsed:.2f}s")
            if response.status_code != 200:
                raise Exception(
                    f"Druid query failed with status {response.status_code}: {response.text}"
                )
            result = response.json()
            events = []
            for segment in result:
                if "events" in segment and "columns" in segment:
                    columns = segment["columns"]
                    for event_row in segment["events"]:
                        event_dict = {}
                        for i, column in enumerate(columns):
                            if i < len(event_row):
                                event_dict[column] = event_row[i]
                        events.append(event_dict)
            return events
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to Druid: {str(e)}. Please check the Druid cluster status.",
            )

    sales_data_dicts = await run_in_threadpool(_query_druid)
    if not sales_data_dicts:
        # Return empty DataFrame instead of raising exception
        # This is a normal state when filters don't match any data
        logger.info(
            f"No sales data found for filters: start_date={start_date}, end_date={end_date}, branch_names={branch_names}, item_groups={item_groups}"
        )
        return pl.DataFrame()

    raw_sales_df = pl.from_dicts(sales_data_dicts)
    logger.info(
        f"Raw data retrieved from Druid: {raw_sales_df.shape[0]} rows, {raw_sales_df.shape[1]} columns"
    )
    return raw_sales_df


async def fetch_raw_sales_data(
    start_date: str,
    end_date: str,
    item_names: Optional[List[str]] = None,
    sales_persons: Optional[List[str]] = None,
    branch_names: Optional[List[str]] = None,
) -> pl.DataFrame:
    """
    Fetches raw sales data from Druid without applying any cleaning.

    Args:
        start_date: Start date in ISO format
        end_date: End date in ISO format
        item_names: Optional list of item names to filter by
        sales_persons: Optional list of sales persons to filter by
        branch_names: Optional list of branch names to filter by

    Returns:
        pl.DataFrame: A Polars DataFrame containing the raw filtered sales data
    """

    def _query_druid() -> List[Dict[str, Any]]:
        """Execute the synchronous Druid query using direct HTTP requests"""
        try:
            # Build Druid scan query
            query = {
                "queryType": "scan",
                "dataSource": "sales_analytics",
                "intervals": [f"{start_date}/{end_date}"],
                "columns": [
                    "__time",
                    "ProductLine",
                    "ItemGroup",
                    "Branch",
                    "SalesPerson",
                    "AcctName",
                    "ItemName",
                    "CardName",
                    "grossRevenue",
                    "returnsValue",
                    "unitsSold",
                    "unitsReturned",
                    "totalCost",
                    "lineItemCount",
                ],
                "resultFormat": "compactedList",
            }

            # Add filters if provided
            filters = []
            if item_names:
                filters.append(
                    {"type": "in", "dimension": "ItemName", "values": item_names}
                )
            if sales_persons:
                filters.append(
                    {"type": "in", "dimension": "SalesPerson", "values": sales_persons}
                )
            if branch_names:
                filters.append(
                    {"type": "in", "dimension": "Branch", "values": branch_names}
                )

            if filters:
                query["filter"] = (
                    {"type": "and", "fields": filters}
                    if len(filters) > 1
                    else filters[0]
                )

            # Execute HTTP request to Druid
            url = "http://localhost:8888/druid/v2/"
            headers = {"Content-Type": "application/json"}
            import time

            print(f"Sending Druid query to {url}:")
            print(query)
            start_time = time.time()
            response = requests.post(url, json=query, headers=headers, timeout=30)
            elapsed = time.time() - start_time
            print(
                f"Druid response status: {response.status_code}, time: {elapsed:.2f}s"
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to fetch raw sales data: Druid query failed with status {response.status_code}: {response.text}",
                )

            result = response.json()

            # Parse the compactedList format
            events = []
            for segment in result:
                if "events" in segment and "columns" in segment:
                    columns = segment["columns"]
                    for event_row in segment["events"]:
                        # Convert array to dictionary
                        event_dict = {}
                        for i, column in enumerate(columns):
                            if i < len(event_row):
                                event_dict[column] = event_row[i]
                        events.append(event_dict)

            return events

        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to Druid: {str(e)}. Please check the Druid cluster status.",
            )

    # Execute the synchronous druid call in a thread pool
    sales_data_dicts = await run_in_threadpool(_query_druid)

    if not sales_data_dicts:
        return pl.DataFrame(
            schema={
                "__time": pl.Datetime,
                "ProductLine": pl.Utf8,
                "ItemGroup": pl.Utf8,
                "Branch": pl.Utf8,
                "SalesPerson": pl.Utf8,
                "AcctName": pl.Utf8,
                "ItemName": pl.Utf8,
                "CardName": pl.Utf8,
                "grossRevenue": pl.Float64,
                "returnsValue": pl.Float64,
                "unitsSold": pl.Float64,
                "unitsReturned": pl.Float64,
                "totalCost": pl.Float64,
                "lineItemCount": pl.Int64,
            }
        )

    # Construct raw Polars DataFrame from the list of dictionaries
    raw_sales_df = pl.from_dicts(sales_data_dicts)

    logger.info(
        f"Raw data retrieved from Druid: {raw_sales_df.shape[0]} rows, {raw_sales_df.shape[1]} columns"
    )

    return raw_sales_df


def get_data_range_from_druid() -> dict:
    """
    Queries Druid for the min and max __time values and total record count.
    Returns a dict: { 'earliest_date': str, 'latest_date': str, 'total_records': int }
    """
    import requests
    from datetime import datetime

    def convert_timestamp_to_iso(timestamp_value):
        """Convert Unix timestamp (ms or s) to ISO 8601 string"""
        if timestamp_value is None:
            return None

        try:
            # Handle string timestamps
            if isinstance(timestamp_value, str):
                timestamp_value = int(timestamp_value)

            # If timestamp is in seconds (< year 2100 in milliseconds), convert to milliseconds
            if timestamp_value < 4102444800000:
                timestamp_value = timestamp_value * 1000

            # Convert to datetime and format as ISO string
            dt = datetime.fromtimestamp(timestamp_value / 1000)
            return dt.isoformat() + "Z"
        except (ValueError, TypeError) as e:
            print(f"Error converting timestamp {timestamp_value}: {e}")
            return None

    url = "http://localhost:8888/druid/v2/"
    headers = {"Content-Type": "application/json"}
    # Earliest date
    query = {
        "queryType": "scan",
        "dataSource": "sales_analytics",
        "intervals": ["1900-01-01/2100-01-01"],
        "columns": ["__time"],
        "resultFormat": "compactedList",
        "limit": 1,
        "order": "ascending",
    }
    response = requests.post(url, json=query, headers=headers, timeout=30)
    earliest_date = None
    if response.status_code == 200:
        result = response.json()
        if result and len(result) > 0 and "events" in result[0]:
            if len(result[0]["events"]) > 0:
                raw_earliest = result[0]["events"][0][0]
                earliest_date = convert_timestamp_to_iso(raw_earliest)
    # Latest date
    query["order"] = "descending"
    response = requests.post(url, json=query, headers=headers, timeout=30)
    latest_date = None
    if response.status_code == 200:
        result = response.json()
        if result and len(result) > 0 and "events" in result[0]:
            if len(result[0]["events"]) > 0:
                raw_latest = result[0]["events"][0][0]
                latest_date = convert_timestamp_to_iso(raw_latest)
    # Total records
    count_query = {
        "queryType": "scan",
        "dataSource": "sales_analytics",
        "intervals": ["1900-01-01/2100-01-01"],
        "columns": [],
        "resultFormat": "compactedList",
    }
    response = requests.post(url, json=count_query, headers=headers, timeout=30)
    total_records = 0
    if response.status_code == 200:
        count_result = response.json()
        for segment in count_result:
            if "events" in segment:
                total_records += len(segment["events"])
    return {
        "earliest_date": earliest_date,
        "latest_date": latest_date,
        "total_records": total_records,
    }


def get_employee_quotas(start_date: str, end_date: str) -> pl.DataFrame:
    """
    Calculates the quota for all employees as the median of total sales for all employees during the specified time period.
    Returns a DataFrame with columns: SalesPerson, quota
    """

    async def _get():
        df = await fetch_sales_data(start_date, end_date)
        if (
            df.is_empty()
            or "SalesPerson" not in df.columns
            or "grossRevenue" not in df.columns
        ):
            return pl.DataFrame({"SalesPerson": [], "quota": []})
        # Calculate total sales per employee
        sales_per_employee = (
            df.lazy()
            .group_by("SalesPerson")
            .agg([pl.sum("grossRevenue").alias("total_sales")])
            .collect()
        )
        if sales_per_employee.is_empty():
            return pl.DataFrame({"SalesPerson": [], "quota": []})
        median_quota = sales_per_employee["total_sales"].median()
        return pl.DataFrame(
            {
                "salesPerson": sales_per_employee["SalesPerson"].to_list(),
                "quota": [median_quota] * sales_per_employee.height,
            }
        )

    return asyncio.run(_get())
