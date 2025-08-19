from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models.ingestion_task import IngestionTask

class IngestionTaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_task(self, task_id: str, datasource_name: str, original_filename: str, 
                   file_uri: str, user_id: Optional[str] = None) -> IngestionTask:
        """Create a new ingestion task record"""
        task = IngestionTask(
            task_id=task_id,
            user_id=user_id,
            datasource_name=datasource_name,
            original_filename=original_filename,
            file_uri=file_uri,
            status='PENDING'
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def get_task_by_id(self, task_id: str) -> Optional[IngestionTask]:
        """Get a task by its task_id"""
        return self.db.query(IngestionTask).filter(IngestionTask.task_id == task_id).first()

    def update_task_status(self, task_id: str, status: str, 
                          error_message: Optional[str] = None,
                          druid_task_id: Optional[str] = None,
                          file_size: Optional[int] = None,
                          row_count: Optional[int] = None) -> Optional[IngestionTask]:
        """Update task status and related fields"""
        task = self.get_task_by_id(task_id)
        if not task:
            return None

        # Type: ignore comments to suppress linter errors for SQLAlchemy model attributes
        task.status = status  # type: ignore
        task.updated_at = datetime.utcnow()  # type: ignore

        if status == 'RUNNING' and not task.started_at:  # type: ignore
            task.started_at = datetime.utcnow()  # type: ignore
        elif status in ['SUCCESS', 'FAILED'] and not task.completed_at:  # type: ignore
            task.completed_at = datetime.utcnow()  # type: ignore

        if error_message:
            task.error_message = error_message  # type: ignore
        if druid_task_id:
            task.druid_task_id = druid_task_id  # type: ignore
        if file_size is not None:
            task.file_size = file_size  # type: ignore
        if row_count is not None:
            task.row_count = row_count  # type: ignore

        self.db.commit()
        self.db.refresh(task)
        return task

    def update_validation_errors(self, task_id: str, validation_errors: dict) -> Optional[IngestionTask]:
        """Update validation errors for a task"""
        task = self.get_task_by_id(task_id)
        if not task:
            return None

        task.validation_errors = validation_errors  # type: ignore
        task.updated_at = datetime.utcnow()  # type: ignore
        self.db.commit()
        self.db.refresh(task)
        return task

    def list_tasks(self, limit: int = 50, offset: int = 0) -> List[IngestionTask]:
        """List tasks with pagination"""
        return self.db.query(IngestionTask)\
            .order_by(IngestionTask.created_at.desc())\
            .offset(offset)\
            .limit(limit)\
            .all()

    def get_tasks_by_status(self, status: str) -> List[IngestionTask]:
        """Get all tasks with a specific status"""
        return self.db.query(IngestionTask)\
            .filter(IngestionTask.status == status)\
            .order_by(IngestionTask.created_at.desc())\
            .all()

    def delete_task(self, task_id: str) -> bool:
        """Delete a task by task_id"""
        task = self.get_task_by_id(task_id)
        if not task:
            return False

        self.db.delete(task)
        self.db.commit()
        return True
