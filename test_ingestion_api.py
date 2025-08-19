#!/usr/bin/env python3
"""
Test script for the ingestion API endpoints.
This script tests the file upload and status endpoints.
"""

import requests
import json
import os
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:8000"
UPLOAD_URL = f"{BASE_URL}/api/ingest/upload"

def create_test_file():
    """Create a simple test CSV file"""
    test_data = """TransactionTimestamp,ProductLine,ItemGroup,Branch,SalesPerson,AcctName,ItemName,CardName,grossRevenue,returnsValue,unitsSold,unitsReturned,totalCost,lineItemCount
2024-01-01T10:00:00,Electronics,Computers,Nairobi Central,John Doe,ABC Corp,Laptop Pro,XYZ Inc,1500.00,0.00,1,0,1200.00,1
2024-01-01T11:00:00,Electronics,Phones,Nairobi Central,Jane Smith,DEF Ltd,iPhone 15,GHI Corp,800.00,0.00,1,0,600.00,1"""
    
    test_file_path = "test_sales_data.csv"
    with open(test_file_path, "w") as f:
        f.write(test_data)
    
    return test_file_path

def test_upload_endpoint():
    """Test the file upload endpoint"""
    print("🚀 Testing File Upload Endpoint")
    print("=" * 50)
    
    # Create test file
    test_file_path = create_test_file()
    
    try:
        # Prepare the upload request
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_sales_data.csv", f, "text/csv")}
            data = {"datasource_name": "test_sales_data"}
            
            print(f"📤 Uploading file: {test_file_path}")
            print(f"📋 Datasource name: {data['datasource_name']}")
            
            # Make the upload request
            response = requests.post(UPLOAD_URL, files=files, data=data)
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 202:
                result = response.json()
                print(f"✅ Upload successful!")
                print(f"📝 Message: {result.get('message')}")
                print(f"🆔 Task ID: {result.get('task_id')}")
                return result.get('task_id')
            else:
                print(f"❌ Upload failed!")
                print(f"📄 Response: {response.text}")
                return None
                
    except Exception as e:
        print(f"❌ Error during upload: {e}")
        return None
    finally:
        # Clean up test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

def test_status_endpoint(task_id):
    """Test the task status endpoint"""
    if not task_id:
        print("❌ No task ID available for status check")
        return
    
    print(f"\n📊 Testing Task Status Endpoint")
    print("=" * 50)
    
    try:
        status_url = f"{BASE_URL}/api/ingest/status/{task_id}"
        print(f"🔍 Checking status for task: {task_id}")
        
        response = requests.get(status_url)
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status retrieved successfully!")
            print(f"📋 Task ID: {result.get('task_id')}")
            print(f"📊 Status: {result.get('status')}")
            print(f"📁 Datasource: {result.get('datasource_name')}")
            print(f"📄 Original File: {result.get('original_filename')}")
            print(f"📏 File Size: {result.get('file_size')} bytes")
            print(f"🕐 Created: {result.get('created_at')}")
        else:
            print(f"❌ Status check failed!")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error during status check: {e}")

def test_health_check():
    """Test the main health check endpoint"""
    print("🏥 Testing Health Check Endpoint")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Health check successful!")
            print(f"📄 Response: {result}")
        else:
            print(f"❌ Health check failed!")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error during health check: {e}")

def main():
    """Main test function"""
    print("🧪 Ingestion API Test Suite")
    print("=" * 60)
    
    # Test health check first
    test_health_check()
    
    # Test upload endpoint
    task_id = test_upload_endpoint()
    
    # Test status endpoint
    test_status_endpoint(task_id)
    
    print("\n🎉 Test suite completed!")
    print("💡 Check the server logs for background task execution")

if __name__ == "__main__":
    main()
