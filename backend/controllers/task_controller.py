"""
Task Controller - Orchestrates task-related requests with user relationships.

MVC Role: CONTROLLER
- Receives HTTP requests from Flask routes
- Calls Task Model methods for data operations
- Calls User Model methods to populate form dropdowns
- Passes results to View templates for rendering
- Returns responses to the client

Controller Responsibilities:
1. Parse incoming request data (form fields, URL params)
2. Coordinate multiple Models (Task + User for dropdowns)
3. Call Task Model methods (get_all, get_by_id, create, update, delete)
4. Handle Model errors (validation failures, not found)
5. Pass data to templates for rendering
6. Return appropriate HTTP responses

What This Controller Does NOT Do:
- Database queries (Task/User Models handle those)
- Validation logic (Task Model handles that)
- HTML generation (templates handle that)

Learning Purpose:
- Demonstrates Controller's multi-model orchestration role
- Shows how Controllers coordinate between related Models
- Illustrates N+1 query avoidance with include_relations
- Demonstrates handling optional relationships (assignee)
- Lesson 5 covers this controller in depth

Design Notes:
- Uses Flask Blueprint for route organization
- Uses flash messages for user feedback
- Renders Jinja2 templates for Views
- Coordinates Task and User Models for form dropdowns
- Uses include_relations=True to eagerly load owners/assignees

URL Prefix: /tasks
Routes:
    GET  /tasks              - List all tasks
    GET  /tasks/<id>         - Show single task
    GET  /tasks/new          - Show create form
    POST /tasks              - Create new task
    GET  /tasks/<id>/edit    - Show edit form
    POST /tasks/<id>/update  - Update task
    POST /tasks/<id>/delete  - Delete task
"""

from flask import Blueprint, request, redirect, url_for, flash

# Import Models
# ✅ DO: Import all Models needed by this Controller
# The Controller will call Model methods but NOT access the database directly
from backend.models.task import Task
from backend.models.user import User

# Import response helpers for dual-mode (HTML/JSON) support
from backend.utils.response_helpers import wants_json, success_response, error_response

# Import tracked template renderer for automatic view data tracking
from backend.utils.request_tracker import tracked_render_template

# Import method call tracking decorator
from backend.utils.decorators import log_method_call


# ============================================================================
# BLUEPRINT SETUP
# ============================================================================
# Create a Blueprint for task routes
# Blueprints allow organizing routes into logical groups
# - 'tasks' is the blueprint name (used in url_for())
# - url_prefix='/tasks' means all routes here start with /tasks

tasks_bp = Blueprint('tasks', __name__, url_prefix='/tasks')


# ============================================================================
# LIST ALL TASKS
# ============================================================================
@tasks_bp.route('/', methods=['GET'])
@log_method_call
def index():
    """
    List all tasks with owner and assignee details.

    MVC Flow:
    1. Controller receives GET /tasks request
    2. Controller calls Task.get_all(include_relations=True) (Model layer)
    3. Model queries database with JOINs to eagerly load owner/assignee
    4. Model returns list of task dicts with nested user objects
    5. Controller passes task list to template (View layer)
    6. View renders HTML with task and user data
    7. Controller returns HTML response to client

    HTTP: GET /tasks

    Dev Panel shows:
    - Task.get_all(include_relations=True) method call
    - Single SELECT query with JOINs (efficient!)
    - Data passed to template

    ✅ DO: Use include_relations=True to avoid N+1 query problem
    ⚠️ DON'T: Fetch tasks and then query users in a loop

    Performance Note:
    - Using include_relations=True executes 1 query with JOINs
    - WITHOUT it would require 1 + (2 * N) queries (N+1 problem)
    - For 100 tasks: 1 query vs 201 queries!

    Covered in: Lesson 5 (Controller patterns), Lesson 4 (N+1 queries)
    """
    # Call Model method to get all tasks with relationships
    # Using include_relations=True to eagerly load owners/assignees
    # This prevents the N+1 query problem!
    tasks = Task.get_all(include_relations=True)

    # Pass data to View template for rendering
    # Controller decides WHAT to render, View decides HOW to render
    # View data is automatically tracked by tracked_render_template
    return tracked_render_template('tasks/index.html', tasks=tasks)


# ============================================================================
# SHOW SINGLE TASK
# ============================================================================
@tasks_bp.route('/<int:task_id>', methods=['GET'])
@log_method_call
def show(task_id):
    """
    Show a single task's details with owner and assignee information.

    MVC Flow:
    1. Controller receives GET /tasks/<id> request
    2. Controller calls Task.get_by_id(id, include_relations=True) (Model layer)
    3. Model queries database with JOINs and returns task dict (or None)
    4. Controller checks if task exists:
       - If not found: return 404 error
       - If found: pass task to template (View layer)
    5. View renders HTML with task and user data
    6. Controller returns HTML response to client

    HTTP: GET /tasks/<id>

    Args (URL params):
        task_id: The task's ID from URL

    Dev Panel shows:
    - Task.get_by_id() method call with task_id and include_relations=True
    - SELECT query with JOINs to get owner/assignee
    - Return value (task dict with nested user objects or None)

    ✅ DO: Handle "not found" gracefully with 404
    ✅ DO: Use include_relations=True to load owner/assignee in one query
    ⚠️ DON'T: Assume the task exists without checking

    Covered in: Lesson 5 (handling Model return values with relationships)
    """
    # Call Model to get task by ID with related user data
    # Using include_relations=True to eagerly load owner/assignee
    task = Task.get_by_id(task_id, include_relations=True)

    # Handle not found case
    # Model returns None if task doesn't exist
    if not task:
        flash('Task not found', 'error')
        return tracked_render_template('errors/404.html', message='Task not found'), 404

    # Pass task data to View
    return tracked_render_template('tasks/show.html', task=task)


# ============================================================================
# SHOW CREATE FORM
# ============================================================================
@tasks_bp.route('/new', methods=['GET'])
@log_method_call
def new():
    """
    Show the form for creating a new task.

    MVC Flow:
    1. Controller receives GET /tasks/new request
    2. Controller calls User.get_all() to populate owner/assignee dropdowns
    3. Controller renders form template with users list (View layer)
    4. View displays HTML form with dropdown options
    5. Form submits to POST /tasks (create action)

    HTTP: GET /tasks/new

    Dev Panel shows:
    - User.get_all() method call
    - SELECT query to fetch all users for dropdowns
    - Template rendered: tasks/new.html with users list

    Multi-Model Orchestration:
    - Controller coordinates multiple models (Task + User)
    - Task Model handles task data
    - User Model provides data for form dropdowns
    - Controller brings them together

    Note: This route just displays a form. No Task Model interaction yet.
    The actual creation happens when the form is submitted (POST /tasks).

    ✅ DO: Load related data (users) needed for form dropdowns
    ✅ DO: Separate form display (GET) from form processing (POST)
    ⚠️ DON'T: Mix form display and creation in one route

    Covered in: Lesson 5 (multi-model coordination, form handling patterns)
    """
    # Load all users for owner and assignee dropdowns
    # Controller coordinates multiple models (Task + User)
    users = User.get_all()

    # Render the form template with users for dropdowns
    # No Task Model calls needed - just showing an empty form
    return tracked_render_template('tasks/new.html', users=users)


# ============================================================================
# CREATE NEW TASK
# ============================================================================
@tasks_bp.route('/', methods=['POST'], strict_slashes=False)
@log_method_call
def create():
    """
    Create a new task from form data.

    Now supports both HTML form submission and JSON API requests.

    MVC Flow (both modes):
    1. Controller receives POST /tasks with form data
    2. Controller extracts fields from request
    3. Controller calls Task.create(...) (Model layer - unchanged)
    4. Model validates data and inserts into database
    5. Controller handles result:
       - HTML mode: redirect to /tasks with flash message
       - JSON mode: return {success: true, data: {...}, __DEBUG__: {...}}
    6. Response includes full __DEBUG__ trace

    HTTP: POST /tasks
    Form data: title, description, status, priority, owner_id, assignee_id

    Dev Panel shows:
    - Task.create() method call with arguments
    - Task.validate() being called
    - Foreign key validation queries
    - INSERT query execution
    - __DEBUG__ available in same response (no redirect needed in JSON mode)

    ✅ DO: Let Model handle validation - Controller catches errors
    ✅ DO: Support both HTML and JSON clients from one endpoint
    ✅ DO: Re-load users list when re-rendering form after error
    ⚠️ DON'T: Duplicate validation logic in Controller

    Covered in: Lesson 5 (form submission with relationships), Progressive enhancement
    """
    # Extract form data from request
    # Works with both HTML forms (request.form) and JSON (request.get_json)
    if request.is_json:
        data = request.get_json()
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        status = data.get('status', '').strip()
        priority = data.get('priority', '').strip()
        owner_id = data.get('owner_id', '').strip()
        assignee_id = data.get('assignee_id', '').strip()
    else:
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        status = request.form.get('status', '').strip()
        priority = request.form.get('priority', '').strip()
        owner_id = request.form.get('owner_id', '').strip()
        assignee_id = request.form.get('assignee_id', '').strip()

    # Convert string IDs to integers
    # Handle empty assignee_id (optional field) - convert to None
    try:
        owner_id = int(owner_id) if owner_id else None
        assignee_id = int(assignee_id) if assignee_id else None
    except ValueError:
        error_msg = 'Invalid user ID format'
        if wants_json():
            return error_response(error_msg, code='INVALID_INPUT', status=400)
        else:
            flash(error_msg, 'error')
            users = User.get_all()
            return tracked_render_template('tasks/new.html', users=users,
                                 title=title, description=description,
                                 status=status, priority=priority)

    try:
        # Call Model to create task (Model layer unchanged)
        task = Task.create(title, description, status, priority, owner_id, assignee_id)

        # Success! Return appropriate response based on client preference
        if wants_json():
            return success_response(
                data={'task': task},
                redirect=url_for('tasks.show', task_id=task['id'])
            )
        else:
            flash('Task created successfully!', 'success')
            return redirect(url_for('tasks.index'))

    except ValueError as e:
        # Validation failed
        if wants_json():
            return error_response(
                message=str(e),
                code='VALIDATION_ERROR',
                status=400
            )
        else:
            flash(str(e), 'error')
            # Re-load users for dropdowns when re-rendering form
            users = User.get_all()
            return tracked_render_template('tasks/new.html', users=users,
                                 title=title, description=description,
                                 status=status, priority=priority,
                                 owner_id=owner_id, assignee_id=assignee_id)
    
    except Exception as e:
        # Database errors (IntegrityError, OperationalError, etc.)
        # The error has been logged in the developer panel by connection.py
        error_message = getattr(e, 'structured_error', {}).get('message', str(e))
        
        if wants_json():
            return error_response(
                message=error_message,
                code='DATABASE_ERROR',
                status=400
            )
        else:
            flash(error_message, 'error')
            users = User.get_all()
            return tracked_render_template('tasks/new.html', users=users,
                                 title=title, description=description,
                                 status=status, priority=priority,
                                 owner_id=owner_id, assignee_id=assignee_id)


# ============================================================================
# SHOW EDIT FORM
# ============================================================================
@tasks_bp.route('/<int:task_id>/edit', methods=['GET'])
@log_method_call
def edit(task_id):
    """
    Show the form for editing an existing task.

    MVC Flow:
    1. Controller receives GET /tasks/<id>/edit request
    2. Controller calls Task.get_by_id(id) (Model layer)
    3. Controller calls User.get_all() for dropdowns (Model layer)
    4. Models return task dict and users list (or None if not found)
    5. Controller handles result:
       - If task not found: return 404 error
       - If found: render edit form with task data and users list
    6. View displays form pre-filled with current values and dropdown options

    HTTP: GET /tasks/<id>/edit

    Args (URL params):
        task_id: The task's ID from URL

    Dev Panel shows:
    - Task.get_by_id() method call
    - User.get_all() method call
    - SELECT queries for both
    - Task and users data passed to template

    Multi-Model Orchestration:
    - Controller coordinates Task and User Models
    - Task provides data to pre-fill form
    - User provides options for owner/assignee dropdowns
    - Controller brings them together for the View

    Note: This route fetches task and user data to pre-fill the form.
    The actual update happens when form is submitted (POST /tasks/<id>/update).

    ✅ DO: Pre-fill form with existing data for good UX
    ✅ DO: Load users for dropdowns
    ⚠️ DON'T: Forget to handle the case where task doesn't exist

    Covered in: Lesson 5 (edit form patterns with multi-model coordination)
    """
    # Get task data to pre-fill form
    task = Task.get_by_id(task_id)

    # Handle not found
    if not task:
        flash('Task not found', 'error')
        return tracked_render_template('errors/404.html', message='Task not found'), 404

    # Load all users for owner and assignee dropdowns
    # Controller coordinates multiple models (Task + User)
    users = User.get_all()

    # Render edit form with current task data and users for dropdowns
    return tracked_render_template('tasks/edit.html', task=task, users=users)


# ============================================================================
# UPDATE TASK
# ============================================================================
@tasks_bp.route('/<int:task_id>/update', methods=['POST'], strict_slashes=False)
@log_method_call
def update(task_id):
    """
    Update an existing task with form data.

    MVC Flow:
    1. Controller receives POST /tasks/<id>/update with form data
    2. Controller extracts fields from request
    3. Controller calls Task.update(id, title, description, ...) (Model layer)
    4. Model validates new data and updates database:
       - Validates required fields and foreign keys
       - If validation fails: raises ValueError
       - If task not found: returns None
       - If success: returns updated task dict
    5. Controller handles result:
       - On validation error: re-render form with error and users list
       - On not found: return 404
       - On success: redirect to task detail page
    6. View renders appropriate response

    HTTP: POST /tasks/<id>/update
    Form data: title, description, status, priority, owner_id, assignee_id

    Args (URL params):
        task_id: The task's ID from URL

    Dev Panel shows:
    - Task.update() method call with arguments
    - Task.validate() being called
    - Task.get_by_id() checking if task exists
    - Foreign key validation queries
    - UPDATE query (if validation passes)

    ✅ DO: Handle both validation errors AND not-found cases
    ✅ DO: Re-load users list when re-rendering form after error
    ✅ DO: Handle empty assignee_id (convert to None)
    ⚠️ DON'T: Assume update will always succeed

    Covered in: Lesson 5 (update patterns with relationships)
    """
    # Extract form data
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    status = request.form.get('status', '').strip()
    priority = request.form.get('priority', '').strip()
    owner_id = request.form.get('owner_id', '').strip()
    assignee_id = request.form.get('assignee_id', '').strip()

    # Convert string IDs to integers
    # Handle empty assignee_id (optional field) - convert to None
    try:
        owner_id = int(owner_id) if owner_id else None
        assignee_id = int(assignee_id) if assignee_id else None
    except ValueError:
        error_msg = 'Invalid user ID format'
        if wants_json():
            return error_response(error_msg, code='INVALID_INPUT', status=400)
        else:
            flash(error_msg, 'error')
            users = User.get_all()
            return tracked_render_template('tasks/edit.html', task={
                'id': task_id,
                'title': title,
                'description': description,
                'status': status,
                'priority': priority,
                'owner_id': owner_id,
                'assignee_id': assignee_id
            }, users=users)

    try:
        # Call Model to update task (Model layer unchanged)
        updated_task = Task.update(task_id, title=title, description=description,
                                   status=status, priority=priority,
                                   owner_id=owner_id, assignee_id=assignee_id)

        # Check if task was found
        if not updated_task:
            if wants_json():
                return error_response(
                    message='Task not found',
                    code='NOT_FOUND',
                    status=404
                )
            else:
                flash('Task not found', 'error')
                return tracked_render_template('errors/404.html', message='Task not found'), 404

        # Success! Return appropriate response based on client preference
        if wants_json():
            return success_response(
                data={'task': updated_task},
                redirect=url_for('tasks.show', task_id=task_id)
            )
        else:
            flash('Task updated successfully!', 'success')
            return redirect(url_for('tasks.show', task_id=task_id))

    except ValueError as e:
        # Validation failed
        if wants_json():
            return error_response(
                message=str(e),
                code='VALIDATION_ERROR',
                status=400
            )
        else:
            flash(str(e), 'error')
            # Re-load users for dropdowns when re-rendering form
            users = User.get_all()
            # Pass the submitted values back to re-fill the form
            return tracked_render_template('tasks/edit.html', task={
                'id': task_id,
                'title': title,
                'description': description,
                'status': status,
                'priority': priority,
                'owner_id': owner_id,
                'assignee_id': assignee_id
            }, users=users)
    
    except Exception as e:
        # Database errors (IntegrityError, OperationalError, etc.)
        # The error has been logged in the developer panel by connection.py
        error_message = getattr(e, 'structured_error', {}).get('message', str(e))
        
        if wants_json():
            return error_response(
                message=error_message,
                code='DATABASE_ERROR',
                status=400
            )
        else:
            flash(error_message, 'error')
            users = User.get_all()
            return tracked_render_template('tasks/edit.html', task={
                'id': task_id,
                'title': title,
                'description': description,
                'status': status,
                'priority': priority,
                'owner_id': owner_id,
                'assignee_id': assignee_id
            }, users=users)


# ============================================================================
# DELETE TASK
# ============================================================================
@tasks_bp.route('/<int:task_id>/delete', methods=['POST'], strict_slashes=False)
@log_method_call
def delete(task_id):
    """
    Delete a task.

    Now supports both HTML form submission and JSON API requests.

    MVC Flow (both modes):
    1. Controller receives POST /tasks/<id>/delete request
    2. Controller calls Task.delete(id) (Model layer - unchanged)
    3. Model checks if task exists and deletes
    4. Controller handles result:
       - HTML mode: redirect to list with flash message
       - JSON mode: return {success: true/false, __DEBUG__: {...}}
    5. Response includes full __DEBUG__ trace

    HTTP: POST /tasks/<id>/delete

    Args (URL params):
        task_id: The task's ID from URL

    Dev Panel shows:
    - Task.delete() method call with task_id
    - Task.get_by_id() checking if task exists
    - DELETE query execution (if task found)
    - Boolean return value
    - __DEBUG__ available in same response (no redirect needed in JSON mode)

    Note: We use POST for delete (not GET) because:
    - GET requests should be safe (no side effects)
    - DELETE operations modify data
    - Prevents accidental deletion via link clicks or bots

    ✅ DO: Use POST/DELETE for destructive actions
    ✅ DO: Support both HTML and JSON clients from one endpoint
    ⚠️ DON'T: Allow GET requests to modify data

    Covered in: Lesson 5 (HTTP method semantics), Progressive enhancement
    """
    # Call Model to delete task (Model layer unchanged)
    success = Task.delete(task_id)

    if wants_json():
        # JSON mode: return status as JSON
        if success:
            return success_response(
                data={'deleted': True},
                redirect=url_for('tasks.index')
            )
        else:
            return error_response(
                message='Task not found',
                code='NOT_FOUND',
                status=404
            )
    else:
        # HTML mode: flash message and redirect
        if success:
            flash('Task deleted successfully!', 'success')
        else:
            flash('Task not found', 'error')

        # Always redirect to task list
        return redirect(url_for('tasks.index'))
