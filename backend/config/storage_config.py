import logging
import os
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class S3StorageConfig:
    """Configuration and utility class for AWS S3 storage operations."""
    
    def __init__(self):
        """Initialize S3 configuration from environment variables."""
        self.bucket_name = os.getenv("S3_BUCKET_NAME")
        self.region = os.getenv("AWS_REGION", "us-east-1")
        
        if not self.bucket_name:
            raise ValueError("S3_BUCKET_NAME environment variable is required")
        
        self.s3_client = self._get_s3_client()
    
    def _get_s3_client(self):
        """Initialize and return a boto3 S3 client."""
        return boto3.client("s3", region_name=self.region)
    
    async def upload_file(self, file_content: bytes, file_key: str) -> str:
        """
        Upload file content to S3 and return the URI.
        
        Args:
            file_content: The file content as bytes
            file_key: The S3 object key (path/filename)
            
        Returns:
            str: The S3 URI of the uploaded file
            
        Raises:
            Exception: If upload fails
        """
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=file_content
            )
            s3_uri = f"s3://{self.bucket_name}/{file_key}"
            logger.info(f"Successfully uploaded file to {s3_uri}")
            return s3_uri
        except ClientError as e:
            logger.error(f"Failed to upload file to S3: {e}")
            raise Exception(f"Failed to upload file to S3: {str(e)}")
    
    async def upload_fileobj(self, file: UploadFile, file_key: str) -> str:
        """
        Upload a FastAPI UploadFile object to S3.
        
        Args:
            file: FastAPI UploadFile object
            file_key: The S3 object key (path/filename)
            
        Returns:
            str: The S3 URI of the uploaded file
            
        Raises:
            Exception: If upload fails
        """
        try:
            # Reset file pointer to beginning
            await file.seek(0)
            
            # Upload the file object
            self.s3_client.upload_fileobj(file.file, self.bucket_name, file_key)
            s3_uri = f"s3://{self.bucket_name}/{file_key}"
            logger.info(f"Successfully uploaded {file.filename} to {s3_uri}")
            return s3_uri
        except ClientError as e:
            logger.error(f"Failed to upload {file.filename} to S3: {e}")
            raise Exception(f"Failed to upload file to S3: {str(e)}")
    
    async def delete_file(self, file_key: str) -> bool:
        """
        Delete a file from S3.
        
        Args:
            file_key: The S3 object key to delete
            
        Returns:
            bool: True if deletion was successful, False otherwise
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            logger.info(f"Successfully deleted {file_key} from S3")
            return True
        except ClientError as e:
            logger.error(f"Failed to delete {file_key} from S3: {e}")
            return False
    
    async def file_exists(self, file_key: str) -> bool:
        """
        Check if a file exists in S3.
        
        Args:
            file_key: The S3 object key to check
            
        Returns:
            bool: True if file exists, False otherwise
        """
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=file_key)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            else:
                logger.error(f"Error checking if {file_key} exists: {e}")
                return False
    
    async def get_file_size(self, file_key: str) -> Optional[int]:
        """
        Get the size of a file in S3.
        
        Args:
            file_key: The S3 object key
            
        Returns:
            Optional[int]: File size in bytes, or None if file doesn't exist
        """
        try:
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=file_key)
            return response['ContentLength']
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return None
            else:
                logger.error(f"Error getting size of {file_key}: {e}")
                return None
    
    def generate_unique_key(self, original_filename: str, prefix: str = "uploads") -> str:
        """
        Generate a unique S3 key for a file.
        
        Args:
            original_filename: The original filename
            prefix: Optional prefix for the S3 key
            
        Returns:
            str: A unique S3 key
        """
        import uuid
        from datetime import datetime
        
        # Get file extension
        file_extension = os.path.splitext(original_filename)[1]
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create unique key
        unique_key = f"{prefix}/{timestamp}_{unique_id}{file_extension}"
        
        return unique_key
    
    async def test_connection(self) -> bool:
        """
        Test the S3 connection and permissions.
        
        Returns:
            bool: True if connection is successful, False otherwise
        """
        try:
            # Test bucket access by listing objects (requires s3:ListBucket permission)
            self.s3_client.list_objects_v2(Bucket=self.bucket_name, MaxKeys=1)
            logger.info(f"✅ Successfully connected to S3 bucket '{self.bucket_name}'")
            return True
        except ClientError as e:
            logger.error(f"❌ Failed to connect to S3 bucket '{self.bucket_name}': {e}")
            return False
