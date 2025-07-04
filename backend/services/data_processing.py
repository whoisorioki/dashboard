import polars as pl


def heavy_polars_transform(df: pl.DataFrame) -> pl.DataFrame:
    return (
        df.group_by("sales_employee")
        .agg(
            pl.sum("total").alias("total_sales"),
            pl.mean("price").alias("average_price"),
        )
        .sort("total_sales", descending=True)
    )
