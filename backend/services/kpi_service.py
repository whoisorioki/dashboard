import polars as pl
import numpy as np
from typing import Dict, List, Optional, Union, Any
import logging
import requests
from datetime import datetime
import asyncio
from services.sales_data import fetch_sales_data
from core.druid_client import get_data_range_from_druid
from services.mock_data_service import mock_data_fetcher
from services.metric_standards import (
    RevenueMetrics,
    ProfitMetrics,
    MarginMetrics,
    OptimizedAggregations,
    TimeBasedAggregations,
    ErrorHandling
)
from utils.lazyframe_utils import is_lazyframe_empty

# Import mock data configuration
from config.mock_data_config import USE_MOCK_DATA


def _ensure_time_is_datetime(df: pl.LazyFrame) -> pl.LazyFrame:
    """
    Ensure the __time column is properly converted to datetime.
    
    Args:
        df: Polars LazyFrame with sales data
        
    Returns:
        pl.LazyFrame: DataFrame with __time column as datetime
        
    Raises:
        ValueError: If __time column is missing or cannot be converted
    """
    try:
        # Get the schema to check if __time column exists
        schema = df.collect_schema()
        if "__time" not in schema:
            raise ValueError("__time column missing from DataFrame")
        
        # For LazyFrames, we'll apply the datetime conversion lazily
        # First, let's check if it's already datetime by collecting a small sample
        sample_df = df.select("__time").limit(1).collect()
        dtype = sample_df["__time"].dtype
        
        if dtype == pl.Datetime:
            return df
        elif dtype == pl.Int64 or dtype == pl.UInt64:
            # Druid returns timestamps in milliseconds, Polars expects microseconds
            # Check if it's already in microseconds (values > 1e15) or milliseconds
            sample_value = sample_df["__time"].item()
            if sample_value > 1e15:  # Already in microseconds
                return df.with_columns(pl.col("__time").cast(pl.Datetime))
            else:  # In milliseconds, convert to microseconds
                return df.with_columns((pl.col("__time") * 1000).cast(pl.Datetime))
        else:
            # Try string parsing as before
            for fmt in [
                "%Y-%m-%dT%H:%M:%S%.3fZ",
                "%Y-%m-%dT%H:%M:%S%.6fZ",
                "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%d %H:%M:%S",
            ]:
                try:
                    return df.with_columns(
                        pl.col("__time")
                        .cast(pl.Utf8)
                        .str.strptime(pl.Datetime, fmt, strict=False)
                    )
                except Exception:
                    continue
            # Fallback: try casting directly
            try:
                return df.with_columns(pl.col("__time").cast(pl.Datetime))
            except Exception:
                pass
    except Exception as e:
        logging.error(f"Error in _ensure_time_is_datetime: {e}")
        raise ValueError(f"Failed to convert __time to Datetime: {e}")
    
    logging.error("Failed to convert __time to Datetime")
    raise ValueError("Failed to convert __time to Datetime")


async def calculate_monthly_sales_growth(
    start_date: str,
    end_date: str,
    branch: Optional[str] = None,
    product_line: Optional[str] = None,
    item_groups: Optional[List[str]] = None,
) -> List[Dict[str, Union[str, float]]]:
    """
    Fetches sales data from Druid (via sales_data.py) and aggregates by month, with optional branch and product_line filters.
    
    Args:
        start_date: Start date in ISO format
        end_date: End date in ISO format
        branch: Optional branch filter
        product_line: Optional product line filter
        item_groups: Optional list of item groups to filter by
        
    Returns:
        List[Dict[str, Union[str, float]]]: List of monthly sales growth data
        
    Raises:
        ValueError: If required parameters are missing
    """
    if not start_date or not end_date:
        raise ValueError("start_date and end_date are required")
    
    try:
        df = await fetch_sales_data(
            start_date,
            end_date,
            branch_names=[branch] if branch else None,
            item_groups=item_groups,
        )
        
        # Check if the LazyFrame is empty by collecting a small sample
        sample_df = df.limit(1).collect()
        if sample_df.is_empty():
            return []
        
        # Apply product_line filter if needed
        if product_line and product_line != "all":
            df = df.filter(pl.col("ProductLine") == product_line)
        
        # Ensure __time is datetime using the shared helper
        df = _ensure_time_is_datetime(df)
        
        # Group by month
        df = df.with_columns([pl.col("__time").dt.strftime("%Y-%m").alias("month")])
        grouped = (
            df
            .group_by("month")
            .agg(
                [
                    (pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("totalSales"),
                    (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit"),
                ]
            )
            .sort("month")
            .collect()
        )
        
        return [
            {
                "date": row["month"],
                "totalSales": float(row["totalSales"]) if row["totalSales"] is not None else 0.0,
                "grossProfit": float(row["grossProfit"]) if row["grossProfit"] is not None else 0.0,
            }
            for row in grouped.iter_rows(named=True)
        ]
    except Exception as e:
        logging.error(f"Error in calculate_monthly_sales_growth: {e}")
        return []


def calculate_sales_target_attainment(df: pl.LazyFrame, target: float) -> Dict[str, float]:
    """
    Calculate sales target attainment percentage using standardized metrics.
    
    Args:
        df: Polars LazyFrame with sales data
        target: Target sales amount
        
    Returns:
        Dict[str, float]: Dictionary with total_sales and attainment_percentage
        
    Raises:
        ValueError: If target is invalid
    """
    if target <= 0:
        raise ValueError("Target must be greater than 0")
    
    try:
        # Use standardized net_sales calculation
        total_sales = RevenueMetrics.net_sales(df)

        # Ensure no NaN values
        if np.isnan(total_sales) or np.isinf(total_sales):
            total_sales = 0.0

        attainment_pct = (total_sales / target) * 100

        # Ensure no NaN values
        if np.isnan(attainment_pct) or np.isinf(attainment_pct):
            attainment_pct = 0.0

        return {
            "total_sales": round(total_sales, 2),
            "attainment_percentage": round(attainment_pct, 2),
        }
    except Exception as e:
        logging.error(f"Error in calculate_sales_target_attainment: {e}")
        return {
            "total_sales": 0.0,
            "attainment_percentage": 0.0,
        }


def get_product_performance(df: pl.LazyFrame, n: int = 5) -> List[Dict[str, Union[str, float]]]:
    """
    Identifies the top or bottom N performing products by total sales using standardized metrics.
    
    Args:
        df: Polars LazyFrame with sales data
        n: Number of products to return (positive for top N, negative for bottom N)
        
    Returns:
        List[Dict[str, Union[str, float]]]: List of product performance data
        
    Raises:
        ValueError: If n is 0
    """
    if n == 0:
        raise ValueError("n must be non-zero")
    
    try:
        # Check if the LazyFrame is empty by collecting a small sample
        sample_df = df.limit(1).collect()
        if sample_df.is_empty():
            return []

        product_sales = (
            df
            .group_by("ItemName")
            .agg((pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("total_sales"))
            .filter(pl.col("total_sales").is_finite())  # Filter out NaN/infinite values
            .sort("total_sales", descending=True)
            .collect()
        )

        # Select top or bottom N based on sign of n
        if n > 0:
            selected_products = product_sales.head(n)
        else:
            selected_products = product_sales.tail(abs(n))

        # Transform to frontend format
        return [
            {"product": row["ItemName"], "sales": float(row["total_sales"]) if row["total_sales"] is not None else 0.0}
            for row in selected_products.to_dicts()
        ]
    except Exception as e:
        logging.error(f"Error in get_product_performance: {e}")
        return []


def create_branch_product_heatmap_data(df: pl.LazyFrame) -> pl.DataFrame:
    """
    Creates heatmap data showing sales for each product line per branch.
    Returns unpivoted data suitable for frontend visualization.
    """
    # Check if the LazyFrame is empty by collecting a small sample
    sample_df = df.limit(1).collect()
    if sample_df.is_empty():
        return pl.DataFrame({"branch": [], "product": [], "sales": []})

    # Use the actual ProductLine column from Druid schema
    # If ProductLine is empty, create fallback based on description
    df_with_product_line = df.with_columns(
        pl.when(
            pl.col("ProductLine").is_not_null() & (pl.col("ProductLine") != "Unknown")
        )
        .then(pl.col("ProductLine"))
        .when(pl.col("ItemName").str.contains("TVS", literal=True))
        .then(pl.lit("TVS"))
        .when(pl.col("ItemName").str.contains("Piaggio", literal=True))
        .then(pl.lit("Piaggio"))
        .otherwise(pl.lit("Other"))
        .alias("product_line_clean")
    )

    # Group by branch and product, then sum sales
    heatmap_df = (
        df_with_product_line.group_by(["Branch", "product_line_clean"])
        .agg((pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("sales"))
        .with_columns(
            [
                pl.col("Branch").alias("branch"),
                pl.col("product_line_clean").alias("product"),
            ]
        )
        .select(["branch", "product", "sales"])
        .filter(pl.col("sales") > 0)  # Filter out zero/negative sales
        .sort(["branch", "product"])
        .collect()
    )

    return heatmap_df


def calculate_employee_quota_attainment(
    df: pl.LazyFrame, quotas_df: pl.DataFrame
) -> pl.DataFrame:
    """
    Calculates sales per employee and their quota attainment percentage.
    """
    employee_sales = (
        df
        .group_by("SalesPerson")
        .agg((pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("total_sales"))
        .collect()
    )
    # Both employee_sales and quotas_df are DataFrames, so join directly
    performance_df = (
        employee_sales.join(quotas_df, on="SalesPerson", how="left")
        .with_columns(
            ((pl.col("total_sales") / pl.col("quota")) * 100)
            .round(2)
            .alias("attainment_pct")
        )
        .fill_null(0)
        .sort("attainment_pct", descending=True)
    )
    return performance_df


def calculate_avg_deal_size_per_rep(df: pl.LazyFrame) -> pl.DataFrame:
    """
    Calculates the average sale value for each employee.
    """
    avg_deal_size = (
        df
        .group_by("SalesPerson")
        .agg(pl.mean("grossRevenue").round(2).alias("average_deal_size"))
        .sort("average_deal_size", descending=True)
        .collect()
    )
    return avg_deal_size


def calculate_branch_performance(df: pl.LazyFrame) -> pl.DataFrame:
    """
    Calculate comprehensive performance metrics for each branch.
    """
    # Check if the LazyFrame is empty by collecting a small sample
    sample_df = df.limit(1).collect()
    if sample_df.is_empty():
        return pl.DataFrame(
            {
                "Branch": [],
                "total_sales": [],
                "transaction_count": [],
                "average_sale": [],
                "unique_customers": [],
                "unique_products": [],
            }
        )

    branch_metrics = (
        df
        .group_by("Branch")
        .agg(
            [
                (pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("total_sales"),
                pl.count().alias("transaction_count"),
                pl.mean("grossRevenue").round(2).alias("average_sale"),
                pl.n_unique("SalesPerson").alias("unique_customers"),
                pl.n_unique("ItemName").alias("unique_products"),
            ]
        )
        .sort("total_sales", descending=True)
        .collect()
    )

    return branch_metrics


def get_branch_list(df: pl.LazyFrame) -> pl.DataFrame:
    """
    Get a simple list of all branches with basic sales data.
    last_activity will be formatted as yyyy-mm-dd string.
    """
    # Check if the LazyFrame is empty by collecting a small sample
    sample_df = df.limit(1).collect()
    if sample_df.is_empty():
        return pl.DataFrame({"Branch": [], "total_sales": [], "last_activity": []})

    df = _ensure_time_is_datetime(df)
    branch_list = (
        df
        .group_by("Branch")
        .agg(
            [
                (pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("total_sales"),
                pl.max("__time").alias("last_activity"),
            ]
        )
        .sort("total_sales", descending=True)
        .collect()
    )
    # Format last_activity as yyyy-mm-dd string
    if branch_list.height > 0:
        branch_list = branch_list.with_columns(
            pl.col("last_activity").dt.strftime("%Y-%m-%d").alias("last_activity")
        )
    return branch_list


def calculate_branch_growth(df: pl.LazyFrame) -> pl.DataFrame:
    """
    Calculate month-over-month sales growth for each branch.
    """
    # Check if the LazyFrame is empty by collecting a small sample
    sample_df = df.limit(1).collect()
    if sample_df.is_empty():
        return pl.DataFrame(
            {"Branch": [], "__time": [], "monthly_sales": [], "growth_pct": []}
        )

    df = _ensure_time_is_datetime(df)
    # Debug: print dtype and sample
    sample_time_df = df.select("__time").limit(5).collect()
    logging.info(f"__time dtype after conversion: {sample_time_df['__time'].dtype}")
    logging.info(f"__time sample: {sample_time_df['__time'].head(5)}")

    monthly_branch_sales = (
        df
        .with_columns([pl.col("__time").dt.strftime("%Y-%m").alias("month_year")])
        .group_by(["Branch", "month_year"])
        .agg((pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("monthly_sales"))
        .sort(["Branch", "month_year"])
        .collect()
    )

    growth_df = monthly_branch_sales.with_columns(
        pl.col("monthly_sales")
        .pct_change()
        .over("Branch")
        .mul(100)
        .round(2)
        .fill_nan(0.0)
        .fill_null(0.0)
        .map_elements(
            lambda x: 0.0 if (x == float("inf") or x == float("-inf")) else x,
            return_dtype=pl.Float64,
        )
        .alias("growth_pct")
    )

    return growth_df


def get_sales_performance(df: pl.LazyFrame) -> pl.DataFrame:
    """
    Get comprehensive sales performance metrics by salesperson/employee.
    """
    # Check if the LazyFrame is empty by collecting a small sample
    sample_df = df.limit(1).collect()
    if sample_df.is_empty():
        return pl.DataFrame(
            {
                "SalesPerson": [],
                "total_sales": [],
                "transaction_count": [],
                "average_sale": [],
                "unique_branches": [],
                "unique_products": [],
            }
        )

    sales_performance = (
        df
        .group_by("SalesPerson")
        .agg(
            [
                (pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("total_sales"),
                pl.count().alias("transaction_count"),
                pl.mean("grossRevenue").round(2).alias("average_sale"),
                pl.n_unique("Branch").alias("unique_branches"),
                pl.n_unique("ItemName").alias("unique_products"),
            ]
        )
        .sort("total_sales", descending=True)
    )

    # Only collect when we need the final result
    return sales_performance.collect()


def get_product_analytics(df: pl.LazyFrame) -> pl.DataFrame:
    """
    Get detailed product analytics including performance metrics.
    """
    # Check if the LazyFrame is empty by collecting a small sample
    sample_df = df.limit(1).collect()
    if sample_df.is_empty():
        return pl.DataFrame(
            {
                "ItemName": [],
                "ProductLine": [],
                "ItemGroup": [],
                "total_sales": [],
                "total_qty": [],
                "transaction_count": [],
                "unique_branches": [],
                "average_price": [],
            }
        )

    product_analytics = (
        df
        .group_by(["ItemName", "ProductLine", "ItemGroup"])
        .agg(
            [
                (pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("total_sales"),
                pl.sum("unitsSold").alias("total_qty"),
                pl.count().alias("transaction_count"),
                pl.n_unique("Branch").alias("unique_branches"),
            ]
        )
        .with_columns(
            [
                # Handle division by zero for average price calculation
                pl.when(pl.col("total_qty") != 0)
                .then(pl.col("total_sales") / pl.col("total_qty"))
                .otherwise(0.0)
                .round(2)
                .alias("average_price")
            ]
        )
        .filter(pl.col("total_sales").is_finite())  # Filter out infinite values
        .sort("total_sales", descending=True)
    )

    # Only collect when we need the final result
    return product_analytics.collect()


def calculate_revenue_summary(df: pl.LazyFrame) -> dict:
    """
    Calculate overall revenue summary metrics using optimized aggregations.
    """
    # Use optimized aggregation for all revenue summary metrics
    return OptimizedAggregations.revenue_summary_metrics(df)


def calculate_employee_performance(df: pl.LazyFrame, quotas_df: pl.DataFrame) -> list:
    """
    Returns a list of employees with their total sales, quota, and attainment percentage.
    """
    # Check if the LazyFrame is empty by collecting a small sample
    sample_df = df.limit(1).collect()
    if sample_df.is_empty() or quotas_df.is_empty():
        return []
    employee_sales = (
        df
        .group_by("SalesPerson")
        .agg((pl.sum("grossRevenue") + pl.sum("returnsValue")).alias("total_sales"))
    )
    
    # Only collect when we need the final result
    employee_sales_df = employee_sales.collect()
    
    # Both employee_sales and quotas_df are DataFrames, so join directly
    performance_df = (
        employee_sales_df.join(quotas_df, on="SalesPerson", how="left")
        .with_columns(
            [
                pl.col("total_sales"),
                pl.col("quota"),
                ((pl.col("total_sales") / pl.col("quota")) * 100)
                .round(2)
                .alias("attainment_pct"),
            ]
        )
        .fill_null(0)
        .sort("attainment_pct", descending=True)
    )
    return [
        {
            "employee": row["SalesPerson"],
            "total_sales": row["total_sales"],
            "quota": row["quota"],
            "attainment_pct": row["attainment_pct"],
        }
        for row in performance_df.to_dicts()
    ]


def calculate_margin_trends(df: pl.LazyFrame) -> list:
    """
    Calculates monthly margin percentage trends using standardized metrics.
    Returns: [{date: string, marginPct: float}]
    """
    # Check if the LazyFrame is empty by collecting a small sample
    sample_df = df.limit(1).collect()
    if sample_df.is_empty():
        return []
    
    df = _ensure_time_is_datetime(df)
    monthly = (
        df
        .with_columns([pl.col("__time").dt.strftime("%Y-%m").alias("month")])
        .group_by("month")
        .agg([
            pl.sum("grossRevenue").alias("revenue"),
            pl.sum("totalCost").alias("cost"),
        ])
        .with_columns([
            ((pl.col("revenue") - pl.col("cost")) / pl.col("revenue") * 100)
            .round(2)
            .alias("marginPct")
        ])
        .sort("month")
    )
    
    # Only collect when we need the final result
    monthly_df = monthly.collect()
    
    result = [
        {"date": row["month"], "marginPct": row["marginPct"]}
        for row in monthly_df.to_dicts()
    ]
    return result


# Removed redundant wrapper functions - using metric_standards classes directly


def sum_net_units_sold(df: pl.LazyFrame) -> float:
    """Net units sold: units sold plus units returned."""
    if is_lazyframe_empty(df):
        return 0.0
    result = (
        df.select(pl.sum("unitsSold") + pl.sum("unitsReturned")).collect()
    )
    return float(result.item())


async def get_dashboard_metrics(start_date: str, end_date: str, use_mock_data: Optional[bool] = None) -> Dict[str, Any]:
    """
    Get comprehensive dashboard metrics using either real or mock data.
    
    Args: 
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        use_mock_data: Override for mock data usage (None uses global setting)
        
    Returns:
        Dict containing all dashboard metrics
    """
    try:
        # Use the centralized fetch_sales_data which already handles mock/real fallback
        df = await fetch_sales_data(start_date, end_date)
        
        # Check if data is empty
        if is_lazyframe_empty(df):
            logging.warning("No data available for dashboard metrics")
            return {
                "revenueSummary": {},
                "monthlySalesGrowth": [],
                "topCustomers": [],
                "salespersonLeaderboard": [],
                "branchPerformance": [],
                "productAnalytics": [],
                "dataRange": {"earliestDate": start_date, "latestDate": end_date, "totalRecords": 0},
                "isMockData": True
            }
        
        # Convert to LazyFrame for processing
        lazy_df = df.lazy()
        
        # Calculate metrics using standardized metric classes directly
        revenue_summary = {
            "totalRevenue": RevenueMetrics.total_revenue(lazy_df),
            "netSales": RevenueMetrics.net_sales(lazy_df),
            "totalSales": RevenueMetrics.net_sales(lazy_df),  # Alias for netSales
            "grossProfit": ProfitMetrics.gross_profit(lazy_df),
            "grossProfitMargin": MarginMetrics.gross_margin(lazy_df),
            "totalTransactions": lazy_df.select(pl.count()).collect().item(),
            "uniqueProducts": lazy_df.select(pl.n_unique("ItemName")).collect().item(),
            "uniqueBranches": lazy_df.select(pl.n_unique("Branch")).collect().item(),
            "uniqueEmployees": lazy_df.select(pl.n_unique("SalesPerson")).collect().item(),
            "returnsValue": lazy_df.select(pl.sum("returnsValue")).collect().item(),
            "averageTransaction": RevenueMetrics.total_revenue(lazy_df) / lazy_df.select(pl.count()).collect().item() if lazy_df.select(pl.count()).collect().item() > 0 else 0,
            "netUnitsSold": sum_net_units_sold(lazy_df)
        }
        
        # Calculate other metrics
        monthly_growth = await calculate_monthly_sales_growth(start_date, end_date)
        top_customers = get_top_customers(lazy_df, 10)
        salesperson_leaderboard = get_salesperson_leaderboard(lazy_df)
        branch_performance = get_branch_performance(lazy_df)
        product_analytics = get_product_analytics(lazy_df)
        
        # Get data range
        data_range = get_data_range_from_druid()
        
        return {
            "revenueSummary": revenue_summary,
            "monthlySalesGrowth": monthly_growth,
            "topCustomers": top_customers,
            "salespersonLeaderboard": salesperson_leaderboard,
            "branchPerformance": branch_performance,
            "productAnalytics": product_analytics,
            "dataRange": data_range,
            "isMockData": False  # This will be determined by fetch_sales_data
        }
        
    except Exception as e:
        logging.error(f"Error getting dashboard metrics: {e}")
        # Return empty structure on error
        return {
            "revenueSummary": {},
            "monthlySalesGrowth": [],
            "topCustomers": [],
            "salespersonLeaderboard": [],
            "branchPerformance": [],
            "productAnalytics": [],
            "dataRange": {"earliestDate": start_date, "latestDate": end_date, "totalRecords": 0},
            "isMockData": True
        }


def get_top_customers(df: pl.LazyFrame, n: int = 10) -> List[Dict[str, Any]]:
    """Get top customers by sales amount"""
    try:
        if is_lazyframe_empty(df):
            return []
        
        customer_data = (
            df
            .group_by("CardName")
            .agg([
                pl.sum("grossRevenue").alias("salesAmount"),
                (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit")
            ])
            .sort("salesAmount", descending=True)
            .head(n)
            .collect()
        )
        
        return [
            {
                "cardName": row["CardName"],
                "salesAmount": round(row["salesAmount"], 2),
                "grossProfit": round(row["grossProfit"], 2)
            }
            for row in customer_data.iter_rows(named=True)
        ]
        
    except Exception as e:
        logging.error(f"Error getting top customers: {e}")
        return []


def get_salesperson_leaderboard(df: pl.LazyFrame) -> List[Dict[str, Any]]:
    """Get salesperson leaderboard"""
    try:
        if is_lazyframe_empty(df):
            return []
        
        salesperson_data = (
            df
            .group_by("SalesPerson")
            .agg([
                pl.sum("grossRevenue").alias("salesAmount"),
                (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit")
            ])
            .sort("salesAmount", descending=True)
            .collect()
        )
        
        return [
            {
                "salesperson": row["SalesPerson"],
                "salesAmount": round(row["salesAmount"], 2),
                "grossProfit": round(row["grossProfit"], 2)
            }
            for row in salesperson_data.iter_rows(named=True)
        ]
        
    except Exception as e:
        logging.error(f"Error getting salesperson leaderboard: {e}")
        return []


def get_branch_performance(df: pl.LazyFrame) -> List[Dict[str, Any]]:
    """Get branch performance metrics"""
    try:
        if is_lazyframe_empty(df):
            return []
        
        branch_data = (
            df
            .group_by("Branch")
            .agg([
                pl.sum("grossRevenue").alias("totalSales"),
                pl.count().alias("transactionCount"),
                pl.sum("grossRevenue").mean().alias("averageSale"),
                pl.n_unique("CardName").alias("uniqueCustomers"),
                pl.n_unique("ItemName").alias("uniqueProducts")
            ])
            .sort("totalSales", descending=True)
            .collect()
        )
        
        return [
            {
                "branch": row["Branch"],
                "totalSales": round(row["totalSales"], 2),
                "transactionCount": row["transactionCount"],
                "averageSale": round(row["averageSale"], 2),
                "uniqueCustomers": row["uniqueCustomers"],
                "uniqueProducts": row["uniqueProducts"]
            }
            for row in branch_data.iter_rows(named=True)
        ]
        
    except Exception as e:
        logging.error(f"Error getting branch performance: {e}")
        return []
