"""
S3 service for handling file uploads to AWS S3.
"""

import os
import boto3
import time
import logging
from typing import Optional
from fastapi import UploadFile
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# S3 configuration
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "sales-analytics-01")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION", "us-east-1")

def upload_file_to_s3(file, object_name: str) -> bool:
    """
    Upload a file to S3.
    
    Args:
        file: FastAPI UploadFile object
        object_name: S3 object name/key
        
    Returns:
        True if successful, False otherwise
    """
    start_time = time.time()
    
    try:
        # Create S3 client with explicit region and optional credentials
        session = boto3.session.Session()
        if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
            s3_client = session.client(
                's3',
                region_name=AWS_REGION,
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            )
        else:
            s3_client = session.client('s3', region_name=AWS_REGION)
        
        # Upload file
        s3_client.upload_fileobj(file.file, S3_BUCKET_NAME, object_name)
        
        upload_time = time.time() - start_time
        logger.info(f"S3 upload completed in {upload_time:.3f}s: {object_name} ({file.size} bytes)")
        return True
        
    except Exception as e:
        upload_time = time.time() - start_time
        logger.error(f"S3 upload failed in {upload_time:.3f}s: {e}")
        return False

def upload_file_to_s3_from_bytes(file_obj, object_name: str) -> bool:
    """
    Upload a file-like object (BytesIO) to S3.
    
    Args:
        file_obj: File-like object (BytesIO, etc.)
        object_name: S3 object name/key
        
    Returns:
        True if successful, False otherwise
    """
    start_time = time.time()
    
    try:
        session = boto3.session.Session()
        if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
            s3_client = session.client(
                's3',
                region_name=AWS_REGION,
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            )
        else:
            s3_client = session.client('s3', region_name=AWS_REGION)
        
        # Reset file pointer to beginning
        file_obj.seek(0)
        
        # Upload file object
        s3_client.upload_fileobj(file_obj, S3_BUCKET_NAME, object_name)
        
        upload_time = time.time() - start_time
        logger.info(f"S3 upload from bytes completed in {upload_time:.3f}s: {object_name}")
        return True
        
    except Exception as e:
        upload_time = time.time() - start_time
        logger.error(f"S3 upload from bytes failed in {upload_time:.3f}s: {e}")
        return False

def upload_file_to_s3_from_path(file_path: str, object_name: str) -> bool:
    """
    Upload a file from local path to S3.
    
    Args:
        file_path: Local file path
        object_name: S3 object name/key
        
    Returns:
        True if successful, False otherwise
    """
    start_time = time.time()
    
    try:
        session = boto3.session.Session()
        if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
            s3_client = session.client(
                's3',
                region_name=AWS_REGION,
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            )
        else:
            s3_client = session.client('s3', region_name=AWS_REGION)
        
        # Upload file
        s3_client.upload_file(file_path, S3_BUCKET_NAME, object_name)
        
        upload_time = time.time() - start_time
        logger.info(f"S3 upload from path completed in {upload_time:.3f}s: {object_name}")
        return True
        
    except Exception as e:
        upload_time = time.time() - start_time
        logger.error(f"S3 upload from path failed in {upload_time:.3f}s: {e}")
        return False
