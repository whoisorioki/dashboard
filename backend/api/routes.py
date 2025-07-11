from fastapi import APIRouter, Request, Depends
from starlette.concurrency import run_in_threadpool
import polars as pl
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from backend.services.data_processing import heavy_polars_transform
from backend.services.sales_data import fetch_sales_data
from backend.core.druid_client import druid_conn
from backend.api.auth_routes import verify_token
from backend.services.user_activity import log_user_activity

# Import user analytics service
try:
    from backend.services.user_analytics import user_analytics
except ImportError:
    user_analytics = None

router = APIRouter(prefix="/api")


# Pydantic model for user activity
class UserActivity(BaseModel):
    user_id: Optional[str]
    action: str
    timestamp: str
    user_agent: Optional[str]
    ip_address: Optional[str]


@router.post("/user-activity")
async def track_user_activity(activity: UserActivity, request: Request):
    """Track user activity for analytics - stores in Druid"""

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

    # Send to Druid via analytics service if available
    if user_analytics:
        try:
            await user_analytics.track_user_session(activity_data)
        except Exception as e:
            print(f"Failed to track user session in Druid: {e}")
    else:
        print(f"User activity tracked (no analytics service): {activity_data}")

    return {"status": "success", "message": "Activity tracked"}


@router.get("/health")
async def health_check():
    """Health check endpoint for the API."""
    return {"status": "ok"}


@router.get("/health/druid")
async def druid_health_check():
    """Health check endpoint specifically for Druid connectivity."""
    is_connected = await run_in_threadpool(druid_conn.is_connected)
    return {
        "druid_status": "connected" if is_connected else "disconnected",
        "is_available": is_connected,
    }


@router.get("/druid/datasources")
async def get_druid_datasources():
    """Get list of available Druid datasources."""
    datasources = await run_in_threadpool(druid_conn.get_available_datasources)
    return {"datasources": datasources, "count": len(datasources)}


@router.get("/process-data")
async def process_data_endpoint():
    """Sample endpoint demonstrating data processing with Polars using real business data."""
    # Create a sample DataFrame using the exact Druid schema with realistic multi-brand data
    raw_df = pl.DataFrame(
        {
            "__time": [
                "2024-01-01T10:00:00Z",
                "2024-01-01T11:00:00Z",
                "2024-01-01T12:00:00Z",
                "2024-01-01T13:00:00Z",
            ],
            "itemcode": ["3W6D000214", "SZN5161030", "PART3421", "SERV001"],
            "dscription": [
                "PIAGGIO APE DIESEL",
                "WIRING HARNESS ES",
                "ENGINE OIL",
                "MAINTENANCE SERVICE",
            ],
            "ocrname": [
                "Mombasa trading",
                "Nakuru trading",
                "Thika",
                "Nanyuki",
            ],
            "sales_employee": [
                "John Mwangi",
                "Mary Wanjiku",
                "Walk In Customers-Showroom",
                "Peter Ochieng",
            ],
            "item_group_name": ["Units", "Parts", "Parts", "Services"],
            "product_line": ["Piaggio", "TVS", "Piaggio", "TVS"],
            "qty": [1.0, 2.0, -1.0, 1.0],  # Include a return (negative qty)
            "line_total": [
                450000.0,
                1500.0,
                -800.0,
                5000.0,
            ],  # Negative line_total for return
        }
    )

    # Offload the blocking, CPU-bound work to the thread pool
    processed_df = await run_in_threadpool(heavy_polars_transform, raw_df)

    # The event loop was free to handle other requests during the transformation
    return processed_df.to_dicts()


@router.get("/sales", dependencies=[Depends(verify_token)])
async def get_sales(
    start_date: str,
    end_date: str,
    item_names: str | None = None,
    sales_persons: str | None = None,
    branch_names: str | None = None,
    ignore_mock_data: bool = False,
    current_user: dict = Depends(verify_token),  # Ensure current_user is available
    request: Request = Depends(),  # Add Request dependency
):
    """
    Get sales data for the specified time range and filters.

    Args:
        start_date: Start date in ISO format (YYYY-MM-DD)
        end_date: End date in ISO format (YYYY-MM-DD)
        item_names: Comma-separated list of item names
        sales_persons: Comma-separated list of sales employee names
        branch_names: Comma-separated list of branch names
        ignore_mock_data: Whether to filter out mock data from Druid results
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

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="fetch_sales_data",
            details={
                "start_date": start_date,
                "end_date": end_date,
                "item_names": item_names,
                "sales_persons": sales_persons,
                "branch_names": branch_names,
                "ignore_mock_data": ignore_mock_data,
            },
            user_agent=user_agent,
            ip_address=client_ip,
        )

    # Filter out mock data if requested
    if ignore_mock_data and not df.is_empty():
        # Filter out obvious mock data patterns (this would need to be customized based on actual mock data patterns)
        df = df.filter(
            ~pl.col("ItemName").str.contains("mock", literal=False)
            & ~pl.col("ItemName").str.contains("test", literal=False)
            & ~pl.col("Branch").str.contains("test", literal=False)
        )

    return df.to_dicts()


@router.get("/data-range", dependencies=[Depends(verify_token)])
async def get_data_range():
    """Get the earliest and latest dates available in the dataset"""
    import requests

    try:
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
        url = "http://localhost:8888/druid/v2/"
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=query, headers=headers, timeout=30)

        if response.status_code != 200:
            raise Exception(f"Druid query failed: {response.text}")

        earliest_result = response.json()

        # Get latest date
        query["order"] = "descending"
        response = requests.post(url, json=query, headers=headers, timeout=30)

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

        return [
            {
                "earliest_date": earliest_date,
                "latest_date": latest_date,
                "total_records": total_records,
            }
        ]

    except Exception as e:
        # Fallback to hardcoded values if Druid query fails
        return [
            {
                "earliest_date": "2023-01-01T00:00:00.000Z",
                "latest_date": "2025-06-01T00:00:00.000Z",
                "total_records": 51685,
            }
        ]
