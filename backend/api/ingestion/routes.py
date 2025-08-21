import os
import time
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import SessionLocal
from services import s3_service
from crud import crud_ingestion_task
import shortuuid

router = APIRouter()

# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ingestion_background_task(task_id: str, file_uri: str, datasource_name: str, original_filename: str):
    """
    Complete background task for data ingestion pipeline.
    Handles validation, Druid spec generation, and task submission.
    """
    from services.file_processing_service import FileProcessingService
    from services.druid_service import DruidService
    from crud import crud_ingestion_task
    from db.session import SessionLocal
    import os
    
    total_start_time = time.time()
    print(f"🚀 Starting background processing for task {task_id} with file {file_uri}")
    
    # Initialize services
    init_start = time.time()
    file_processor = FileProcessingService()
    druid_service = DruidService()
    db = SessionLocal()
    init_time = time.time() - init_start
    print(f"⚙️  Service initialization completed in {init_time:.3f}s")
    
    try:
        # Update task status to PROCESSING
        db_update_start = time.time()
        crud_ingestion_task.update_task_status(
            db, task_id, "PROCESSING", 
            started_at=datetime.now()
        )
        db_update_time = time.time() - db_update_start
        print(f"📝 Database status update completed in {db_update_time:.3f}s")
        
        # Step 1: Download file from S3 for processing
        download_start = time.time()
        temp_file_path = download_file_from_s3(file_uri, original_filename)
        download_time = time.time() - download_start
        
        if not temp_file_path:
            print(f"❌ S3 download failed after {download_time:.3f}s")
            raise Exception("Failed to download file from S3")
        
        print(f"⬇️  S3 file download completed in {download_time:.3f}s")
        
        try:
            # Step 2: Process and validate file using the downloaded file
            validation_start = time.time()
            processing_result = file_processor.validation_service.validate_file(
                temp_file_path, 
                original_filename, 
                os.path.getsize(temp_file_path)
            )
            validation_time = time.time() - validation_start
            
            print(f"🔍 File validation completed in {validation_time:.3f}s")
            if 'timing' in processing_result:
                print(f"   Validation breakdown: {processing_result['timing']}")
            
            if not processing_result['is_valid']:
                print(f"❌ Validation failed after {validation_time:.3f}s")
                raise Exception(f"File processing failed: {processing_result['error_message']}")
            
            # Step 2.5: Copy file to shared directory for Druid access
            copy_start = time.time()
            shared_file_path = f"/opt/shared/{original_filename}"
            import shutil
            shutil.copy2(temp_file_path, shared_file_path)
            copy_time = time.time() - copy_start
            print(f"📁 File copied to shared directory in {copy_time:.3f}s: {shared_file_path}")
            
            # Step 3: Generate Druid ingestion spec
            spec_start = time.time()
            ingestion_spec = druid_service.create_ingestion_spec(
                datasource_name=datasource_name,
                file_name=original_filename,
                file_format=processing_result['file_format'],
                row_count=processing_result['row_count']
            )
            spec_time = time.time() - spec_start
            print(f"📋 Druid ingestion spec generated in {spec_time:.3f}s")
            
            # Step 4: Submit to Druid
            submit_start = time.time()
            druid_task_id = druid_service.submit_ingestion_task(ingestion_spec)
            submit_time = time.time() - submit_start
            
            if not druid_task_id:
                print(f"❌ Druid task submission failed after {submit_time:.3f}s")
                raise Exception("Failed to submit task to Druid")
            
            print(f"📤 Druid task submitted in {submit_time:.3f}s - Task ID: {druid_task_id}")
            
            # Step 5: Update database with Druid task ID
            db_update2_start = time.time()
            crud_ingestion_task.update_task_status(
                db, task_id, "SUBMITTED_TO_DRUID",
                druid_task_id=druid_task_id,
                row_count=processing_result['row_count']
            )
            db_update2_time = time.time() - db_update2_start
            print(f"📝 Database update with Druid task ID completed in {db_update2_time:.3f}s")
            
            # Step 6: Monitor Druid task completion
            monitoring_start = time.time()
            print(f"👀 Starting Druid task monitoring for task {druid_task_id}...")
            final_status = druid_service.wait_for_task_completion(druid_task_id)
            monitoring_time = time.time() - monitoring_start
            
            print(f"📊 Druid task monitoring completed in {monitoring_time:.3f}s")
            
            if final_status.get('status', {}).get('state') == 'SUCCESS':
                db_final_start = time.time()
                crud_ingestion_task.update_task_status(
                    db, task_id, "COMPLETED",
                    completed_at=datetime.now()
                )
                db_final_time = time.time() - db_final_start
                print(f"✅ Task {task_id} completed successfully in {monitoring_time:.3f}s (DB update: {db_final_time:.3f}s)")
            else:
                error_msg = final_status.get('error', 'Unknown error')
                db_error_start = time.time()
                crud_ingestion_task.update_task_status(
                    db, task_id, "FAILED",
                    completed_at=datetime.now(),
                    error_message=error_msg
                )
                db_error_time = time.time() - db_error_start
                print(f"❌ Task {task_id} failed after {monitoring_time:.3f}s: {error_msg} (DB update: {db_error_time:.3f}s)")
                
        finally:
            # Clean up temporary file
            cleanup_start = time.time()
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                cleanup_time = time.time() - cleanup_start
                print(f"🧹 Temporary file cleanup completed in {cleanup_time:.3f}s")
                
    except Exception as e:
        error_msg = f"Background task failed: {str(e)}"
        print(f"❌ {error_msg}")
        
        db_error_start = time.time()
        crud_ingestion_task.update_task_status(
            db, task_id, "FAILED",
            completed_at=datetime.now(),
            error_message=error_msg
        )
        db_error_time = time.time() - db_error_start
        print(f"📝 Error status update completed in {db_error_time:.3f}s")
        
    finally:
        db.close()
        total_time = time.time() - total_start_time
        print(f"🏁 Background task {task_id} completed in {total_time:.3f}s total")

def download_file_from_s3(s3_uri: str, filename: str) -> Optional[str]:
    """
    Download file from S3 to temporary location.
    """
    import tempfile
    import boto3
    from urllib.parse import urlparse
    
    try:
        # Parse S3 URI
        parsed = urlparse(s3_uri)
        bucket = parsed.netloc
        key = parsed.path.lstrip('/')
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1])
        temp_file_path = temp_file.name
        temp_file.close()
        
        # Download from S3
        s3_client = boto3.client('s3')
        s3_client.download_file(bucket, key, temp_file_path)
        
        return temp_file_path
    except Exception as e:
        print(f"Failed to download file from S3: {e}")
        return None

@router.post("/upload", status_code=202)
async def upload_data_file(
    background_tasks: BackgroundTasks,
    datasource_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts a file upload, saves it to S3, creates a tracking record
    in the database, and schedules the ingestion process to run in the background.
    """
    upload_start_time = time.time()
    
    # Validate file input
    if not file.filename:
        raise HTTPException(status_code=400, detail="File must have a filename")
    
    if file.size is None:
        raise HTTPException(status_code=400, detail="File size is required")
    
    # 1. Generate a meaningful name for the file in S3 (preserve original filename)
    s3_name_start = time.time()
    file_extension = os.path.splitext(file.filename)[1]
    base_filename = os.path.splitext(file.filename)[0]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Option 1: Original filename with timestamp (recommended)
    meaningful_s3_filename = f"uploads/{datasource_name}/{base_filename}_{timestamp}{file_extension}"
    
    # Option 2: Just original filename (if you want exact preservation)
    # meaningful_s3_filename = f"uploads/{datasource_name}/{file.filename}"
    
    # Option 3: Original filename with task ID for uniqueness
    # meaningful_s3_filename = f"uploads/{datasource_name}/{base_filename}_{task_id}{file_extension}"
    
    s3_name_time = time.time() - s3_name_start
    
    # 2. Stream the file directly to S3
    s3_upload_start = time.time()
    success = s3_service.upload_file_to_s3(file=file, object_name=meaningful_s3_filename)
    s3_upload_time = time.time() - s3_upload_start
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to upload file to S3.")

    # 3. Create the initial task record in the operational database
    db_create_start = time.time()
    file_uri = f"s3://{s3_service.S3_BUCKET_NAME}/{meaningful_s3_filename}"
    task = crud_ingestion_task.create_ingestion_task(
        db=db,
        datasource_name=datasource_name,
        original_filename=file.filename,
        file_uri=file_uri,
        file_size=file.size
    )
    db_create_time = time.time() - db_create_start

    # 4. Add the long-running process to the background task queue
    bg_task_start = time.time()
    background_tasks.add_task(
        ingestion_background_task, 
        task.task_id,  # type: ignore
        file_uri,
        datasource_name,
        file.filename
    )  # type: ignore
    bg_task_time = time.time() - bg_task_start

    # 5. Return an immediate response to the client
    total_upload_time = time.time() - upload_start_time
    
    print(f"📤 File upload completed in {total_upload_time:.3f}s:")
    print(f"   S3 name generation: {s3_name_time:.3f}s")
    print(f"   S3 upload: {s3_upload_time:.3f}s")
    print(f"   Database record creation: {db_create_time:.3f}s")
    print(f"   Background task scheduling: {bg_task_time:.3f}s")
    
    return {"message": "File upload accepted and is being processed.", "task_id": task.task_id}  # type: ignore

@router.post("/test-upload", status_code=200)
async def test_upload(
    datasource_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Simple test endpoint that just uploads to S3 without Druid processing.
    """
    try:
        # Generate S3 filename
        if not file.filename:
            raise HTTPException(status_code=400, detail="File must have a filename")
        
        file_extension = os.path.splitext(file.filename)[1]
        base_filename = os.path.splitext(file.filename)[0]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        s3_filename = f"uploads/{datasource_name}/{base_filename}_{timestamp}{file_extension}"
        
        # Upload to S3
        success = s3_service.upload_file_to_s3(file=file, object_name=s3_filename)
        
        if success:
            return {
                "message": "File uploaded successfully to S3",
                "s3_path": f"s3://{s3_service.S3_BUCKET_NAME}/{s3_filename}",
                "filename": file.filename,
                "size": file.size
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to upload to S3")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/status/{task_id}")
async def get_task_status(task_id: str, db: Session = Depends(get_db)):
    """
    Get the current status of an ingestion task.
    """
    status_start = time.time()
    
    task = crud_ingestion_task.get_ingestion_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    status_time = time.time() - status_start
    print(f"📊 Task status retrieved in {status_time:.3f}s")
    
    return {
        "task_id": task.task_id,  # type: ignore
        "status": task.status,  # type: ignore
        "datasource_name": task.datasource_name,  # type: ignore
        "original_filename": task.original_filename,  # type: ignore
        "created_at": task.created_at,  # type: ignore
        "started_at": task.started_at,  # type: ignore
        "completed_at": task.completed_at,  # type: ignore
        "error_message": task.error_message,  # type: ignore
        "file_size": task.file_size,  # type: ignore
        "row_count": task.row_count  # type: ignore
    }
