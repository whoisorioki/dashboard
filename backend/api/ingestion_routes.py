from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from utils.response_envelope import envelope
import logging
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/ingest", tags=["ingestion"])

logger = logging.getLogger("backend.api.ingestion_routes")


@router.get("/status")
async def get_ingestion_status(request: Request):
    """
    Get current data ingestion status.
    
    Returns information about active, completed, and failed ingestion tasks.
    """
    try:
        # Mock data for now - replace with actual database queries
        ingestion_status = {
            "activeTasks": 0,
            "completedTasks": 5,
            "failedTasks": 0,
            "lastUpdate": datetime.now().isoformat(),
            "totalFilesProcessed": 15,
            "lastSuccessfulIngestion": "2024-08-21T12:00:00Z",
            "pendingFiles": 0,
            "systemHealth": "healthy"
        }
        
        return envelope(ingestion_status, request)
        
    except Exception as e:
        logger.error(f"Error getting ingestion status: {str(e)}")
        return envelope({"error": "Failed to get ingestion status"}, request)


@router.get("/upload")
async def get_upload_status(request: Request):
    """
    Get upload interface status and configuration.
    
    Returns information about supported file types and upload limits.
    """
    try:
        upload_config = {
            "supportedFormats": ['.csv', '.xlsx', '.xls', '.json'],
            "maxFileSize": "100MB",
            "uploadEnabled": True,
            "activeUploads": 0,
            "queueLength": 0,
            "lastUpload": "2024-08-21T12:00:00Z"
        }
        
        return envelope(upload_config, request)
        
    except Exception as e:
        logger.error(f"Error getting upload status: {str(e)}")
        return envelope({"error": "Failed to get upload status"}, request)


@router.post("/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
):
    """
    Upload a file for data ingestion.
    
    Accepts CSV, Excel, or JSON files for processing.
    """
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
            
        allowed_extensions = ['.csv', '.xlsx', '.xls', '.json']
        file_extension = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
        
        if f'.{file_extension}' not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Mock file processing response
        upload_response = {
            "filename": file.filename,
            "size": file.size,
            "status": "uploaded",
            "taskId": f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "message": "File uploaded successfully and queued for processing",
            "estimatedProcessingTime": "2-5 minutes"
        }
        
        logger.info(f"File uploaded: {file.filename}, size: {file.size}")
        
        return envelope(upload_response, request)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return envelope({"error": "Failed to upload file"}, request)


@router.get("/tasks")
async def get_ingestion_tasks(request: Request):
    """
    Get list of ingestion tasks.
    
    Returns detailed information about all ingestion tasks.
    """
    try:
        # Mock data for now - replace with actual database queries
        tasks = [
            {
                "taskId": "task_20240821_120000",
                "filename": "sales_data_2024.csv",
                "status": "completed",
                "startTime": "2024-08-21T12:00:00Z",
                "endTime": "2024-08-21T12:02:30Z",
                "recordsProcessed": 15000,
                "errors": 0
            },
            {
                "taskId": "task_20240821_110000",
                "filename": "product_catalog.xlsx",
                "status": "completed",
                "startTime": "2024-08-21T11:00:00Z",
                "endTime": "2024-08-21T11:01:45Z",
                "recordsProcessed": 500,
                "errors": 0
            }
        ]
        
        return envelope(tasks, request)
        
    except Exception as e:
        logger.error(f"Error getting ingestion tasks: {str(e)}")
        return envelope({"error": "Failed to get ingestion tasks"}, request)
