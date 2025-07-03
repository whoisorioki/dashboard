from fastapi import APIRouter, Depends, Query
from typing import Optional
import polars as pl
from backend.services.sales_data import fetch_sales_data
from backend.services import kpi_service
from starlette.concurrency import run_in_threadpool

router = APIRouter(prefix="/api/kpis")


# Dependency to fetch sales data based on common filters
async def get_sales_data_df(
    start_date: str,
    end_date: str,
    item_codes: Optional[str] = Query(None),
    sales_employees: Optional[str] = Query(None),
    customer_names: Optional[str] = Query(None),
) -> pl.DataFrame:
    item_codes_list = item_codes.split(",") if item_codes else None
    sales_employees_list = sales_employees.split(",") if sales_employees else None
    customer_names_list = customer_names.split(",") if customer_names else None

    return await fetch_sales_data(
        start_date=start_date,
        end_date=end_date,
        item_codes=item_codes_list,
        sales_employees=sales_employees_list,
        customer_names=customer_names_list,
    )


@router.get("/monthly-sales-growth")
async def monthly_sales_growth(df: pl.DataFrame = Depends(get_sales_data_df)):
    result_df = await run_in_threadpool(kpi_service.calculate_monthly_sales_growth, df)
    return result_df.to_dicts()


@router.get("/sales-target-attainment")
async def sales_target_attainment(
    target: float, df: pl.DataFrame = Depends(get_sales_data_df)
):
    result = await run_in_threadpool(
        kpi_service.calculate_sales_target_attainment, df, target
    )
    return result


@router.get("/product-performance")
async def product_performance(
    n: int = 5, df: pl.DataFrame = Depends(get_sales_data_df)
):
    result = await run_in_threadpool(kpi_service.get_product_performance, df, n)
    return result


@router.get("/branch-product-heatmap")
async def branch_product_heatmap(df: pl.DataFrame = Depends(get_sales_data_df)):
    result_df = await run_in_threadpool(
        kpi_service.create_branch_product_heatmap_data, df
    )
    return result_df.to_dicts()
