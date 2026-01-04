"""
Database connection utilities. Handles SQLite connection and query execution.

MVC Role: Infrastructure Layer
- Not strictly part of MVC, but supports the Model layer
- Provides low-level database access
- Models will use these functions to persist data

Learning Purpose:
- Shows separation between data access and business logic
- Demonstrates connection management patterns
- Lesson 2 covers how models interact with database layer
"""

import sqlite3
import os
import time
from typing import Any, List, Dict, Optional
from backend.utils.request_tracker import track_db_query


# Database file location
# Supports both local development and Docker deployment
# Docker sets DATABASE_PATH environment variable for persistence
DB_PATH = os.environ.get(
    'DATABASE_PATH',
    os.path.join(os.path.dirname(__file__), 'educational_mvc.db')
)


def get_connection() -> sqlite3.Connection:
    """
    Create and return a connection to the SQLite database.

    Returns:
        sqlite3.Connection: Database connection object

    Note: Uses sqlite3.Row factory to return results as dictionaries
    instead of tuples, making data easier to work with in models.
    """
    conn = sqlite3.connect(DB_PATH)
    # Return rows as dict-like objects instead of tuples
    conn.row_factory = sqlite3.Row
    return conn


def execute_query(query: str, params: tuple = (), fetch_one: bool = False,
                  fetch_all: bool = False, commit: bool = False) -> Optional[Any]:
    """
    Execute a SQL query with error handling and developer panel tracking.

    Args:
        query: SQL query string (use ? for parameters)
        params: Tuple of parameters to safely substitute into query
        fetch_one: If True, return single row
        fetch_all: If True, return all rows
        commit: If True, commit changes (for INSERT/UPDATE/DELETE)

    Returns:
        - If fetch_one: Single row as dict-like object or None
        - If fetch_all: List of rows as dict-like objects
        - If commit: ID of last inserted row (for INSERT) or None
        - Otherwise: None

    Example:
        # Fetch all users
        users = execute_query("SELECT * FROM users", fetch_all=True)

        # Create a user (safe from SQL injection via params)
        user_id = execute_query(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            ("Alice", "alice@example.com"),
            commit=True
        )

    MVC Learning:
    - Models call this function to interact with database
    - Using ? placeholders prevents SQL injection
    - Connection handling is abstracted from models
    - Developer panel tracks all queries for performance analysis
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Track query execution time for developer panel
        start_time = time.time()
        cursor.execute(query, params)
        duration_ms = (time.time() - start_time) * 1000

        result = None
        result_row_count = 0

        if commit:
            conn.commit()
            # Return the ID of the inserted row (useful for INSERT operations)
            result = cursor.lastrowid
            result_row_count = cursor.rowcount
        elif fetch_one:
            result_obj = cursor.fetchone()
            # Convert Row object to dict for easier use
            result = dict(result_obj) if result_obj else None
            result_row_count = 1 if result else 0
        elif fetch_all:
            results = cursor.fetchall()
            # Convert Row objects to dicts
            result = [dict(row) for row in results]
            result_row_count = len(result)

        # Track the query for the developer panel
        # Converts tuple params to list for JSON serialization
        track_db_query(
            query=query,
            params=list(params) if params else [],
            result_row_count=result_row_count,
            duration_ms=round(duration_ms, 2)
        )

        return result

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        raise
    finally:
        if conn:
            conn.close()
