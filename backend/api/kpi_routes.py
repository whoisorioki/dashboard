from fastapi import APIRouter, Depends, Query, Request
from typing import Optional
import polars as pl
from backend.services.sales_data import fetch_sales_data
from backend.services import kpi_service
from starlette.concurrency import run_in_threadpool
from backend.api.auth_routes import verify_token
from backend.services.user_activity import log_user_activity

router = APIRouter(prefix="/api/kpis", dependencies=[Depends(verify_token)])


# Dependency to fetch sales data based on common filters
async def get_sales_data_df(
    start_date: str,
    end_date: str,
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),  # Single branch filter
    product_line: Optional[str] = Query(None),  # Product line filter
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


@router.get("/monthly-sales-growth")
async def monthly_sales_growth(
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Calculate and return monthly sales growth."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        # Capture the parameters used to fetch the data for details
        # Note: Accessing dependency parameters directly here might be tricky.
        # A better approach might be to pass parameters through the dependency or log before calling the dependency.
        # For simplicity now, we'll just log the action.
        log_user_activity(
            user_id=user_id,
            action="view_monthly_sales_growth",
            user_agent=user_agent,
            ip_address=client_ip,
            # details can be added here if parameters are accessible or result is small
        )

    result = await run_in_threadpool(kpi_service.calculate_monthly_sales_growth, df)
    return result


@router.get("/sales-target-attainment")
async def sales_target_attainment(
    target: float,
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Calculate and return sales target attainment."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="view_sales_target_attainment",
            details={"target": target},
            user_agent=user_agent,
            ip_address=client_ip,
        )

    result = await run_in_threadpool(
        kpi_service.calculate_sales_target_attainment, df, target
    )
    return result


@router.get("/product-performance")
async def product_performance(
    n: int = 5,
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Get top N product performance."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="view_product_performance",
            details={"n": n},
            user_agent=user_agent,
            ip_address=client_ip,
        )

    result = await run_in_threadpool(kpi_service.get_product_performance, df, n)
    return result


@router.get("/branch-product-heatmap")
async def branch_product_heatmap(
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Generate data for branch-product heatmap."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        # Note: Parameters for get_sales_data_df are not directly accessible here.
        # Logging just the action for now.
        log_user_activity(
            user_id=user_id,
            action="view_branch_product_heatmap",
            user_agent=user_agent,
            ip_address=client_ip,
        )

    result_df = await run_in_threadpool(
        kpi_service.create_branch_product_heatmap_data, df
    )
    return result_df.to_dicts()


@router.get("/branch-performance")
async def branch_performance(
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Get performance metrics for each branch."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="view_branch_performance",
            user_agent=user_agent,
            ip_address=client_ip,
        )

    result_df = await run_in_threadpool(kpi_service.calculate_branch_performance, df)
    return result_df.to_dicts()


@router.get("/branch-list")
async def branch_list(
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Get list of all branches with basic metrics."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="view_branch_list",
            user_agent=user_agent,
            ip_address=client_ip,
        )

    result_df = await run_in_threadpool(kpi_service.get_branch_list, df)
    return result_df.to_dicts()


@router.get("/branch-growth")
async def branch_growth(
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Get month-over-month growth for each branch."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="view_branch_growth",
            user_agent=user_agent,
            ip_address=client_ip,
        )

    result_df = await run_in_threadpool(kpi_service.calculate_branch_growth, df)
    return result_df.to_dicts()


@router.get("/sales-performance")
async def sales_performance(
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Get sales performance by employee/salesperson."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="view_sales_performance",
            user_agent=user_agent,
            ip_address=client_ip,
        )

    result_df = await run_in_threadpool(kpi_service.get_sales_performance, df)
    return result_df.to_dicts()


@router.get("/product-analytics")
async def product_analytics(
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Get detailed product analytics including top performers."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        log_user_activity(
            user_id=user_id,
            action="view_product_analytics",
            user_agent=user_agent,
            ip_address=client_ip,
        )

    result_df = await run_in_threadpool(kpi_service.get_product_analytics, df)
    return result_df.to_dicts()


@router.get("/revenue-summary")
async def revenue_summary(
    df: pl.DataFrame = Depends(get_sales_data_df),
    current_user: dict = Depends(verify_token),  # Add current_user dependency
    request: Request = Depends(),  # Add Request dependency
):
    """Get overall revenue summary metrics."""

    # Log user activity
    user_id = current_user.get("id")
    if user_id:
        client_ip = getattr(request.client, "host", None)
        user_agent = request.headers.get("User-Agent")
        # Note: Parameters for get_sales_data_df are not directly accessible here.
        # Logging just the action for now.
        log_user_activity(
            user_id=user_id,
            action="view_revenue_summary",
            user_agent=user_agent,
            ip_address=client_ip,
        )

    result = await run_in_threadpool(kpi_service.calculate_revenue_summary, df)
    return result
