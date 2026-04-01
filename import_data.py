import sqlite3
import re
import os

# Paths
SQL_FILE = "/Users/aiswarya/AssetTracker/asset_tracker.sql"
DB_FILE = "/Users/aiswarya/AssetTracker/assettracker-backend/asset_tracker.db"

def translate_sql(sql):
    # Convert SERIAL PRIMARY KEY to INTEGER PRIMARY KEY AUTOINCREMENT for SQLite
    sql = re.sub(r'SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT', sql, flags=re.IGNORECASE)
    # Convert INT to INTEGER
    sql = sql.replace(' INT,', ' INTEGER,')
    # Remove PostgreSQL specific features if any
    return sql

def import_data():
    if not os.path.exists(SQL_FILE):
        print(f"SQL file not found: {SQL_FILE}")
        return

    # Use the existing database
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    with open(SQL_FILE, 'r') as f:
        sql_content = f.read()

    # Translate and execute
    translated_sql = translate_sql(sql_content)
    
    try:
        # Execute script
        cursor.executescript(translated_sql)
        conn.commit()
        print("Data imported successfully into asset_tracker.db")

        # Now, since the backend code expects 'users' and 'assets' as defined in models
        # Let's verify we have them or if they mismatch.
        # asset_tracker.sql created 'employees' and 'assets'. 
        # But 'assets' table in the SQL might conflict with the existing one if it already exists.
        # Actually, SQL uses 'id SERIAL PRIMARY KEY' for assets too.
        # The existing one uses 'id VARCHAR PRIMARY KEY' (e.g. AST-001).
        
    except sqlite3.Error as e:
        print(f"Error importing SQL: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    import_data()
