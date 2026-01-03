"""
Database seed data for Educational MVC App.

MVC Role: Database Setup Utility
- Pre-populates database with sample data for learning
- Creates realistic scenarios for exploring relationships
- Not part of the application runtime (only runs during setup)

Learning Purpose:
- Provides immediate data to work with
- Demonstrates relationships (owner/assignee)
- Shows various task states and priorities
- Lessons 2-4 rely on this seed data
"""

import os
import sqlite3
from typing import List, Tuple


# Database file location
DB_PATH = os.path.join(os.path.dirname(__file__), 'educational_mvc.db')


def insert_seed_data() -> None:
    """
    Insert sample users and tasks into the database.

    Creates:
    - 3 users: Alice (owner), Bob (developer), Charlie (designer)
    - 5 tasks: Mix of statuses, priorities, and assignments

    This data demonstrates:
    - One-to-many relationships (one user owns multiple tasks)
    - Foreign key references (owner_id, assignee_id)
    - Different task states (todo, in-progress, done)
    - Different priorities (low, medium, high)
    - Both assigned and unassigned tasks

    Covered in: Lesson 2 (seeing data flow), Lesson 4 (task relationships)
    """
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Enable foreign key enforcement (required for SQLite)
        # ⚠️ DON'T FORGET: SQLite doesn't enforce foreign keys by default
        cursor.execute("PRAGMA foreign_keys = ON;")

        print("Inserting seed data...")

        # ========================================================================
        # SEED USERS
        # ========================================================================
        # Three users with different roles (for varied task assignments)

        users_data: List[Tuple[str, str]] = [
            ("Alice Anderson", "alice@example.com"),  # Will be task owner
            ("Bob Builder", "bob@example.com"),       # Will be assignee
            ("Charlie Chen", "charlie@example.com"),  # Will be assignee
        ]

        cursor.executemany(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            users_data
        )

        # Get the user IDs for creating tasks
        cursor.execute("SELECT id, name FROM users ORDER BY id")
        users = cursor.fetchall()
        alice_id, bob_id, charlie_id = [user[0] for user in users]

        print(f"✓ Created {len(users)} users")
        for user in users:
            print(f"  - {user[1]} (ID: {user[0]})")

        # ========================================================================
        # SEED TASKS
        # ========================================================================
        # Five tasks demonstrating different scenarios:
        # 1. High priority, in progress, assigned
        # 2. Medium priority, todo, assigned
        # 3. Low priority, done, assigned
        # 4. High priority, todo, unassigned (assignee_id is NULL)
        # 5. Medium priority, in progress, assigned to different user

        tasks_data: List[Tuple[str, str, str, str, int, int]] = [
            # (title, description, status, priority, owner_id, assignee_id)
            (
                "Implement user authentication",
                "Add login and registration functionality with session management. Should include password hashing and email validation.",
                "in-progress",
                "high",
                alice_id,
                bob_id  # Assigned to Bob
            ),
            (
                "Design homepage layout",
                "Create wireframes and mockups for the new homepage design. Focus on mobile-first approach.",
                "todo",
                "medium",
                alice_id,
                charlie_id  # Assigned to Charlie
            ),
            (
                "Fix navigation menu bug",
                "Navigation menu doesn't close on mobile devices when clicking outside. Need to add event listener.",
                "done",
                "low",
                alice_id,
                bob_id  # Assigned to Bob, already completed
            ),
            (
                "Set up CI/CD pipeline",
                "Configure GitHub Actions for automated testing and deployment. Include linting and type checking.",
                "todo",
                "high",
                alice_id,
                None  # Unassigned task (demonstrates NULL assignee_id)
            ),
            (
                "Write API documentation",
                "Document all REST endpoints with request/response examples. Use OpenAPI/Swagger format.",
                "in-progress",
                "medium",
                alice_id,
                charlie_id  # Assigned to Charlie
            ),
        ]

        cursor.executemany(
            """
            INSERT INTO tasks (title, description, status, priority, owner_id, assignee_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            tasks_data
        )

        # Display created tasks for verification
        cursor.execute("""
            SELECT
                t.id,
                t.title,
                t.status,
                t.priority,
                u_owner.name as owner_name,
                u_assignee.name as assignee_name
            FROM tasks t
            JOIN users u_owner ON t.owner_id = u_owner.id
            LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
            ORDER BY t.id
        """)

        tasks = cursor.fetchall()
        print(f"\n✓ Created {len(tasks)} tasks")
        for task in tasks:
            assignee = task[5] if task[5] else "Unassigned"
            print(f"  - [{task[2]}] {task[1]} (Priority: {task[3]}, Assignee: {assignee})")

        # Commit all changes
        conn.commit()
        print("\n✓ Database seeded successfully!")

        # Show summary statistics
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM tasks")
        task_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM tasks WHERE assignee_id IS NULL")
        unassigned_count = cursor.fetchone()[0]

        print("\n" + "="*60)
        print("DATABASE SUMMARY")
        print("="*60)
        print(f"Total Users: {user_count}")
        print(f"Total Tasks: {task_count}")
        print(f"Unassigned Tasks: {unassigned_count}")
        print("="*60)

    except sqlite3.Error as e:
        print(f"Error seeding database: {e}")
        if conn:
            conn.rollback()
        raise

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    """
    Run this script directly to seed the database:
        python backend/database/seed.py

    Note: This will add seed data to existing database.
    To reset completely, delete educational_mvc.db first.
    """
    insert_seed_data()
