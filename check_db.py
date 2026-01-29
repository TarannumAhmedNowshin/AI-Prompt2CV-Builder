import sqlite3

conn = sqlite3.connect('cv_builder.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables in database:")
for table in tables:
    print(f"  - {table[0]}")
    
# Check CV table structure if it exists
if any('cvs' in str(t) for t in tables):
    cursor.execute("PRAGMA table_info(cvs)")
    columns = cursor.fetchall()
    print("\nCV table columns:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
        
    # Count CVs
    cursor.execute("SELECT COUNT(*) FROM cvs")
    count = cursor.fetchone()[0]
    print(f"\nTotal CVs: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, title, full_name, created_at FROM cvs LIMIT 5")
        cvs = cursor.fetchall()
        print("\nRecent CVs:")
        for cv in cvs:
            print(f"  ID: {cv[0]}, Title: {cv[1]}, Name: {cv[2]}, Created: {cv[3]}")

conn.close()
