#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

load_dotenv(dotenv_path='docker.env')

def test_environment_setup():
    print("🔧 Testing Database Environment Setup...")
    
    # Check .env file
    env_file_path = 'docker.env'
    if os.path.exists(env_file_path):
        print("   ✅ .env file found")
    else:
        print("   ❌ .env file not found")
        return False
    
    # Check required environment variables
    required_vars = [
        ("DB_HOST", os.getenv("DB_HOST")),
        ("DB_PORT", os.getenv("DB_PORT")),
        ("DB_USER", os.getenv("DB_USER")),
        ("DB_PASSWORD", os.getenv("DB_PASSWORD")),
        ("DB_NAME", os.getenv("DB_NAME"))
    ]
    
    missing_vars = []
    for var_name, var_value in required_vars:
        if var_value:
            print(f"   ✅ {var_name} is set")
        else:
            print(f"   ❌ {var_name} is not set")
            missing_vars.append(var_name)
    
    if missing_vars:
        print(f"   💡 Please set the following variables in your .env file: {', '.join(missing_vars)}")
        return False
    
    print("   ✅ All environment variables are configured")
    return True

def test_database_connection():
    print("\n🔍 Testing Database Connection...")
    
    try:
        from backend.db.session import engine, SessionLocal
        
        # Test connection
        with engine.connect() as connection:
            from sqlalchemy import text
            result = connection.execute(text("SELECT version();"))
            row = result.fetchone()
            version = row[0] if row else "Unknown"
            print(f"   ✅ Successfully connected to PostgreSQL")
            print(f"   📋 Version: {version}")
        
        # Test session creation
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1;"))
            print("   ✅ Database session created successfully")
        finally:
            db.close()
        
        return True
        
    except Exception as e:
        print(f"   ❌ Database connection failed: {e}")
        return False

def test_model_imports():
    print("\n📦 Testing Model Imports...")
    
    try:
        from backend.db.base import Base
        from backend.models.ingestion_task import IngestionTask
        from backend.repositories.ingestion_task_repository import IngestionTaskRepository
        
        print("   ✅ All models imported successfully")
        print(f"   📋 Base model: {Base}")
        print(f"   📋 IngestionTask model: {IngestionTask}")
        print(f"   📋 Repository: {IngestionTaskRepository}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Model import failed: {e}")
        return False

def test_alembic_setup():
    print("\n🔄 Testing Alembic Setup...")
    
    try:
        import alembic
        from alembic import command
        from alembic.config import Config
        
        print("   ✅ Alembic imported successfully")
        
        # Check if alembic.ini exists
        if os.path.exists('alembic.ini'):
            print("   ✅ alembic.ini found")
        else:
            print("   ❌ alembic.ini not found")
            return False
        
        # Check if alembic directory exists
        if os.path.exists('alembic'):
            print("   ✅ alembic directory found")
        else:
            print("   ❌ alembic directory not found")
            return False
        
        return True
        
    except Exception as e:
        print(f"   ❌ Alembic setup failed: {e}")
        return False

def main():
    print("🚀 Database Setup Test")
    print("=" * 50)
    
    # Test environment setup
    if not test_environment_setup():
        print("\n❌ Environment setup failed. Please fix the issues above.")
        sys.exit(1)
    
    # Test database connection
    if not test_database_connection():
        print("\n❌ Database connection failed. Please ensure the database is running.")
        sys.exit(1)
    
    # Test model imports
    if not test_model_imports():
        print("\n❌ Model imports failed. Please check the model definitions.")
        sys.exit(1)
    
    # Test Alembic setup
    if not test_alembic_setup():
        print("\n❌ Alembic setup failed. Please check the migration configuration.")
        sys.exit(1)
    
    print("\n🎉 All database tests passed successfully!")
    print("✅ Database setup is complete and ready for use!")
    print("   You can now proceed with running migrations and implementing the ingestion pipeline.")

if __name__ == "__main__":
    main()
