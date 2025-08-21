"""
Druid service for managing ingestion tasks and generating ingestion specifications.
Handles communication with Druid Overlord API for task submission and monitoring.
"""

import json
import logging
import requests
import time
import os
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class DruidService:
    """
    Service for interacting with Apache Druid for data ingestion.
    """
    
    def __init__(self, overlord_url: str = None): # type: ignore
        if overlord_url is None:
            overlord_url = os.getenv("DRUID_OVERLORD_URL", "http://localhost:8091")
        overlord_url = overlord_url or "http://localhost:8091"
        self.overlord_url = overlord_url.rstrip('/')
        self.tasks_endpoint = f"{self.overlord_url}/druid/indexer/v1/task"
        self.task_status_endpoint = f"{self.overlord_url}/druid/indexer/v1/task"
        
    def create_ingestion_spec(self, 
                            datasource_name: str, 
                            file_name: str, 
                            file_format: str,
                            row_count: int) -> Dict[str, Any]:
        """
        Create a Druid ingestion specification for batch ingestion.
        
        Args:
            datasource_name: Name of the Druid datasource
            file_name: Name of the file in the shared directory
            file_format: Format of the file (csv, xlsx, parquet)
            row_count: Number of rows in the dataset
            
        Returns:
            Complete ingestion specification dictionary
        """
        start_time = time.time()
        
        # Determine input format based on file extension
        input_format = self._get_input_format(file_format)
        
        # Create the ingestion spec
        spec = {
            "type": "index_parallel",
            "spec": {
                "dataSchema": {
                    "dataSource": datasource_name,
                    "timestampSpec": {
                        "column": "__time",
                        "format": "auto"
                    },
                    "dimensionsSpec": {
                        "useSchemaDiscovery": True
                    },
                    "metricsSpec": [],
                    "granularitySpec": {
                        "type": "uniform",
                        "segmentGranularity": "DAY",
                        "queryGranularity": "HOUR",
                        "rollup": True
                    }
                },
                "ioConfig": {
                    "type": "index_parallel",
                    "inputSource": {
                        "type": "local",
                        "baseDir": "/opt/shared",
                        "filter": file_name
                    },
                    "inputFormat": input_format,
                    "appendToExisting": False
                },
                "tuningConfig": {
                    "type": "index_parallel",
                    "partitionsSpec": {
                        "type": "dynamic",
                        "maxRowsPerSegment": 5000000,
                        "maxTotalRows": row_count
                    },
                    "maxRowsInMemory": 100000,
                    "indexSpec": {
                        "bitmap": {
                            "type": "roaring"
                        },
                        "dimensionCompression": "lz4",
                        "metricCompression": "lz4",
                        "longEncoding": "longs"
                    }
                }
            }
        }
        
        generation_time = time.time() - start_time
        logger.info(f"Created ingestion spec for datasource '{datasource_name}' in {generation_time:.3f}s")
        return spec
    
    def _get_input_format(self, file_format: str) -> Dict[str, Any]:
        """
        Get the appropriate input format configuration for the file type.
        
        Args:
            file_format: File extension (e.g., '.csv', '.xlsx')
            
        Returns:
            Input format configuration dictionary
        """
        start_time = time.time()
        
        if file_format == '.csv':
            format_config = {
                "type": "csv",
                "findColumnsFromHeader": True
            }
        elif file_format in ['.xlsx', '.xls']:
            format_config = {
                "type": "excel",
                "findColumnsFromHeader": True
            }
        elif file_format == '.parquet':
            format_config = {
                "type": "parquet"
            }
        else:
            raise ValueError(f"Unsupported file format: {file_format}")
        
        logger.debug(f"Input format configuration generated in {time.time() - start_time:.3f}s for {file_format}")
        return format_config
    
    def submit_ingestion_task(self, ingestion_spec: Dict[str, Any]) -> Optional[str]:
        """
        Submit an ingestion task to Druid Overlord.
        
        Args:
            ingestion_spec: Complete ingestion specification
            
        Returns:
            Task ID if successful, None otherwise
        """
        start_time = time.time()
        
        try:
            logger.info(f"Submitting ingestion task to Druid Overlord...")
            response = requests.post(
                self.tasks_endpoint,
                json=ingestion_spec,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            submission_time = time.time() - start_time
            
            if response.status_code == 200:
                task_id = response.json().get('task')
                logger.info(f"Successfully submitted ingestion task '{task_id}' in {submission_time:.3f}s")
                return task_id
            else:
                logger.error(f"Failed to submit ingestion task in {submission_time:.3f}s. Status: {response.status_code}, Response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            submission_time = time.time() - start_time
            logger.error(f"Error submitting ingestion task in {submission_time:.3f}s: {e}")
            return None
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the status of a Druid ingestion task.
        
        Args:
            task_id: Druid task ID
            
        Returns:
            Task status information or None if failed
        """
        start_time = time.time()
        
        try:
            response = requests.get(
                f"{self.task_status_endpoint}/{task_id}/status",
                timeout=10
            )
            
            request_time = time.time() - start_time
            
            if response.status_code == 200:
                logger.debug(f"Retrieved task status for '{task_id}' in {request_time:.3f}s")
                return response.json()
            else:
                logger.error(f"Failed to get task status in {request_time:.3f}s. Status: {response.status_code}, Response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            request_time = time.time() - start_time
            logger.error(f"Error getting task status in {request_time:.3f}s: {e}")
            return None
    
    def get_task_info(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a Druid ingestion task.
        
        Args:
            task_id: Druid task ID
            
        Returns:
            Detailed task information or None if failed
        """
        start_time = time.time()
        
        try:
            response = requests.get(
                f"{self.task_status_endpoint}/{task_id}",
                timeout=10
            )
            
            request_time = time.time() - start_time
            
            if response.status_code == 200:
                logger.debug(f"Retrieved task info for '{task_id}' in {request_time:.3f}s")
                return response.json()
            else:
                logger.error(f"Failed to get task info in {request_time:.3f}s. Status: {response.status_code}, Response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            request_time = time.time() - start_time
            logger.error(f"Error getting task info in {request_time:.3f}s: {e}")
            return None
    
    def cancel_task(self, task_id: str) -> bool:
        """
        Cancel a running Druid ingestion task.
        
        Args:
            task_id: Druid task ID
            
        Returns:
            True if successful, False otherwise
        """
        start_time = time.time()
        
        try:
            response = requests.post(
                f"{self.task_status_endpoint}/{task_id}/shutdown",
                timeout=10
            )
            
            cancel_time = time.time() - start_time
            
            if response.status_code == 200:
                logger.info(f"Successfully cancelled task '{task_id}' in {cancel_time:.3f}s")
                return True
            else:
                logger.error(f"Failed to cancel task in {cancel_time:.3f}s. Status: {response.status_code}, Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            cancel_time = time.time() - start_time
            logger.error(f"Error cancelling task in {cancel_time:.3f}s: {e}")
            return False
    
    def wait_for_task_completion(self, task_id: str, timeout_minutes: int = 30) -> Dict[str, Any]:
        """
        Wait for a task to complete and return the final status.
        
        Args:
            task_id: Druid task ID
            timeout_minutes: Maximum time to wait in minutes
            
        Returns:
            Final task status information
        """
        start_time = time.time()
        timeout_seconds = timeout_minutes * 60
        check_count = 0
        
        logger.info(f"Starting to monitor task '{task_id}' completion (timeout: {timeout_minutes} minutes)")
        
        while time.time() - start_time < timeout_seconds:
            check_start = time.time()
            status_info = self.get_task_status(task_id)
            check_count += 1
            
            if status_info is None:
                logger.error(f"Failed to get task status on check #{check_count}")
                return {
                    'status': 'UNKNOWN',
                    'error': 'Failed to get task status'
                }
            
            status = status_info.get('status', {}).get('state', 'UNKNOWN')
            
            if status in ['SUCCESS', 'FAILED']:
                total_time = time.time() - start_time
                logger.info(f"Task '{task_id}' completed with status '{status}' after {total_time:.1f}s ({check_count} status checks)")
                return status_info
            
            logger.debug(f"Task '{task_id}' status: '{status}' (check #{check_count}, elapsed: {time.time() - start_time:.1f}s)")
            time.sleep(10)  # Wait 10 seconds before checking again
        
        # Timeout reached
        total_time = time.time() - start_time
        logger.warning(f"Task '{task_id}' did not complete within {timeout_minutes} minutes ({total_time:.1f}s, {check_count} checks)")
        return {
            'status': 'TIMEOUT',
            'error': f'Task did not complete within {timeout_minutes} minutes'
        }
    
    def check_datasource_exists(self, datasource_name: str) -> bool:
        """
        Check if a datasource exists in Druid.
        
        Args:
            datasource_name: Name of the datasource
            
        Returns:
            True if datasource exists, False otherwise
        """
        start_time = time.time()
        
        try:
            coordinator_url = self.overlord_url.replace(':8081', ':8081')  # Coordinator runs on same port as Overlord
            response = requests.get(
                f"{coordinator_url}/druid/coordinator/v1/datasources/{datasource_name}",
                timeout=10
            )
            
            check_time = time.time() - start_time
            exists = response.status_code == 200
            
            logger.debug(f"Datasource existence check for '{datasource_name}' completed in {check_time:.3f}s: {exists}")
            return exists
            
        except requests.exceptions.RequestException as e:
            check_time = time.time() - start_time
            logger.error(f"Error checking datasource existence in {check_time:.3f}s: {e}")
            return False
