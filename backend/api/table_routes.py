from fastapi import APIRouter, Request, Depends, Query
from typing import Optional
import polars as pl
from services.sales_data import fetch_sales_data_with_dynamic_schema as fetch_sales_data
from utils.response_envelope import envelope
import logging

router = APIRouter(prefix="/api/tables", tags=["tables"])

logger = logging.getLogger("backend.api.table_routes")


# Dependency to fetch sales data based on common filters
async def get_sales_data_df(
    start_date: Optional[str] = Query("2024-01-01"),
    end_date: Optional[str] = Query("2024-12-31"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
) -> pl.LazyFrame:
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None

    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None

    df = await fetch_sales_data(
        start_date=start_date,
        end_date=end_date,
        item_names=item_names_list,
        sales_persons=sales_persons_list,
        branch_names=branch_names_list,
    )

    if product_line and product_line != "all":
        df = df.filter(pl.col("ProductLine") == product_line)

    return df


@router.get("/sales-data")
async def get_sales_data(
    request: Request,
    df: pl.LazyFrame = Depends(get_sales_data_df),
):
    """
    Get sales data for table display.
    
    Returns formatted sales data for table visualization.
    """
    try:
        # Get date range from query params
        start_date = request.query_params.get("start_date", "2024-01-01")
        end_date = request.query_params.get("end_date", "2024-12-31")
        
        # Mock data for now - replace with actual data processing
        table_data = {
            "columns": ["Date", "Branch", "Revenue", "Products", "Sales Person"],
            "data": [
                ["2024-01-01", "Nairobi", 50000, 150, "John Doe"],
                ["2024-01-02", "Mombasa", 45000, 120, "Jane Smith"],
                ["2024-01-03", "Kisumu", 38000, 95, "Mike Johnson"],
                ["2024-01-04", "Nakuru", 32000, 80, "Sarah Wilson"]
            ],
            "total_records": 4,
            "period": f"{start_date} to {end_date}"
        }
        
        return envelope(table_data, request)
        
    except Exception as e:
        logger.error(f"Error getting sales data: {str(e)}")
        return envelope({"error": "Failed to get sales data"}, request)


@router.get("/product-data")
async def get_product_data(
    request: Request,
    df: pl.LazyFrame = Depends(get_sales_data_df),
):
    """
    Get product data for table display.
    
    Returns formatted product data for table visualization.
    """
    try:
        # Mock data for now - replace with actual data processing
        product_data = {
            "columns": ["Product", "Category", "Units Sold", "Revenue", "Profit Margin"],
            "data": [
                ["Toyota Camry", "Sedan", 1500, 45000000, 25.5],
                ["Toyota Land Cruiser", "SUV", 1200, 38000000, 30.2],
                ["Toyota Hilux", "Truck", 800, 25000000, 28.8],
                ["Honda CG125", "Motorcycle", 5000, 15000000, 22.1]
            ],
            "total_products": 4,
            "total_revenue": 123000000
        }
        
        return envelope(product_data, request)
        
    except Exception as e:
        logger.error(f"Error getting product data: {str(e)}")
        return envelope({"error": "Failed to get product data"}, request)
