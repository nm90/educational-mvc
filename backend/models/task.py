"""
Task Model - Handles task data validation, relationships, and database operations.

MVC Role: MODEL
- Validates task input (title, status, priority, ownership)
- Manages database queries for tasks table with user relationships
- Contains business logic for task operations
- Demonstrates foreign keys and JOIN operations
- Returns data structures (dicts) to controllers

Learning Purpose:
- Demonstrates relationships between models (tasks belong to users)
- Shows foreign key constraints and referential integrity
- Illustrates the N+1 query problem and eager loading solution
- Teaches when to use JOINs vs separate queries
- Lesson 4 covers Task Model and relationships in detail

Design Notes:
- owner_id is required (every task must have a creator)
- assignee_id is optional (tasks can be unassigned)
- include_relations parameter demonstrates eager loading to avoid N+1 queries
- Clear separation between validation and database operations
"""

from typing import Dict, List, Optional
from datetime import datetime
from backend.database.connection import execute_query
from backend.utils.decorators import log_method_call


class Task:
    """
    Task model for managing task data, relationships, and operations.

    This class demonstrates the MODEL layer in MVC with relationships:
    - Data validation (required fields, enum constraints, foreign keys)
    - Database operations with JOINs (CRUD with relationships)
    - Business logic (what makes a valid task?)
    - Eager loading to prevent N+1 query problems

    Relationships:
    - Each task has ONE owner (User who created it)
    - Each task may have ONE assignee (User assigned to complete it)

    ✅ DO: Keep all task-related validation in this Model
    ✅ DO: Use include_relations=True when you need owner/assignee details
    ⚠️ DON'T: Duplicate validation logic in Controllers or Views
    ⚠️ DON'T: Fetch tasks in a loop and query users separately (N+1 problem!)
    """

    # Valid status values
    # ✅ DO: Define enum values as class constants
    VALID_STATUSES = ['todo', 'in-progress', 'done']

    # Valid priority values
    VALID_PRIORITIES = ['low', 'medium', 'high']

    @staticmethod
    @log_method_call
    def validate(title: str, description: str, status: str, priority: str,
                 owner_id: int, assignee_id: Optional[int] = None) -> None:
        """
        Validate task data before database operations.

        MVC Flow:
        1. Controller receives form data from user
        2. Controller calls Task.validate() BEFORE attempting to save
        3. Model checks business rules (non-empty title, valid status/priority, valid user IDs)
        4. Raises ValueError if invalid (Controller will catch and show error)
        5. If valid, returns None (Controller proceeds with create/update)

        Args:
            title: Task title (required, non-empty)
            description: Task description (can be empty)
            status: Task status (must be in VALID_STATUSES)
            priority: Task priority (must be in VALID_PRIORITIES)
            owner_id: ID of user who owns this task (required, must exist)
            assignee_id: ID of user assigned to this task (optional, must exist if provided)

        Raises:
            ValueError: If validation fails, with descriptive message

        Returns:
            None if validation passes

        Example:
            >>> Task.validate("Fix bug", "Description", "todo", "high", 1, None)  # OK
            >>> Task.validate("", "Description", "todo", "high", 1, None)  # Raises ValueError
            >>> Task.validate("Fix bug", "", "invalid", "high", 1, None)  # Raises ValueError

        ✅ DO: Validate data in Model before touching database
        ✅ DO: Check foreign keys exist (prevent orphaned tasks)
        ⚠️ DON'T: Assume data is valid just because it came from a form

        Covered in: Lesson 4 (Model validation with relationships)
        """
        # Check title is not empty
        # ✅ DO: Check for empty strings, not just None
        if not title or not title.strip():
            raise ValueError("Title is required and cannot be empty")

        # Check status is valid
        # ✅ DO: Enforce enum constraints in application code AND database
        if status not in Task.VALID_STATUSES:
            raise ValueError(f"Status must be one of {Task.VALID_STATUSES}, got: {status}")

        # Check priority is valid
        if priority not in Task.VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of {Task.VALID_PRIORITIES}, got: {priority}")

        # Check owner_id exists in users table
        # ✅ DO: Validate foreign keys to prevent orphaned records
        # This demonstrates referential integrity at the application level
        owner_query = "SELECT id FROM users WHERE id = ?"
        owner = execute_query(owner_query, (owner_id,), fetch_one=True)
        if not owner:
            raise ValueError(f"Owner user with ID {owner_id} does not exist")

        # Check assignee_id exists if provided
        # ⚠️ IMPORTANT: assignee_id is nullable, so None is valid
        if assignee_id is not None:
            assignee_query = "SELECT id FROM users WHERE id = ?"
            assignee = execute_query(assignee_query, (assignee_id,), fetch_one=True)
            if not assignee:
                raise ValueError(f"Assignee user with ID {assignee_id} does not exist")

    @staticmethod
    @log_method_call
    def create(title: str, description: str, status: str, priority: str,
               owner_id: int, assignee_id: Optional[int] = None) -> Dict[str, any]:
        """
        Create a new task in the database.

        MVC Flow:
        1. Controller receives POST request with form data
        2. Controller calls Task.create(...)
        3. Model validates data (raises error if invalid)
        4. Model executes INSERT query with timestamps
        5. Model fetches newly created task and returns dict
        6. Controller receives task dict and decides what to render

        Args:
            title: Task title
            description: Task description
            status: Task status (todo, in-progress, done)
            priority: Task priority (low, medium, high)
            owner_id: ID of user who owns this task
            assignee_id: ID of user assigned to this task (optional)

        Returns:
            Dict containing task data: {id, title, description, status, priority,
                                       owner_id, assignee_id, created_at, updated_at}

        Raises:
            ValueError: If validation fails
            sqlite3.Error: If database operation fails

        Example:
            >>> task = Task.create("Fix bug", "Fix login bug", "todo", "high", 1, 2)
            >>> print(task)
            {'id': 1, 'title': 'Fix bug', 'status': 'todo', 'priority': 'high',
             'owner_id': 1, 'assignee_id': 2, ...}

        ✅ DO: Validate before inserting into database
        ✅ DO: Set created_at and updated_at to current timestamp
        ✅ DO: Return complete task data (including generated ID and timestamps)
        ⚠️ DON'T: Return just the ID - Controller needs full data for rendering

        Covered in: Lesson 4 (creating tasks with relationships)
        """
        # Validate input data
        # This will raise ValueError if invalid - Controller handles the error
        Task.validate(title, description, status, priority, owner_id, assignee_id)

        # Insert into database with timestamps
        # ✅ DO: Use parameterized queries (? placeholders) to prevent SQL injection
        # Note: SQLite's CURRENT_TIMESTAMP is UTC, which is good practice
        query = """
            INSERT INTO tasks (title, description, status, priority, owner_id, assignee_id,
                             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """
        task_id = execute_query(query, (title, description, status, priority,
                                       owner_id, assignee_id), commit=True)

        # Fetch and return the newly created task
        # This ensures we return data exactly as stored (with timestamp, etc.)
        return Task.get_by_id(task_id)

    @staticmethod
    @log_method_call
    def get_by_id(task_id: int, include_relations: bool = False) -> Optional[Dict[str, any]]:
        """
        Fetch a task by its ID, optionally including related user data.

        MVC Flow:
        1. Controller needs to display task details
        2. Controller calls Task.get_by_id(task_id, include_relations=True)
        3. Model queries database with JOINs (if include_relations=True)
        4. Model returns dict with nested owner and assignee objects
        5. Controller checks result and renders appropriate view

        Args:
            task_id: The task's ID
            include_relations: If True, include owner and assignee user details via JOINs

        Returns:
            Task dict if found, None if not found

            Without relations (include_relations=False):
            {
                'id': 1,
                'title': 'Fix bug',
                'description': 'Fix login bug',
                'status': 'todo',
                'priority': 'high',
                'owner_id': 1,
                'assignee_id': 2,
                'created_at': '2025-01-03 10:30:00',
                'updated_at': '2025-01-03 10:30:00'
            }

            With relations (include_relations=True):
            {
                'id': 1,
                'title': 'Fix bug',
                'description': 'Fix login bug',
                'status': 'todo',
                'priority': 'high',
                'owner_id': 1,
                'assignee_id': 2,
                'created_at': '2025-01-03 10:30:00',
                'updated_at': '2025-01-03 10:30:00',
                'owner': {
                    'id': 1,
                    'name': 'Alice',
                    'email': 'alice@example.com',
                    'created_at': '2025-01-01 00:00:00'
                },
                'assignee': {
                    'id': 2,
                    'name': 'Bob',
                    'email': 'bob@example.com',
                    'created_at': '2025-01-01 00:00:00'
                } or None
            }

        N+1 Query Problem Demonstration:
        ❌ BAD (N+1 queries):
            task = Task.get_by_id(1)  # Query 1
            owner = User.get_by_id(task['owner_id'])  # Query 2
            assignee = User.get_by_id(task['assignee_id'])  # Query 3
            # For a list of 100 tasks, this causes 201 queries! (1 + 100*2)

        ✅ GOOD (eager loading with JOIN):
            task = Task.get_by_id(1, include_relations=True)  # Single query with JOINs
            # Access owner: task['owner']
            # Access assignee: task['assignee']
            # For 100 tasks, this is still just 1 query!

        ✅ DO: Use include_relations=True when displaying task with user names
        ✅ DO: Use LEFT JOIN for assignee (nullable relationship)
        ⚠️ DON'T: Query users in a loop - causes N+1 problem

        Covered in: Lesson 4 (relationships, JOINs, and N+1 query problem)
        """
        if not include_relations:
            # Simple query without JOINs - just task data
            query = "SELECT * FROM tasks WHERE id = ?"
            return execute_query(query, (task_id,), fetch_one=True)
        else:
            # This demonstrates eager loading to avoid N+1 queries!
            # We JOIN with users table to get owner and assignee in ONE query
            # ✅ DO: Use LEFT JOIN for nullable relationships (assignee can be NULL)
            # ✅ DO: Alias columns to avoid name collisions (owner_id vs assignee_id)
            query = """
                SELECT
                    tasks.*,
                    owner.id as owner_user_id,
                    owner.name as owner_name,
                    owner.email as owner_email,
                    owner.created_at as owner_created_at,
                    assignee.id as assignee_user_id,
                    assignee.name as assignee_name,
                    assignee.email as assignee_email,
                    assignee.created_at as assignee_created_at
                FROM tasks
                INNER JOIN users as owner ON tasks.owner_id = owner.id
                LEFT JOIN users as assignee ON tasks.assignee_id = assignee.id
                WHERE tasks.id = ?
            """
            result = execute_query(query, (task_id,), fetch_one=True)

            if not result:
                return None

            # Transform flat result into nested structure
            # This makes it easier to work with in templates and controllers
            task = {
                'id': result['id'],
                'title': result['title'],
                'description': result['description'],
                'status': result['status'],
                'priority': result['priority'],
                'owner_id': result['owner_id'],
                'assignee_id': result['assignee_id'],
                'created_at': result['created_at'],
                'updated_at': result['updated_at'],
                'owner': {
                    'id': result['owner_user_id'],
                    'name': result['owner_name'],
                    'email': result['owner_email'],
                    'created_at': result['owner_created_at']
                },
                'assignee': {
                    'id': result['assignee_user_id'],
                    'name': result['assignee_name'],
                    'email': result['assignee_email'],
                    'created_at': result['assignee_created_at']
                } if result['assignee_user_id'] is not None else None
            }

            return task

    @staticmethod
    @log_method_call
    def get_all(include_relations: bool = False) -> List[Dict[str, any]]:
        """
        Fetch all tasks from the database, optionally including related user data.

        MVC Flow:
        1. Controller needs to show list of all tasks
        2. Controller calls Task.get_all(include_relations=True)
        3. Model queries database with JOINs (if include_relations=True)
        4. Model returns list of task dicts with nested user objects
        5. Controller passes list to View for rendering

        Args:
            include_relations: If True, include owner and assignee user details via JOINs

        Returns:
            List of task dicts (empty list if no tasks exist)
            Format same as get_by_id() - nested owner/assignee if include_relations=True

        N+1 Query Problem - THIS IS CRITICAL FOR PERFORMANCE:
        ❌ BAD approach (causes N+1 queries):
            tasks = Task.get_all()  # Query 1: Fetch all tasks
            for task in tasks:
                owner = User.get_by_id(task['owner_id'])  # Query 2, 3, 4... N+1
                assignee = User.get_by_id(task['assignee_id'])  # Query N+2, N+3...
            # For 100 tasks: 1 + 100 + 100 = 201 queries! 😱

        ✅ GOOD approach (single query with JOINs):
            tasks = Task.get_all(include_relations=True)  # Single query with JOINs
            for task in tasks:
                print(task['owner']['name'])  # Data already loaded!
                print(task['assignee']['name'] if task['assignee'] else 'Unassigned')
            # For 100 tasks: Just 1 query! 🎉

        Example:
            >>> tasks = Task.get_all(include_relations=True)
            >>> for task in tasks:
            ...     print(f"{task['title']} - Owner: {task['owner']['name']}")

        ✅ DO: Use include_relations=True when listing tasks with user names
        ✅ DO: Return empty list if no tasks (Controller can iterate safely)
        ⚠️ DON'T: Fetch users in a loop after getting tasks - N+1 problem!

        Covered in: Lesson 4 (N+1 query problem and eager loading solution)
        """
        if not include_relations:
            # Simple query without JOINs - just task data
            query = "SELECT * FROM tasks ORDER BY created_at DESC"
            result = execute_query(query, fetch_all=True)
            return result if result else []
        else:
            # Eager loading with JOINs - prevents N+1 query problem!
            # Same JOIN logic as get_by_id, but for all tasks
            query = """
                SELECT
                    tasks.*,
                    owner.id as owner_user_id,
                    owner.name as owner_name,
                    owner.email as owner_email,
                    owner.created_at as owner_created_at,
                    assignee.id as assignee_user_id,
                    assignee.name as assignee_name,
                    assignee.email as assignee_email,
                    assignee.created_at as assignee_created_at
                FROM tasks
                INNER JOIN users as owner ON tasks.owner_id = owner.id
                LEFT JOIN users as assignee ON tasks.assignee_id = assignee.id
                ORDER BY tasks.created_at DESC
            """
            results = execute_query(query, fetch_all=True)

            if not results:
                return []

            # Transform flat results into nested structure
            tasks = []
            for result in results:
                task = {
                    'id': result['id'],
                    'title': result['title'],
                    'description': result['description'],
                    'status': result['status'],
                    'priority': result['priority'],
                    'owner_id': result['owner_id'],
                    'assignee_id': result['assignee_id'],
                    'created_at': result['created_at'],
                    'updated_at': result['updated_at'],
                    'owner': {
                        'id': result['owner_user_id'],
                        'name': result['owner_name'],
                        'email': result['owner_email'],
                        'created_at': result['owner_created_at']
                    },
                    'assignee': {
                        'id': result['assignee_user_id'],
                        'name': result['assignee_name'],
                        'email': result['assignee_email'],
                        'created_at': result['assignee_created_at']
                    } if result['assignee_user_id'] is not None else None
                }
                tasks.append(task)

            return tasks

    @staticmethod
    @log_method_call
    def update(task_id: int, **kwargs) -> Optional[Dict[str, any]]:
        """
        Update an existing task's information.

        MVC Flow:
        1. Controller receives PUT/POST request with updated data
        2. Controller calls Task.update(task_id, title="New Title", status="done")
        3. Model validates new data
        4. Model checks if task exists
        5. Model executes UPDATE query with updated_at timestamp
        6. Model returns updated task dict
        7. Controller renders success view with updated data

        Args:
            task_id: The task's ID
            **kwargs: Fields to update (title, description, status, priority,
                     owner_id, assignee_id)

        Returns:
            Updated task dict if successful, None if task not found

        Raises:
            ValueError: If validation fails for any field

        Example:
            >>> task = Task.update(1, status='done', priority='low')
            >>> task = Task.update(1, title='New Title', assignee_id=3)
            >>> task = Task.update(1, assignee_id=None)  # Unassign task

        ✅ DO: Validate before updating database
        ✅ DO: Update updated_at timestamp automatically
        ✅ DO: Allow partial updates (only update specified fields)
        ⚠️ DON'T: Update without validation - maintain data integrity

        Covered in: Lesson 4 (updating tasks, Lesson 7 demonstrates priority updates)
        """
        # Check if task exists
        existing_task = Task.get_by_id(task_id)
        if not existing_task:
            return None

        # Get current values and merge with updates
        # This allows partial updates while maintaining all required fields for validation
        current_data = {
            'title': existing_task['title'],
            'description': existing_task['description'],
            'status': existing_task['status'],
            'priority': existing_task['priority'],
            'owner_id': existing_task['owner_id'],
            'assignee_id': existing_task['assignee_id']
        }

        # Update with provided kwargs
        current_data.update(kwargs)

        # Validate the complete updated data
        Task.validate(
            title=current_data['title'],
            description=current_data['description'],
            status=current_data['status'],
            priority=current_data['priority'],
            owner_id=current_data['owner_id'],
            assignee_id=current_data['assignee_id']
        )

        # Build UPDATE query dynamically based on provided fields
        # ✅ DO: Only update fields that were provided in kwargs
        # ✅ DO: Always update updated_at timestamp
        update_fields = []
        update_values = []

        for field in ['title', 'description', 'status', 'priority', 'owner_id', 'assignee_id']:
            if field in kwargs:
                update_fields.append(f"{field} = ?")
                update_values.append(current_data[field])

        # Always update the updated_at timestamp
        update_fields.append("updated_at = CURRENT_TIMESTAMP")

        # Add task_id for WHERE clause
        update_values.append(task_id)

        # Execute update query
        query = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = ?"
        execute_query(query, tuple(update_values), commit=True)

        # Return updated task
        return Task.get_by_id(task_id)

    @staticmethod
    @log_method_call
    def delete(task_id: int) -> bool:
        """
        Delete a task from the database.

        MVC Flow:
        1. Controller receives DELETE request
        2. Controller calls Task.delete(task_id)
        3. Model checks if task exists
        4. Model executes DELETE query
        5. Model returns success/failure boolean
        6. Controller renders appropriate response

        Args:
            task_id: The task's ID to delete

        Returns:
            True if task was deleted, False if task didn't exist

        Example:
            >>> if Task.delete(1):
            ...     print("Task deleted")
            ... else:
            ...     print("Task not found")

        Note:
            In this educational app:
            - Deleting a task is simple (no cascading required)
            - In a real app with comments/attachments, you'd need cascade logic
            - Lesson 8 covers building a Comment feature with cascade deletes

        ✅ DO: Check if task exists before attempting delete
        ✅ DO: Return boolean for clear success/failure indication
        ⚠️ DON'T: Delete without checking existence first

        Covered in: Lesson 4 (basic delete), Lesson 8 (cascade delete with relationships)
        """
        # Check if task exists
        existing_task = Task.get_by_id(task_id)
        if not existing_task:
            return False

        # Delete from database
        query = "DELETE FROM tasks WHERE id = ?"
        execute_query(query, (task_id,), commit=True)

        return True
