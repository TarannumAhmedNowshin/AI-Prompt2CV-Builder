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
        cursor.execute("SELECT id, title, full_name, ai_prompt, created_at, updated_at FROM cvs ORDER BY id DESC LIMIT 5")
        cvs = cursor.fetchall()
        print("\nRecent CVs with AI prompts:")
        for cv in cvs:
            print(f"\n  ID: {cv[0]}")
            print(f"  Title: {cv[1]}")
            print(f"  Name: {cv[2]}")
            print(f"  AI Prompt: {cv[3][:100] if cv[3] else 'None'}...")
            print(f"  Created: {cv[4]}")
            print(f"  Updated: {cv[5]}")

conn.close()
