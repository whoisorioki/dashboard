# In api/routes.py
from fastapi import APIRouter
from starlette.concurrency import run_in_threadpool
import polars as pl
from services.data_processing import heavy_polars_transform

router = APIRouter()


@router.get("/process-data")
async def process_data_endpoint():
    # Assume 'raw_df' is a Polars DataFrame fetched from Druid
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
