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
from typing import Any, List, Dict, Optional


# Database file location
DB_PATH = os.path.join(os.path.dirname(__file__), 'educational_mvc.db')


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
    Execute a SQL query with error handling.

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
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)

        if commit:
            conn.commit()
            # Return the ID of the inserted row (useful for INSERT operations)
            return cursor.lastrowid
        elif fetch_one:
            result = cursor.fetchone()
            # Convert Row object to dict for easier use
            return dict(result) if result else None
        elif fetch_all:
            results = cursor.fetchall()
            # Convert Row objects to dicts
            return [dict(row) for row in results]

        return None

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        raise
    finally:
        if conn:
            conn.close()
