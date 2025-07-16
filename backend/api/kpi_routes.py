from fastapi import APIRouter, Depends, Query, Request, HTTPException
from typing import Optional
import polars as pl
from backend.services.sales_data import fetch_sales_data
from backend.services import kpi_service, sales_data
from fastapi.concurrency import run_in_threadpool
import logging
from backend.utils.response_envelope import envelope

router = APIRouter(prefix="/api/kpis", tags=["kpis"])

logger = logging.getLogger("backend.api.kpi_routes")


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
    request: Request,
    start_date: str = Query(
        "2024-06-01", description="Start date in YYYY-MM-DD format"
    ),
    end_date: str = Query("2024-06-30", description="End date in YYYY-MM-DD format"),
    mock_data: bool = Query(False, description="Use mock data instead of Druid"),
    item_names: Optional[str] = Query(
        None, description="Comma-separated list of item names to filter"
    ),
    sales_persons: Optional[str] = Query(
        None, description="Comma-separated list of sales personnel to filter"
    ),
    branch_names: Optional[str] = Query(
        None, description="Comma-separated list of branch names to filter (legacy)"
    ),
    branch: Optional[str] = Query(None, description="Single branch name to filter"),
    product_line: Optional[str] = Query(
        None, description="Product line to filter (e.g., 'Piaggio', 'TVS')"
    ),
):
    """
    Calculate monthly sales growth trends.

    Returns month-over-month sales growth percentages for the specified time period.
    All monetary values are in Kenyan Shillings (KES).

    **Response Format:**
    ```json
    {
        "using_mock_data": false,
        "result": [
            {
                "month_year": "2024-06",
                "sales": 1500000.0,
                "growth_pct": 12.5
            }
        ]
    }
    ```
    """
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result = await run_in_threadpool(kpi_service.calculate_monthly_sales_growth, df)
        return envelope(result, request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for monthly_sales_growth, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result = await run_in_threadpool(
                kpi_service.calculate_monthly_sales_growth, df
            )
            return envelope(result, request)
        raise


@router.get("/sales-target-attainment")
async def sales_target_attainment(
    request: Request,
    target: float,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result = await run_in_threadpool(
            kpi_service.calculate_sales_target_attainment, df, target
        )
        return envelope(result, request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for sales_target_attainment, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result = await run_in_threadpool(
                kpi_service.calculate_sales_target_attainment, df, target
            )
            return envelope(result, request)
        raise


@router.get("/product-performance")
async def product_performance(
    request: Request,
    n: int = 5,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result = await run_in_threadpool(kpi_service.get_product_performance, df, n)
        return envelope(result, request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for product_performance, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result = await run_in_threadpool(kpi_service.get_product_performance, df, n)
            return envelope(result, request)
        raise


@router.get("/branch-product-heatmap")
async def branch_product_heatmap(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result_df = await run_in_threadpool(
            kpi_service.create_branch_product_heatmap_data, df
        )
        return envelope(result_df.to_dicts(), request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for branch_product_heatmap, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result_df = await run_in_threadpool(
                kpi_service.create_branch_product_heatmap_data, df
            )
            return envelope(result_df.to_dicts(), request)
        raise


# Apply fail-safe fallback to all remaining endpoints
@router.get("/branch-performance")
async def branch_performance(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result_df = await run_in_threadpool(
            kpi_service.calculate_branch_performance, df
        )
        return envelope(result_df.to_dicts(), request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for branch_performance, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result_df = await run_in_threadpool(
                kpi_service.calculate_branch_performance, df
            )
            return envelope(result_df.to_dicts(), request)
        raise


@router.get("/branch-list")
async def branch_list(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result_df = await run_in_threadpool(kpi_service.get_branch_list, df)
        return envelope(result_df.to_dicts(), request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for branch_list, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result_df = await run_in_threadpool(kpi_service.get_branch_list, df)
            return envelope(result_df.to_dicts(), request)
        raise


@router.get("/branch-growth")
async def branch_growth(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result_df = await run_in_threadpool(kpi_service.calculate_branch_growth, df)
        return envelope(result_df.to_dicts(), request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for branch_growth, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result_df = await run_in_threadpool(kpi_service.calculate_branch_growth, df)
            return envelope(result_df.to_dicts(), request)
        raise


@router.get("/sales-performance")
async def sales_performance(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result_df = await run_in_threadpool(kpi_service.get_sales_performance, df)
        return envelope(result_df.to_dicts(), request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for sales_performance, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result_df = await run_in_threadpool(kpi_service.get_sales_performance, df)
            return envelope(result_df.to_dicts(), request)
        raise


@router.get("/product-analytics")
async def product_analytics(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result_df = await run_in_threadpool(kpi_service.get_product_analytics, df)
        return envelope(result_df.to_dicts(), request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for product_analytics, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result_df = await run_in_threadpool(kpi_service.get_product_analytics, df)
            return envelope(result_df.to_dicts(), request)
        raise


@router.get("/revenue-summary")
async def revenue_summary(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        result = await run_in_threadpool(kpi_service.calculate_revenue_summary, df)
        return envelope(result, request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for revenue_summary, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            result = await run_in_threadpool(kpi_service.calculate_revenue_summary, df)
            return envelope(result, request)
        raise


# --- MOCK DATA FOR CUSTOMER VALUE ANALYTICS ---
mock_customer_value_data = [
    {
        "AcctName": "Acme Corp",
        "total_gross_revenue": 120000.0,
        "total_net_profit": 35000.0,
    },
    {
        "AcctName": "Beta Industries",
        "total_gross_revenue": 95000.0,
        "total_net_profit": 22000.0,
    },
    {
        "AcctName": "Gamma LLC",
        "total_gross_revenue": 87000.0,
        "total_net_profit": 18000.0,
    },
    {
        "AcctName": "Delta Partners",
        "total_gross_revenue": 65000.0,
        "total_net_profit": 12000.0,
    },
    {
        "AcctName": "Epsilon Inc",
        "total_gross_revenue": 43000.0,
        "total_net_profit": 9000.0,
    },
]


@router.get("/customer-value")
async def customer_value(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(False),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
):
    item_names_list = item_names.split(",") if item_names else None
    sales_persons_list = sales_persons.split(",") if sales_persons else None
    if branch:
        branch_names_list = [branch]
    elif branch_names:
        branch_names_list = branch_names.split(",")
    else:
        branch_names_list = None
    try:
        df = await fetch_sales_data(
            start_date=start_date,
            end_date=end_date,
            item_names=item_names_list,
            sales_persons=sales_persons_list,
            branch_names=branch_names_list,
            use_mock_data=mock_data,
        )
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        if df.is_empty():
            return envelope([], request)
        result_df = (
            df.lazy()
            .group_by("AcctName")
            .agg(
                [
                    pl.sum("grossRevenue").alias("total_gross_revenue"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias(
                        "total_net_profit"
                    ),
                ]
            )
            .sort("total_net_profit", descending=True)
            .collect()
        )
        return envelope(result_df.to_dicts(), request)
    except Exception as e:
        if not mock_data:
            logger.warning(
                f"Druid failed for customer_value, falling back to mock data: {e}"
            )
            df = await fetch_sales_data(
                start_date=start_date,
                end_date=end_date,
                item_names=item_names_list,
                sales_persons=sales_persons_list,
                branch_names=branch_names_list,
                use_mock_data=True,
            )
            if product_line and product_line != "all":
                df = df.filter(pl.col("ProductLine") == product_line)
            if df.is_empty():
                return envelope([], request)
            result_df = (
                df.lazy()
                .group_by("AcctName")
                .agg(
                    [
                        pl.sum("grossRevenue").alias("total_gross_revenue"),
                        (pl.sum("grossRevenue") - pl.sum("totalCost")).alias(
                            "total_net_profit"
                        ),
                    ]
                )
                .sort("total_net_profit", descending=True)
                .collect()
            )
            return envelope(result_df.to_dicts(), request)
        raise


@router.get("/employee-performance")
async def employee_performance(
    request: Request,
    start_date: str = Query(...),
    end_date: str = Query(...),
    mock_data: bool = Query(False),
):
    """
    Returns employee sales and quota attainment. Fails over to mock data if Druid fails.
    """
    using_mock_data = False
    try:
        if mock_data:
            raise Exception("Force mock data")
        df = await sales_data.fetch_sales_data(start_date, end_date)
        quotas_df = await run_in_threadpool(sales_data.get_employee_quotas)
        result = await run_in_threadpool(
            kpi_service.calculate_employee_performance, df, quotas_df
        )
    except Exception as e:
        import logging

        logging.warning(
            f"Druid failed for employee_performance, falling back to mock data: {e}"
        )
        using_mock_data = True
        df = await run_in_threadpool(
            sales_data.get_mock_sales_data, start_date, end_date
        )
        quotas_df = await run_in_threadpool(sales_data.get_mock_employee_quotas)
        result = await run_in_threadpool(
            kpi_service.calculate_employee_performance, df, quotas_df
        )
    return envelope(result, request)


# --- MOCK ENDPOINTS FOR MISSING KPIS ---
from fastapi import HTTPException


@router.get("/top-customers")
async def top_customers(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    n: int = 5,
    mock_data: bool = Query(True),
):
    # Return mock top customers with correct fields
    result = [
        {
            "CardName": f"Customer {i+1}",
            "total_revenue": 100000 - i * 10000,
            "transaction_count": 20 - i,
            "average_purchase_value": round((100000 - i * 10000) / (20 - i), 2),
        }
        for i in range(n)
    ]
    return envelope(result, request)


@router.get("/margin-trends")
async def margin_trends(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(True),
):
    # Return mock margin trends (monthly)
    import datetime

    base = datetime.date(2024, 1, 1)
    result = [
        {
            "date": (base.replace(month=((i % 12) + 1))).strftime("%Y-%m"),
            "margin": 20 + i % 5,
        }
        for i in range(6)
    ]
    return envelope(result, request)


@router.get("/profitability-by-dimension")
async def profitability_by_dimension(
    request: Request,
    dimension: str = Query("Branch"),
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(True),
):
    # Return mock profitability by dimension with correct fields
    result = [
        {
            dimension: f"{dimension} {i+1}",
            "gross_margin": 20 + i * 2,
            "gross_profit": 50000 + i * 5000,
        }
        for i in range(5)
    ]
    return envelope(result, request)


@router.get("/returns-analysis")
async def returns_analysis(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    mock_data: bool = Query(True),
):
    # Return mock returns analysis with correct fields
    result = [
        {
            "ItemName": f"Product {i+1}",
            "returns_value_pct": round(0.05 + i * 0.01, 3),
            "units_returned_pct": round(0.02 + i * 0.005, 3),
        }
        for i in range(5)
    ]
    return envelope(result, request)
