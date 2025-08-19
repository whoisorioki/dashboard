import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import all models here to register them with SQLAlchemy
from models.ingestion_task import IngestionTask

# Import the Base and engine
from db.base import Base
from db.session import engine

def init_db():
    """Initialize the database by creating all tables."""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
