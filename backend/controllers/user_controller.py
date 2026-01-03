"""
User Controller - Orchestrates user-related requests.

MVC Role: CONTROLLER
- Receives HTTP requests from Flask routes
- Calls User Model methods for data operations
- Passes results to View templates for rendering
- Returns responses to the client

Controller Responsibilities:
1. Parse incoming request data (form fields, URL params)
2. Call User Model methods (get_all, get_by_id, create, update, delete)
3. Handle Model errors (validation failures, not found)
4. Pass data to templates for rendering
5. Return appropriate HTTP responses

What This Controller Does NOT Do:
- Database queries (User Model handles those)
- Validation logic (User Model handles that)
- HTML generation (templates handle that)

Learning Purpose:
- Demonstrates Controller's orchestration role in MVC
- Shows how Controllers are "thin" - they just coordinate
- Lesson 5 covers this controller in depth

Design Notes:
- Uses Flask Blueprint for route organization
- Uses flash messages for user feedback
- Renders Jinja2 templates for Views

URL Prefix: /users
Routes:
    GET  /users          - List all users
    GET  /users/<id>     - Show single user
    GET  /users/new      - Show create form
    POST /users          - Create new user
    GET  /users/<id>/edit   - Show edit form
    POST /users/<id>/update - Update user
    POST /users/<id>/delete - Delete user
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash

# Import User Model
# ✅ DO: Import Models at the top of Controller files
# The Controller will call Model methods but NOT access the database directly
from backend.models.user import User


# ============================================================================
# BLUEPRINT SETUP
# ============================================================================
# Create a Blueprint for user routes
# Blueprints allow organizing routes into logical groups
# - 'users' is the blueprint name (used in url_for())
# - url_prefix='/users' means all routes here start with /users

users_bp = Blueprint('users', __name__, url_prefix='/users')


# ============================================================================
# LIST ALL USERS
# ============================================================================
@users_bp.route('/', methods=['GET'])
def index():
    """
    List all users.

    MVC Flow:
    1. Controller receives GET /users request
    2. Controller calls User.get_all() (Model layer)
    3. Model queries database and returns list of user dicts
    4. Controller passes user list to template (View layer)
    5. View renders HTML with user data
    6. Controller returns HTML response to client

    HTTP: GET /users

    Dev Panel shows:
    - User.get_all() method call
    - SELECT query executed
    - Data passed to template

    ✅ DO: Keep Controller logic minimal - just orchestrate Model and View
    ⚠️ DON'T: Query database directly in Controller

    Covered in: Lesson 5 (Controller patterns)
    """
    # Call Model method to get all users
    # The Model handles the database query
    users = User.get_all()

    # Pass data to View template for rendering
    # Controller decides WHAT to render, View decides HOW to render
    return render_template('users/index.html', users=users)


# ============================================================================
# SHOW SINGLE USER
# ============================================================================
@users_bp.route('/<int:user_id>', methods=['GET'])
def show(user_id):
    """
    Show a single user's details.

    MVC Flow:
    1. Controller receives GET /users/<id> request
    2. Controller calls User.get_by_id(id) (Model layer)
    3. Model queries database and returns user dict (or None)
    4. Controller checks if user exists:
       - If not found: return 404 error
       - If found: pass user to template (View layer)
    5. View renders HTML with user data
    6. Controller returns HTML response to client

    HTTP: GET /users/<id>

    Args (URL params):
        user_id: The user's ID from URL

    Dev Panel shows:
    - User.get_by_id() method call with user_id argument
    - SELECT WHERE id = ? query
    - Return value (user dict or None)

    ✅ DO: Handle "not found" gracefully with 404
    ⚠️ DON'T: Assume the user exists without checking

    Covered in: Lesson 5 (handling Model return values)
    """
    # Call Model to get user by ID
    user = User.get_by_id(user_id)

    # Handle not found case
    # Model returns None if user doesn't exist
    if not user:
        flash('User not found', 'error')
        return render_template('errors/404.html', message='User not found'), 404

    # Pass user data to View
    return render_template('users/show.html', user=user)


# ============================================================================
# SHOW CREATE FORM
# ============================================================================
@users_bp.route('/new', methods=['GET'])
def new():
    """
    Show the form for creating a new user.

    MVC Flow:
    1. Controller receives GET /users/new request
    2. Controller renders empty form template (View layer)
    3. View displays HTML form for user input
    4. Form submits to POST /users (create action)

    HTTP: GET /users/new

    Dev Panel shows:
    - No Model calls (just rendering empty form)
    - Template rendered: users/new.html

    Note: This route just displays a form. No Model interaction yet.
    The actual creation happens when the form is submitted (POST /users).

    ✅ DO: Separate form display (GET) from form processing (POST)
    ⚠️ DON'T: Mix form display and creation in one route

    Covered in: Lesson 5 (form handling patterns)
    """
    # Simply render the form template
    # No Model calls needed - just showing an empty form
    return render_template('users/new.html')


# ============================================================================
# CREATE NEW USER
# ============================================================================
@users_bp.route('/', methods=['POST'])
def create():
    """
    Create a new user from form data.

    MVC Flow:
    1. Controller receives POST /users with form data
    2. Controller extracts name and email from request
    3. Controller calls User.create(name, email) (Model layer)
    4. Model validates data:
       - If invalid: raises ValueError
       - If valid: inserts into database
    5. Controller handles result:
       - On error: re-render form with error message
       - On success: redirect to /users with success message
    6. View renders appropriate response

    HTTP: POST /users
    Form data: name, email

    Dev Panel shows:
    - User.create() method call with arguments
    - User.validate() being called
    - INSERT query (if validation passes)
    - Validation error (if it fails)

    ✅ DO: Let Model handle validation - Controller catches errors
    ✅ DO: Use flash messages to communicate success/failure to user
    ⚠️ DON'T: Duplicate validation logic in Controller

    Covered in: Lesson 5 (form submission handling)
    """
    # Extract form data from request
    # request.form contains POST data from HTML forms
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()

    try:
        # Call Model to create user
        # Model.create() validates and inserts into database
        # If validation fails, it raises ValueError
        User.create(name, email)

        # Success! Redirect to user list with success message
        flash('User created successfully!', 'success')
        return redirect(url_for('users.index'))

    except ValueError as e:
        # Validation failed - Model raised ValueError
        # Re-render form with error message and submitted data
        flash(str(e), 'error')
        return render_template('users/new.html', name=name, email=email)


# ============================================================================
# SHOW EDIT FORM
# ============================================================================
@users_bp.route('/<int:user_id>/edit', methods=['GET'])
def edit(user_id):
    """
    Show the form for editing an existing user.

    MVC Flow:
    1. Controller receives GET /users/<id>/edit request
    2. Controller calls User.get_by_id(id) (Model layer)
    3. Model returns user dict (or None if not found)
    4. Controller handles result:
       - If not found: return 404 error
       - If found: render edit form with user data
    5. View displays form pre-filled with current values

    HTTP: GET /users/<id>/edit

    Args (URL params):
        user_id: The user's ID from URL

    Dev Panel shows:
    - User.get_by_id() method call
    - SELECT query
    - User data passed to template

    Note: This route fetches user data to pre-fill the form.
    The actual update happens when form is submitted (POST /users/<id>/update).

    ✅ DO: Pre-fill form with existing data for good UX
    ⚠️ DON'T: Forget to handle the case where user doesn't exist

    Covered in: Lesson 5 (edit form patterns)
    """
    # Get user data to pre-fill form
    user = User.get_by_id(user_id)

    # Handle not found
    if not user:
        flash('User not found', 'error')
        return render_template('errors/404.html', message='User not found'), 404

    # Render edit form with current user data
    return render_template('users/edit.html', user=user)


# ============================================================================
# UPDATE USER
# ============================================================================
@users_bp.route('/<int:user_id>/update', methods=['POST'])
def update(user_id):
    """
    Update an existing user with form data.

    MVC Flow:
    1. Controller receives POST /users/<id>/update with form data
    2. Controller extracts name and email from request
    3. Controller calls User.update(id, name, email) (Model layer)
    4. Model validates new data and updates database:
       - If validation fails: raises ValueError
       - If user not found: returns None
       - If success: returns updated user dict
    5. Controller handles result:
       - On validation error: re-render form with error
       - On not found: return 404
       - On success: redirect to user detail page

    HTTP: POST /users/<id>/update
    Form data: name, email

    Args (URL params):
        user_id: The user's ID from URL

    Dev Panel shows:
    - User.update() method call with arguments
    - User.validate() being called
    - User.get_by_id() checking if user exists
    - UPDATE query (if validation passes)

    ✅ DO: Handle both validation errors AND not-found cases
    ⚠️ DON'T: Assume update will always succeed

    Covered in: Lesson 5 (update patterns)
    """
    # Extract form data
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()

    try:
        # Call Model to update user
        # Model validates data, checks if user exists, then updates
        updated_user = User.update(user_id, name, email)

        # Check if user was found
        if not updated_user:
            flash('User not found', 'error')
            return render_template('errors/404.html', message='User not found'), 404

        # Success! Redirect to user detail page
        flash('User updated successfully!', 'success')
        return redirect(url_for('users.show', user_id=user_id))

    except ValueError as e:
        # Validation failed - re-render form with error
        flash(str(e), 'error')
        # Pass the submitted values back to re-fill the form
        return render_template('users/edit.html', user={
            'id': user_id,
            'name': name,
            'email': email
        })


# ============================================================================
# DELETE USER
# ============================================================================
@users_bp.route('/<int:user_id>/delete', methods=['POST'])
def delete(user_id):
    """
    Delete a user.

    MVC Flow:
    1. Controller receives POST /users/<id>/delete request
    2. Controller calls User.delete(id) (Model layer)
    3. Model checks if user exists and deletes:
       - If not found: returns False
       - If deleted: returns True
    4. Controller handles result:
       - On not found: flash error message
       - On success: flash success message
    5. Redirect to user list either way

    HTTP: POST /users/<id>/delete

    Args (URL params):
        user_id: The user's ID from URL

    Dev Panel shows:
    - User.delete() method call with user_id
    - User.get_by_id() checking if user exists
    - DELETE query (if user found)
    - Boolean return value

    Note: We use POST for delete (not GET) because:
    - GET requests should be safe (no side effects)
    - DELETE operations modify data
    - Prevents accidental deletion via link clicks or bots

    ✅ DO: Use POST/DELETE for destructive actions
    ⚠️ DON'T: Allow GET requests to modify data

    Covered in: Lesson 5 (HTTP method semantics)
    """
    # Call Model to delete user
    success = User.delete(user_id)

    if success:
        flash('User deleted successfully!', 'success')
    else:
        flash('User not found', 'error')

    # Always redirect to user list
    return redirect(url_for('users.index'))
