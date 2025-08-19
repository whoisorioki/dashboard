#!/usr/bin/env python3
"""
Script to check the database for the uploaded task
"""

import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Load environment variables
load_dotenv('docker.env')

def check_database_task():
    """Check the database for the uploaded task"""
    try:
        from backend.db.session import SessionLocal
        from backend.models.ingestion_task import IngestionTask
        
        print("🔍 Checking Database for Uploaded Task")
        print("=" * 50)
        
        # Create database session
        db = SessionLocal()
        
        try:
            # Get the most recent task
            task = db.query(IngestionTask).order_by(IngestionTask.created_at.desc()).first()
            
            if task:
                print(f"✅ Task found in database!")
                print(f"🆔 Task ID: {task.task_id}")  # type: ignore
                print(f"📊 Status: {task.status}")  # type: ignore
                print(f"📁 Datasource: {task.datasource_name}")  # type: ignore
                print(f"📄 Original File: {task.original_filename}")  # type: ignore
                print(f"📏 File Size: {task.file_size} bytes")  # type: ignore
                print(f"🔗 S3 URI: {task.file_uri}")  # type: ignore
                print(f"🕐 Created: {task.created_at}")  # type: ignore
                print()
                
                # Extract S3 path from URI
                file_uri = task.file_uri  # type: ignore
                if file_uri.startswith('s3://'):  # type: ignore
                    s3_path = file_uri.replace('s3://sales-analytics-01/', '')
                    print(f"📍 S3 Path: {s3_path}")
                    print(f"📦 S3 Bucket: sales-analytics-01")
                    print(f"📁 S3 Key: {s3_path}")
                else:
                    print(f"⚠️  File URI format: {file_uri}")
                    
            else:
                print("❌ No tasks found in database")
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error checking database: {e}")

if __name__ == "__main__":
    check_database_task()
