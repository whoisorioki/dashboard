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
    result = await run_in_threadpool(kpi_service.calculate_monthly_sales_growth, df)
    return envelope(result, request)


@router.get("/sales-target-attainment")
async def sales_target_attainment(
    request: Request,
    target: float,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
    result = await run_in_threadpool(
        kpi_service.calculate_sales_target_attainment, df, target
    )
    return envelope(result, request)


@router.get("/product-performance")
async def product_performance(
    request: Request,
    n: int = 5,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
        "data": [
            {"ItemName": "PIAGGIO 3-WHEELER APE CITY DLX", "total_sales": 55198750.03, "total_qty": 123, "transaction_count": 51, "average_price": 448770.33}
        ],
        "error": null,
        "metadata": {"requestId": "string"}
    }
    ```*

    Error Responses:
      - 400: User error (e.g., invalid date, no data)
      - 500: Internal server error
    """
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
    result = await run_in_threadpool(kpi_service.get_product_performance, df, n)
    return envelope(result, request)


@router.get("/branch-product-heatmap")
async def branch_product_heatmap(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
    result_df = await run_in_threadpool(
        kpi_service.create_branch_product_heatmap_data, df
    )
    return envelope(result_df.to_dicts(), request)


# Apply fail-safe fallback to all remaining endpoints
@router.get("/branch-performance")
async def branch_performance(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
    result_df = await run_in_threadpool(kpi_service.calculate_branch_performance, df)
    return envelope(result_df.to_dicts(), request)


@router.get("/branch-list")
async def branch_list(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
    result_df = await run_in_threadpool(kpi_service.get_branch_list, df)
    return envelope(result_df.to_dicts(), request)


@router.get("/branch-growth")
async def branch_growth(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
    try:
        result_df = await run_in_threadpool(kpi_service.calculate_branch_growth, df)
        return envelope(result_df.to_dicts(), request)
    except Exception as e:
        logger.error(f"Error in branch_growth: {e}")
        raise HTTPException(status_code=500, detail=f"Branch growth calculation failed: {e}")


@router.get("/sales-performance")
async def sales_performance(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
    result_df = await run_in_threadpool(kpi_service.get_sales_performance, df)
    return envelope(result_df.to_dicts(), request)


@router.get("/product-analytics")
async def product_analytics(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
    result_df = await run_in_threadpool(kpi_service.get_product_analytics, df)
    return envelope(result_df.to_dicts(), request)


@router.get("/revenue-summary")
async def revenue_summary(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
    result = await run_in_threadpool(kpi_service.calculate_revenue_summary, df)
    return envelope(result, request)


@router.get("/customer-value")
async def customer_value(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
    item_names: Optional[str] = Query(None),
    sales_persons: Optional[str] = Query(None),
    branch_names: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    product_line: Optional[str] = Query(None),
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
    if df.is_empty():
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
    quotas_df = await run_in_threadpool(sales_data.get_employee_quotas)
    result = await run_in_threadpool(
        kpi_service.calculate_employee_performance, df, quotas_df
    )
    return envelope(result, request)


@router.get("/top-customers")
async def top_customers(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
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
    df = await fetch_sales_data(start_date, end_date)
    if df.is_empty():
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
async def margin_trends(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
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
    df = await fetch_sales_data(start_date, end_date)
    if df.is_empty():
        return envelope([], request)
    result = kpi_service.calculate_margin_trends(df)
    return envelope(result, request)


@router.get("/profitability-by-dimension")
async def profitability_by_dimension(
    request: Request,
    dimension: str = Query("Branch"),
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
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
    df = await fetch_sales_data(start_date, end_date)
    if df.is_empty():
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
async def returns_analysis(
    request: Request,
    start_date: str = Query("2024-06-01"),
    end_date: str = Query("2024-06-30"),
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
    df = await fetch_sales_data(start_date, end_date)
    if df.is_empty() or "returnsValue" not in df.columns:
        return envelope([], request)
    result_df = (
        df.lazy()
        .filter(pl.col("returnsValue") > 0)
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
