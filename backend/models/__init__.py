"""
Models package - Business logic and data access layer.

MVC Role: MODEL
- Handles data validation and business rules
- Performs database operations (CRUD)
- Returns data to controllers (never renders views directly)
- Keeps application logic independent of presentation

Learning Purpose:
- Demonstrates separation of concerns
- Shows where validation belongs in MVC
- Lesson 3 explores User model structure
- Lesson 4 explores Task model relationships
"""

from backend.models.user import User

__all__ = ['User']
