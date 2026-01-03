"""
User Model - Handles user data validation and database operations.

MVC Role: MODEL
- Validates user input (email format, required fields)
- Manages database queries for users table
- Contains business logic for user operations
- Returns data structures (dicts) to controllers

Learning Purpose:
- Demonstrates Model responsibilities in MVC
- Shows proper separation: validation in Model, not Controller
- Illustrates database interaction patterns
- Lesson 3 covers User Model exploration in detail

Design Notes:
- Static methods for now (will become instance methods in later lessons)
- Clear separation between validation and database operations
- Descriptive error messages help with debugging
"""

import re
from typing import Dict, List, Optional
from backend.database.connection import execute_query
from backend.utils.decorators import log_method_call


class User:
    """
    User model for managing user data and operations.

    This class demonstrates the MODEL layer in MVC:
    - Data validation (email format, required fields)
    - Database operations (CRUD)
    - Business logic (what makes a valid user?)

    ✅ DO: Keep all user-related validation in this Model
    ⚠️ DON'T: Duplicate validation logic in Controllers or Views
    """

    # Email validation regex pattern
    # ✅ DO: Define validation rules as class constants
    EMAIL_PATTERN = r'^[\w\.-]+@[\w\.-]+\.\w+$'

    @staticmethod
    @log_method_call
    def validate(name: str, email: str) -> None:
        """
        Validate user data before database operations.

        MVC Flow:
        1. Controller receives form data from user
        2. Controller calls User.validate() BEFORE attempting to save
        3. Model checks business rules (non-empty name, valid email)
        4. Raises ValueError if invalid (Controller will catch and show error)
        5. If valid, returns None (Controller proceeds with create/update)

        Args:
            name: User's full name
            email: User's email address

        Raises:
            ValueError: If validation fails, with descriptive message

        Returns:
            None if validation passes

        Example:
            >>> User.validate("Alice", "alice@example.com")  # OK, returns None
            >>> User.validate("", "alice@example.com")       # Raises ValueError
            >>> User.validate("Alice", "invalid-email")      # Raises ValueError

        ✅ DO: Validate data in Model before touching database
        ⚠️ DON'T: Assume data is valid just because it came from a form

        Covered in: Lesson 3 (Model validation patterns)
        """
        # Check name is not empty
        # ✅ DO: Check for empty strings, not just None
        if not name or not name.strip():
            raise ValueError("Name is required and cannot be empty")

        # Check email format
        # ✅ DO: Use regex for email validation (simple but effective)
        if not email or not email.strip():
            raise ValueError("Email is required and cannot be empty")

        if not re.match(User.EMAIL_PATTERN, email):
            raise ValueError(f"Email format invalid: {email}")

    @staticmethod
    @log_method_call
    def create(name: str, email: str) -> Dict[str, any]:
        """
        Create a new user in the database.

        MVC Flow:
        1. Controller receives POST request with form data
        2. Controller calls User.create(name, email)
        3. Model validates data (raises error if invalid)
        4. Model executes INSERT query
        5. Model fetches newly created user and returns dict
        6. Controller receives user dict and decides what to render

        Args:
            name: User's full name
            email: User's email address

        Returns:
            Dict containing user data: {id, name, email, created_at}

        Raises:
            ValueError: If validation fails
            sqlite3.Error: If database operation fails

        Example:
            >>> user = User.create("Alice", "alice@example.com")
            >>> print(user)
            {'id': 1, 'name': 'Alice', 'email': 'alice@example.com',
             'created_at': '2025-01-03 10:30:00'}

        ✅ DO: Validate before inserting into database
        ✅ DO: Return complete user data (including generated ID and timestamp)
        ⚠️ DON'T: Return just the ID - Controller needs full data for rendering

        Covered in: Lesson 3 (creating users through Model layer)
        """
        # Validate input data
        # This will raise ValueError if invalid - Controller handles the error
        User.validate(name, email)

        # Insert into database
        # ✅ DO: Use parameterized queries (? placeholders) to prevent SQL injection
        # ⚠️ DON'T: Concatenate user input directly into SQL strings
        query = "INSERT INTO users (name, email) VALUES (?, ?)"
        user_id = execute_query(query, (name, email), commit=True)

        # Fetch and return the newly created user
        # This ensures we return data exactly as stored (with timestamp, etc.)
        return User.get_by_id(user_id)

    @staticmethod
    @log_method_call
    def get_by_id(user_id: int) -> Optional[Dict[str, any]]:
        """
        Fetch a user by their ID.

        MVC Flow:
        1. Controller needs to display user details
        2. Controller calls User.get_by_id(user_id)
        3. Model queries database
        4. Model returns dict (or None if not found)
        5. Controller checks result and renders appropriate view

        Args:
            user_id: The user's ID

        Returns:
            User dict if found, None if not found

        Example:
            >>> user = User.get_by_id(1)
            >>> if user:
            ...     print(f"Found: {user['name']}")
            ... else:
            ...     print("User not found")

        ✅ DO: Return None for not found (Controller decides how to handle)
        ⚠️ DON'T: Raise exceptions for "not found" - it's a valid case

        Covered in: Lesson 3 (reading data from Model)
        """
        query = "SELECT * FROM users WHERE id = ?"
        return execute_query(query, (user_id,), fetch_one=True)

    @staticmethod
    @log_method_call
    def get_all() -> List[Dict[str, any]]:
        """
        Fetch all users from the database.

        MVC Flow:
        1. Controller needs to show list of all users
        2. Controller calls User.get_all()
        3. Model queries database for all users
        4. Model returns list of user dicts
        5. Controller passes list to View for rendering

        Returns:
            List of user dicts (empty list if no users exist)

        Example:
            >>> users = User.get_all()
            >>> for user in users:
            ...     print(f"{user['id']}: {user['name']}")

        ✅ DO: Return empty list if no users (Controller can iterate safely)
        ⚠️ DON'T: Return None for empty results - use empty list []

        Covered in: Lesson 3 (listing users)
        """
        query = "SELECT * FROM users ORDER BY created_at DESC"
        result = execute_query(query, fetch_all=True)
        # execute_query returns a list (empty if no results)
        return result if result else []

    @staticmethod
    @log_method_call
    def update(user_id: int, name: str, email: str) -> Optional[Dict[str, any]]:
        """
        Update an existing user's information.

        MVC Flow:
        1. Controller receives PUT/POST request with updated data
        2. Controller calls User.update(user_id, name, email)
        3. Model validates new data
        4. Model checks if user exists
        5. Model executes UPDATE query
        6. Model returns updated user dict
        7. Controller renders success view with updated data

        Args:
            user_id: The user's ID
            name: New name
            email: New email

        Returns:
            Updated user dict if successful, None if user not found

        Raises:
            ValueError: If validation fails

        Example:
            >>> user = User.update(1, "Alice Smith", "alice.smith@example.com")
            >>> if user:
            ...     print(f"Updated: {user['name']}")
            ... else:
            ...     print("User not found")

        ✅ DO: Validate before updating database
        ✅ DO: Check if user exists before attempting update
        ⚠️ DON'T: Update without validation - maintain data integrity

        Covered in: Lesson 3 (updating through Model layer)
        """
        # Validate new data
        User.validate(name, email)

        # Check if user exists
        existing_user = User.get_by_id(user_id)
        if not existing_user:
            return None

        # Update database
        query = "UPDATE users SET name = ?, email = ? WHERE id = ?"
        execute_query(query, (name, email, user_id), commit=True)

        # Return updated user
        return User.get_by_id(user_id)

    @staticmethod
    @log_method_call
    def delete(user_id: int) -> bool:
        """
        Delete a user from the database.

        MVC Flow:
        1. Controller receives DELETE request
        2. Controller calls User.delete(user_id)
        3. Model checks if user exists
        4. Model executes DELETE query
        5. Model returns success/failure boolean
        6. Controller renders appropriate response

        Args:
            user_id: The user's ID to delete

        Returns:
            True if user was deleted, False if user didn't exist

        Example:
            >>> if User.delete(1):
            ...     print("User deleted")
            ... else:
            ...     print("User not found")

        Note:
            In a real application, you might want to:
            - Check for related records (tasks owned by this user)
            - Use soft deletes (mark as inactive instead of removing)
            - Cascade delete related records

        ✅ DO: Check if user exists before attempting delete
        ✅ DO: Return boolean for clear success/failure indication
        ⚠️ DON'T: Delete without checking for related data (covered in Lesson 4)

        Covered in: Lesson 3 (basic delete), Lesson 4 (relationships & cascading)
        """
        # Check if user exists
        existing_user = User.get_by_id(user_id)
        if not existing_user:
            return False

        # Delete from database
        query = "DELETE FROM users WHERE id = ?"
        execute_query(query, (user_id,), commit=True)

        return True
