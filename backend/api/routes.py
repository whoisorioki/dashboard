from fastapi import APIRouter
from starlette.concurrency import run_in_threadpool
import polars as pl
from backend.services.data_processing import heavy_polars_transform
from backend.services.sales_data import fetch_sales_data
from backend.core.druid_client import druid_conn

router = APIRouter(prefix="/api")


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
    """Sample endpoint demonstrating data processing with Polars."""
    # Create a sample DataFrame
    raw_df = pl.DataFrame(
        {
            "sales_employee": ["Alice", "Bob", "Alice", "Bob"],
            "total": [100, 200, 150, 250],
            "price": [10, 20, 15, 25],
        }
    )

    # Offload the blocking, CPU-bound work to the thread pool
    processed_df = await run_in_threadpool(heavy_polars_transform, raw_df)

    # The event loop was free to handle other requests during the transformation
    return processed_df.to_dicts()


@router.get("/sales")
async def get_sales(
    start_date: str,
    end_date: str,
    item_codes: str | None = None,
    sales_employees: str | None = None,
    customer_names: str | None = None,
):
    """
    Get sales data for the specified time range and filters.

    Args:
        start_date: Start date in ISO format (YYYY-MM-DD)
        end_date: End date in ISO format (YYYY-MM-DD)
        item_codes: Comma-separated list of item codes
        sales_employees: Comma-separated list of sales employee names
        customer_names: Comma-separated list of customer names
    """
    # Convert comma-separated strings to lists
    item_codes_list = item_codes.split(",") if item_codes else None
    sales_employees_list = sales_employees.split(",") if sales_employees else None
    customer_names_list = customer_names.split(",") if customer_names else None

    df = await fetch_sales_data(
        start_date=start_date,
        end_date=end_date,
        item_codes=item_codes_list,
        sales_employees=sales_employees_list,
        customer_names=customer_names_list,
    )

    return df.to_dicts()
