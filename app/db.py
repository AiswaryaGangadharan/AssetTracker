import sqlite3
import os

DB_PATH = "asset_tracker.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)

    sql_path = os.path.join(os.path.dirname(__file__), "asset_tracker.sql")

    with open(sql_path, 'r') as f:
        conn.executescript(f.read())

    conn.commit()
    conn.close()