"""
Data Quality and Cleaning endpoint for testing and monitoring.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, Dict, Any
import polars as pl
import logging
from backend.services.sales_data import fetch_raw_sales_data, fetch_sales_data

# from backend.services.data_cleaning import SalesDataCleaner
from starlette.concurrency import run_in_threadpool

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/data-quality", tags=["data-quality"])


# Data cleaning endpoints removed as data is now cleaned in Druid. All references to SalesDataCleaner and cleaning endpoints are removed.


@router.get("/schema-info")
async def get_schema_info() -> Dict[str, Any]:
    """
    Get information about the expected schema and data types.
    """
    # Data is now cleaned in Druid. Return the current Druid schema for sales_data.
    return {
        "target_schema": {
            "__time": "TIMESTAMP",
            "ProductLine": "STRING",
            "ItemGroup": "STRING",
            "Branch": "STRING",
            "SalesPerson": "STRING",
            "AcctName": "STRING",
            "ItemName": "STRING",
            "CardName": "STRING",
            "grossRevenue": "DOUBLE",
            "returnsValue": "DOUBLE",
            "unitsSold": "DOUBLE",
            "unitsReturned": "DOUBLE",
            "totalCost": "DOUBLE",
            "lineItemCount": "LONG",
        },
        "text_standardization": {"patterns": []},
    }


@router.get("/sample-cleaning")
async def get_sample_cleaning(
    text: str = Query(
        ..., description="Text to clean and standardize", min_length=1, max_length=1000
    )
) -> Dict[str, Any]:
    """
    Test the text cleaning on a sample string.
    Returns a dictionary with the original text, cleaned text, and whether it was changed.
    """
    try:
        # Validate input
        if not text.strip():
            raise ValueError("Input text cannot be empty or only whitespace")

        # Data is now cleaned in Druid. Text cleaning endpoint is deprecated.
        return {
            "original": text,
            "cleaned": text,
            "changed": False,
            "message": "Text cleaning is now handled in Druid. No changes applied.",
        }

    except ValueError as e:
        logger.warning(f"Invalid input: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error cleaning text: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Internal error while cleaning text: {str(e)}"
        )
