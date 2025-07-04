import polars as pl
from typing import Dict, List


def calculate_monthly_sales_growth(df: pl.DataFrame) -> pl.DataFrame:
    """
    Calculates monthly sales totals and the month-over-month growth rate.
    """
    monthly_sales = (
        df.group_by_dynamic("timestamp", every="1mo")
        .agg(pl.sum("total").alias("monthly_sales"))
        .sort("timestamp")
    )

    # Calculate the percentage change from the previous month
    growth_df = monthly_sales.with_columns(
        (pl.col("monthly_sales").pct_change() * 100)
        .round(2)
        .alias("monthly_growth_pct")
    )

    return growth_df


def calculate_sales_target_attainment(df: pl.DataFrame, target: float) -> dict:
    """
    Calculates total sales and the percentage of the target achieved.
    """
    if target == 0:
        return {"total_sales": 0, "attainment_pct": 0}

    total_sales = df.select(pl.sum("total")).item()
    attainment_pct = round((total_sales / target) * 100, 2)

    return {"total_sales": total_sales, "attainment_pct": attainment_pct}


def get_product_performance(df: pl.DataFrame, n: int = 5) -> dict:
    """
    Identifies the top and bottom N performing products by total sales.
    """
    product_sales = (
        df.group_by(["itemcode", "description"])
        .agg(pl.sum("total").alias("total_sales"))
        .sort("total_sales", descending=True)
    )

    top_products = product_sales.head(n)
    bottom_products = product_sales.tail(n)

    return {
        "top_performers": top_products.to_dicts(),
        "bottom_performers": bottom_products.to_dicts(),
    }


def create_branch_product_heatmap_data(df: pl.DataFrame) -> pl.DataFrame:
    """
    Pivots the data to show sales for each product line per branch.
    This structure is ideal for generating a heatmap.
    """
    # Create a 'product_line' column for better grouping.
    df_with_product_line = df.with_columns(
        pl.when(pl.col("description").str.contains("TVS", literal=True))
        .then(pl.lit("TVS"))
        .when(pl.col("description").str.contains("Piaggio", literal=True))
        .then(pl.lit("Piaggio"))
        .otherwise(pl.lit("Other"))
        .alias("product_line")
    )

    heatmap_df = df_with_product_line.pivot(
        values="total", index="ocname", on="product_line", aggregate_function="sum"
    ).fill_null(0)

    return heatmap_df


def calculate_employee_quota_attainment(
    df: pl.DataFrame, quotas_df: pl.DataFrame
) -> pl.DataFrame:
    """
    Calculates sales per employee and their quota attainment percentage.
    """
    employee_sales = df.group_by("a.sales_employee").agg(
        pl.sum("total").alias("total_sales")
    )

    performance_df = (
        employee_sales.join(quotas_df, on="a.sales_employee", how="left")
        .with_columns(
            ((pl.col("total_sales") / pl.col("quota")) * 100)
            .round(2)
            .alias("attainment_pct")
        )
        .fill_null(0)
    )

    return performance_df.sort("attainment_pct", descending=True)


def calculate_avg_deal_size_per_rep(df: pl.DataFrame) -> pl.DataFrame:
    """
    Calculates the average sale value for each employee.
    """
    avg_deal_size = (
        df.group_by("a.sales_employee")
        .agg(pl.mean("total").round(2).alias("average_deal_size"))
        .sort("average_deal_size", descending=True)
    )

    return avg_deal_size
