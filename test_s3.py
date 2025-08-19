#!/usr/bin/env python3
"""
Test script to verify S3 connectivity and permissions.
Run this script to test your AWS S3 configuration.
"""

import os
import sys
from dotenv import load_dotenv
import boto3
from botocore.exceptions import ClientError

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Load environment variables from .env file
load_dotenv(dotenv_path='backend/.env')

S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

def test_s3_connection():
    """Tests connection and permissions to the S3 bucket."""
    print("🔍 Testing S3 Connection and Permissions...")
    print(f"   Bucket: {S3_BUCKET_NAME}")
    print(f"   Region: {AWS_REGION}")
    print(f"   Access Key: {AWS_ACCESS_KEY_ID[:8]}..." if AWS_ACCESS_KEY_ID else "   Access Key: Not set")
    print()
    
    if not all([S3_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY]):
        print("❌ Error: Missing required environment variables.")
        print("   Please ensure the following are set in your .env file:")
        print("   - S3_BUCKET_NAME")
        print("   - AWS_REGION")
        print("   - AWS_ACCESS_KEY_ID")
        print("   - AWS_SECRET_ACCESS_KEY")
        return False

    try:
        # Create S3 client
        s3_client = boto3.client(
            "s3", 
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        # Test 1: List bucket contents (requires s3:ListBucket permission)
        print("📋 Test 1: Listing bucket contents...")
        s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, MaxKeys=1)
        print("   ✅ Successfully listed bucket contents")
        
        # Test 2: Upload test file
        print("📤 Test 2: Uploading test file...")
        test_content = b"s3 connection test - " + str(os.getpid()).encode()
        test_object_key = "connection_test.txt"
        
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME, 
            Key=test_object_key, 
            Body=test_content
        )
        print(f"   ✅ Successfully uploaded test object '{test_object_key}'")
        
        # Test 3: Verify file exists
        print("🔍 Test 3: Verifying file exists...")
        response = s3_client.head_object(Bucket=S3_BUCKET_NAME, Key=test_object_key)
        file_size = response['ContentLength']
        print(f"   ✅ File exists with size: {file_size} bytes")
        
        # Test 4: Download and verify content
        print("📥 Test 4: Downloading and verifying content...")
        response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=test_object_key)
        downloaded_content = response['Body'].read()
        
        if downloaded_content == test_content:
            print("   ✅ Downloaded content matches uploaded content")
        else:
            print("   ❌ Content mismatch!")
            return False
        
        # Test 5: Delete test file
        print("🗑️  Test 5: Cleaning up test file...")
        s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=test_object_key)
        print("   ✅ Successfully deleted test file")
        
        print()
        print("🎉 All S3 tests passed successfully!")
        print(f"✅ Successfully connected to S3 bucket '{S3_BUCKET_NAME}'")
        print("✅ All permissions are correctly configured")
        print("✅ File upload/download operations work correctly")
        
        return True

    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        error_message = e.response.get("Error", {}).get("Message", str(e))
        
        print(f"❌ Failed to connect or operate on S3 bucket '{S3_BUCKET_NAME}'")
        print(f"   Error Code: {error_code}")
        print(f"   Message: {error_message}")
        
        # Provide helpful error messages
        if error_code == "NoSuchBucket":
            print("   💡 The bucket doesn't exist. Please create it first.")
        elif error_code == "AccessDenied":
            print("   💡 Access denied. Please check your IAM permissions.")
        elif error_code == "InvalidAccessKeyId":
            print("   💡 Invalid access key. Please check your AWS credentials.")
        elif error_code == "SignatureDoesNotMatch":
            print("   💡 Invalid secret key. Please check your AWS credentials.")
        elif error_code == "InvalidToken":
            print("   💡 Invalid token. Please check your AWS credentials.")
        
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_environment_setup():
    """Test if the environment is properly configured."""
    print("🔧 Testing Environment Setup...")
    
    # Check if .env file exists
    env_file_path = os.path.join('backend', '.env')
    if os.path.exists(env_file_path):
        print("   ✅ .env file found")
    else:
        print("   ❌ .env file not found")
        print("   💡 Please create backend/.env file with your AWS credentials")
        return False
    
    # Check required environment variables
    required_vars = [
        ("S3_BUCKET_NAME", S3_BUCKET_NAME),
        ("AWS_REGION", AWS_REGION),
        ("AWS_ACCESS_KEY_ID", AWS_ACCESS_KEY_ID),
        ("AWS_SECRET_ACCESS_KEY", AWS_SECRET_ACCESS_KEY)
    ]
    
    missing_vars = []
    for var_name, var_value in required_vars:
        if var_value:
            print(f"   ✅ {var_name} is set")
        else:
            print(f"   ❌ {var_name} is not set")
            missing_vars.append(var_name)
    
    if missing_vars:
        print(f"   💡 Please set the following variables in your .env file: {', '.join(missing_vars)}")
        return False
    
    print("   ✅ All environment variables are configured")
    return True

def main():
    """Main test function."""
    print("🚀 S3 Connection Test")
    print("=" * 50)
    
    # Test environment setup first
    if not test_environment_setup():
        print("\n❌ Environment setup failed. Please fix the issues above.")
        sys.exit(1)
    
    print()
    
    # Test S3 connection
    if test_s3_connection():
        print("\n🎯 S3 setup is complete and ready for use!")
        print("   You can now proceed with implementing the data ingestion pipeline.")
    else:
        print("\n❌ S3 setup failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
