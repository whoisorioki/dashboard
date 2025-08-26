"""
Utility functions for Polars LazyFrame operations.
"""

import polars as pl


def is_lazyframe_empty(df: pl.LazyFrame | pl.DataFrame) -> bool:
    """
    Check if a LazyFrame or DataFrame is empty by collecting a small sample.
    
    Args:
        df: Polars LazyFrame or DataFrame to check for emptiness
        
    Returns:
        bool: True if LazyFrame/DataFrame is empty, False otherwise
    """
    try:
        if isinstance(df, pl.LazyFrame):
            sample_df = df.limit(1).collect()
        else:
            sample_df = df.limit(1)
        return sample_df.is_empty()
    except Exception:
        return True
