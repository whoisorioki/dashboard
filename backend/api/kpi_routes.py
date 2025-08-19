from fastapi import APIRouter, Depends, Query, Request, HTTPException
from typing import Optional
import polars as pl
from fastapi_redis_cache import cache
from services.sales_data import fetch_sales_data
from services import kpi_service, sales_data
from fastapi.concurrency import run_in_threadpool
import logging
from utils.response_envelope import envelope
from utils.lazyframe_utils import is_lazyframe_empty

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
) -> pl.LazyFrame:
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
@cache(expire=3600)  # Cache for 1 hour (Tier 2)
async def monthly_sales_growth(
    request: Request,
    df: pl.LazyFrame = Depends(get_sales_data_df),
):
    """
    Calculate monthly sales growth trends.

    Returns month-over-month sales growth percentages for the specified time period. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"month_year": "2024-06", "sales": 1500000.0, "growth_pct": 12.5}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    # Extract dates from query parameters
    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")
    if start_date is None:
        start_date = ""
    if end_date is None:
        end_date = ""
    result = await kpi_service.calculate_monthly_sales_growth(start_date, end_date)
    return envelope(result, request)


@router.get("/sales-target-attainment")
@cache(expire=3600)
async def sales_target_attainment(
    request: Request,
    target: float,
    df: pl.LazyFrame = Depends(get_sales_data_df),
):
    """
    Calculate sales target attainment for the specified time period.

    Returns a list of sales targets and their attainment percentages. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"target": 1000000.0, "attainment_pct": 120.0}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    result = await run_in_threadpool(
        kpi_service.calculate_sales_target_attainment, df.lazy(), target
    )
    return envelope(result, request)


@router.get("/product-performance")
@cache(expire=3600)
async def product_performance(
    request: Request,
    n: int = 5,
    df: pl.LazyFrame = Depends(get_sales_data_df),
):
    """
    Get top N performing products based on sales.

    Returns a list of products with their performance metrics. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": {
            "product": "PIAGGIO 3-WHEELER APE CITY DLX", "sales": 55198750.03
        },
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    result = await run_in_threadpool(kpi_service.get_product_performance, df.lazy(), n)
    return envelope(result, request)


@router.get("/branch-product-heatmap")
@cache(expire=3600)
async def branch_product_heatmap(
    request: Request,
    df: pl.LazyFrame = Depends(get_sales_data_df),
):
    """
    Create a heatmap of product sales by branch.

    Returns a list of branch-product sales data. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"branch": "Branch A", "product": "Product X", "sales": 100000.0}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    result_df = await run_in_threadpool(
        kpi_service.create_branch_product_heatmap_data, df.lazy()
    )
    return envelope(result_df.to_dicts(), request)


# Apply fail-safe fallback to all remaining endpoints
@router.get("/branch-performance")
@cache(expire=3600)
async def branch_performance(
    request: Request,
    df: pl.LazyFrame = Depends(get_sales_data_df),
):
    """
    Calculate branch performance metrics.

    Returns a list of branches with their performance metrics. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"branch": "Branch A", "total_sales": 1000000.0, "total_qty": 100, "transaction_count": 10, "average_price": 10000.0}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    result_df = await run_in_threadpool(kpi_service.calculate_branch_performance, df.lazy())
    return envelope(result_df.to_dicts(), request)


@router.get("/branch-list")
@cache(expire=86400)  # Cache for 24 hours (Tier 1)
async def branch_list(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Get a list of branches.

    Returns a list of branches.

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"branch": "Branch A"}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    result_df = await run_in_threadpool(kpi_service.get_branch_list, df.lazy())
    return envelope(result_df.to_dicts(), request)


@router.get("/branch-growth")
@cache(expire=3600)
async def branch_growth(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Calculate branch growth trends.

    Returns a list of branches with their growth percentages. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"branch": "Branch A", "growth_pct": 10.0}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    try:
        result_df = await run_in_threadpool(kpi_service.calculate_branch_growth, df.lazy())
        return envelope(result_df.to_dicts(), request)
    except Exception as e:
        logger.error(f"Error in branch_growth: {e}")
        raise HTTPException(
            status_code=500, detail=f"Branch growth calculation failed: {e}"
        )


@router.get("/sales-performance")
@cache(expire=3600)
async def sales_performance(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Get sales performance metrics.

    Returns a list of sales performance metrics. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"sales_person": "John Doe", "total_sales": 1000000.0, "total_qty": 100, "transaction_count": 10, "average_price": 10000.0}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    result_df = await run_in_threadpool(kpi_service.get_sales_performance, df.lazy())
    return envelope(result_df.to_dicts(), request)


@router.get("/product-analytics")
@cache(expire=3600)
async def product_analytics(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Get detailed product analytics including performance metrics for the specified time period.
    All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"ItemName": "PIAGGIO 3-WHEELER APE CITY DLX", "ProductLine": "Piaggio", "ItemGroup": "Units", "total_sales": 55198750.03, "total_qty": 123, "transaction_count": 51, "average_price": 448770.33}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    result_df = await run_in_threadpool(kpi_service.get_product_analytics, df.lazy())
    return envelope(result_df.to_dicts(), request)


@router.get("/revenue-summary")
@cache(expire=3600)
async def revenue_summary(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Calculate revenue summary for the specified time period.

    Returns a summary of total revenue, gross profit, and average gross margin. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"total_revenue": 100000000.0, "total_gross_profit": 20000000.0, "average_gross_margin": 20.0}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    if is_lazyframe_empty(df):
        return envelope([], request, warning="No data for the selected filters.")
    result = await run_in_threadpool(kpi_service.calculate_revenue_summary, df.lazy())
    return envelope(result, request)


@router.get("/customer-value")
@cache(expire=3600)
async def customer_value(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Get customer value analysis grouped by CardName (customer name) for the specified time period.
    All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"cardName": "Wanjiku Mwangi", "salesAmount": 445702880.16, "grossProfit": 130900434.02}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    if is_lazyframe_empty(df):
        return envelope([], request)
    result_df = (
        df.lazy()
        .group_by("CardName")
        .agg(
            [
                pl.sum("grossRevenue").alias("salesAmount"),
                (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit"),
            ]
        )
        .sort("grossProfit", descending=True)
        .collect()
    )
    result = [
        {
            "cardName": row["CardName"],
            "salesAmount": row["salesAmount"],
            "grossProfit": row["grossProfit"],
        }
        for row in result_df.to_dicts()
    ]
    return envelope(result, request)


@router.get("/employee-performance")
@cache(expire=3600)
async def employee_performance(
    request: Request,
    start_date: str = Query(...),
    end_date: str = Query(...),
):
    """
    Returns employee sales and quota attainment. Only real data is used.

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"employee": "John Doe", "total_sales": 1000000.0, "quota_attainment_pct": 120.0}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    df = await sales_data.fetch_sales_data(start_date, end_date)
    quotas_df = await run_in_threadpool(
        sales_data.get_employee_quotas, start_date, end_date
    )
    result = await run_in_threadpool(
        kpi_service.calculate_employee_performance, df.lazy(), quotas_df
    )
    return envelope(result, request)


@router.get("/top-customers")
@cache(expire=3600)
async def top_customers(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
    n: int = 5,
):
    """
    Get the top N customers by sales amount for the specified time period.
    All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"cardName": "Wanjiku Mwangi", "salesAmount": 123456.78, "grossProfit": 23456.78}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    if is_lazyframe_empty(df):
        return envelope([], request)
    result_df = (
        df.lazy()
        .group_by("CardName")
        .agg(
            [
                pl.sum("grossRevenue").alias("salesAmount"),
                (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit"),
            ]
        )
        .sort("salesAmount", descending=True)
        .head(n)
        .collect()
    )
    result = [
        {
            "cardName": row["CardName"],
            "salesAmount": row["salesAmount"],
            "grossProfit": row["grossProfit"],
        }
        for row in result_df.to_dicts()
    ]
    return envelope(result, request)


@router.get("/margin-trends")
@cache(expire=3600)
async def margin_trends(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Calculate margin trends for the specified time period.

    Returns a list of margin trends. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"month_year": "2024-06", "gross_margin": 20.0}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    if is_lazyframe_empty(df):
        return envelope([], request)
    result = kpi_service.calculate_margin_trends(df.lazy())
    return envelope(result, request)


@router.get("/profitability-by-dimension")
@cache(expire=3600)
async def profitability_by_dimension(
    request: Request,
    dimension: str = Query("Branch"),
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Calculate profitability by a specified dimension.

    Returns a list of profitability metrics grouped by the dimension. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"dimension": "Branch A", "gross_margin": 20.0, "gross_profit": 1000000.0}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    if is_lazyframe_empty(df):
        return envelope([], request)
    group_col = dimension
    result_df = (
        df.lazy()
        .group_by(group_col)
        .agg(
            [
                (
                    (pl.sum("grossRevenue") - pl.sum("totalCost"))
                    / pl.sum("grossRevenue")
                )
                .round(4)
                .alias("grossMargin"),
                (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit"),
            ]
        )
        .sort("grossProfit", descending=True)
        .collect()
    )
    result = [
        {
            "dimension": row[group_col],
            "grossMargin": row["grossMargin"],
            "grossProfit": row["grossProfit"],
        }
        for row in result_df.to_dicts()
    ]
    return envelope(result, request)


@router.get("/returns-analysis")
@cache(expire=3600)
async def returns_analysis(
    request: Request,
    df: pl.DataFrame = Depends(get_sales_data_df),
):
    """
    Analyze product returns for the specified time period.

    Returns a list of reasons for returns and their counts. All monetary values are in Kenyan Shillings (KES).

    Response Envelope:
      - data: list of results
      - error: null or error object
      - metadata: {"requestId": str}

    *Response Format:*
    *```json
    {
        "data": [
            {"reason": "Damaged", "count": 5}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
    if is_lazyframe_empty(df) or "returnsValue" not in df.columns:
        return envelope([], request)
    result_df = (
        df.lazy()
        .filter(pl.col("returnsValue") < 0)  # Returns should be negative values
        .group_by("ItemName")
        .agg(pl.count().alias("count"))
        .sort("count", descending=True)
        .collect()
    )
    result = [
        {"reason": row["ItemName"], "count": row["count"]}
        for row in result_df.to_dicts()
    ]
    return envelope(result, request)
