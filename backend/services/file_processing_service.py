"""
File processing service for handling file uploads, format detection, and S3 operations.
Integrates with the data validation service for complete file processing pipeline.
"""

import os
import tempfile
import logging
from typing import Dict, Optional, Tuple
from fastapi import UploadFile
import boto3
from botocore.exceptions import ClientError

from .data_validation_service import DataValidationService
from . import s3_service

logger = logging.getLogger(__name__)

class FileProcessingService:
    """
    Service for processing uploaded files, including format detection,
    validation, and S3 storage operations.
    """
    
    def __init__(self):
        self.validation_service = DataValidationService()
        self.s3_client = boto3.client('s3')
    
    async def process_uploaded_file(self, file: UploadFile, datasource_name: str) -> Dict:
        """
        Complete file processing pipeline.
        
        Args:
            file: Uploaded file from FastAPI
            datasource_name: Name for the datasource
            
        Returns:
            Dictionary with processing results
        """
        result = {
            'success': False,
            'error_message': '',
            'file_info': {},
            'validation_result': {},
            's3_uri': '',
            'row_count': 0
        }
        
        temp_file_path = None
        try:
            # Step 1: Save uploaded file to temporary location
            temp_file_path = await self._save_uploaded_file(file)
            if not temp_file_path:
                result['error_message'] = "Failed to save uploaded file"
                return result
            
            # Step 2: Validate file format and size
            if not file.filename:
                result['error_message'] = "No filename provided"
                self._cleanup_temp_file(temp_file_path)
                return result
                
            if file.size is None:
                result['error_message'] = "No file size provided"
                self._cleanup_temp_file(temp_file_path)
                return result
            
            format_valid, format_error = self.validation_service.validate_file_format(file.filename)
            if not format_valid:
                result['error_message'] = format_error
                self._cleanup_temp_file(temp_file_path)
                return result
            
            size_valid, size_error = self.validation_service.validate_file_size(file.size)
            if not size_valid:
                result['error_message'] = size_error
                self._cleanup_temp_file(temp_file_path)
                return result
            
            # Step 3: Validate data content
            validation_result = self.validation_service.validate_file(
                temp_file_path, 
                file.filename, 
                file.size
            )
            
            result['validation_result'] = validation_result
            result['file_info'] = {
                'filename': file.filename,
                'size': file.size,
                'format': validation_result.get('file_format', ''),
                'row_count': validation_result.get('row_count', 0)
            }
            
            if not validation_result['is_valid']:
                result['error_message'] = validation_result['error_message']
                self._cleanup_temp_file(temp_file_path)
                return result
            
            # Step 4: Upload to S3
            s3_uri = await self._upload_to_s3(temp_file_path, file.filename, datasource_name)
            if not s3_uri:
                result['error_message'] = "Failed to upload file to S3"
                self._cleanup_temp_file(temp_file_path)
                return result
            
            result['s3_uri'] = s3_uri
            result['row_count'] = validation_result.get('row_count', 0)
            result['success'] = True
            
            logger.info(f"File processing successful: {file.filename}, {result['row_count']} rows")
            
        except Exception as e:
            error_msg = f"Unexpected error during file processing: {str(e)}"
            logger.error(error_msg)
            result['error_message'] = error_msg
            
        finally:
            # Clean up temporary file
            if 'temp_file_path' in locals() and temp_file_path:
                self._cleanup_temp_file(temp_file_path)
        
        return result
    
    async def _save_uploaded_file(self, file: UploadFile) -> Optional[str]:
        """
        Save uploaded file to a temporary location.
        
        Args:
            file: Uploaded file from FastAPI
            
        Returns:
            Path to temporary file or None if failed
        """
        try:
            # Create temporary file with proper extension
            file_ext = os.path.splitext(file.filename)[1] if file.filename else '.tmp'
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
            temp_file_path = temp_file.name
            
            # Write file content
            content = await file.read()
            temp_file.write(content)
            temp_file.close()
            
            logger.info(f"Saved uploaded file to temporary location: {temp_file_path}")
            return temp_file_path
            
        except Exception as e:
            logger.error(f"Failed to save uploaded file: {e}")
            return None
    
    async def _upload_to_s3(self, file_path: str, original_filename: str, datasource_name: str) -> Optional[str]:
        """
        Upload file to S3 with organized naming.
        
        Args:
            file_path: Path to the file to upload
            original_filename: Original filename
            datasource_name: Name for the datasource
            
        Returns:
            S3 URI or None if failed
        """
        try:
            # Generate S3 key with organized structure
            file_ext = os.path.splitext(original_filename)[1]
            s3_key = f"datasources/{datasource_name}/{original_filename}"
            
            # Upload to S3
            success = s3_service.upload_file_to_s3_from_path(file_path, s3_key)
            if not success:
                logger.error(f"Failed to upload file to S3: {s3_key}")
                return None
            
            s3_uri = f"s3://{s3_service.S3_BUCKET_NAME}/{s3_key}"
            logger.info(f"Successfully uploaded file to S3: {s3_uri}")
            return s3_uri
            
        except Exception as e:
            logger.error(f"Error uploading file to S3: {e}")
            return None
    
    def _cleanup_temp_file(self, file_path: str):
        """
        Clean up temporary file.
        
        Args:
            file_path: Path to temporary file
        """
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                logger.debug(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup temporary file {file_path}: {e}")
    
    def get_file_format_info(self, filename: str) -> Dict:
        """
        Get information about the file format.
        
        Args:
            filename: Name of the file
            
        Returns:
            Dictionary with format information
        """
        file_ext = os.path.splitext(filename.lower())[1] if filename else ''
        
        format_info = {
            'extension': file_ext,
            'is_supported': file_ext in self.validation_service.supported_formats,
            'supported_formats': list(self.validation_service.supported_formats),
            'mime_type': self._get_mime_type(file_ext)
        }
        
        return format_info
    
    def _get_mime_type(self, file_ext: str) -> str:
        """
        Get MIME type for file extension.
        
        Args:
            file_ext: File extension
            
        Returns:
            MIME type string
        """
        mime_types = {
            '.csv': 'text/csv',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.xls': 'application/vnd.ms-excel',
            '.parquet': 'application/octet-stream'
        }
        
        return mime_types.get(file_ext.lower(), 'application/octet-stream')
