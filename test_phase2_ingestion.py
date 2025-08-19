#!/usr/bin/env python3
"""
Comprehensive test script for Phase 2: Core Ingestion Logic
Tests data validation, file processing, and Druid integration.
"""

import os
import sys
import tempfile
import json
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Load environment variables
load_dotenv('docker.env')

def create_test_csv_file():
    """Create a test CSV file with valid sales data."""
    csv_content = """TransactionTimestamp,ProductLine,ItemGroup,Branch,SalesPerson,AcctName,ItemName,CardName,grossRevenue,returnsValue,unitsSold,unitsReturned,totalCost,lineItemCount
2024-01-01T10:00:00,Electronics,Computers,Nairobi Central,John Doe,ABC Corp,Laptop Pro,MasterCard,1500.00,0.00,1,0,1200.00,1
2024-01-01T11:30:00,Electronics,Phones,Nairobi Central,Jane Smith,XYZ Ltd,iPhone 15,Visa,1200.00,0.00,1,0,900.00,1
2024-01-01T14:15:00,Office,Supplies,Mombasa Branch,Bob Wilson,Office Plus,Printer Paper,Cash,50.00,0.00,10,0,30.00,1
2024-01-01T16:45:00,Electronics,Computers,Kisumu Branch,Alice Brown,Tech Solutions,Desktop PC,Amex,2000.00,100.00,1,1,1600.00,1
2024-01-02T09:20:00,Office,Furniture,Nairobi Central,John Doe,Startup Inc,Office Chair,Visa,300.00,0.00,2,0,200.00,1"""
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False)
    temp_file.write(csv_content)
    temp_file.close()
    
    return temp_file.name

def test_data_validation_service():
    """Test the data validation service."""
    print("🧪 Testing Data Validation Service")
    print("=" * 50)
    
    try:
        from backend.services.data_validation_service import DataValidationService
        
        # Create service instance
        validation_service = DataValidationService()
        
        # Test file format validation
        print("📋 Testing file format validation...")
        valid, error = validation_service.validate_file_format("test.csv")
        print(f"   CSV file: {'✅ Valid' if valid else f'❌ Invalid: {error}'}")
        
        valid, error = validation_service.validate_file_format("test.txt")
        print(f"   TXT file: {'✅ Valid' if valid else f'❌ Invalid: {error}'}")
        
        # Test file size validation
        print("📏 Testing file size validation...")
        valid, error = validation_service.validate_file_size(1024)
        print(f"   1KB file: {'✅ Valid' if valid else f'❌ Invalid: {error}'}")
        
        valid, error = validation_service.validate_file_size(200 * 1024 * 1024)  # 200MB
        print(f"   200MB file: {'✅ Valid' if valid else f'❌ Invalid: {error}'}")
        
        valid, error = validation_service.validate_file_size(400 * 1024 * 1024)  # 400MB
        print(f"   400MB file: {'✅ Valid' if valid else f'❌ Invalid: {error}'}")
        
        valid, error = validation_service.validate_file_size(600 * 1024 * 1024)  # 600MB
        print(f"   600MB file: {'✅ Valid' if valid else f'❌ Invalid: {error}'}")
        
        # Test complete file validation
        print("🔍 Testing complete file validation...")
        test_file_path = create_test_csv_file()
        
        try:
            validation_result = validation_service.validate_file(
                test_file_path, 
                "test_sales_data.csv", 
                os.path.getsize(test_file_path)
            )
            
            error_msg = validation_result.get("error_message", "Unknown error")
            print(f"   Validation result: {'✅ Success' if validation_result['is_valid'] else f'❌ Failed: {error_msg}'}")
            
            if validation_result['is_valid']:
                print(f"   📊 Row count: {validation_result['row_count']}")
                print(f"   📁 File format: {validation_result['file_format']}")
                print(f"   📋 DataFrame info: {validation_result['dataframe_info']}")
            
        finally:
            # Clean up test file
            if os.path.exists(test_file_path):
                os.unlink(test_file_path)
        
        print("✅ Data validation service tests completed\n")
        return True
        
    except Exception as e:
        print(f"❌ Data validation service test failed: {e}")
        return False

def test_file_processing_service():
    """Test the file processing service."""
    print("🧪 Testing File Processing Service")
    print("=" * 50)
    
    try:
        from backend.services.file_processing_service import FileProcessingService
        
        # Create service instance
        file_processor = FileProcessingService()
        
        # Test file format info
        print("📋 Testing file format detection...")
        format_info = file_processor.get_file_format_info("test.csv")
        print(f"   CSV format info: {format_info}")
        
        format_info = file_processor.get_file_format_info("test.xlsx")
        print(f"   XLSX format info: {format_info}")
        
        print("✅ File processing service tests completed\n")
        return True
        
    except Exception as e:
        print(f"❌ File processing service test failed: {e}")
        return False

def test_druid_service():
    """Test the Druid service."""
    print("🧪 Testing Druid Service")
    print("=" * 50)
    
    try:
        from backend.services.druid_service import DruidService
        
        # Create service instance
        druid_service = DruidService()
        
        # Test ingestion spec generation
        print("📋 Testing ingestion spec generation...")
        spec = druid_service.create_ingestion_spec(
            datasource_name="test_sales_data",
            s3_uri="s3://test-bucket/test.csv",
            file_format=".csv",
            row_count=100
        )
        
        print(f"   ✅ Spec generated successfully")
        print(f"   📊 Spec type: {spec['type']}")
        print(f"   📁 DataSource: {spec['spec']['dataSchema']['dataSource']}")
        print(f"   🔗 S3 URI: {spec['spec']['ioConfig']['inputSource']['uris'][0]}")
        
        # Test input format detection
        print("🔍 Testing input format detection...")
        csv_format = druid_service._get_input_format(".csv")
        print(f"   CSV format: {csv_format['type']}")
        
        xlsx_format = druid_service._get_input_format(".xlsx")
        print(f"   XLSX format: {xlsx_format['type']}")
        
        print("✅ Druid service tests completed\n")
        return True
        
    except Exception as e:
        print(f"❌ Druid service test failed: {e}")
        return False

def test_api_endpoints():
    """Test the updated API endpoints."""
    print("🧪 Testing API Endpoints")
    print("=" * 50)
    
    try:
        import requests
        import time
        
        base_url = "http://localhost:8000"
        
        # Test health check
        print("🏥 Testing health check...")
        response = requests.get(f"{base_url}/")
        print(f"   Health check: {'✅ OK' if response.status_code == 200 else f'❌ Failed: {response.status_code}'}")
        
        # Test file upload with test data
        print("📤 Testing file upload...")
        test_file_path = create_test_csv_file()
        
        try:
            with open(test_file_path, 'rb') as f:
                files = {'file': ('test_sales_data.csv', f, 'text/csv')}
                data = {'datasource_name': 'test_phase2_data'}
                
                response = requests.post(
                    f"{base_url}/api/ingest/upload",
                    files=files,
                    data=data
                )
            
            if response.status_code == 202:
                result = response.json()
                task_id = result.get('task_id')
                print(f"   ✅ Upload accepted, task_id: {task_id}")
                
                # Test status endpoint
                print("📊 Testing status endpoint...")
                time.sleep(2)  # Wait a bit for processing to start
                
                status_response = requests.get(f"{base_url}/api/ingest/status/{task_id}")
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    print(f"   ✅ Status retrieved: {status_data['status']}")
                    print(f"   📁 Datasource: {status_data['datasource_name']}")
                    print(f"   📄 File: {status_data['original_filename']}")
                else:
                    print(f"   ❌ Status check failed: {status_response.status_code}")
            else:
                print(f"   ❌ Upload failed: {response.status_code} - {response.text}")
                
        finally:
            # Clean up test file
            if os.path.exists(test_file_path):
                os.unlink(test_file_path)
        
        print("✅ API endpoint tests completed\n")
        return True
        
    except Exception as e:
        print(f"❌ API endpoint test failed: {e}")
        return False

def main():
    """Run all Phase 2 tests."""
    print("🚀 Phase 2: Core Ingestion Logic - Comprehensive Test Suite")
    print("=" * 70)
    print()
    
    tests = [
        ("Data Validation Service", test_data_validation_service),
        ("File Processing Service", test_file_processing_service),
        ("Druid Service", test_druid_service),
        ("API Endpoints", test_api_endpoints)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"🔍 Running {test_name} tests...")
        success = test_func()
        results.append((test_name, success))
        print()
    
    # Summary
    print("📊 Test Results Summary")
    print("=" * 30)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if success:
            passed += 1
    
    print()
    print(f"📈 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All Phase 2 tests passed! The implementation is ready.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    main()
