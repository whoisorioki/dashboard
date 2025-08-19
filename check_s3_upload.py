#!/usr/bin/env python3
"""
Script to check what files are uploaded to S3 bucket
"""

import boto3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('docker.env')

def list_s3_files():
    """List all files in the S3 bucket"""
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        
        bucket_name = os.getenv('S3_BUCKET_NAME', 'sales-analytics-01')
        
        print(f"🔍 Checking S3 bucket: {bucket_name}")
        print("=" * 50)
        
        # List objects in the bucket
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='uploads/'
        )
        
        if 'Contents' in response:
            print(f"📁 Found {len(response['Contents'])} files in uploads/ folder:")
            print()
            
            for obj in response['Contents']:
                key = obj['Key']
                size = obj['Size']
                last_modified = obj['LastModified']
                
                print(f"📄 File: {key}")
                print(f"   📏 Size: {size} bytes")
                print(f"   🕐 Modified: {last_modified}")
                print()
        else:
            print("📭 No files found in uploads/ folder")
            
    except Exception as e:
        print(f"❌ Error checking S3: {e}")

if __name__ == "__main__":
    list_s3_files()
