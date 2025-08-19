#!/usr/bin/env python3
"""
Simple S3 ingestion test using the existing S3 configuration.
This tests if the basic pipeline works with minimal configuration.
"""

import requests
import json
import time

def test_simple_s3_ingestion():
    """
    Test simple S3 ingestion using existing configuration.
    """
    
    # Create a minimal ingestion spec for S3
    ingestion_spec = {
        "type": "index_parallel",
        "spec": {
            "dataSchema": {
                "dataSource": "test_simple_s3",
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
                    "type": "s3",
                    "uris": ["s3://sales-analytics-01/uploads/test_simple_s3/data.csv"]
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
    
    # Submit the task
    headers = {'Content-Type': 'application/json'}
    task_endpoint = "http://localhost:8081/druid/indexer/v1/task"
    
    print(f"📤 Submitting simple S3 ingestion task to {task_endpoint}")
    
    try:
        response = requests.post(task_endpoint, data=json.dumps(ingestion_spec), headers=headers, timeout=30)
        response.raise_for_status()
        
        task_id = response.json().get("task")
        print(f"✅ Successfully submitted task: {task_id}")
        
        # Monitor the task
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

if __name__ == "__main__":
    print("🚀 Starting simple S3 ingestion test...")
    success = test_simple_s3_ingestion()
    
    if success:
        print("✅ Simple S3 ingestion test completed successfully!")
    else:
        print("❌ Simple S3 ingestion test failed!")
