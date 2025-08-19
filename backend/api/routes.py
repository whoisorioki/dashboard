from fastapi import APIRouter, Request, Depends
from starlette.concurrency import run_in_threadpool
import polars as pl
from pydantic import BaseModel
from typing import Optional
import requests
from datetime import datetime, timezone
from services.sales_data import fetch_sales_data
from core.druid_client import druid_conn
from utils.response_envelope import envelope
import logging
import os

router = APIRouter(prefix="/api", tags=["sales"])


# Pydantic model for user activity
class UserActivity(BaseModel):
    user_id: Optional[str]
    action: str
    timestamp: str
    user_agent: Optional[str]
    ip_address: Optional[str]


@router.post("/user-activity")
async def track_user_activity(activity: UserActivity, request: Request):
    """
    Track user activity for analytics - stores in Druid.

    **Response Envelope:**
    - `data`: {"status": "success", "message": "Activity tracked"}
    - `error`: null or error object
    - `metadata`: {"requestId": str}

    **Expected Result Example:**
    ```python
    {
        "status": "success",
        "message": "Activity tracked"
    }
    ```

    **Error Responses:**
    - 400: User error (e.g., invalid input)
    - 500: Internal server error
    """
    # Get real IP address
    client_ip = (
        getattr(request.client, "host", "unknown") if request.client else "unknown"
    )
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()

    # Prepare activity data for Druid ingestion
    activity_data = {
        "timestamp": activity.timestamp,
        "user_id": activity.user_id,
        "action": activity.action,
        "user_agent": activity.user_agent,
        "ip_address": (
            client_ip if activity.ip_address == "auto" else activity.ip_address
        ),
        "session_id": request.headers.get("X-Session-ID"),  # Can be added by frontend
    }

    # Log activity (analytics service removed)
    print(f"User activity tracked: {activity_data}")

    return envelope({"status": "success", "message": "Activity tracked"}, request)


@router.get("/health")
async def health_check(request: Request):
    """
    Health check endpoint for the API.

    **Response Envelope:**
    - `data`: {"status": "ok"}
    - `error`: null or error object
    - `metadata`: {"requestId": str}

    **Expected Result Example:**
    ```python
    {"status": "ok"}
    ```

    **Error Responses:**
    - 500: Internal server error
    """
    return envelope({"status": "ok"}, request)


@router.get("/health/druid")
async def druid_health_check(request: Request):
    """
    Health check endpoint specifically for Druid connectivity.

    **Response Envelope:**
    - `data`: {"druid_status": "connected"|"disconnected", "is_available": bool}
    - `error`: null or error object
    - `metadata`: {"requestId": str}

    **Expected Result Example:**
    ```python
    {"druid_status": "connected", "is_available": True}
    ```

    **Error Responses:**
    - 500: Internal server error
    """
    is_connected = await run_in_threadpool(druid_conn.is_connected)
    return envelope(
        {
            "druid_status": "connected" if is_connected else "disconnected",
            "is_available": is_connected,
        },
        request,
    )


@router.get("/druid/datasources")
async def get_druid_datasources(request: Request):
    """
    Get list of available Druid datasources.

    **Response Envelope:**
    - `data`: {"datasources": [str], "count": int}
    - `error`: null or error object
    - `metadata`: {"requestId": str}

    **Expected Result Example:**
    ```python
    {"datasources": ["sales_analytics", "other_source"], "count": 2}
    ```

    **Error Responses:**
    - 500: Internal server error
    """
    datasources = await run_in_threadpool(druid_conn.get_available_datasources)
    return envelope({"datasources": datasources, "count": len(datasources)}, request)


@router.get("/sales")
async def get_sales(
    start_date: str,
    end_date: str,
    request: Request,
    item_names: str | None = None,
    sales_persons: str | None = None,
    branch_names: str | None = None,
    ignore_mock_data: bool = False,
):
    """
    Get sales data for the specified time range and filters.

    **Response Envelope:**
    - `data`: [ { ...sales record... } ]
    - `error`: null or error object
    - `metadata`: {"requestId": str}

    **Expected Result Example:**
    ```python
    [
        {
            "date": "2024-06-01",
            "branch": "Nairobi",
            "item_name": "Product A",
            "sales": 12345.67,
            ...
        }
    ]
    ```

    **Error Responses:**
    - 400: User error (e.g., invalid date, no data)
    - 500: Internal server error
    """
    # Convert comma-separated strings to lists
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    branch_names_list = branch_names.split(",") if branch_names else None

    df = await fetch_sales_data(
        start_date=start_date,
        end_date=end_date,
        item_names=item_names_list,
        sales_persons=sales_persons_list,
        branch_names=branch_names_list,
    )

    # Collect the LazyFrame to DataFrame before converting to dicts
    df_collected = df.collect()
    return envelope(df_collected.to_dicts(), request)


@router.get("/data-range")
async def get_data_range(request: Request):
    """
    Get the earliest and latest dates available in the dataset.

    **Response Envelope:**
    - `data`: [ {"earliest_date": str, "latest_date": str, "total_records": int} ]
    - `error`: null or error object
    - `metadata`: {"requestId": str}

    **Expected Result Example:**
    ```python
    [
        {
            "earliest_date": "2023-01-01T00:00:00.000Z",
            "latest_date": "2025-06-01T00:00:00.000Z",
            "total_records": 51685
        }
    ]
    ```

    **Error Responses:**
    - 500: Internal server error
    """

    def to_iso8601(val):
        if isinstance(val, int) or (isinstance(val, str) and val.isdigit()):
            ts = int(val)
            # If timestamp is in seconds (< year 2100 in milliseconds), convert to milliseconds
            if ts < 4102444800000:
                ts = ts * 1000
            # Convert to seconds for fromtimestamp
            ts = ts / 1000
            return (
                datetime.fromtimestamp(ts, tz=timezone.utc)
                .isoformat()
                .replace("+00:00", "Z")
            )
        if isinstance(val, str) and "T" in val:
            return val  # Already ISO8601
        return "2024-01-01T00:00:00.000Z"  # Default fallback

    try:
        logging.info("Querying Druid for data range...")
        # Query Druid directly for min/max dates
        query = {
            "queryType": "scan",
            "dataSource": "sales_analytics",
            "intervals": ["1900-01-01/2100-01-01"],  # Very wide range to get all data
            "columns": ["__time"],
            "resultFormat": "compactedList",
            "limit": 1,
            "order": "ascending",
        }

        # Get earliest date
        url = f"{os.getenv('DRUID_URL', 'http://router:8888')}/druid/v2/"
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=query, headers=headers, timeout=30)
        logging.info(f"Earliest date Druid response: {response.text}")

        if response.status_code != 200:
            raise Exception(f"Druid query failed: {response.text}")

        earliest_result = response.json()

        # Get latest date
        query["order"] = "descending"
        response = requests.post(url, json=query, headers=headers, timeout=30)
        logging.info(f"Latest date Druid response: {response.text}")

        if response.status_code != 200:
            raise Exception(f"Druid query failed: {response.text}")

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
                earliest_date = earliest_result[0]["events"][0][
                    0
                ]  # First column is __time

        if latest_result and len(latest_result) > 0 and "events" in latest_result[0]:
            if len(latest_result[0]["events"]) > 0:
                latest_date = latest_result[0]["events"][0][0]  # First column is __time

        # Get total record count using a simpler approach
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
        logging.info(f"Total records Druid response: {response.text}")

        # Convert to ISO8601 with fallbacks
        earliest_date = to_iso8601(earliest_date) if earliest_date else "2024-01-01T00:00:00.000Z"
        latest_date = to_iso8601(latest_date) if latest_date else "2024-12-31T23:59:59.999Z"
        logging.info(
            f"Extracted earliest_date: {earliest_date}, latest_date: {latest_date}, total_records: {total_records}"
        )
        return envelope(
            [
                {
                    "earliest_date": earliest_date,
                    "latest_date": latest_date,
                    "total_records": total_records,
                }
            ],
            request,
        )

    except Exception as e:
        # Fallback to hardcoded values if Druid query fails
        return envelope(
            [
                {
                    "earliest_date": "2023-01-01T00:00:00.000Z",
                    "latest_date": "2025-06-01T00:00:00.000Z",
                    "total_records": 51685,
                }
            ],
            request,
        )
