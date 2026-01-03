"""
Controllers package for Educational MVC App.

MVC Role: Controller Layer
- Controllers receive HTTP requests from Flask routes
- They orchestrate between Models and Views
- They do NOT contain business logic (that belongs in Models)
- They do NOT render HTML directly (that's the View's job)

Controller Responsibilities:
1. Parse and validate incoming request data
2. Call appropriate Model methods
3. Pass data to View templates for rendering
4. Return responses to the client

What Controllers Should NOT Do:
- Database queries (use Models instead)
- Complex business logic (use Models instead)
- HTML generation (use templates instead)

Learning Purpose:
- Lesson 5 covers controller patterns in depth
- Shows request -> response flow
- Demonstrates separation of concerns

Controllers to be implemented:
- UserController: CRUD operations for users
- TaskController: CRUD operations for tasks

Note: Controllers will be registered with Flask app in app.py
"""

# Controllers will be imported here as they are created
# Example (after UserController is implemented):
#   from .user_controller import UserController
#
# Then registered in app.py with blueprints
