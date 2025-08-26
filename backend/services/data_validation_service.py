"""
Data validation service using Polars and Pandera for the ingestion pipeline.
Handles file parsing, schema validation, and data quality checks.
"""

import os
import tempfile
import time
from typing import Dict, List, Optional, Tuple, Union
import polars as pl
import logging

logger = logging.getLogger(__name__)

class DataValidationService:
    """
    Service for validating uploaded data files using Polars.
    Flexible validation that focuses on data types and structure rather than exact column names.
    """
    
    def __init__(self):
        self.supported_formats = {'.csv', '.xlsx', '.xls', '.parquet'}
        self.max_file_size = 500 * 1024 * 1024  # 500MB limit
        
        # Expected data types for flexible validation
        self.expected_types = {
            'string_columns': ['ProductLine', 'ItemGroup', 'Branch', 'SalesPerson', 'AcctName', 'ItemName', 'CardName'],
            'numeric_columns': ['grossRevenue', 'returnsValue', 'unitsSold', 'unitsReturned', 'totalCost', 'lineItemCount'],
            'time_columns': ['TransactionTimestamp', '__time', 'timestamp', 'date', 'time']
        }
    
    def validate_file_format(self, filename: str) -> Tuple[bool, str]:
        """
        Validate that the file format is supported.
        
        Args:
            filename: Name of the uploaded file
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        start_time = time.time()
        
        if not filename:
            logger.info(f"File format validation failed in {time.time() - start_time:.3f}s")
            return False, "No filename provided"
        
        file_ext = os.path.splitext(filename.lower())[1]
        if file_ext not in self.supported_formats:
            logger.info(f"File format validation failed in {time.time() - start_time:.3f}s")
            return False, f"Unsupported file format: {file_ext}. Supported formats: {', '.join(self.supported_formats)}"
        
        logger.info(f"File format validation completed in {time.time() - start_time:.3f}s")
        return True, ""
    
    def validate_file_size(self, file_size: int) -> Tuple[bool, str]:
        """
        Validate that the file size is within acceptable limits.
        
        Args:
            file_size: Size of the file in bytes
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        start_time = time.time()
        
        if file_size <= 0:
            logger.info(f"File size validation failed in {time.time() - start_time:.3f}s")
            return False, "File size must be greater than 0"
        
        if file_size > self.max_file_size:
            logger.info(f"File size validation failed in {time.time() - start_time:.3f}s")
            return False, f"File size ({file_size} bytes) exceeds maximum limit ({self.max_file_size} bytes)"
        
        logger.info(f"File size validation completed in {time.time() - start_time:.3f}s")
        return True, ""
    
    def read_file_to_dataframe(self, file_path: str, file_format: str) -> Tuple[Optional[pl.DataFrame], str]:
        """
        Read a file into a Polars DataFrame based on its format.
        
        Args:
            file_path: Path to the file
            file_format: File extension (e.g., '.csv', '.xlsx')
            
        Returns:
            Tuple of (DataFrame, error_message)
        """
        start_time = time.time()
        
        try:
            if file_format == '.csv':
                df = pl.read_csv(file_path)
            elif file_format in ['.xlsx', '.xls']:
                df = pl.read_excel(file_path)
            elif file_format == '.parquet':
                df = pl.read_parquet(file_path)
            else:
                logger.error(f"File reading failed in {time.time() - start_time:.3f}s")
                return None, f"Unsupported file format: {file_format}"
            
            read_time = time.time() - start_time
            logger.info(f"File reading completed in {read_time:.3f}s - Shape: {df.shape}")
            return df, ""
            
        except Exception as e:
            error_msg = f"Failed to read file {file_path}: {str(e)}"
            logger.error(f"File reading failed in {time.time() - start_time:.3f}s: {error_msg}")
            return None, error_msg
    
    def validate_dataframe_structure(self, df: pl.DataFrame) -> Tuple[bool, List[Dict]]:
        """
        Validate the DataFrame structure flexibly.
        Focuses on data types and minimum requirements rather than exact column names.
        
        Args:
            df: Polars DataFrame to validate
            
        Returns:
            Tuple of (is_valid, validation_errors)
        """
        start_time = time.time()
        validation_errors = []
        
        try:
            # Check minimum requirements
            if len(df) == 0:
                validation_errors.append({
                    'column': 'dataframe',
                    'check': 'empty_dataframe',
                    'failure_case': 'DataFrame is empty',
                    'index': 'all'
                })
                logger.info(f"Structure validation failed in {time.time() - start_time:.3f}s")
                return False, validation_errors
            
            if len(df.columns) < 5:  # Minimum reasonable number of columns
                validation_errors.append({
                    'column': 'dataframe',
                    'check': 'insufficient_columns',
                    'failure_case': f'Only {len(df.columns)} columns found, expected at least 5',
                    'index': 'all'
                })
                logger.info(f"Structure validation failed in {time.time() - start_time:.3f}s")
                return False, validation_errors
            
            # Check for at least one time-like column
            time_check_start = time.time()
            time_columns = [col for col in df.columns if any(time_keyword in col.lower() for time_keyword in ['time', 'date', 'timestamp'])]
            if not time_columns:
                validation_errors.append({
                    'column': 'dataframe',
                    'check': 'no_time_column',
                    'failure_case': 'No time/date column found',
                    'index': 'all'
                })
            logger.debug(f"Time column check completed in {time.time() - time_check_start:.3f}s")
            
            # Check for at least some numeric columns
            numeric_check_start = time.time()
            numeric_columns = []
            for col in df.columns:
                try:
                    # Try to convert to numeric
                    numeric_col = df[col].cast(pl.Float64, strict=False)
                    if numeric_col.null_count() < len(df) * 0.5:  # At least 50% numeric
                        numeric_columns.append(col)
                except:
                    pass
            
            if len(numeric_columns) < 2:
                validation_errors.append({
                    'column': 'dataframe',
                    'check': 'insufficient_numeric_columns',
                    'failure_case': f'Only {len(numeric_columns)} numeric columns found, expected at least 2',
                    'index': 'all'
                })
            logger.debug(f"Numeric column check completed in {time.time() - numeric_check_start:.3f}s")
            
            # Check for reasonable data quality
            quality_check_start = time.time()
            for col in df.columns:
                null_count = df[col].null_count()
                null_percentage = (null_count / len(df)) * 100
                
                if null_percentage > 90:  # More than 90% null values
                    validation_errors.append({
                        'column': col,
                        'check': 'too_many_nulls',
                        'failure_case': f'{null_percentage:.1f}% null values',
                        'index': 'all'
                    })
            logger.debug(f"Data quality check completed in {time.time() - quality_check_start:.3f}s")
            
            # Note: String length validation removed due to type complexity
            # Focus on null percentage and basic structure validation
            
            total_time = time.time() - start_time
            logger.info(f"Structure validation completed in {total_time:.3f}s - Found {len(validation_errors)} issues")
            return len(validation_errors) == 0, validation_errors
            
        except Exception as e:
            error_msg = f"Unexpected error during structure validation: {str(e)}"
            logger.error(f"Structure validation failed in {time.time() - start_time:.3f}s: {error_msg}")
            return False, [{
                'column': 'system',
                'check': 'validation_error',
                'failure_case': error_msg,
                'index': 'all'
            }]
    
    def get_dataframe_info(self, df: pl.DataFrame) -> Dict:
        """
        Extract useful information about the DataFrame.
        
        Args:
            df: Polars DataFrame
            
        Returns:
            Dictionary with DataFrame information
        """
        start_time = time.time()
        
        try:
            info = {
                'row_count': len(df),
                'column_count': len(df.columns),
                'columns': df.columns,
                'dtypes': {col: str(dtype) for col, dtype in df.schema.items()},
                'memory_usage': df.estimated_size(),
                'null_counts': {col: df[col].null_count() for col in df.columns}
            }
            logger.debug(f"DataFrame info extraction completed in {time.time() - start_time:.3f}s")
            return info
        except Exception as e:
            logger.error(f"Error getting DataFrame info in {time.time() - start_time:.3f}s: {e}")
            return {
                'row_count': 0,
                'column_count': 0,
                'columns': [],
                'dtypes': {},
                'memory_usage': 0,
                'null_counts': {}
            }
    
    def validate_file(self, file_path: str, filename: str, file_size: int) -> Dict:
        """
        Complete file validation pipeline with flexible schema validation.
        
        Args:
            file_path: Path to the file
            filename: Original filename
            file_size: File size in bytes
            
        Returns:
            Dictionary with validation results
        """
        total_start_time = time.time()
        result = {
            'is_valid': False,
            'error_message': '',
            'validation_errors': [],
            'dataframe_info': {},
            'file_format': '',
            'row_count': 0,
            'timing': {}
        }
        
        try:
            # Step 1: Validate file format
            step_start = time.time()
            format_valid, format_error = self.validate_file_format(filename)
            result['timing']['format_validation'] = time.time() - step_start
            
            if not format_valid:
                result['error_message'] = format_error
                result['timing']['total'] = time.time() - total_start_time
                return result
            
            file_format = os.path.splitext(filename.lower())[1]
            result['file_format'] = file_format
            
            # Step 2: Validate file size
            step_start = time.time()
            size_valid, size_error = self.validate_file_size(file_size)
            result['timing']['size_validation'] = time.time() - step_start
            
            if not size_valid:
                result['error_message'] = size_error
                result['timing']['total'] = time.time() - total_start_time
                return result
            
            # Step 3: Read file into DataFrame
            step_start = time.time()
            df, read_error = self.read_file_to_dataframe(file_path, file_format)
            result['timing']['file_reading'] = time.time() - step_start
            
            if df is None:
                result['error_message'] = read_error
                result['timing']['total'] = time.time() - total_start_time
                return result
            
            # Step 4: Get DataFrame information
            step_start = time.time()
            result['dataframe_info'] = self.get_dataframe_info(df)
            result['row_count'] = len(df)
            result['timing']['info_extraction'] = time.time() - step_start
            
            # Step 5: Validate structure (flexible validation)
            step_start = time.time()
            structure_valid, validation_errors = self.validate_dataframe_structure(df)
            result['timing']['structure_validation'] = time.time() - step_start
            
            if not structure_valid:
                result['validation_errors'] = validation_errors
                result['error_message'] = f"Structure validation failed with {len(validation_errors)} issues"
                result['timing']['total'] = time.time() - total_start_time
                return result
            
            # All validations passed
            result['is_valid'] = True
            result['error_message'] = "Validation successful"
            result['timing']['total'] = time.time() - total_start_time
            
            logger.info(f"File validation successful in {result['timing']['total']:.3f}s: {filename}, {len(df)} rows, {len(df.columns)} columns")
            logger.info(f"Validation timing breakdown: {result['timing']}")
            return result
            
        except Exception as e:
            error_msg = f"Unexpected error during file validation: {str(e)}"
            logger.error(f"File validation failed in {time.time() - total_start_time:.3f}s: {error_msg}")
            result['error_message'] = error_msg
            result['timing']['total'] = time.time() - total_start_time
            return result
