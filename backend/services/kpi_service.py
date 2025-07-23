import polars as pl
import numpy as np
from typing import Dict, List
import logging
import requests
from datetime import datetime
import asyncio
from backend.services.sales_data import fetch_sales_data


def _ensure_time_is_datetime(df: pl.DataFrame) -> pl.DataFrame:
    if "__time" not in df.columns:
        raise ValueError("__time column missing from DataFrame")
    dtype = df["__time"].dtype
    if dtype == pl.Datetime:
        return df
    elif dtype == pl.Int64 or dtype == pl.UInt64:
        # Assume ms since epoch, convert to us for Polars Datetime
        df = df.with_columns((pl.col("__time") * 1000).cast(pl.Datetime))
        return df
    else:
        # Try string parsing as before
        for fmt in [
            "%Y-%m-%dT%H:%M:%S%.3fZ",
            "%Y-%m-%dT%H:%M:%S%.6fZ",
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%d %H:%M:%S",
        ]:
            try:
                df = df.with_columns(
                    pl.col("__time")
                    .cast(pl.Utf8)
                    .str.strptime(pl.Datetime, fmt, strict=False)
                )
                if df["__time"].dtype == pl.Datetime:
                    return df
            except Exception:
                continue
        # Fallback: try casting directly
        try:
            df = df.with_columns(pl.col("__time").cast(pl.Datetime))
            if df["__time"].dtype == pl.Datetime:
                return df
        except Exception:
            pass
    logging.error(
        f"Failed to convert __time to Datetime. Dtype: {df['__time'].dtype}, Sample: {df['__time'].head(5)}"
    )
    raise ValueError(
        f"Failed to convert __time to Datetime. Dtype: {df['__time'].dtype}"
    )


async def calculate_monthly_sales_growth(start_date: str, end_date: str, branch: str = None, product_line: str = None) -> list:
    """
    Fetches sales data from Druid (via sales_data.py) and aggregates by month, with optional branch and product_line filters.
    Returns: [{date: string, totalSales: number, grossProfit: number}]
    """
    df = await fetch_sales_data(
        start_date,
        end_date,
        branch_names=[branch] if branch else None,
    )
    if df.is_empty():
        return []
    # Apply product_line filter if needed
    if product_line and product_line != "all":
        df = df.filter(pl.col("ProductLine") == product_line)
    # Ensure __time is datetime using the shared helper
    df = _ensure_time_is_datetime(df)
    # Group by month
    df = df.with_columns([
        pl.col("__time").dt.strftime("%Y-%m").alias("month")
    ])
    grouped = (
        df.lazy()
        .group_by("month")
        .agg([
            pl.sum("grossRevenue").alias("totalSales"),
            (pl.sum("grossRevenue") - pl.sum("totalCost")).alias("grossProfit"),
        ])
        .sort("month")
        .collect()
    )
    return [
        {
            "date": row["month"],
            "totalSales": row["totalSales"],
            "grossProfit": row["grossProfit"],
        }
        for row in grouped.iter_rows(named=True)
    ]


def calculate_sales_target_attainment(df: pl.DataFrame, target: float) -> dict:
    """
    Calculates total sales and the percentage of the target achieved.
    """
    if target == 0 or df.is_empty():
        return {"total_sales": 0.0, "attainment_percentage": 0.0}

    total_sales = float(df.lazy().select(pl.sum("grossRevenue")).collect().item())

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


def get_product_performance(df: pl.DataFrame, n: int = 5) -> List[Dict]:
    """
    Identifies the top or bottom N performing products by total sales.
    Returns data in format expected by frontend: [{product: string, sales: number}]
    """
    if df.is_empty():
        return []

    product_sales = (
        df.lazy()
        .group_by("ItemName")
        .agg(pl.sum("grossRevenue").alias("total_sales"))
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
        {"product": row["ItemName"], "sales": row["total_sales"]}
        for row in selected_products.to_dicts()
    ]


def create_branch_product_heatmap_data(df: pl.DataFrame) -> pl.DataFrame:
    """
    Creates heatmap data showing sales for each product line per branch.
    Returns unpivoted data suitable for frontend visualization.
    """
    if df.is_empty():
        return pl.DataFrame({"branch": [], "product": [], "sales": []})

    # Use the actual ProductLine column from Druid schema
    # If ProductLine is empty, create fallback based on description
    df_with_product_line = df.lazy().with_columns(
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
        .agg(pl.sum("grossRevenue").alias("sales"))
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
    df: pl.DataFrame, quotas_df: pl.DataFrame
) -> pl.DataFrame:
    """
    Calculates sales per employee and their quota attainment percentage.
    """
    employee_sales = (
        df.lazy()
        .group_by("SalesPerson")
        .agg(pl.sum("grossRevenue").alias("total_sales"))
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


def calculate_avg_deal_size_per_rep(df: pl.DataFrame) -> pl.DataFrame:
    """
    Calculates the average sale value for each employee.
    """
    avg_deal_size = (
        df.lazy()
        .group_by("SalesPerson")
        .agg(pl.mean("grossRevenue").round(2).alias("average_deal_size"))
        .sort("average_deal_size", descending=True)
        .collect()
    )
    return avg_deal_size


def calculate_branch_performance(df: pl.DataFrame) -> pl.DataFrame:
    """
    Calculate comprehensive performance metrics for each branch.
    """
    if df.is_empty():
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
        df.lazy()
        .group_by("Branch")
        .agg(
            [
                pl.sum("grossRevenue").alias("total_sales"),
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


def get_branch_list(df: pl.DataFrame) -> pl.DataFrame:
    """
    Get a simple list of all branches with basic sales data.
    last_activity will be formatted as yyyy-mm-dd string.
    """
    if df.is_empty():
        return pl.DataFrame({"Branch": [], "total_sales": [], "last_activity": []})

    df = _ensure_time_is_datetime(df)
    branch_list = (
        df.lazy()
        .group_by("Branch")
        .agg(
            [
                pl.sum("grossRevenue").alias("total_sales"),
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


def calculate_branch_growth(df: pl.DataFrame) -> pl.DataFrame:
    """
    Calculate month-over-month sales growth for each branch.
    """
    if df.is_empty():
        return pl.DataFrame(
            {"Branch": [], "__time": [], "monthly_sales": [], "growth_pct": []}
        )

    df = _ensure_time_is_datetime(df)
    # Debug: print dtype and sample
    logging.info(f"__time dtype after conversion: {df['__time'].dtype}")
    logging.info(f"__time sample: {df['__time'].head(5)}")

    monthly_branch_sales = (
        df.lazy()
        .with_columns([pl.col("__time").dt.strftime("%Y-%m").alias("month_year")])
        .group_by(["Branch", "month_year"])
        .agg(pl.sum("grossRevenue").alias("monthly_sales"))
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


def get_sales_performance(df: pl.DataFrame) -> pl.DataFrame:
    """
    Get comprehensive sales performance metrics by salesperson/employee.
    """
    if df.is_empty():
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
        df.lazy()
        .group_by("SalesPerson")
        .agg(
            [
                pl.sum("grossRevenue").alias("total_sales"),
                pl.count().alias("transaction_count"),
                pl.mean("grossRevenue").round(2).alias("average_sale"),
                pl.n_unique("Branch").alias("unique_branches"),
                pl.n_unique("ItemName").alias("unique_products"),
            ]
        )
        .sort("total_sales", descending=True)
        .collect()
    )

    return sales_performance


def get_product_analytics(df: pl.DataFrame) -> pl.DataFrame:
    """
    Get detailed product analytics including performance metrics.
    """
    if df.is_empty():
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
        df.lazy()
        .group_by(["ItemName", "ProductLine", "ItemGroup"])
        .agg(
            [
                pl.sum("grossRevenue").alias("total_sales"),
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
        .collect()
    )

    return product_analytics


def calculate_revenue_summary(df: pl.DataFrame) -> dict:
    """
    Calculate overall revenue summary metrics.
    """
    if df.is_empty():
        return {
            "total_revenue": 0.0,
            "total_transactions": 0,
            "average_transaction": 0.0,
            "unique_products": 0,
            "unique_branches": 0,
            "unique_employees": 0,
        }
    summary = (
        df.lazy()
        .select(
            [
                pl.sum("grossRevenue").alias("total_revenue"),
                pl.n_unique("ItemName").alias("unique_products"),
                pl.n_unique("Branch").alias("unique_branches"),
                pl.n_unique("SalesPerson").alias("unique_employees"),
            ]
        )
        .collect()
    )
    total_revenue = float(summary[0, "total_revenue"])
    total_transactions = df.height
    unique_products = int(summary[0, "unique_products"])
    unique_branches = int(summary[0, "unique_branches"])
    unique_employees = int(summary[0, "unique_employees"])
    average_transaction = (
        total_revenue / total_transactions if total_transactions > 0 else 0.0
    )
    return {
        "total_revenue": round(total_revenue, 2),
        "total_transactions": total_transactions,
        "average_transaction": round(average_transaction, 2),
        "unique_products": unique_products,
        "unique_branches": unique_branches,
        "unique_employees": unique_employees,
    }


def calculate_employee_performance(df: pl.DataFrame, quotas_df: pl.DataFrame) -> list:
    """
    Returns a list of employees with their total sales, quota, and attainment percentage.
    """
    if df.is_empty() or quotas_df.is_empty():
        return []
    employee_sales = (
        df.lazy()
        .group_by("SalesPerson")
        .agg(pl.sum("grossRevenue").alias("total_sales"))
        .collect()
    )
    # Both employee_sales and quotas_df are DataFrames, so join directly
    performance_df = (
        employee_sales.join(quotas_df, on="SalesPerson", how="left")
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


def calculate_margin_trends(df: pl.DataFrame) -> list:
    """
    Calculates monthly margin percentage trends.
    Returns: [{date: string, marginPct: float}]
    """
    if df.is_empty():
        return []
    df = _ensure_time_is_datetime(df)
    monthly = (
        df.lazy()
        .with_columns([pl.col("__time").dt.strftime("%Y-%m").alias("month")])
        .group_by("month")
        .agg(
            [
                pl.sum("grossRevenue").alias("revenue"),
                pl.sum("totalCost").alias("cost"),
            ]
        )
        .with_columns(
            [
                ((pl.col("revenue") - pl.col("cost")) / pl.col("revenue") * 100)
                .round(2)
                .alias("marginPct")
            ]
        )
        .sort("month")
        .collect()
    )
    result = [
        {"date": row["month"], "marginPct": row["marginPct"]}
        for row in monthly.to_dicts()
    ]
    return result
