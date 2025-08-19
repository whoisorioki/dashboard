#!/usr/bin/env python3
"""
Test script for programmatic Druid ingestion using local storage.
Based on the strategic blueprint document recommendations.
"""

import requests
import json
import time
import os

def trigger_druid_ingestion(data_file_path: str, druid_overlord_url: str = "http://localhost:8081") -> str:
    """
    Constructs and submits a native batch ingestion task to Apache Druid.
    Based on the document's recommended implementation.
    """
    
    # Create ingestion spec for local file
    ingestion_spec = {
        "type": "index_parallel",
        "spec": {
            "dataSchema": {
                "dataSource": "test_local_ingestion",
                "timestampSpec": {"column": "__time", "format": "iso"},
                "dimensionsSpec": {
                    "dimensions": [
                        "Branch",
                        "ProductLine", 
                        "SalesPerson",
                        "ItemGroup",
                        "AcctName",
                        "ItemName",
                        "CardName"
                    ]
                },
                "metricsSpec": [
                    {"name": "count", "type": "count"},
                    {"name": "grossRevenue", "type": "doubleSum", "fieldName": "grossRevenue"},
                    {"name": "returnsValue", "type": "doubleSum", "fieldName": "returnsValue"},
                    {"name": "unitsSold", "type": "doubleSum", "fieldName": "unitsSold"},
                    {"name": "unitsReturned", "type": "doubleSum", "fieldName": "unitsReturned"},
                    {"name": "totalCost", "type": "doubleSum", "fieldName": "totalCost"},
                    {"name": "lineItemCount", "type": "longSum", "fieldName": "lineItemCount"}
                ],
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
                     "files": [data_file_path]
                 },
                 "inputFormat": {"type": "csv", "findColumnsFromHeader": True}
             },
            "tuningConfig": {
                "type": "index_parallel",
                "partitionsSpec": {"type": "dynamic"}
            }
        }
    }

    headers = {'Content-Type': 'application/json'}
    task_endpoint = f"{druid_overlord_url}/druid/indexer/v1/task"
    
    try:
        print(f"Submitting ingestion task to {task_endpoint}")
        print(f"Using file: {data_file_path}")
        
        response = requests.post(task_endpoint, data=json.dumps(ingestion_spec), headers=headers, timeout=30)
        response.raise_for_status()
        
        task_id = response.json().get("task")
        print(f"Successfully submitted task: {task_id}")
        return task_id
        
    except requests.exceptions.RequestException as e:
        print(f"Error submitting Druid ingestion task: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        raise

def monitor_druid_task(task_id: str, druid_overlord_url: str = "http://localhost:8081", poll_interval: int = 5) -> str:
    """
    Polls the Druid Overlord for the status of an ingestion task until it completes or fails.
    """
    status_endpoint = f"{druid_overlord_url}/druid/indexer/v1/task/{task_id}/status"
    
    print(f"Monitoring task {task_id}...")
    
    while True:
        try:
            response = requests.get(status_endpoint, timeout=10)
            response.raise_for_status()
            status_data = response.json()
            task_status = status_data.get("status", {}).get("status")
            
            print(f"Task {task_id} status: {task_status}")

            if task_status in ["SUCCESS", "FAILED"]:
                if task_status == "FAILED":
                    error_msg = status_data.get("status", {}).get("errorMsg", "Unknown error")
                    print(f"Task failed: {error_msg}")
                return task_status
            
            time.sleep(poll_interval)
            
        except requests.exceptions.RequestException as e:
            print(f"Error polling Druid task status for {task_id}: {e}")
            return "FAILED"

if __name__ == "__main__":
    # Test with the data.csv file copied to the container
    test_file = "/tmp/data.csv"
    
    print(f"Using data file: {test_file}")
    
    try:
        # Submit the task
        task_id = trigger_druid_ingestion(test_file)
        
        # Monitor the task
        final_status = monitor_druid_task(task_id)
        
        print(f"Final task status: {final_status}")
        
    except Exception as e:
        print(f"Test failed: {e}")
