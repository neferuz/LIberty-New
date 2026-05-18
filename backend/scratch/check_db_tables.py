import sqlite3

def check_db():
    conn = sqlite3.connect("liberty_wear.db")
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    print("Tables in liberty_wear.db:")
    print(tables)
    
    for table in tables:
        print(f"\nSchema for {table}:")
        cursor.execute(f"PRAGMA table_info({table});")
        for col in cursor.fetchall():
            print(f"  Column: {col[1]} | Type: {col[2]}")
            
        # Check first 3 rows
        cursor.execute(f"SELECT * FROM {table} LIMIT 3;")
        rows = cursor.fetchall()
        print(f"  Rows count: {len(rows)}")
        for r in rows:
            print(f"    {r}")
            
    conn.close()

if __name__ == "__main__":
    check_db()
