"""
Migration script to add projects and research columns to cvs and cv_versions tables
Run this script to update your existing database schema.
"""
import sys
import os

# Add the parent directory to the path to allow imports
backend_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(backend_dir)
sys.path.insert(0, parent_dir)

from sqlalchemy import text, inspect, create_engine
from sqlalchemy.orm import sessionmaker

# Database is in the parent directory
db_path = os.path.join(parent_dir, 'cv_builder.db')
DATABASE_URL = f'sqlite:///{db_path}'

# Create engine and session
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_migration():
    """Add projects and research columns to existing tables"""
    
    # First, ensure all tables are created
    print("Checking if database tables exist...")
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    if 'cvs' not in existing_tables or 'cv_versions' not in existing_tables:
        print("⚠️  Tables don't exist yet. Please start the backend server first to create tables.")
        print("Run: python start_backend.py")
        print("Then stop it and run this migration again.")
        return False
    
    db = SessionLocal()
    
    try:
        # Check if columns already exist
        cvs_columns = [col['name'] for col in inspector.get_columns('cvs')]
        cv_versions_columns = [col['name'] for col in inspector.get_columns('cv_versions')]
        
        changes_made = False
        
        # Add columns to cvs table if they don't exist
        if 'projects' not in cvs_columns:
            print("Adding 'projects' column to cvs table...")
            db.execute(text("ALTER TABLE cvs ADD COLUMN projects TEXT"))
            changes_made = True
        else:
            print("✓ 'projects' column already exists in cvs table")
        
        if 'research' not in cvs_columns:
            print("Adding 'research' column to cvs table...")
            db.execute(text("ALTER TABLE cvs ADD COLUMN research TEXT"))
            changes_made = True
        else:
            print("✓ 'research' column already exists in cvs table")
        
        # Add columns to cv_versions table if they don't exist
        if 'projects' not in cv_versions_columns:
            print("Adding 'projects' column to cv_versions table...")
            db.execute(text("ALTER TABLE cv_versions ADD COLUMN projects TEXT"))
            changes_made = True
        else:
            print("✓ 'projects' column already exists in cv_versions table")
        
        if 'research' not in cv_versions_columns:
            print("Adding 'research' column to cv_versions table...")
            db.execute(text("ALTER TABLE cv_versions ADD COLUMN research TEXT"))
            changes_made = True
        else:
            print("✓ 'research' column already exists in cv_versions table")
        
        if changes_made:
            db.commit()
            print("\n✅ Migration completed successfully!")
            print("New columns 'projects' and 'research' have been added.")
        else:
            print("\n✅ All columns already exist. No changes needed.")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Database Migration: Add Projects and Research Columns")
    print("=" * 60)
    print("\nThis will add 'projects' and 'research' columns to:")
    print("  - cvs table")
    print("  - cv_versions table")
    print("\n")
    
    response = input("Do you want to proceed? (yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        success = run_migration()
        if success:
            print("\n" + "=" * 60)
            print("✅ Migration complete! You can now restart the backend server.")
            print("=" * 60)
    else:
        print("Migration cancelled.")
