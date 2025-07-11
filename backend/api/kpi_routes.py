from fastapi import APIRouter, Depends, Query, Request, HTTPException
from typing import Optional
import polars as pl
from backend.services.sales_data import fetch_sales_data
from backend.services import kpi_service
from starlette.concurrency import run_in_threadpool
from backend.api.auth_routes import require_role, verify_token
from backend.services.user_activity import log_user_activity

router = APIRouter(
    prefix="/api/kpis", 
    # dependencies=[Depends(require_role(["admin", "user"]))]
)


# Dependency to fetch sales data based on common filters
async def get_sales_data_df(
    start_date: str,
    end_date: str,
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),  # Single branch filter
    product_line: Optional[str] = Query(None),  # Product line filter
    # current_user: dict = Depends(verify_token),
) -> pl.DataFrame:
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None

    # Handle both branch_names (legacy) and branch (new) parameters
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

    # Apply product line filter if specified
    if product_line and product_line != "all":
        df = df.filter(pl.col("ProductLine") == product_line)

    return df


async def get_profitability_data_df(
    df: pl.DataFrame = Depends(get_sales_data_df),
) -> pl.DataFrame:
    """
    Dependency to add profitability columns to the sales data DataFrame.
    """
    return kpi_service.add_profitability_columns(df)


@router.get("/monthly-sales-growth")
async def monthly_sales_growth(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
    # current_user: dict = Depends(verify_token),
):
    """Calculate and return monthly sales growth."""

    # Log user activity
    # user_id = current_user.get("id")
    # if user_id:
    #     client_ip = getattr(request.client, "host", None)
    #     user_agent = request.headers.get("User-Agent")
    #     # Capture the parameters used to fetch the data for details
    #     # Note: Accessing dependency parameters directly here might be tricky.
    #     # A better approach might be to pass parameters through the dependency or log before calling the dependency.
    #     # For simplicity now, we'll just log the action.
    #     log_user_activity(
    #         user_id=user_id,
    #         action="view_monthly_sales_growth",
    #         user_agent=user_agent,
    #         ip_address=client_ip,
    #         # details can be added here if parameters are accessible or result is small
    #     )

    result = await run_in_threadpool(kpi_service.calculate_monthly_sales_growth, df)
    return result


@router.get("/sales-target-attainment")
async def sales_target_attainment(
    request: Request,
    target: float,
    df: pl.DataFrame = Depends(get_sales_data_df),
    # current_user: dict = Depends(verify_token),
):
    """Calculate and return sales target attainment."""

    # Log user activity
    # user_id = current_user.get("id")
    # if user_id:
    #     client_ip = getattr(request.client, "host", None)
    #     user_agent = request.headers.get("User-Agent")
    #     log_user_activity(
    #         user_id=user_id,
    #         action="view_sales_target_attainment",
    #         details={"target": target},
    #         user_agent=user_agent,
    #         ip_address=client_ip,
    #     )

    result = await run_in_threadpool(
        kpi_service.calculate_sales_target_attainment, df, target
    )
    return result


@router.get("/product-performance")
async def product_performance(
    request: Request,
    n: int = 5,
    df: pl.DataFrame = Depends(get_sales_data_df),
    # current_user: dict = Depends(verify_token),
):
    """Get top N product performance."""

    # Log user activity
    # user_id = current_user.get("id")
    # if user_id:
    #     client_ip = getattr(request.client, "host", None)
    #     user_agent = request.headers.get("User-Agent")
    #     log_user_activity(
    #         user_id=user_id,
    #         action="view_product_performance",
    #         details={"n": n},
    #         user_agent=user_agent,
    #         ip_address=client_ip,
    #     )

    result = await run_in_threadpool(kpi_service.get_product_performance, df, n)
    return result


@router.get("/branch-product-heatmap")
async def branch_product_heatmap(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
    # current_user: dict = Depends(verify_token),
):
    """Generate data for branch-product heatmap."""

    # Log user activity
    # user_id = current_user.get("id")
    # if user_id:
    #     client_ip = getattr(request.client, "host", None)
    #     user_agent = request.headers.get("User-Agent")
    #     log_user_activity(
    #         user_id=user_id,
    #         action="view_branch_product_heatmap",
    #         user_agent=user_agent,
    #         ip_address=client_ip,
    #     )

    result_df = await run_in_threadpool(
        kpi_service.create_branch_product_heatmap_data, df
    )
    return result_df.to_dicts()


@router.get("/employee-performance")
async def employee__performance(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
    # current_user: dict = Depends(verify_token),
):
    """Generate data for employee performance, including quota attainment."""

    # Log user activity
    # user_id = current_user.get("id")
    # if user_id:
    #     client_ip = getattr(request.client, "host", None)
    #     user_agent = request.headers.get("User-Agent")
    #     log_user_activity(
    #         user_id=user_id,
    #         action="view_employee_performance",
    #         user_agent=user_agent,
    #         ip_address=client_ip,
    #     )

    # In a real app, quotas would come from a database or another service
    quotas = {
        "John Mwangi": 500000,
        "Mary Wanjiku": 450000,
        "Peter Ochieng": 550000,
        "Walk In Customers-Showroom": 1000000,
    }
    quotas_df = pl.DataFrame(list(quotas.items()), schema=["SalesPerson", "quota"])

    result_df = await run_in_threadpool(
        kpi_service.calculate_employee_quota_attainment, df, quotas_df
    )
    return result_df.to_dicts()


@router.get("/profit-summary")
async def get_profit_summary(
    df: pl.DataFrame = Depends(get_profitability_data_df),
):
    """
    Calculate and return a summary of overall profitability metrics.
    """
    summary = await run_in_threadpool(kpi_service.calculate_revenue_summary, df)
    return summary


@router.get("/margin-trends")
async def get_margin_trends(
    df: pl.DataFrame = Depends(get_profitability_data_df),
):
    """
    Calculate and return margin trends over time.
    """
    trends = await run_in_threadpool(kpi_service.calculate_margin_trends, df)
    return trends


@router.get("/profitability-by-dimension")
async def get_profitability_by_dimension(
    dimension: str,
    df: pl.DataFrame = Depends(get_profitability_data_df),
):
    """
    Calculate and return profitability broken down by a given dimension.
    Valid dimensions: ProductLine, ItemGroup, Branch, SalesPerson
    """
    if dimension not in ["ProductLine", "ItemGroup", "Branch", "SalesPerson"]:
        raise HTTPException(status_code=400, detail="Invalid dimension specified.")

    result = await run_in_threadpool(
        kpi_service.calculate_profitability_by_dimension, df, dimension
    )
    return result.to_dicts()


@router.get("/sales-performance")
async def get_sales_performance(
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Get comprehensive sales performance metrics by salesperson/employee.
    """
    result = await run_in_threadpool(kpi_service.get_sales_performance, df)
    return result.to_dicts()


@router.get("/product-analytics")
async def get_product_analytics(
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Get detailed product analytics including performance metrics.
    """
    result = await run_in_threadpool(kpi_service.get_product_analytics, df)
    return result.to_dicts()


@router.get("/returns-analysis")
async def get_returns_analysis(
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Get analysis of product returns.
    """
    result = await run_in_threadpool(kpi_service.get_returns_analysis, df)
    return result.to_dicts()


@router.get("/top-customers")
async def get_top_customers(
    n: int = 10,
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Get the top N customers by total sales.
    """
    result = await run_in_threadpool(kpi_service.get_top_customers, df, n)
    return result.to_dicts()
