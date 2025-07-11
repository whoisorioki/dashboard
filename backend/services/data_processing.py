import polars as pl


def heavy_polars_transform(df: pl.DataFrame) -> pl.DataFrame:
    """
    Transform sales data to calculate employee performance metrics.
    Uses the original schema columns: line_total and qty (not aggregates).
    """
    # Calculate unit price if not already present
    df_with_unit_price = df.with_columns(
        [(pl.col("line_total") / pl.col("qty")).alias("unit_price")]
    )

    return (
        df_with_unit_price.group_by("sales_employee")
        .agg(
            [
                pl.sum("line_total").alias("total_sales"),
                pl.mean("unit_price").alias("average_unit_price"),
                pl.sum("qty").alias("total_quantity"),
                pl.count().alias("transaction_count"),
            ]
        )
        .sort("total_sales", descending=True)
    )
