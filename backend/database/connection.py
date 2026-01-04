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
from backend.utils.request_tracker import track_db_query, track_error


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

    except sqlite3.IntegrityError as e:
        # Handle constraint violations (UNIQUE, FOREIGN KEY, etc.)
        # These are common user errors that should be handled gracefully
        error_message = str(e)
        
        # Create structured error for tracking
        structured_error = {
            'error_type': 'IntegrityError',
            'message': _parse_integrity_error(error_message),
            'raw': error_message,
            'query': query,
            'params': list(params) if params else []
        }
        
        # Track error for developer panel
        track_error(
            error_type='IntegrityError',
            message=structured_error['message'],
            raw_error=error_message,
            query=query,
            params=list(params) if params else []
        )
        
        # Log to console for debugging
        print(f"Database IntegrityError: {error_message}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        
        # Re-raise with structured information attached
        e.structured_error = structured_error
        raise
        
    except sqlite3.Error as e:
        # Handle other database errors (connection issues, syntax errors, etc.)
        error_message = str(e)
        
        # Create structured error for tracking
        structured_error = {
            'error_type': type(e).__name__,
            'message': error_message,
            'raw': error_message,
            'query': query,
            'params': list(params) if params else []
        }
        
        # Track error for developer panel
        track_error(
            error_type=type(e).__name__,
            message=error_message,
            raw_error=error_message,
            query=query,
            params=list(params) if params else []
        )
        
        # Log to console for debugging
        print(f"Database error ({type(e).__name__}): {error_message}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        
        # Re-raise with structured information attached
        e.structured_error = structured_error
        raise
        
    finally:
        if conn:
            conn.close()


def _parse_integrity_error(error_message: str) -> str:
    """
    Parse SQLite IntegrityError message into user-friendly format.
    
    Args:
        error_message: Raw SQLite error message
        
    Returns:
        User-friendly error message
        
    Examples:
        "UNIQUE constraint failed: users.email" 
        → "Email already exists"
        
        "FOREIGN KEY constraint failed"
        → "Referenced record does not exist"
        
        "NOT NULL constraint failed: tasks.title"
        → "Title is required"
    
    Learning Purpose:
    - Shows how to transform technical errors into user-friendly messages
    - Demonstrates error parsing and pattern matching
    - Part of graceful error handling strategy
    """
    error_lower = error_message.lower()
    
    # UNIQUE constraint violations
    if 'unique constraint failed' in error_lower:
        # Extract field name if possible
        if 'users.email' in error_lower:
            return "Email already exists"
        elif 'users.username' in error_lower:
            return "Username already exists"
        else:
            # Generic unique constraint message
            parts = error_message.split(':')
            if len(parts) > 1:
                field = parts[1].strip().split('.')[-1]
                return f"{field.capitalize()} already exists"
            return "This value already exists"
    
    # FOREIGN KEY constraint violations
    if 'foreign key constraint failed' in error_lower:
        return "Referenced record does not exist"
    
    # NOT NULL constraint violations
    if 'not null constraint failed' in error_lower:
        parts = error_message.split(':')
        if len(parts) > 1:
            field = parts[1].strip().split('.')[-1]
            return f"{field.capitalize()} is required"
        return "Required field is missing"
    
    # CHECK constraint violations
    if 'check constraint failed' in error_lower:
        return "Value does not meet validation requirements"
    
    # Default fallback
    return error_message
