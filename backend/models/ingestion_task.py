import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, Text, DateTime, BigInteger, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from db.base import Base

class IngestionTask(Base):
    __tablename__ = "ingestion_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(String(255), unique=True, nullable=False)
    user_id = Column(String(255), nullable=True)
    datasource_name = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_uri = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default='PENDING')
    druid_task_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    validation_errors = Column(JSON, nullable=True)
    file_size = Column(BigInteger, nullable=True)
    row_count = Column(Integer, nullable=True)

    def __repr__(self):
        return f"<IngestionTask(task_id='{self.task_id}', status='{self.status}')>"
