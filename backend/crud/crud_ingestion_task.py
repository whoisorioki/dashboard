from sqlalchemy.orm import Session
from models.ingestion_task import IngestionTask
from typing import Optional, List
import shortuuid

def create_ingestion_task(db: Session, *, datasource_name: str, original_filename: str, file_uri: str, file_size: int) -> IngestionTask:
    """
    Creates a new ingestion task record in the database.
    """
    # Use shortuuid for a cleaner, URL-friendly task ID
    task_id = shortuuid.uuid()
    
    db_task = IngestionTask(
        task_id=task_id,
        datasource_name=datasource_name,
        original_filename=original_filename,
        file_uri=file_uri,
        file_size=file_size,
        status="ACCEPTED"  # A more descriptive initial status than PENDING
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_ingestion_task(db: Session, task_id: str) -> Optional[IngestionTask]:
    """
    Retrieves an ingestion task by its task_id.
    """
    return db.query(IngestionTask).filter(IngestionTask.task_id == task_id).first()

def get_task_by_task_id(db: Session, task_id: str) -> Optional[IngestionTask]:
    """
    Retrieves a single ingestion task by its public task_id.
    """
    return db.query(IngestionTask).filter(IngestionTask.task_id == task_id).first()

def get_tasks(db: Session, skip: int = 0, limit: int = 100) -> List[IngestionTask]:
    """
    Retrieves a list of ingestion tasks with pagination.
    """
    return db.query(IngestionTask).order_by(IngestionTask.created_at.desc()).offset(skip).limit(limit).all()

def update_task_status(db: Session, task_id: str, status: str, **kwargs) -> Optional[IngestionTask]:
    """
    Updates the status and other fields of an ingestion task.
    """
    task = get_ingestion_task(db, task_id)
    if not task:
        return None
    
    # Type: ignore comments to suppress linter errors for SQLAlchemy model attributes
    task.status = status  # type: ignore
    for key, value in kwargs.items():
        if hasattr(task, key):
            setattr(task, key, value)  # type: ignore
    
    db.commit()
    db.refresh(task)
    return task
