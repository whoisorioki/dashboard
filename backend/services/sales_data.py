import polars as pl
import asyncio
from datetime import datetime, timedelta
from backend.core.druid_client import druid_conn, DRUID_DATASOURCE
from starlette.concurrency import run_in_threadpool
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def fetch_sales_data(
    start_date: str,
    end_date: str,
    item_names: Optional[List[str]] = None,
    sales_persons: Optional[List[str]] = None,
    branch_names: Optional[List[str]] = None,
) -> pl.DataFrame:
    """
    Asynchronously fetches sales data from Druid and returns it as a Polars DataFrame.
    Raises HTTPException if Druid is unavailable or returns no data.
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
            response = requests.post(url, json=query, headers=headers, timeout=30)
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
        raise HTTPException(
            status_code=404, detail="No sales data found for the given filters."
        )
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
            response = requests.post(url, json=query, headers=headers, timeout=30)

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


def get_employee_quotas() -> pl.DataFrame:
    # TODO: Replace with real quota data source
    return pl.DataFrame(
        {
            "SalesPerson": ["Alice", "Bob", "Charlie", "Diana"],
            "quota": [1000000, 1200000, 900000, 1100000],
        }
    )
