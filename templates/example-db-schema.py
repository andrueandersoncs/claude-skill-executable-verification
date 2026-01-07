#!/usr/bin/env python3
# Example: Verify database schema
# Copy and adapt for your project
# Run with: python3 example-db-schema.py

import sqlite3
import sys
import os

# Configuration
DB_PATH = os.environ.get("DB_PATH", "data/app.db")
REQUIRED_TABLE = "users"
REQUIRED_COLUMNS = {"id", "email", "created_at"}

print(f"Checking: {DB_PATH}")

# Check database file exists
if not os.path.exists(DB_PATH):
    print(f"FAIL: Database not found at {DB_PATH}")
    print("")
    print("Looking for database files...")
    for root, dirs, files in os.walk("."):
        for f in files:
            if f.endswith(".db") or f.endswith(".sqlite"):
                print(f"  Found: {os.path.join(root, f)}")
    sys.exit(1)

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check table exists
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (REQUIRED_TABLE,)
    )
    if not cursor.fetchone():
        print(f"FAIL: Table '{REQUIRED_TABLE}' does not exist")
        print("")
        print("Available tables:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        for row in cursor.fetchall():
            print(f"  - {row[0]}")
        sys.exit(1)

    # Check columns
    cursor.execute(f"PRAGMA table_info({REQUIRED_TABLE})")
    columns = {row[1] for row in cursor.fetchall()}

    missing = REQUIRED_COLUMNS - columns
    if missing:
        print(f"FAIL: Missing columns in {REQUIRED_TABLE}: {missing}")
        print(f"Available columns: {columns}")
        sys.exit(1)

    print(f"PASS: Table '{REQUIRED_TABLE}' exists with required columns")
    print(f"Columns: {', '.join(sorted(columns))}")

    conn.close()

except sqlite3.Error as e:
    print(f"FAIL: Database error: {e}")
    sys.exit(1)
