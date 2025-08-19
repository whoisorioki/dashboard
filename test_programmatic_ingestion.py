#!/usr/bin/env python3
"""
Programmatic Druid ingestion test using the strategic document's recommended approach.
This bypasses Docker configuration issues by using direct API calls.
"""

import requests
import json
import time
import os
import shutil

def test_programmatic_ingestion():
    """
    Test programmatic ingestion using the strategic document's approach.
    """
    
    # Step 1: Use the file already copied to the Docker container
    target_file = "/tmp/data.csv"
    
    print(f"📁 Using file in container: {target_file}")
    
    # Step 2: Create ingestion spec for local file
    ingestion_spec = {
        "type": "index_parallel",
        "spec": {
            "dataSchema": {
                "dataSource": "test_programmatic",
                "timestampSpec": {
                    "column": "__time",
                    "format": "iso"
                },
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
                    "files": [target_file]
                },
                "inputFormat": {
                    "type": "csv",
                    "findColumnsFromHeader": True
                },
                "appendToExisting": False
            },
            "tuningConfig": {
                "type": "index_parallel",
                "partitionsSpec": {
                    "type": "dynamic"
                }
            }
        }
    }
    
    # Step 3: Submit the task
    headers = {'Content-Type': 'application/json'}
    task_endpoint = "http://localhost:8081/druid/indexer/v1/task"
    
    print(f"📤 Submitting ingestion task to {task_endpoint}")
    print(f"📄 Using file: {target_file}")
    
    try:
        response = requests.post(task_endpoint, data=json.dumps(ingestion_spec), headers=headers, timeout=30)
        response.raise_for_status()
        
        task_id = response.json().get("task")
        print(f"✅ Successfully submitted task: {task_id}")
        
        # Step 4: Monitor the task
        status_endpoint = f"http://localhost:8081/druid/indexer/v1/task/{task_id}/status"
        print(f"👀 Monitoring task {task_id}...")
        
        task_status = "UNKNOWN"
        while True:
            try:
                response = requests.get(status_endpoint, timeout=10)
                response.raise_for_status()
                status_data = response.json()
                task_status = status_data.get("status", {}).get("status")
                
                print(f"📊 Task {task_id} status: {task_status}")
                
                if task_status in ["SUCCESS", "FAILED"]:
                    if task_status == "FAILED":
                        error_msg = status_data.get("status", {}).get("errorMsg", "Unknown error")
                        print(f"❌ Task failed: {error_msg}")
                    else:
                        print(f"🎉 Task completed successfully!")
                    break
                
                time.sleep(5)
                
            except requests.exceptions.RequestException as e:
                print(f"❌ Error polling Druid task status: {e}")
                break
        
        return task_status == "SUCCESS"
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error submitting Druid ingestion task: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"📄 Response: {e.response.text}")
        return False
    
    finally:
        # Cleanup
        if os.path.exists(target_file):
            os.remove(target_file)
            print(f"🧹 Cleaned up {target_file}")

if __name__ == "__main__":
    print("🚀 Starting programmatic Druid ingestion test...")
    success = test_programmatic_ingestion()
    
    if success:
        print("✅ Programmatic ingestion test completed successfully!")
    else:
        print("❌ Programmatic ingestion test failed!")
