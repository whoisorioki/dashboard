import polars as pl
import logging
import os
from typing import Dict, List, Any, Tuple
from datetime import datetime
import re

class DynamicSchemaService:
    """Service for dynamically analyzing CSV files and generating Druid ingestion schemas."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Common numeric patterns
        self.numeric_patterns = [
            r'amount', r'revenue', r'cost', r'price', r'quantity', r'qty', r'count',
            r'total', r'sum', r'value', r'number', r'num', r'count', r'line',
            r'unit', r'volume', r'weight', r'length', r'width', r'height',
            r'percentage', r'percent', r'rate', r'ratio', r'score', r'rating'
        ]
        
        # Common date patterns
        self.date_patterns = [
            r'date', r'time', r'timestamp', r'created', r'updated', r'start',
            r'end', r'begin', r'finish', r'expiry', r'valid', r'effective'
        ]
        
        # Common dimension patterns
        self.dimension_patterns = [
            r'name', r'id', r'code', r'type', r'category', r'group', r'class',
            r'status', r'state', r'level', r'grade', r'rank', r'position',
            r'location', r'region', r'area', r'zone', r'country', r'city',
            r'customer', r'client', r'user', r'employee', r'staff', r'person',
            r'product', r'item', r'service', r'brand', r'model', r'version'
        ]
    
    def analyze_csv_structure(self, file_path: str) -> Dict[str, Any]:
        """
        Analyzes a CSV file to determine its structure and data types.
        Returns a comprehensive analysis for schema generation.
        """
        self.logger.info(f"🔍 Analyzing CSV structure: {file_path}")
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Read a sample of the CSV to analyze structure using Polars LazyFrames
        try:
            # First get column names to create explicit schema
            import pandas as pd
            header_df = pd.read_csv(file_path, nrows=1, encoding='latin1')
            column_names = [col.strip().replace('\ufeff', '') for col in header_df.columns]
            
            # Create explicit schema with all columns as strings
            schema = {col: pl.Utf8 for col in column_names}
            
            # Use Polars with explicit schema to force string reading
            sample_lazy_df = pl.scan_csv(
                file_path,
                encoding='utf8-lossy',
                schema=schema
            )
            
            # Sample first 1000 rows for analysis
            sample_df = sample_lazy_df.head(1000).collect()
            
            # Clean column names
            sample_df.columns = [col.strip().replace('\ufeff', '') for col in sample_df.columns]
            
            self.logger.info(f"📊 CSV Analysis: {len(sample_df)} sample rows, {len(sample_df.columns)} columns")
            
        except Exception as e:
            self.logger.error(f"Failed to read CSV: {e}")
            raise
        
        # Analyze each column
        column_analysis = {}
        for col_name in sample_df.columns:
            # Get the column data and ensure it's a Polars Series
            column_data = sample_df[col_name]
            if isinstance(column_data, pl.Series):
                analysis = self._analyze_column(column_data, col_name)
                column_analysis[col_name] = analysis
            else:
                self.logger.warning(f"Column {col_name} is not a Polars Series, skipping analysis")
        
        # Determine the best timestamp column
        timestamp_column = self._find_timestamp_column(column_analysis)
        
        # Generate schema recommendations
        schema_recommendation = self._generate_schema_recommendation(
            column_analysis, timestamp_column
        )
        
        return {
            'file_path': file_path,
            'total_columns': len(sample_df.columns),
            'sample_rows': len(sample_df),
            'timestamp_column': timestamp_column,
            'column_analysis': column_analysis,
            'schema_recommendation': schema_recommendation,
            'recommended_dimensions': schema_recommendation['dimensions'],
            'recommended_metrics': schema_recommendation['metrics']
        }
    
    def _analyze_column(self, column_data: pl.Series, column_name: str) -> Dict[str, Any]:
        """Analyzes a single column to determine its characteristics."""
        col_name_lower = column_name.lower()
        
        # Check for nulls
        null_count = column_data.null_count()
        null_percentage = (null_count / len(column_data)) * 100
        
        # Check for unique values
        unique_count = column_data.n_unique()
        unique_percentage = (unique_count / len(column_data)) * 100
        
        # Determine column type
        column_type = self._determine_column_type(column_data, column_name)
        
        # Check for patterns
        is_numeric_likely = any(pattern in col_name_lower for pattern in self.numeric_patterns)
        is_date_likely = any(pattern in col_name_lower for pattern in self.date_patterns)
        is_dimension_likely = any(pattern in col_name_lower for pattern in self.dimension_patterns)
        
        # Sample values for validation
        sample_values = column_data.drop_nulls().head(5).to_list()
        
        return {
            'name': column_name,
            'type': column_type,
            'null_count': int(null_count),
            'null_percentage': round(null_percentage, 2),
            'unique_count': int(unique_count),
            'unique_percentage': round(unique_percentage, 2),
            'is_numeric_likely': is_numeric_likely,
            'is_date_likely': is_date_likely,
            'is_dimension_likely': is_dimension_likely,
            'sample_values': sample_values,
            'recommended_druid_type': self._get_druid_type_recommendation(
                column_type, is_numeric_likely, is_date_likely, unique_percentage
            )
        }
    
    def _determine_column_type(self, column_data: pl.Series, column_name: str) -> str:
        """Determines the most likely data type of a column."""
        # Remove nulls for analysis
        clean_data = column_data.drop_nulls()
        if len(clean_data) == 0:
            return 'unknown'
        
        # Check if it's a date (try common formats)
        try:
            # Try DD/MM/YYYY format first
            clean_data.str.to_datetime(format="%d/%m/%Y")
            return 'date'
        except:
            try:
                # Try other common formats
                clean_data.str.to_datetime()
                return 'date'
            except:
                pass
        
        # Check if it's numeric (but be more careful)
        try:
            # Remove commas and quotes first
            cleaned = clean_data.str.replace_all(',', '').str.replace_all('"', '')
            # Only consider it numeric if it's mostly numbers
            numeric_count = cleaned.str.contains(r'^\d+\.?\d*$').sum()
            if numeric_count / len(cleaned) > 0.8:  # 80% must be pure numbers
                cleaned.cast(pl.Float64, strict=False)
                return 'numeric'
        except:
            pass
        
        # Check if it's boolean
        if clean_data.is_in(['true', 'false', 'True', 'False', '1', '0', 'yes', 'no']).all():
            return 'boolean'
        
        # Default to string
        return 'string'
    
    def _get_druid_type_recommendation(self, column_type: str, is_numeric_likely: bool, 
                                      is_date_likely: bool, unique_percentage: float) -> str:
        """Recommends the best Druid data type for a column."""
        if column_type == 'numeric' or is_numeric_likely:
            return 'double'
        elif column_type == 'date' or is_date_likely:
            return 'timestamp'
        elif unique_percentage < 50:  # Low cardinality
            return 'string'
        else:  # High cardinality
            return 'string'
    
    def _find_timestamp_column(self, column_analysis: Dict[str, Any]) -> str:
        """Finds the best candidate for the timestamp column."""
        timestamp_candidates = []
        
        for col_name, analysis in column_analysis.items():
            score = 0
            
            # Prefer columns with 'date' or 'time' in the name
            if analysis['is_date_likely']:
                score += 10
            
            # Prefer actual date types
            if analysis['type'] == 'date':
                score += 8
            
            # Prefer columns with reasonable null percentages
            if analysis['null_percentage'] < 20:
                score += 5
            
            # Prefer columns with good data coverage
            if analysis['unique_percentage'] > 10:
                score += 3
            
            if score > 0:
                timestamp_candidates.append((col_name, score))
        
        if timestamp_candidates:
            # Sort by score and return the best candidate
            timestamp_candidates.sort(key=lambda x: x[1], reverse=True)
            return timestamp_candidates[0][0]
        
        # Fallback: look for any date column
        for col_name, analysis in column_analysis.items():
            if analysis['type'] == 'date':
                return col_name
        
        # Default fallback
        return '__time'
    
    def _generate_schema_recommendation(self, column_analysis: Dict[str, Any], 
                                      timestamp_column: str) -> Dict[str, Any]:
        """Generates the recommended Druid schema based on column analysis."""
        dimensions = []
        metrics = []
        
        for col_name, analysis in column_analysis.items():
            if col_name == timestamp_column:
                continue  # Skip timestamp column
            
            if analysis['recommended_druid_type'] == 'double':
                # Numeric columns become metrics
                metrics.append({
                    "type": "doubleSum",
                    "name": col_name,
                    "fieldName": col_name
                })
            else:
                # String and other types become dimensions
                dimensions.append(col_name)
        
        # Ensure we have at least some basic metrics
        if not metrics:
            # Create a default count metric
            metrics.append({
                "type": "longSum",
                "name": "count",
                "fieldName": "count"
            })
        
        return {
            'dimensions': dimensions,
            'metrics': metrics,
            'timestamp_column': timestamp_column,
            'timestamp_format': 'auto'  # Let Druid auto-detect
        }
    
    def generate_druid_ingestion_spec(self, file_path: str, datasource_name: str) -> Dict[str, Any]:
        """
        Generates a complete Druid ingestion spec for any CSV file.
        This is the main method that makes the system truly dynamic.
        """
        self.logger.info(f"🚀 Generating dynamic Druid ingestion spec for: {file_path}")
        
        # Analyze the CSV structure
        analysis = self.analyze_csv_structure(file_path)
        
        # Extract schema components
        dimensions = analysis['recommended_dimensions']
        metrics = analysis['recommended_metrics']
        timestamp_col = analysis['timestamp_column']
        
        self.logger.info(f"📋 Dynamic Schema Generated:")
        self.logger.info(f"   Timestamp Column: {timestamp_col}")
        self.logger.info(f"   Dimensions: {len(dimensions)} columns")
        self.logger.info(f"   Metrics: {len(metrics)} columns")
        self.logger.info(f"   Total Columns: {analysis['total_columns']}")
        
        # Generate the ingestion spec
        ingestion_spec = {
            "type": "index_parallel",
            "spec": {
                "dataSchema": {
                    "dataSource": datasource_name,
                    "timestampSpec": {
                        "column": timestamp_col,
                        "format": "auto",  # Dynamic format detection
                        "missingValue": None
                    },
                    "dimensionsSpec": {
                        "dimensions": dimensions,
                        "dimensionExclusions": [timestamp_col],
                        "includeAllDimensions": False,
                        "useSchemaDiscovery": True  # Enable for dynamic schemas
                    },
                    "metricsSpec": metrics,
                    "granularitySpec": {
                        "type": "uniform",
                        "segmentGranularity": "DAY",
                        "queryGranularity": "HOUR",
                        "rollup": True,
                        "intervals": []
                    }
                },
                "ioConfig": {
                    "type": "index_parallel",
                    "inputSource": {
                        "type": "local",
                        "baseDir": "/opt/shared",
                        "filter": os.path.basename(file_path)
                    },
                    "inputFormat": {
                        "type": "csv",
                        "findColumnsFromHeader": True
                    },
                    "appendToExisting": False,
                    "dropExisting": True
                },
                "tuningConfig": {
                    "type": "index_parallel",
                    "maxRowsPerSegment": 5000000,
                    "maxRowsInMemory": 100000,
                    "maxTotalRows": 1000000
                }
            }
        }
        
        self.logger.info("✅ Dynamic Druid ingestion spec generated successfully")
        return ingestion_spec
    
    def validate_schema_compatibility(self, file_path: str, existing_schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates if a CSV file is compatible with an existing Druid schema.
        Useful for incremental updates and schema evolution.
        """
        self.logger.info(f"🔍 Validating schema compatibility for: {file_path}")
        
        # Analyze the new CSV
        new_analysis = self.analyze_csv_structure(file_path)
        
        # Extract existing schema info
        existing_dimensions = set(existing_schema.get('dimensions', []))
        existing_metrics = set(existing_schema.get('metrics', []))
        
        # Check for new columns
        new_dimensions = set(new_analysis['recommended_dimensions']) - existing_dimensions
        new_metrics = set(new_analysis['recommended_metrics']) - existing_metrics
        
        # Check for removed columns
        removed_dimensions = existing_dimensions - set(new_analysis['recommended_dimensions'])
        removed_metrics = existing_metrics - set(new_analysis['recommended_metrics'])
        
        compatibility_report = {
            'is_compatible': len(new_dimensions) == 0 and len(new_metrics) == 0,
            'new_dimensions': list(new_dimensions),
            'new_metrics': list(new_metrics),
            'removed_dimensions': list(removed_dimensions),
            'removed_metrics': list(removed_metrics),
            'schema_evolution_required': len(new_dimensions) > 0 or len(new_metrics) > 0,
            'recommendations': []
        }
        
        # Generate recommendations
        if new_dimensions:
            compatibility_report['recommendations'].append(
                f"Add {len(new_dimensions)} new dimensions: {list(new_dimensions)}"
            )
        
        if new_metrics:
            compatibility_report['recommendations'].append(
                f"Add {len(new_metrics)} new metrics: {list(new_metrics)}"
            )
        
        if removed_dimensions:
            compatibility_report['recommendations'].append(
                f"Remove {len(removed_dimensions)} deprecated dimensions: {list(removed_dimensions)}"
            )
        
        self.logger.info(f"📊 Schema Compatibility: {'✅ Compatible' if compatibility_report['is_compatible'] else '❌ Incompatible'}")
        
        return compatibility_report
