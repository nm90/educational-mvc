# Educational MVC App - Implementation Plan

**Project**: Educational MVC App with transparent developer features
**Status**: Planning Complete - Ready for Implementation
**Approach**: Micro-features (30min-1hr each), test after each commit

---

## Agent Guidelines & Best Practices

### General Principles

**ALWAYS follow these guidelines when implementing features:**

1. **Architecture Source of Truth**: Use `PROJECT_BRIEF.md` as the authoritative reference for:
   - MVC architecture patterns (where logic belongs)
   - Tech stack decisions (Flask, SQLite, Jinja2)
   - Code documentation style
   - Developer panel design

2. **Ask Before Deciding**: If you encounter ANY architectural ambiguity not covered in PROJECT_BRIEF.md, STOP and ask the user:
   - Where should this logic live? (Model vs Controller)
   - Which approach should I use? (if multiple valid options)
   - How should I structure this? (if unclear)

3. **Commit Workflow**:
   - Complete the micro-feature fully
   - Test it yourself (run the code, check for errors)
   - Create a commit with descriptive message
   - Ask user to test before moving to next feature
   - Commit message format: `feat: [brief description]` or `fix: [brief description]`

4. **Code Quality Standards**:
   - Follow PROJECT_BRIEF.md documentation style (docstrings, inline comments)
   - Keep code simple - avoid over-engineering
   - Use descriptive variable names
   - Include MVC flow explanations in docstrings
   - Add "Lesson X covers this" comments where applicable

5. **Testing Protocol**:
   - After each feature commit, ask user: "Feature X is complete. Please test by [specific test steps]. Let me know if it works correctly or if you encounter any issues."
   - Wait for user confirmation before proceeding
   - If issues found, fix them immediately before moving on

---

## Project Structure

```
educational-mvc/
├── backend/                 # Python Flask server
│   ├── app.py              # Flask application entry point
│   ├── models/             # Model layer (User, Task)
│   ├── controllers/        # Controller layer (routes, orchestration)
│   ├── utils/              # Decorators, logging, request tracking
│   ├── database/           # SQLite connection, schema, migrations
│   └── templates/          # Jinja2 view templates
├── frontend/               # JavaScript client
│   ├── public/
│   │   ├── index.html      # Main HTML entry
│   │   ├── css/           # Stylesheets
│   │   └── js/            # Client-side JavaScript
│   │       ├── main.js    # App initialization
│   │       ├── devPanel.js # Developer panel component
│   │       └── lessons.js  # Lesson engine
├── lessons/               # JSON lesson files (Lesson 1-8)
├── docker/                # Docker configuration
├── docs/                  # Documentation
├── package.json           # npm scripts and dependencies
├── requirements.txt       # Python dependencies
├── docker-compose.yml     # Docker orchestration
└── README.md             # Setup instructions
```

---

## Implementation Phases

### Phase 0: Project Scaffolding (Prerequisites)

**Goal**: Set up basic project structure and tooling

#### Feature 0.1: Initialize Project Structure
**Time**: 30min
**Files to create**:
- `/package.json`
- `/requirements.txt`
- `/.gitignore`
- `/README.md`
- Directory structure

**Agent Prompt**:
```
You are setting up a new Educational MVC App project from scratch.

CONTEXT:
- Read PROJECT_BRIEF.md to understand the full project vision
- This is a Python Flask backend + Vanilla JavaScript frontend
- Uses SQLite database, Jinja2 templates
- Focus: Teaching MVC architecture with transparent developer tools

TASK:
Create the initial project structure:

1. Create package.json with scripts:
   - "setup": Initialize database and install dependencies
   - "start": Run Flask server on port 5000
   - "dev": Run with auto-reload enabled

2. Create requirements.txt with Python dependencies:
   - Flask==3.0.0
   - flask-cors==4.0.0

3. Create .gitignore for Python and Node:
   - __pycache__/, *.pyc, .env
   - node_modules/, *.db, .DS_Store

4. Create directory structure:
   - backend/ (models/, controllers/, utils/, database/, templates/)
   - frontend/public/ (css/, js/)
   - lessons/, docker/, docs/

5. Create basic README.md with:
   - Project title and description
   - Setup instructions (placeholder)
   - Reference to PROJECT_BRIEF.md

IMPORTANT:
- Keep it minimal - just scaffolding, no implementation yet
- Follow standard Python/Node project conventions
- Add helpful comments in package.json scripts

When complete, commit with message: "feat: initialize project structure"
Then ask user to verify the structure looks correct.
```

**Test Steps**: Check that all directories exist, package.json has valid scripts

---

### Phase 1: Core Python MVC + SQLite

**Goal**: Working task app with CRUD operations (no dev panel yet)

#### Feature 1.1: Database Setup & Schema
**Time**: 45min
**Files to create**:
- `/backend/database/__init__.py`
- `/backend/database/connection.py`
- `/backend/database/schema.sql`
- `/backend/database/seed.py`

**Agent Prompt**:
```
You are implementing the database layer for the Educational MVC App.

CONTEXT:
- Using SQLite (file-based, zero setup)
- Two tables: users and tasks (see PROJECT_BRIEF.md lines 101-124 for schema)
- Need seed data for learning (pre-populated users and tasks)

TASK:
Create database infrastructure:

1. Create backend/database/connection.py:
   - SQLite connection function with database path
   - Execute query helper (with error handling)
   - Add docstring: "Database connection utilities. Handles SQLite connection and query execution."

2. Create backend/database/schema.sql:
   - CREATE TABLE users (id, name, email UNIQUE, created_at)
   - CREATE TABLE tasks (id, title, description, status, priority, owner_id, assignee_id, created_at, updated_at)
   - Add FOREIGN KEY constraints (owner_id → users.id, assignee_id → users.id)
   - Add indexes for foreign keys

3. Create backend/database/seed.py:
   - insert_seed_data() function
   - Create 3 sample users: Alice, Bob, Charlie
   - Create 5 sample tasks with varied statuses and priorities
   - Use realistic task titles/descriptions for learning

4. Create backend/database/__init__.py (can be empty for now)

IMPORTANT:
- Use INTEGER PRIMARY KEY for auto-increment IDs
- Status ENUM: 'todo', 'in-progress', 'done'
- Priority ENUM: 'low', 'medium', 'high'
- Timestamps: Use DATETIME DEFAULT CURRENT_TIMESTAMP
- Add SQL comments explaining the MVC learning purpose

When complete:
- Commit: "feat: implement database schema and seed data"
- Ask user to review schema.sql before proceeding
```

**Test Steps**: Review schema.sql for correctness, check seed data is realistic

#### Feature 1.2: User Model with Validation
**Time**: 45min
**Files to create**:
- `/backend/models/__init__.py`
- `/backend/models/user.py`

**Agent Prompt**:
```
You are implementing the User Model for the Educational MVC App.

CONTEXT:
- This is the MODEL layer in MVC
- Models handle: data validation, business logic, database queries
- See PROJECT_BRIEF.md lines 232-261 for documentation style requirements
- This will be used in Lesson 3 to teach Model concepts

TASK:
Create backend/models/user.py with a User class:

1. Class docstring explaining:
   - "User Model - Handles user data validation and database operations"
   - MVC role: Business logic and data access
   - Related lessons: Lesson 3 (User Model exploration)

2. Implement methods (as @staticmethod for now):
   - validate(name, email): Check name non-empty, email format valid
   - create(name, email): Validate, insert into DB, return user ID
   - get_by_id(user_id): Fetch user by ID, return dict or None
   - get_all(): Return list of all users as dicts
   - update(user_id, name, email): Validate and update user
   - delete(user_id): Remove user from database

3. Documentation requirements:
   - Each method: docstring with MVC flow explanation
   - Inline comments: ✅ DO / ⚠️ DON'T patterns
   - Example: "✅ DO: Keep validation in Model. ⚠️ DON'T: Validate in Controller"

4. Return format:
   - Success: {"id": 1, "name": "Alice", "email": "alice@example.com", "created_at": "..."}
   - Validation errors: raise ValueError with clear message

IMPORTANT:
- Use database.connection module for queries
- Keep methods pure (no side effects beyond DB)
- Validate email with simple regex: r'^[\w\.-]+@[\w\.-]+\.\w+$'
- Add helpful error messages: "Email format invalid: {email}"

When complete:
- Commit: "feat: implement User model with validation"
- Ask user to test by running Python and calling User.create()
```

**Test Steps**: Import User model in Python REPL, test create/get/validate methods

#### Feature 1.3: Task Model with Relationships
**Time**: 60min
**Files to create**:
- `/backend/models/task.py`

**Agent Prompt**:
```
You are implementing the Task Model with relationships for the Educational MVC App.

CONTEXT:
- Task has foreign keys: owner_id → users, assignee_id → users (nullable)
- This demonstrates relationships and JOINs
- Used in Lesson 4 to teach relationships and N+1 query problem
- More complex than User model

TASK:
Create backend/models/task.py with a Task class:

1. Class docstring:
   - Explain MVC role and relationship teaching purpose
   - Mention N+1 query problem (will be demonstrated in lessons)
   - Related lessons: Lesson 4

2. Implement methods:
   - validate(title, description, status, priority, owner_id, assignee_id):
     * Title non-empty
     * Status in ['todo', 'in-progress', 'done']
     * Priority in ['low', 'medium', 'high']
     * owner_id exists in users table
     * assignee_id exists if provided

   - create(title, description, status, priority, owner_id, assignee_id=None):
     * Validate inputs
     * Insert into tasks table
     * Set created_at and updated_at to now
     * Return task ID

   - get_by_id(task_id, include_relations=False):
     * If include_relations=False: Just task data
     * If include_relations=True: JOIN with users to get owner and assignee details
     * Return dict with nested owner and assignee objects

   - get_all(include_relations=False):
     * Return all tasks
     * Support include_relations for JOINs

   - update(task_id, **kwargs):
     * Allow updating any field
     * Validate new values
     * Update updated_at timestamp

   - delete(task_id):
     * Remove task from database

3. Relationship handling:
   - Document the N+1 problem in comments
   - Show how include_relations avoids it with JOINs
   - Example return with relations:
     ```python
     {
       "id": 1,
       "title": "...",
       "owner": {"id": 1, "name": "Alice", ...},
       "assignee": {"id": 2, "name": "Bob", ...} or None
     }
     ```

IMPORTANT:
- Use LEFT JOIN for assignee (nullable)
- Add clear docstrings explaining when to use include_relations
- Comment: "This demonstrates eager loading to avoid N+1 queries"

When complete:
- Commit: "feat: implement Task model with relationships"
- Ask user to test get_by_id with and without include_relations
```

**Test Steps**: Test Task.create(), verify JOINs work with include_relations=True

#### Feature 1.4: Flask App Setup & Basic Routes
**Time**: 45min
**Files to create**:
- `/backend/app.py`
- `/backend/controllers/__init__.py`

**Agent Prompt**:
```
You are creating the Flask application setup for the Educational MVC App.

CONTEXT:
- Flask serves as the web server
- Routes will be in controllers (next feature)
- Need to initialize database on first run
- This is the entry point for the Python backend

TASK:
Create backend/app.py:

1. Flask app initialization:
   - Import Flask, create app instance
   - Configure app (SECRET_KEY, DATABASE_PATH)
   - Enable CORS for frontend requests

2. Database initialization:
   - Check if database file exists
   - If not: create schema, run seed data
   - Log initialization status

3. Basic routes (placeholder for now):
   - GET /: Return simple "Educational MVC App API" message
   - GET /health: Return {"status": "ok"} for health checks

4. Error handlers:
   - 404: Return JSON {"error": "Not found"}
   - 500: Return JSON {"error": "Internal server error"}

5. Main execution:
   - if __name__ == '__main__': app.run(debug=True, port=5000)

6. Documentation:
   - Module docstring explaining Flask app role
   - Comments about why we initialize DB here
   - Note: "Controllers will be added in next feature"

IMPORTANT:
- Use environment variable for SECRET_KEY with fallback
- Database path: ./educational_mvc.db
- Add helpful print statements for debugging
- Keep it minimal - just skeleton

When complete:
- Commit: "feat: create Flask app with basic setup"
- Ask user to run: python backend/app.py and visit http://localhost:5000
```

**Test Steps**: Run Flask app, check health endpoint returns JSON

#### Feature 1.5: User Controller with CRUD Routes
**Time**: 60min
**Files to create**:
- `/backend/controllers/user_controller.py`

**Agent Prompt**:
```
You are implementing the User Controller for the Educational MVC App.

CONTEXT:
- Controllers orchestrate between Models and Views
- They handle HTTP requests, call Model methods, render templates
- See PROJECT_BRIEF.md for controller responsibilities
- Used in Lesson 5 to teach Controller role

TASK:
Create backend/controllers/user_controller.py:

1. Blueprint setup:
   - Create Flask Blueprint named 'users'
   - URL prefix: /users

2. Implement routes:

   GET /users - List all users
   - Call User.get_all()
   - Render template 'users/index.html' with users list

   GET /users/<id> - Show single user
   - Call User.get_by_id(id)
   - If not found: 404
   - Render template 'users/show.html' with user

   GET /users/new - Show create form
   - Render template 'users/new.html'

   POST /users - Create new user
   - Get form data (name, email)
   - Call User.create(name, email)
   - Handle validation errors (return form with errors)
   - On success: redirect to /users

   GET /users/<id>/edit - Show edit form
   - Call User.get_by_id(id)
   - Render template 'users/edit.html' with user

   POST /users/<id>/update - Update user
   - Get form data
   - Call User.update(id, name, email)
   - Handle validation errors
   - On success: redirect to /users/<id>

   POST /users/<id>/delete - Delete user
   - Call User.delete(id)
   - Redirect to /users

3. Documentation:
   - Module docstring: "User Controller - Orchestrates user-related requests"
   - Each route: docstring explaining MVC flow
   - Example: "Controller receives request → calls User.get_all() → renders view"
   - Add comments: "✅ DO: Keep logic in Model. Controller just orchestrates."

4. Register blueprint in app.py:
   - Import and register the blueprint

IMPORTANT:
- Controllers should be thin - just orchestration
- All validation happens in Model
- Return helpful error messages to users
- Use Flask flash messages for success/error feedback

When complete:
- Commit: "feat: implement User controller with CRUD routes"
- Ask user to test routes with curl or browser (templates don't exist yet, so expect errors)
```

**Test Steps**: Test routes with curl, verify they call User model methods correctly

#### Feature 1.6: User Jinja2 Templates (Views)
**Time**: 60min
**Files to create**:
- `/backend/templates/base.html`
- `/backend/templates/users/index.html`
- `/backend/templates/users/show.html`
- `/backend/templates/users/new.html`
- `/backend/templates/users/edit.html`

**Agent Prompt**:
```
You are creating Jinja2 templates (Views) for the User CRUD interface.

CONTEXT:
- Views just display data - NO logic
- Using Jinja2 templating (Python version of EJS)
- Simple, semantic HTML - no fancy styling yet
- These demonstrate the VIEW layer in MVC

TASK:
Create Jinja2 templates:

1. backend/templates/base.html:
   - Basic HTML5 structure
   - <title>Educational MVC App</title>
   - Navigation: Home | Users | Tasks
   - {% block content %}{% endblock %} for child templates
   - Simple inline CSS for readability (minimal)
   - Comment: "Base template - shared layout for all pages"

2. backend/templates/users/index.html:
   - Extends base.html
   - Display table of all users (name, email, created_at)
   - Each row: View | Edit | Delete links
   - "Create New User" button
   - Comment: "VIEW layer - just displays user data from Controller"

3. backend/templates/users/show.html:
   - Show single user details
   - Display: name, email, created_at
   - Links: Edit | Delete | Back to List
   - Comment: "Shows how View receives data from Controller (user object)"

4. backend/templates/users/new.html:
   - Form with fields: name, email
   - Submit button → POST /users
   - Display validation errors if present
   - Cancel link → /users
   - Comment: "Form posts to Controller, which validates via Model"

5. backend/templates/users/edit.html:
   - Similar to new.html but pre-filled with user data
   - Form → POST /users/<id>/update
   - Display current values
   - Comment: "Controller passes user object to pre-fill form"

IMPORTANT:
- Keep HTML semantic and simple
- Add <!-- comments --> explaining MVC role
- Show flash messages if present
- Use tables for lists (clear structure)
- Forms should have proper labels and required attributes

When complete:
- Commit: "feat: create User views (Jinja2 templates)"
- Ask user to test full User CRUD workflow in browser
```

**Test Steps**: Create, read, update, delete users through web interface

#### Feature 1.7: Task Controller with CRUD Routes
**Time**: 60min
**Files to create**:
- `/backend/controllers/task_controller.py`

**Agent Prompt**:
```
You are implementing the Task Controller for the Educational MVC App.

CONTEXT:
- Similar to User controller but more complex (relationships)
- Tasks have foreign keys to users (owner, assignee)
- Need to load users for dropdown in forms
- Demonstrates controller orchestration with multiple models

TASK:
Create backend/controllers/task_controller.py:

1. Blueprint setup:
   - Create Flask Blueprint named 'tasks'
   - URL prefix: /tasks

2. Implement routes:

   GET /tasks - List all tasks
   - Call Task.get_all(include_relations=True) to avoid N+1
   - Render template 'tasks/index.html' with tasks
   - Comment: "Using include_relations=True to eagerly load owners/assignees"

   GET /tasks/<id> - Show single task with details
   - Call Task.get_by_id(id, include_relations=True)
   - Render template 'tasks/show.html'

   GET /tasks/new - Show create form
   - Load User.get_all() for owner/assignee dropdowns
   - Render template 'tasks/new.html' with users list
   - Comment: "Controller coordinates multiple models (Task + User)"

   POST /tasks - Create new task
   - Get form data: title, description, status, priority, owner_id, assignee_id
   - Call Task.create(...)
   - Handle validation errors (re-render form with errors)
   - On success: redirect to /tasks

   GET /tasks/<id>/edit - Show edit form
   - Load task and users list
   - Render template 'tasks/edit.html'

   POST /tasks/<id>/update - Update task
   - Similar to create
   - Call Task.update(id, ...)

   POST /tasks/<id>/delete - Delete task
   - Call Task.delete(id)
   - Redirect to /tasks

3. Documentation:
   - Module docstring explaining Task controller role
   - Each route: MVC flow explanation
   - Highlight multi-model orchestration
   - Comment about N+1 query avoidance

4. Register blueprint in app.py

IMPORTANT:
- Controllers stay thin - models do the work
- Always load related data (users) when needed for dropdowns
- Use include_relations to demonstrate efficient queries
- Handle null assignee_id gracefully

When complete:
- Commit: "feat: implement Task controller with CRUD routes"
- Ask user to verify routes are accessible (templates pending)
```

**Test Steps**: Test routes with curl, verify include_relations loads user data

#### Feature 1.8: Task Jinja2 Templates (Views)
**Time**: 60min
**Files to create**:
- `/backend/templates/tasks/index.html`
- `/backend/templates/tasks/show.html`
- `/backend/templates/tasks/new.html`
- `/backend/templates/tasks/edit.html`

**Agent Prompt**:
```
You are creating Jinja2 templates (Views) for the Task CRUD interface.

CONTEXT:
- Tasks are more complex than Users (status, priority, relationships)
- Need to display owner and assignee information
- Forms need dropdowns for users
- Demonstrate how View displays related data

TASK:
Create Jinja2 templates:

1. backend/templates/tasks/index.html:
   - Extends base.html
   - Table showing: title, status, priority, owner name, assignee name, actions
   - Status badge styling (color-coded: todo=gray, in-progress=blue, done=green)
   - Priority badge (low=green, medium=yellow, high=red)
   - Each row: View | Edit | Delete links
   - "Create New Task" button
   - Comment: "Shows relationship data (task.owner.name, task.assignee.name)"

2. backend/templates/tasks/show.html:
   - Display all task fields
   - Show owner details: name, email
   - Show assignee details (or "Unassigned" if null)
   - Display timestamps (created_at, updated_at)
   - Links: Edit | Delete | Back to List
   - Comment: "View receives task with eager-loaded relationships"

3. backend/templates/tasks/new.html:
   - Form fields:
     * title (text input, required)
     * description (textarea, required)
     * status (dropdown: todo, in-progress, done)
     * priority (dropdown: low, medium, high)
     * owner_id (dropdown of users, required)
     * assignee_id (dropdown of users + "Unassigned" option)
   - Submit → POST /tasks
   - Display validation errors
   - Comment: "Controller passes users list for dropdowns"

4. backend/templates/tasks/edit.html:
   - Same as new.html but pre-filled with task data
   - Select correct option in dropdowns
   - Form → POST /tasks/<id>/update
   - Comment: "Shows current values using task.status, task.priority, etc."

IMPORTANT:
- Use semantic HTML (<select>, <option>)
- Show owner.name and assignee.name (demonstrate relationship access)
- Handle null assignee gracefully
- Add visual indicators for status/priority
- Include HTML comments about MVC concepts

When complete:
- Commit: "feat: create Task views (Jinja2 templates)"
- Ask user to test full Task CRUD workflow including creating tasks with relationships
```

**Test Steps**: Create tasks with owners/assignees, verify relationships display correctly

#### Feature 1.9: Update base.html Navigation & Styling
**Time**: 30min
**Files to modify**:
- `/backend/templates/base.html`

**Agent Prompt**:
```
You are improving the base template with better navigation and minimal styling.

CONTEXT:
- Phase 1 is almost complete - basic MVC app works
- Need clean navigation between Users and Tasks
- Add minimal CSS for readability (not beautiful, just functional)

TASK:
Update backend/templates/base.html:

1. Navigation improvements:
   - Header with app title: "Educational MVC App"
   - Nav links: Home | Users | Tasks
   - Highlight current page (active link)

2. Flash message display:
   - Show Flask flash messages at top of page
   - Style: success (green), error (red), info (blue)

3. Minimal CSS (inline <style> in <head>):
   - Clean typography (sans-serif font)
   - Table styling (borders, padding, hover states)
   - Button styling (primary, secondary, danger)
   - Form styling (labels, inputs, spacing)
   - Badge styling (status and priority colors)
   - Responsive container (max-width, centered)

4. Footer:
   - "Phase 1 Complete - Basic MVC App"
   - Small text: "Developer Panel coming in Phase 2"

IMPORTANT:
- Keep CSS minimal and inline (no external files yet)
- Focus on readability, not aesthetics
- Use CSS comments to organize styles
- Ensure forms and tables look clean

When complete:
- Commit: "feat: improve base template with navigation and styling"
- Ask user to test entire app - Users and Tasks CRUD should work smoothly
```

**Test Steps**: Navigate between Users and Tasks, verify flash messages work

---

### Phase 2: Async JSON API & Method Logging

**Goal**: Transparent MVC execution visibility with dual-mode controllers and developer tools

**Phase 2 Architecture**:
This phase implements a hybrid request handling approach:
- **HTML Mode**: Traditional form POST → 302 redirect → GET (for classic MVC learning)
- **JSON Mode**: Async fetch() → immediate JSON response with embedded __DEBUG__ (for modern transparency)

Both modes use the same controllers and models, allowing students to see:
- Traditional flow (synchronous, form-based)
- Modern flow (asynchronous, API-based) in the same request/response

#### Feature 2.1: Request Tracking Middleware
**Status**: ✅ COMPLETED
**Files created**:
- `/backend/utils/__init__.py`
- `/backend/utils/request_tracker.py`

**Implementation Summary**:
- Generates unique request_id (UUID) for each request
- Tracks method calls, database queries, timing information
- Stores in Flask's `g` object (request-scoped)
- Provides `before_request()` and `after_request()` middleware
- Helper functions: `track_method_call()`, `track_db_query()`, `track_view_data()`

**Key Design Decision**: __DEBUG__ object is populated throughout request lifecycle and injected/embedded based on response type (see Feature 2.4)

---

#### Feature 2.2: Method Logging Decorator
**Status**: ✅ COMPLETED
**Files created**:
- `/backend/utils/decorators.py`

**Implementation Summary**:
- Decorator: `@log_method_call` wraps all Model methods
- Captures: method name (qualified with class name), args, kwargs, return value, execution duration
- Handles edge cases:
  * Exceptions: logs before re-raising (preserves stack trace)
  * Large values: truncates to 1000 chars with "[...TRUNCATED...]" marker
  * Outside request context: gracefully skips tracking
- Uses `time.perf_counter()` for precise millisecond timing
- Uses `func.__qualname__` to capture qualified method names (e.g., "User.create")

**Applied To**: All User and Task model methods (validate, create, get_by_id, get_all, update, delete)

**Key Design**: Decorator is transparent - doesn't modify return values or behavior, just logs

---

#### Feature 2.3: Database Query Logging
**Status**: ✅ COMPLETED (integrated into Feature 2.1)
**Files modified**:
- `/backend/database/connection.py`

**Implementation Summary**:
- Modified `execute_query()` to track all SQL operations
- Captures: SQL text, parameters, result row count, execution duration
- Different handling for query types:
  * SELECT: tracks fetched row count
  * INSERT: tracks lastrowid
  * UPDATE/DELETE: tracks affected row count
- Timing: uses `time.perf_counter()` before/after execution

**Key Design**: Queries are tracked regardless of response mode (HTML or JSON)

---

#### Feature 2.4: Dual-Mode Controllers & Response Helpers
**Status**: ✅ COMPLETED (UNPLANNED - addresses 302 redirect issue)
**Files created**:
- `/backend/utils/response_helpers.py`

**Purpose**: Enable controllers to serve both traditional HTML and JSON API requests from same endpoints

**Implementation Summary**:

```python
def wants_json() -> bool:
    """Detect client intent via Accept header, X-Requested-With, or ?format=json"""
    # Checks:
    # 1. Accept: application/json header
    # 2. X-Requested-With: XMLHttpRequest header
    # 3. ?format=json query parameter

def success_response(data=None, redirect=None, status=200) -> JSON:
    """Return {success: true, data: {...}, __DEBUG__: {...}}"""
    # Embeds __DEBUG__ from g.tracking automatically
    # Includes redirect URL for client-side navigation

def error_response(message, field=None, code=None, status=400) -> JSON:
    """Return {success: false, error: {...}, __DEBUG__: {...}}"""
    # Embeds __DEBUG__ for debugging failed requests
    # Includes field (for form validation errors) and code (error classification)
```

**Pattern Applied to Controllers**:
Each CRUD action now supports both modes:
```python
@route('/', methods=['POST'], strict_slashes=False)
def create():
    # Extract form data (works for both form POST and JSON)
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    # Call model (unchanged - no knowledge of response mode)
    user = User.create(name, email)

    # Response based on mode
    if wants_json():
        return success_response({'user': user}, redirect=url_for(...))
    else:
        flash('User created successfully!')
        return redirect(url_for(...))
```

**Critical Change**: Added `strict_slashes=False` to POST routes to prevent 308 PERMANENT_REDIRECT before controller code executes

**Updated Controllers**:
- `backend/controllers/user_controller.py`: create, update, delete routes
- `backend/controllers/task_controller.py`: create, update, delete routes

**Key Insight**: This eliminates the 302 redirect problem - JSON clients get __DEBUG__ in same response, HTML clients still work traditionally

---

#### Feature 2.5: JavaScript API Client with Debug Extraction
**Status**: ✅ COMPLETED (UNPLANNED - supports async architecture)
**Files created**:
- `/backend/static/js/mvc-api.js` (moved from frontend/public/js/)

**Purpose**: Centralized fetch() wrapper that extracts and displays __DEBUG__ data

**Implementation Summary**:
```javascript
class MvcApi {
    static async request(url, options = {}) {
        // Sets standard headers (Accept, Content-Type, X-Requested-With)
        // Makes fetch() request
        // Parses JSON response
        // If __DEBUG__ present:
        //   - Logs to console with nested console.group() for expandability
        //   - Stores in window.MVC_DEBUG for dev panel access
        //   - Displays: method calls (with args/kwargs/return value)
        //              db queries (with params and duration)
        //              timing summary
        // Returns response object to caller
    }

    static async post(url, formData)    // convenience method
    static async put(url, formData)     // convenience method
    static async delete(url)            // convenience method
}
```

**Console Output Example**:
```
📡 API Response: POST /users
  Request ID: 1fe9bd88-55aa-453c-87e6-e47548655744
  Method Calls (3)
    1. User.validate (0.5ms)
       Args: ["John", "john@example.com"]
       Kwargs: {}
       Return Value: (None)
       Exception: None
    2. User.create (2.3ms)
       Args: ["John", "john@example.com"]
       ...
    3. User.get_by_id (1.2ms)
       ...
  Database Queries (2)
    1. INSERT INTO users (name, email) VALUES (?, ?)
       Params: ["John", "john@example.com"]
       Rows: 1
       Duration: 1.5ms
    2. SELECT * FROM users WHERE id = ?
       ...
  ⏱️ Total Request Time: 45.2ms
```

**Key Features**:
- Nested `console.group()` structure for fully expandable debugging
- Shows all method calls chronologically
- Shows all database queries with parameters
- Calculates total request time (precise timing)
- Truncates large values to prevent console bloat
- Gracefully handles when __DEBUG__ not present

---

#### Feature 2.6: Form Interception & Async Submission Handler
**Status**: ✅ COMPLETED (UNPLANNED - enables progressive enhancement)
**Files created**:
- `/backend/static/js/mvc-forms.js` (moved from frontend/public/js/)

**Purpose**: Progressively enhance HTML forms to submit asynchronously without JavaScript

**Implementation Summary**:
```javascript
class MvcFormHandler {
    static init() {
        // Find all <form data-async> elements
        // Attach submit event handlers
        // Log initialization: "✓ Initialized async form handling for X form(s)"
    }

    static async handleSubmit(event) {
        // Prevent default form submission
        // Serialize form to JSON
        // Show "Submitting..." state on button
        // Send via MvcApi.post()

        // On success:
        //   - Show success message
        //   - Navigate to redirect URL (if provided)
        //   - Or reset form (if no redirect)

        // On error:
        //   - Show error message
        //   - Highlight invalid field (if provided)
        //   - Auto-remove highlight on user input

        // Always: re-enable submit button
    }

    static serializeForm(form) {
        // Converts FormData to plain JSON object
    }

    static showMessage(type, message) {
        // Creates animated flash message
        // Auto-removes after 5 seconds
        // Success = green, Error = red
    }
}
```

**Form Usage**:
```html
<form action="/users" method="POST" data-async>
    <input type="text" name="name" required>
    <input type="email" name="email" required>
    <button type="submit">Create User</button>
</form>
```

**Key Features**:
- **Progressive Enhancement**: Forms work without JavaScript (traditional POST)
- **Graceful Fallback**: JavaScript intercepts, but HTML still works
- **Async Benefits**:
  * Avoids page reload (smoother UX)
  * __DEBUG__ visible in same response (no redirect confusion)
  * Can show success/error messages inline
- **Accessibility**:
  * Proper form labels
  * Error messages for screen readers
  * Works with keyboard navigation

**Applied To**: All form templates (users/new.html, users/edit.html, tasks/new.html, tasks/edit.html)

---

#### Feature 2.7: Update Templates & Base HTML for Async Architecture
**Status**: ✅ COMPLETED
**Files modified**:
- `/backend/templates/base.html`
- `/backend/templates/users/new.html`
- `/backend/templates/users/edit.html`
- `/backend/templates/tasks/new.html`
- `/backend/templates/tasks/edit.html`

**Changes**:
1. Added script includes in base.html:
   ```html
   <script src="/static/js/mvc-api.js"></script>
   <script src="/static/js/mvc-forms.js"></script>
   ```

2. Added to base.html footer:
   ```html
   <script>
       document.addEventListener('DOMContentLoaded', () => {
           MvcFormHandler.init();
       });
   </script>
   ```

3. Added `data-async` attribute to all forms:
   ```html
   <form action="{{ url_for('users.index') }}" method="POST" data-async>
   ```

4. Added CSS animations for flash messages (slideDown, slideUp)

5. Updated footer to reflect "Phase 2: Async JSON API"

**Key Benefit**: Same templates work for both traditional and async requests

---

### Phase 2 Summary: Architectural Decisions

**Problem Solved**:
Original architecture had issue where form POST → 302 redirect → GET caused __DEBUG__ data from create/update operations to be invisible (hidden by redirect)

**Solution Implemented**:
Dual-mode controllers that support both traditional HTML and modern async JSON requests

**Benefits**:
1. **Educational**: Students can see both synchronous (form-based) and asynchronous (fetch-based) patterns
2. **Transparent**: __DEBUG__ data is immediately available (no redirect confusion)
3. **Progressive**: Forms work without JavaScript, enhanced with JavaScript when available
4. **Modern**: Supports REST API patterns while maintaining educational MVC flow
5. **Same Code Path**: Both modes use identical Model methods and business logic

**Comparison to Original Plan**:
| Original Feature | Actual Implementation |
|------------------|----------------------|
| 2.4: Dev Panel UI | Moved to Feature 2.8 (now after async architecture is solid) |
| 2.5+: Dev Panel Tabs | Moved to Feature 2.9+ (will use __DEBUG__ from both HTML and JSON) |

---

### Phase 2 (Revised): Method Logging & Developer Panel

**Actual Goal**: Full dev panel showing Python execution with support for both HTML and JSON responses

#### Feature 2.8: Developer Panel - Base UI Structure
**Time**: 60min
**Files to create**:
- `/frontend/public/css/devpanel.css`
- `/frontend/public/js/devPanel.js`
- Update `/backend/templates/base.html`

**Agent Prompt**:
```
You are creating the Developer Panel UI structure (no tab content yet).

CONTEXT:
- Panel appears at bottom or side of page (toggle-able)
- Has 5 tabs: State Inspector, Method Calls, Flow Diagram, Network, Database
- Reads window.__DEBUG__ injected by backend
- This is the main learning tool for students

TASK:

1. Create frontend/public/css/devpanel.css:
   - Panel container: fixed position, bottom/right of page
   - Tabs: horizontal tab bar
   - Content area: scrollable, monospace font
   - Toggle button: floating button to show/hide panel
   - Dark theme (developer tool aesthetic)
   - Resizable panel (drag to resize)

2. Create frontend/public/js/devPanel.js:

   - DevPanel class with methods:

     init():
     - Create panel HTML structure
     - Insert into document
     - Attach event listeners
     - Load __DEBUG__ data

     createTabs():
     - Create 5 tab buttons: State, Methods, Flow, Network, Database
     - Attach click handlers to switch tabs

     loadDebugData():
     - Read window.__DEBUG__ object
     - Store in this.debugData
     - Update current tab display

     toggle():
     - Show/hide panel
     - Save state to localStorage

     switchTab(tabName):
     - Hide all tab content
     - Show selected tab content
     - Highlight active tab button

     renderTabContent(tabName):
     - Placeholder: "Tab content coming soon"
     - Will be implemented in next features

3. Update backend/templates/base.html:
   - Add <link> to devpanel.css
   - Add <script src="/js/devPanel.js"></script>
   - Add initialization: <script>new DevPanel().init();</script>
   - Add toggle button: fixed bottom-right corner

4. Static file serving:
   - Configure Flask to serve /frontend/public as static files
   - Route: /css/... → frontend/public/css/
   - Route: /js/... → frontend/public/js/

IMPORTANT:
- Panel should not interfere with main app UI
- Make it collapsible (hidden by default)
- Use semantic HTML for accessibility
- Add CSS comments organizing styles
- Panel should look professional (dev tool quality)

When complete:
- Commit: "feat: create developer panel base UI structure"
- Ask user to test: toggle panel open/close, switch between tabs
```

**Test Steps**: Open panel, switch tabs, verify no JavaScript errors

#### Feature 2.9: Dev Panel Tab 1 - State Inspector
**Time**: 45min
**Files to modify**:
- `/frontend/public/js/devPanel.js`

**Agent Prompt**:
```
You are implementing the State Inspector tab of the developer panel.

CONTEXT:
- Shows data passed to the current view template
- Displays as expandable JSON tree
- Lets students see exactly what data the controller sent to view
- Read from window.__DEBUG__.view_data

TASK:
Update frontend/public/js/devPanel.js:

1. Implement renderStateInspector():

   - Read this.debugData.view_data
   - Render as expandable JSON tree
   - Format:
     * Objects: collapsible with expand/collapse icons
     * Arrays: show length, collapsible items
     * Primitives: show value and type
     * Null/undefined: show in gray

   - Add search/filter box (find keys)
   - Copy button (copy JSON to clipboard)

2. JSON tree rendering:
   - createTreeNode(key, value, depth):
     * Recursively build tree structure
     * Add indent for depth
     * Expandable sections for objects/arrays
     * Syntax highlighting (keys=blue, strings=green, numbers=orange)

   - toggleNode(nodeElement):
     * Expand/collapse on click
     * Rotate icon (▶ to ▼)
     * Show/hide children

3. Display format example:
   ```
   view_data: Object {2}
   ▼ tasks: Array[5]
     ▼ 0: Object {7}
         id: 1 (number)
         title: "Fix bug" (string)
       ▼ owner: Object {3}
           id: 1 (number)
           name: "Alice" (string)
           email: "alice@..." (string)
       ...
   ```

4. Update switchTab() to call renderStateInspector() when tab opened

IMPORTANT:
- Handle large datasets (virtualize if > 100 items)
- Show data types clearly
- Make JSON tree keyboard accessible
- Add "No data" message if view_data empty
- Use monospace font for values

When complete:
- Commit: "feat: implement State Inspector tab in dev panel"
- Ask user to load Tasks page and inspect view_data in State tab
```

**Test Steps**: Load tasks page, open State Inspector, verify task data with relationships visible

#### Feature 2.10: Dev Panel Tab 2 - Method Call Stack
**Time**: 45min
**Files to modify**:
- `/frontend/public/js/devPanel.js`

**Agent Prompt**:
```
You are implementing the Method Call Stack tab of the developer panel.

CONTEXT:
- Shows all Python method calls during request
- Displays in chronological order with timing
- Click method to see arguments and return value
- Helps students trace execution flow through MVC layers

TASK:
Update frontend/public/js/devPanel.js:

1. Implement renderMethodCalls():

   - Read this.debugData.method_calls (array of call objects)
   - Each call: {method, args, kwargs, return_value, duration}

   - Render as timeline/list:
     * Method name (e.g., "Task.get_all")
     * Execution time (e.g., "2.3ms")
     * Expand/collapse to show details

   - Sort by timestamp (chronological order)

2. Method call display:
   - createMethodCallNode(call):
     * Header: method name + duration badge
     * Click to expand → show:
       - Arguments (formatted)
       - Keyword arguments (formatted)
       - Return value (JSON tree format)
     * Syntax highlighting

   - Color-code by layer:
     * Model methods: blue
     * Controller methods: green
     * Utility methods: gray

3. Additional features:
   - Search/filter methods by name
   - "Show only Model calls" checkbox
   - "Show only > 10ms" performance filter
   - Total execution time at top

4. Display format example:
   ```
   Method Call Stack (4 calls, 15.2ms total)

   [Filter: All | Models Only | Slow (>10ms)]

   ▼ User.get_all()                    3.2ms
       Arguments: (none)
       Return: Array[3] (users)

   ▼ Task.get_all(include_relations=True)  12.0ms
       Arguments: []
       Kwargs: {include_relations: true}
       Return: Array[5] (tasks with owners/assignees)
   ```

IMPORTANT:
- Make method names clickable to expand
- Use consistent formatting with State Inspector
- Show timing prominently (performance learning)
- Handle methods with no args/return gracefully
- Add "No method calls tracked" if empty

When complete:
- Commit: "feat: implement Method Call Stack tab in dev panel"
- Ask user to load Tasks page and verify method calls appear correctly
```

**Test Steps**: Create a task, verify create() method appears with arguments and return value

#### Feature 2.11: Dev Panel Tab 3 - Database Inspector
**Time**: 45min
**Files to modify**:
- `/frontend/public/js/devPanel.js`

**Agent Prompt**:
```
You are implementing the Database Inspector tab of the developer panel.

CONTEXT:
- Shows all SQL queries executed during request
- Displays query text, parameters, results, timing
- Highlights slow queries
- Teaches students about database operations and N+1 problems

TASK:
Update frontend/public/js/devPanel.js:

1. Implement renderDatabaseQueries():

   - Read this.debugData.db_queries (array of query objects)
   - Each query: {query, params, result, duration}

   - Render as list with syntax-highlighted SQL

2. Query display:
   - createQueryNode(query):
     * SQL syntax highlighting (keywords in blue)
     * Show parameters (if any)
     * Show result summary (row count)
     * Execution time badge
     * Warning badge if > 50ms (slow query)

   - Expand/collapse to show:
     * Full SQL text (formatted, multi-line)
     * Parameters (with values)
     * Result metadata

3. SQL syntax highlighting:
   - Keywords: SELECT, FROM, WHERE, JOIN, etc. (blue, bold)
   - Table names: (green)
   - Values: (orange)
   - Keep it simple (regex-based)

4. Additional features:
   - Total queries count at top
   - Total query time
   - Highlight duplicates (same query multiple times = N+1 problem)
   - "Show only slow queries" filter

5. Display format example:
   ```
   Database Queries (3 queries, 18.5ms total)

   ⚠️ Warning: Duplicate queries detected (possible N+1 problem)

   ▼ SELECT * FROM users                    3.2ms
       Result: 3 rows

   ▼ SELECT * FROM tasks                    5.1ms
       Result: 5 rows

   ▼ SELECT * FROM users WHERE id = ?      10.2ms [SLOW]
       Parameters: [1]
       Result: 1 row
   ```

IMPORTANT:
- Detect N+1 problems (same query multiple times)
- Make SQL readable (format with line breaks)
- Show execution time prominently
- Highlight slow queries (> 50ms)
- Add "No queries executed" if empty

When complete:
- Commit: "feat: implement Database Inspector tab in dev panel"
- Ask user to load Tasks page with include_relations=False to see N+1 problem
```

**Test Steps**: Load tasks, verify queries appear; test with/without include_relations to see N+1

#### Feature 2.12: Dev Panel Tab 4 - Network Inspector
**Time**: 30min
**Files to modify**:
- `/frontend/public/js/devPanel.js`

**Agent Prompt**:
```
You are implementing the Network Inspector tab of the developer panel.

CONTEXT:
- Shows HTTP request details (method, URL, headers, status)
- Shows HTTP response details (status, headers, content-type)
- One request per page load (no AJAX yet)
- Helps students understand request-response cycle

TASK:
Update frontend/public/js/devPanel.js:

1. Implement renderNetworkInspector():

   - Read this.debugData.request_info:
     * method: GET/POST
     * url: request URL
     * headers: request headers (dict)
     * status: response status code
     * controller: which controller handled it

   - Display request and response sections

2. Request section:
   - HTTP method and URL
   - Request headers (collapsible)
   - Request body (if POST)
   - Timestamp

3. Response section:
   - Status code with color:
     * 200-299: green
     * 300-399: yellow
     * 400-499: orange
     * 500-599: red
   - Response headers (collapsible)
   - Content-type
   - Response size
   - Controller action that handled it

4. Display format example:
   ```
   Request:
   GET /tasks

   ▼ Request Headers {5}
       Host: localhost:5000
       User-Agent: Mozilla/5.0...
       Accept: text/html
       ...

   Response:
   Status: 200 OK ✓
   Controller: TaskController.index
   Content-Type: text/html
   Response Size: 12.3 KB
   Duration: 45ms
   ```

IMPORTANT:
- Make headers collapsible (often verbose)
- Highlight important headers (Content-Type, Status)
- Show which controller handled request
- Add timing information
- Handle missing data gracefully

When complete:
- Commit: "feat: implement Network Inspector tab in dev panel"
- Ask user to verify request/response details appear correctly
```

**Test Steps**: Load any page, check Network tab shows correct method, URL, and status

#### Feature 2.13: Dev Panel Tab 5 - Flow Diagram
**Time**: 60min
**Files to modify**:
- `/frontend/public/js/devPanel.js`
- `/frontend/public/css/devpanel.css`

**Agent Prompt**:
```
You are implementing the Flow Diagram tab - visual MVC flow representation.

CONTEXT:
- Animated diagram showing request flow through MVC layers
- Visual: Browser → Controller → Model → Database → Model → Controller → View → Browser
- Highlights timing for each phase
- Most visual/educational tab

TASK:
Update frontend/public/js/devPanel.js:

1. Implement renderFlowDiagram():

   - Create SVG diagram with boxes and arrows:
     * Browser (user icon)
     * Controller (gear icon)
     * Model (database-like icon)
     * Database (cylinder icon)
     * View (eye icon)

   - Draw arrows showing flow direction
   - Animate flow when tab opened

2. Flow phases (from debugData.timing):
   - Request received (Browser → Controller)
   - Controller processing (method calls)
   - Model validation (if applicable)
   - Database queries
   - Model returns data
   - View rendering
   - Response sent

3. Visual design:
   - Boxes: rounded rectangles
   - Arrows: animated dashed lines
   - Timing: show duration on each arrow
   - Current phase: highlighted in color
   - Completed phases: green checkmark

4. Animation:
   - Auto-play on tab open
   - Sequentially highlight each phase
   - Pause between phases
   - Loop option (checkbox)
   - Speed control (1x, 2x, 5x)

5. Display timing summary:
   ```
   Total Request: 45.2ms

   1. Request → Controller: 0.1ms
   2. Controller Processing: 2.3ms
   3. Model Methods: 12.0ms
   4. Database Queries: 18.5ms
   5. View Rendering: 12.3ms
   ```

Update frontend/public/css/devpanel.css:
- Add styles for SVG diagram
- Animation keyframes
- Phase highlighting colors

IMPORTANT:
- Keep diagram simple and clear
- Use web-safe icons or simple shapes
- Make timing numbers prominent
- Animation should be smooth (CSS transitions)
- Responsive to panel size

When complete:
- Commit: "feat: implement Flow Diagram tab in dev panel"
- Ask user to view flow animation and verify timing matches method calls
```

**Test Steps**: Load tasks page, open Flow Diagram, verify animation shows correct sequence

#### Feature 2.14: Inject view_data into __DEBUG__
**Time**: 30min
**Files to modify**:
- `/backend/controllers/user_controller.py`
- `/backend/controllers/task_controller.py`
- `/backend/utils/request_tracker.py`

**Agent Prompt**:
```
You are updating controllers to track view_data for the developer panel.

CONTEXT:
- Controllers currently render templates but don't track what data they pass
- Need to capture data before rendering template
- This data appears in State Inspector tab
- Helper function: track_view_data()

TASK:

1. Update backend/utils/request_tracker.py:
   - Modify track_view_data(data):
     * Store data in g.tracking['view_data']
     * Deep copy to avoid mutations
     * Handle circular references gracefully

2. Update backend/controllers/user_controller.py:
   - Before each render_template() call:
     * Call track_view_data(locals())
     * This captures all template variables

   Example:
   ```python
   @users.route('/')
   def index():
       users = User.get_all()
       track_view_data({'users': users})
       return render_template('users/index.html', users=users)
   ```

3. Update backend/controllers/task_controller.py:
   - Same pattern for all routes
   - Capture tasks, users, task variables

4. Update after_request middleware:
   - Ensure view_data is included in __DEBUG__ injection
   - Format: window.__DEBUG__.view_data = {...}

IMPORTANT:
- Track data BEFORE rendering (in case template modifies it)
- Don't track sensitive data (passwords)
- Use copy.deepcopy() to avoid reference issues
- Handle None gracefully

When complete:
- Commit: "feat: track view data in controllers for dev panel"
- Ask user to load Tasks page and verify State Inspector shows tasks array
```

**Test Steps**: Load any page, open State Inspector, verify view_data populated

---

### Phase 3: Lesson Engine

**Goal**: Tutorial mode with 8 structured lessons

#### Feature 3.1: Lesson Data Structure & Loader
**Time**: 45min
**Files to create**:
- `/lessons/lesson-1.json`
- `/frontend/public/js/lessonEngine.js`

**Agent Prompt**:
```
You are creating the lesson system for Tutorial Mode.

CONTEXT:
- 8 lessons total (PROJECT_BRIEF.md lines 139-188)
- Each lesson: title, description, steps, checkpoints
- Lessons loaded from JSON files
- Progress tracked in localStorage

TASK:

1. Create lessons/lesson-1.json (Lesson 1: Understand MVC Pattern):
   ```json
   {
     "id": 1,
     "title": "Understand the MVC Pattern",
     "description": "Learn what Model, View, and Controller mean",
     "estimated_time": "5 min",
     "objectives": [
       "Understand the role of each MVC component",
       "See how data flows through the layers"
     ],
     "steps": [
       {
         "id": "1-1",
         "title": "What is a Model?",
         "content": "The Model handles data and business logic...",
         "hint": "Check the User.py file to see an example",
         "checkpoint": null
       },
       {
         "id": "1-2",
         "title": "What is a View?",
         "content": "The View displays data to users...",
         "hint": "Look at templates/users/index.html",
         "checkpoint": null
       },
       {
         "id": "1-3",
         "title": "What is a Controller?",
         "content": "The Controller orchestrates...",
         "hint": "See controllers/user_controller.py",
         "checkpoint": {
           "type": "quiz",
           "question": "Which layer handles validation?",
           "options": ["Model", "View", "Controller"],
           "correct": "Model"
         }
       }
     ]
   }
   ```

2. Create frontend/public/js/lessonEngine.js:

   - LessonEngine class:

     loadLesson(lessonId):
     - Fetch /lessons/lesson-{id}.json
     - Store in this.currentLesson
     - Render lesson UI

     renderLesson():
     - Display lesson title, description
     - Show current step
     - Progress indicator (e.g., "Step 2 of 5")

     nextStep():
     - Check checkpoint if present
     - Move to next step
     - Update progress
     - Save to localStorage

     checkCheckpoint(step):
     - Validate quiz answers
     - Validate code checkpoints
     - Return true/false

     saveProgress():
     - localStorage.setItem('lessonProgress', JSON.stringify({...}))
     - Track: current lesson, current step, completed lessons

     loadProgress():
     - Read from localStorage
     - Resume where user left off

3. Configure Flask to serve /lessons/ directory:
   - Add static route for JSON files

IMPORTANT:
- Validate JSON structure on load
- Handle missing lesson files gracefully
- Don't allow skipping ahead (must complete checkpoints)
- Save progress frequently

When complete:
- Commit: "feat: create lesson engine and Lesson 1 data"
- Ask user to test loading Lesson 1 in console: new LessonEngine().loadLesson(1)
```

**Test Steps**: Load lesson 1 in browser console, verify JSON loads and renders

#### Feature 3.2: Lesson Panel UI Component
**Time**: 60min
**Files to create**:
- `/frontend/public/css/lessonPanel.css`
- Update `/frontend/public/js/lessonEngine.js`
- Update `/backend/templates/base.html`

**Agent Prompt**:
```
You are creating the Lesson Panel UI - the sidebar for Tutorial Mode.

CONTEXT:
- Appears on left side of screen (or collapsible)
- Shows current lesson, step, progress
- Has navigation buttons (Next, Previous, Hint)
- Displays checkpoints when applicable

TASK:

1. Create frontend/public/css/lessonPanel.css:
   - Panel: fixed left sidebar (300px wide)
   - Collapsible toggle button
   - Lesson header: title, progress bar
   - Step content area: scrollable
   - Action buttons: Next, Previous, Hint
   - Checkpoint UI: quiz questions, code validation
   - Color scheme: educational (blues, greens)

2. Update frontend/public/js/lessonEngine.js:

   - Add UI rendering methods:

     createPanel():
     - Build panel HTML structure
     - Insert into DOM
     - Attach event listeners

     renderCurrentStep():
     - Display step title and content
     - Show hint button (reveals hint on click)
     - Render checkpoint if present

     renderCheckpoint(checkpoint):
     - Type: quiz → radio buttons
     - Type: code → validation message
     - Submit button

     showHint(step):
     - Reveal hint text
     - Track hint usage

     updateProgress():
     - Progress bar: X% complete
     - "Step N of M" indicator
     - List of completed steps (checkmarks)

3. Update backend/templates/base.html:
   - Add <div id="lesson-panel"></div>
   - Add <link> to lessonPanel.css
   - Initialize: <script>window.lessonEngine = new LessonEngine();</script>
   - Tutorial mode toggle (show/hide panel)

4. Add mode selector:
   - Toggle switch: Tutorial Mode / Exploration Mode
   - Changes visibility of lesson panel
   - Saves preference to localStorage

IMPORTANT:
- Panel should not block main app content
- Make it collapsible for small screens
- Keyboard navigation (arrow keys for next/prev)
- Clear visual feedback for completed steps
- Smooth animations (transitions)

When complete:
- Commit: "feat: create lesson panel UI component"
- Ask user to enable Tutorial Mode and verify panel appears with Lesson 1
```

**Test Steps**: Toggle Tutorial Mode, verify lesson panel shows Lesson 1 with steps

#### Feature 3.3: Create Lessons 2-4 (Content & JSON)
**Time**: 60min
**Files to create**:
- `/lessons/lesson-2.json`
- `/lessons/lesson-3.json`
- `/lessons/lesson-4.json`

**Agent Prompt**:
```
You are creating lesson content for Lessons 2, 3, and 4.

CONTEXT:
- Lesson 2: Understand Data Flow (10 min)
- Lesson 3: Explore User Model (10 min)
- Lesson 4: Explore Task Model (15 min)
- See PROJECT_BRIEF.md lines 146-162 for objectives

TASK:

1. Create lessons/lesson-2.json:
   - Title: "Understand Data Flow"
   - 4-5 steps walking through a request:
     * Step 1: User clicks "View Tasks"
     * Step 2: Browser sends GET request
     * Step 3: Controller receives request
     * Step 4: Controller calls Model
     * Step 5: Model queries database
     * Step 6: View renders result
   - Checkpoint: "Which layer queries the database?"
   - Reference dev panel tabs in hints

2. Create lessons/lesson-3.json:
   - Title: "Explore the User Model"
   - Steps:
     * Read User model code
     * Understanding validation
     * Create a new user (hands-on)
     * Watch method calls in dev panel
   - Checkpoint: "Add email validation for .edu domains"
   - Provide code template for checkpoint

3. Create lessons/lesson-4.json:
   - Title: "Explore the Task Model"
   - Steps:
     * Understanding relationships (owner, assignee)
     * See foreign keys in database
     * Create task with relationships
     * Observe JOINs in SQL queries
     * Learn about N+1 problem
   - Checkpoint: "Update task status to 'done'"
   - Verify via dev panel Database tab

IMPORTANT:
- Make lessons progressive (build on previous)
- Include interactive elements (not just reading)
- Reference specific files and line numbers
- Use dev panel as primary learning tool
- Write clear, friendly language (not too technical)

When complete:
- Commit: "feat: create lessons 2, 3, and 4 content"
- Ask user to review lesson content for clarity
```

**Test Steps**: Load lessons 2-4, verify content is clear and checkpoints work

#### Feature 3.4: Code Checkpoint Validator
**Time**: 60min
**Files to create**:
- `/backend/utils/checkpoint_validator.py`
- `/backend/controllers/lesson_controller.py`
- Update `/frontend/public/js/lessonEngine.js`

**Agent Prompt**:
```
You are implementing code checkpoint validation for lessons.

CONTEXT:
- Some lessons require students to write code
- Example: "Add validation rule to User model"
- Backend validates the code actually works
- Prevents students from skipping ahead without learning

TASK:

1. Create backend/utils/checkpoint_validator.py:

   - validate_checkpoint(lesson_id, checkpoint_id, submitted_code):
     * Load expected checkpoint requirements
     * Run submitted code safely (sandboxed)
     * Check if requirements met
     * Return: {success: bool, message: str}

   - Validators for specific checkpoints:
     * lesson_3_checkpoint: Verify email validation added
     * lesson_6_checkpoint: Verify status filter works
     * lesson_7_checkpoint: Verify priority update works
     * lesson_8_checkpoint: Verify comments feature works

   - Safety measures:
     * Don't execute arbitrary code (whitelist approaches)
     * Run in isolated context
     * Timeout protection (5 second max)

2. Create backend/controllers/lesson_controller.py:

   - POST /lessons/<id>/checkpoint:
     * Receive submitted code
     * Call validate_checkpoint()
     * Return validation result JSON
     * Track attempt in session

   - GET /lessons/<id>/progress:
     * Return user's progress for lesson
     * Completed steps, checkpoints passed

3. Update frontend/public/js/lessonEngine.js:

   - submitCheckpoint(code):
     * POST code to /lessons/<id>/checkpoint
     * Show validation result
     * If success: unlock next step
     * If fail: show helpful error message

   - renderCodeCheckpoint():
     * Show code editor (textarea with syntax highlighting)
     * Submit button
     * Validation feedback area

IMPORTANT:
- NEVER execute user code directly (security risk)
- Use static analysis where possible (regex, AST parsing)
- For code execution: use restricted environment
- Provide helpful feedback on failures
- Consider using exec() with limited globals (carefully)

When complete:
- Commit: "feat: implement code checkpoint validation"
- Ask user to test Lesson 3 checkpoint submission
```

**Test Steps**: Complete Lesson 3, submit code for checkpoint, verify validation works

#### Feature 3.5: Create Lessons 5-8 (Content & JSON)
**Time**: 90min
**Files to create**:
- `/lessons/lesson-5.json`
- `/lessons/lesson-6.json`
- `/lessons/lesson-7.json`
- `/lessons/lesson-8.json`

**Agent Prompt**:
```
You are creating content for Lessons 5-8 (Controllers, Features, Advanced).

CONTEXT:
- Lesson 5: Controllers (12 min) - understanding orchestration
- Lesson 6: Status Filter (20 min) - first coding exercise
- Lesson 7: Priority Update (25 min) - second coding exercise
- Lesson 8: Comments Feature (45+ min) - advanced multi-part
- See PROJECT_BRIEF.md lines 163-187

TASK:

1. Create lessons/lesson-5.json:
   - Title: "Understand Controllers"
   - Steps:
     * What controllers do (orchestration)
     * Trace TaskController.index request
     * See how controller calls multiple models
     * Understand thin controller principle
   - Checkpoint: Quiz on controller responsibilities

2. Create lessons/lesson-6.json:
   - Title: "Create Task Status Filter"
   - Steps:
     * Part 1: Add byStatus() method to Task model
     * Part 2: Add /tasks?status=done route to controller
     * Part 3: Add filter buttons to view
     * Part 4: Test in browser
   - Checkpoint: Validate filter works, dev panel shows correct query
   - Provide code templates for each part

3. Create lessons/lesson-7.json:
   - Title: "Create Priority Update Feature"
   - Steps:
     * Part 1: Add updatePriority() to Task model
     * Part 2: Add POST /tasks/<id>/priority route
     * Part 3: Add priority dropdown in task view
     * Part 4: Handle validation errors
   - Checkpoint: Update priority, verify in database
   - Similar to Lesson 6 but different feature

4. Create lessons/lesson-8.json:
   - Title: "Build Comments Feature from Scratch"
   - Steps:
     * Part A: Design Comment model (table schema)
     * Part B: Implement Comment CRUD methods
     * Part C: Create CommentController routes
     * Part D: Add comments section to task view
     * Part E: Handle relationships (comment.user, task.comments)
   - Multiple checkpoints (one per part)
   - Final checkpoint: Create comment, see in database
   - This is the capstone lesson

IMPORTANT:
- Lessons 6-8 are hands-on (student writes code)
- Provide clear instructions and templates
- Break down into small steps
- Reference dev panel for verification
- Lesson 8 should feel like a real feature build
- Make success criteria crystal clear

When complete:
- Commit: "feat: create lessons 5-8 content"
- Ask user to review Lesson 8 (most complex) for clarity
```

**Test Steps**: Review all lessons for completeness and clarity

#### Feature 3.6: Lesson Progress Tracking & Persistence
**Time**: 30min
**Files to modify**:
- `/frontend/public/js/lessonEngine.js`

**Agent Prompt**:
```
You are implementing comprehensive lesson progress tracking.

CONTEXT:
- Track which lessons completed
- Track current step within lesson
- Track checkpoint attempts and success
- Persist to localStorage (client-side for now)

TASK:
Update frontend/public/js/lessonEngine.js:

1. Progress data structure:
   ```javascript
   {
     currentLesson: 1,
     currentStep: "1-2",
     completedLessons: [1, 2],
     lessonProgress: {
       1: {completed: true, score: 100, timeSpent: 300},
       2: {completed: false, score: 50, currentStep: "2-3"}
     },
     checkpointAttempts: {
       "3-checkpoint": {attempts: 2, passed: true}
     }
   }
   ```

2. Methods to implement:

   - markStepComplete(lessonId, stepId):
     * Update progress
     * Save to localStorage
     * Unlock next step

   - markLessonComplete(lessonId):
     * Set completed: true
     * Calculate score (based on hints used, attempts)
     * Unlock next lesson

   - canAccessLesson(lessonId):
     * Check if previous lesson completed
     * Return true/false

   - resetProgress():
     * Clear localStorage
     * Start from Lesson 1

   - exportProgress():
     * Generate JSON of progress
     * Allow download for backup

3. UI updates:
   - Show completed lessons with checkmarks
   - Disable locked lessons
   - Display "Continue" button for in-progress lesson
   - Show progress percentage overall

4. Enforcement:
   - Don't allow skipping lessons
   - Don't allow skipping steps within lesson
   - Must pass checkpoints to proceed

IMPORTANT:
- Save progress frequently (after every step)
- Handle localStorage quota exceeded
- Provide "Reset Progress" option (with confirmation)
- Consider future: sync to backend

When complete:
- Commit: "feat: implement lesson progress tracking and persistence"
- Ask user to complete a few steps, reload page, verify progress restored
```

**Test Steps**: Complete steps, reload page, verify progress preserved

---

### Phase 4: Mode Toggle & Polish

**Goal**: Both Tutorial and Exploration modes fully working

#### Feature 4.1: Mode Switcher Component
**Time**: 30min
**Files to create**:
- `/frontend/public/js/modeManager.js`
- `/frontend/public/css/modeManager.css`
- Update `/backend/templates/base.html`

**Agent Prompt**:
```
You are creating the Tutorial/Exploration mode switcher.

CONTEXT:
- Two modes: Tutorial (guided) and Exploration (free)
- Tutorial: lesson panel visible, features locked until taught
- Exploration: full access, dev panel primary tool
- Toggle in UI header

TASK:

1. Create frontend/public/js/modeManager.js:

   - ModeManager class:

     init():
     - Load mode preference from localStorage
     - Apply mode (show/hide lesson panel)
     - Register event listeners

     setMode(mode):
     - 'tutorial' or 'exploration'
     - Save to localStorage
     - Update UI visibility
     - Emit mode change event

     getCurrentMode():
     - Return current mode

     isTutorialMode():
     - Return boolean

     isExplorationMode():
     - Return boolean

2. Create frontend/public/css/modeManager.css:
   - Toggle switch styling (Tutorial ↔ Exploration)
   - Smooth transition animations
   - Active mode highlighted

3. Update backend/templates/base.html:
   - Add mode toggle in header:
     ```html
     <div class="mode-toggle">
       <label>
         <input type="checkbox" id="mode-switch">
         <span>Tutorial Mode</span>
       </label>
     </div>
     ```
   - Initialize: <script>window.modeManager = new ModeManager();</script>

4. Mode behaviors:
   - Tutorial mode:
     * Show lesson panel
     * Hide dev panel toggle (force always visible)
     * Lock features based on lesson progress

   - Exploration mode:
     * Hide lesson panel
     * Show dev panel toggle
     * Unlock all features

IMPORTANT:
- Make toggle prominent and clear
- Show current mode state clearly
- Smooth transitions (no jarring changes)
- Preserve mode preference across sessions

When complete:
- Commit: "feat: create mode switcher component"
- Ask user to toggle between modes and verify UI changes correctly
```

**Test Steps**: Toggle modes, verify lesson panel and dev panel visibility changes

#### Feature 4.2: Feature Locking in Tutorial Mode
**Time**: 45min
**Files to modify**:
- `/frontend/public/js/modeManager.js`
- `/backend/templates/users/index.html`
- `/backend/templates/tasks/index.html`

**Agent Prompt**:
```
You are implementing feature locking based on lesson progress.

CONTEXT:
- In Tutorial Mode, features are locked until relevant lesson completed
- Example: Can't filter tasks until Lesson 6 complete
- Provides structured learning path
- In Exploration Mode: everything unlocked

TASK:

1. Update frontend/public/js/modeManager.js:

   - Feature lock configuration:
     ```javascript
     featureLocks = {
       'task-status-filter': {requiredLesson: 6},
       'task-priority-update': {requiredLesson: 7},
       'comments': {requiredLesson: 8}
     }
     ```

   - isFeatureUnlocked(featureName):
     * If exploration mode: return true
     * If tutorial mode: check lesson progress
     * Return true if required lesson completed

   - lockFeature(element):
     * Add 'locked' class
     * Add tooltip: "Complete Lesson X to unlock"
     * Disable click events

   - unlockFeature(element):
     * Remove 'locked' class
     * Enable click events

2. Update backend/templates/tasks/index.html:
   - Add data-feature attributes:
     ```html
     <div class="status-filter" data-feature="task-status-filter">
       <!-- filter buttons -->
     </div>
     ```

   - On page load: check locks and apply

3. Update backend/templates/users/index.html:
   - Similar pattern for any locked features

4. Visual locked state:
   - Grayed out appearance
   - Lock icon overlay
   - Tooltip on hover
   - Click shows "Unlock in Lesson X" message

IMPORTANT:
- Don't hide features (just lock them)
- Show clear path to unlock
- Make locked state obvious
- Don't frustrate users (clear messaging)

When complete:
- Commit: "feat: implement feature locking in tutorial mode"
- Ask user to test Tutorial Mode with fresh progress (features should be locked)
```

**Test Steps**: Start Tutorial Mode from beginning, verify features locked; complete lessons, verify unlock

#### Feature 4.3: Dev Panel Integration with Lessons
**Time**: 30min
**Files to modify**:
- `/frontend/public/js/devPanel.js`
- `/frontend/public/js/lessonEngine.js`

**Agent Prompt**:
```
You are integrating the dev panel with lessons for guided learning.

CONTEXT:
- In Tutorial Mode, dev panel should highlight relevant info for current lesson
- Example: Lesson 4 (Database) → auto-open Database Inspector tab
- Helps students focus on what matters

TASK:

1. Update frontend/public/js/devPanel.js:

   - highlightTab(tabName):
     * Add pulsing border to tab button
     * Auto-switch to tab
     * Add "Lesson recommends this tab" badge

   - clearHighlights():
     * Remove all lesson-related highlights

   - listenToLessonChanges():
     * Subscribe to lesson step changes
     * Update highlights based on current lesson

2. Update frontend/public/js/lessonEngine.js:

   - Add devPanelHint to lesson steps:
     ```json
     {
       "id": "2-3",
       "devPanelHint": {
         "tab": "methodCalls",
         "message": "Watch the Method Call Stack as you create a user"
       }
     }
     ```

   - When step changes:
     * Emit event with devPanelHint
     * DevPanel listens and responds

3. Lesson step integration:
   - Lesson 2: Highlight Flow Diagram
   - Lesson 3: Highlight Method Calls (User.create)
   - Lesson 4: Highlight Database Inspector (JOINs)
   - Lesson 6-8: Highlight relevant tabs for feature work

IMPORTANT:
- Don't force dev panel open (suggest)
- Make highlights subtle (not annoying)
- Allow students to ignore hints
- Clear highlights when leaving Tutorial Mode

When complete:
- Commit: "feat: integrate dev panel with lesson hints"
- Ask user to go through Lesson 2, verify Flow Diagram tab highlighted
```

**Test Steps**: Start Lesson 2, verify dev panel suggests Flow Diagram tab

#### Feature 4.4: Polish UI/UX and Accessibility
**Time**: 45min
**Files to modify**:
- `/frontend/public/css/devpanel.css`
- `/frontend/public/css/lessonPanel.css`
- `/backend/templates/base.html`

**Agent Prompt**:
```
You are polishing the UI/UX and adding accessibility features.

CONTEXT:
- App should be usable and look professional
- Accessibility: keyboard navigation, screen readers
- Responsive: work on different screen sizes
- Consistent design language

TASK:

1. Update frontend/public/css/devpanel.css:
   - Improve contrast ratios (WCAG AA compliance)
   - Add focus indicators for keyboard navigation
   - Smooth transitions and animations
   - Better typography (readable font sizes)
   - Consistent spacing (use CSS variables)

2. Update frontend/public/css/lessonPanel.css:
   - Match dev panel styling
   - Improve readability
   - Better button states (hover, active, disabled)
   - Progress bar animation

3. Update backend/templates/base.html:
   - Add proper ARIA labels:
     * role="navigation" for nav
     * aria-label for buttons
     * aria-live for dynamic content
   - Semantic HTML (proper headings hierarchy)
   - Skip-to-content link for screen readers
   - Meta tags (viewport, description)

4. Keyboard navigation:
   - Tab key: navigate all interactive elements
   - Escape: close panels
   - Arrow keys: navigate lesson steps
   - Space/Enter: activate buttons
   - Focus visible on all elements

5. Responsive design:
   - Mobile: stack panels vertically
   - Tablet: collapsible panels
   - Desktop: side-by-side layout
   - Use CSS media queries

IMPORTANT:
- Test with keyboard only (no mouse)
- Check color contrast (use tool)
- Validate HTML (no errors)
- Test with screen reader if possible
- Don't sacrifice usability for aesthetics

When complete:
- Commit: "feat: polish UI/UX and add accessibility features"
- Ask user to test keyboard navigation and verify all features accessible
```

**Test Steps**: Navigate entire app with keyboard only, verify all features accessible

#### Feature 4.5: Error Handling & User Feedback
**Time**: 30min
**Files to modify**:
- `/backend/app.py`
- `/frontend/public/js/devPanel.js`
- `/frontend/public/js/lessonEngine.js`

**Agent Prompt**:
```
You are improving error handling and user feedback throughout the app.

CONTEXT:
- Errors should be helpful, not cryptic
- Show user-friendly messages
- Log technical details for debugging
- Graceful degradation when things fail

TASK:

1. Update backend/app.py:

   - Improve error handlers:
     * 404: Helpful message + suggestion
     * 500: User-friendly error + log technical details
     * Database errors: Specific messages

   - Add error logging:
     * Log to file: errors.log
     * Include request context
     * Stack traces for debugging

   - Validation error format:
     * Consistent JSON structure
     * Field-level errors
     * Human-readable messages

2. Update frontend/public/js/devPanel.js:

   - Handle missing __DEBUG__:
     * Show "No debug data" message
     * Don't crash
     * Suggest enabling debug mode

   - Handle malformed data:
     * Try/catch around JSON parsing
     * Show error in panel
     * Preserve user's work

3. Update frontend/public/js/lessonEngine.js:

   - Handle missing lessons:
     * Show "Lesson not found" message
     * Link to available lessons

   - Handle checkpoint failures:
     * Clear error messages
     * Suggestions for fix
     * Don't lock user out

   - Network error handling:
     * Retry logic (3 attempts)
     * Offline mode indicator
     * Save progress locally

4. User feedback improvements:
   - Loading states (spinners)
   - Success messages (green toast)
   - Error messages (red toast)
   - Progress indicators
   - Confirmation dialogs for destructive actions

IMPORTANT:
- Never show stack traces to end users
- Log everything for debugging
- Make error messages actionable
- Preserve user's work on errors
- Test all error paths

When complete:
- Commit: "feat: improve error handling and user feedback"
- Ask user to test error scenarios (e.g., invalid form, missing lesson)
```

**Test Steps**: Submit invalid form, access non-existent lesson, verify helpful errors shown

---

### Phase 5: Deployment & Documentation

**Goal**: Ready to share with others

#### Feature 5.1: Docker Configuration
**Time**: 45min
**Files to create**:
- `/Dockerfile`
- `/docker-compose.yml`
- `/.dockerignore`

**Agent Prompt**:
```
You are creating Docker configuration for easy deployment.

CONTEXT:
- One-command setup: docker-compose up
- Include Python backend, serve frontend static files
- Initialize database on first run
- Development and production modes

TASK:

1. Create Dockerfile:
   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   # Install Python dependencies
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   # Copy application code
   COPY backend/ ./backend/
   COPY frontend/ ./frontend/
   COPY lessons/ ./lessons/

   # Expose port
   EXPOSE 5000

   # Run app
   CMD ["python", "backend/app.py"]
   ```

2. Create docker-compose.yml:
   ```yaml
   version: '3.8'

   services:
     app:
       build: .
       ports:
         - "5000:5000"
       volumes:
         - ./backend:/app/backend
         - ./frontend:/app/frontend
         - ./lessons:/app/lessons
         - db-data:/app/data
       environment:
         - FLASK_ENV=development
         - DATABASE_PATH=/app/data/educational_mvc.db
       command: python backend/app.py

   volumes:
     db-data:
   ```

3. Create .dockerignore:
   - Exclude: __pycache__, *.pyc, .env, node_modules/, *.db
   - Include: backend/, frontend/, lessons/, requirements.txt

4. Database initialization in Docker:
   - Check if DB exists
   - If not: create schema, seed data
   - Mount volume for persistence

IMPORTANT:
- Keep image size small
- Use multi-stage build if needed
- Volume mount for development (hot reload)
- Separate production config
- Document required environment variables

When complete:
- Commit: "feat: add Docker configuration"
- Ask user to test: docker-compose up and access http://localhost:5000
```

**Test Steps**: Run docker-compose up, verify app starts and database initializes

#### Feature 5.2: NPM Scripts and Setup
**Time**: 30min
**Files to modify**:
- `/package.json`

**Agent Prompt**:
```
You are creating comprehensive npm scripts for easy setup and development.

CONTEXT:
- Users should run: npm install → npm start
- Scripts for common tasks (setup, dev, test, clean)
- Cross-platform (Windows, Mac, Linux)

TASK:
Update package.json:

1. Add scripts:
   ```json
   {
     "scripts": {
       "setup": "pip install -r requirements.txt && python backend/database/seed.py",
       "start": "python backend/app.py",
       "dev": "FLASK_ENV=development python backend/app.py",
       "clean": "find . -type f -name '*.pyc' -delete && rm -f *.db",
       "docker:build": "docker-compose build",
       "docker:up": "docker-compose up",
       "docker:down": "docker-compose down",
       "test": "echo 'No tests yet'"
     }
   }
   ```

2. Add package metadata:
   - name: "educational-mvc-app"
   - version: "1.0.0"
   - description: "Interactive MVC learning app"
   - author: Your info
   - license: "MIT"

3. Add helpful npm install message:
   - postinstall script: show setup instructions
   - "Run 'npm run setup' to initialize database"

4. Cross-platform compatibility:
   - Use cross-env for environment variables (Windows)
   - Use rimraf for file deletion (cross-platform)
   - Add as devDependencies

IMPORTANT:
- Test on multiple platforms
- Make scripts intuitive
- Document each script in README
- Handle errors gracefully

When complete:
- Commit: "feat: add comprehensive npm scripts"
- Ask user to test: npm run setup && npm start
```

**Test Steps**: Run npm install, npm run setup, npm start - verify works

#### Feature 5.3: README.md with Setup Instructions
**Time**: 45min
**Files to modify**:
- `/README.md`

**Agent Prompt**:
```
You are writing comprehensive README.md documentation.

CONTEXT:
- First thing users see
- Should enable anyone to set up and run the app
- Explain what it is, why it exists, how to use it
- Link to other docs

TASK:
Update README.md with sections:

1. Header:
   - Project title
   - Badges (Python version, license)
   - One-line description
   - Screenshot (placeholder for now)

2. Overview:
   - What is this app?
   - Who is it for?
   - What will you learn?
   - Link to PROJECT_BRIEF.md

3. Features:
   - MVC architecture (transparent)
   - Developer panel (5 tabs)
   - Tutorial mode (8 lessons)
   - Exploration mode
   - Self-documenting code

4. Quick Start:
   ```bash
   # Option 1: Docker (recommended)
   docker-compose up

   # Option 2: Local setup
   npm install
   npm run setup
   npm start

   # Visit http://localhost:5000
   ```

5. Detailed Setup:
   - Prerequisites (Python 3.11+, Node.js optional)
   - Installation steps
   - Database initialization
   - Running in development mode
   - Troubleshooting common issues

6. Usage:
   - Tutorial Mode: Start Lesson 1
   - Exploration Mode: Create users and tasks
   - Developer Panel: Inspect MVC flow
   - Lessons: Overview of 8 lessons

7. Project Structure:
   - Directory tree
   - Explanation of each folder
   - Key files

8. Learning Path:
   - Recommended order
   - Link to LESSONS.md (next feature)

9. Documentation:
   - Link to ARCHITECTURE.md (next feature)
   - Link to LESSONS.md
   - Link to PROJECT_BRIEF.md

10. Contributing:
    - How to contribute
    - Code style
    - Submitting issues

11. License: MIT

IMPORTANT:
- Clear, concise language
- Code blocks with syntax highlighting
- Links to all relevant docs
- Keep it scannable (headings, lists)
- Include troubleshooting section

When complete:
- Commit: "docs: create comprehensive README"
- Ask user to review README for clarity
```

**Test Steps**: Review README, verify all links work, instructions are clear

#### Feature 5.4: ARCHITECTURE.md Documentation
**Time**: 45min
**Files to create**:
- `/docs/ARCHITECTURE.md`

**Agent Prompt**:
```
You are documenting the technical architecture of the app.

CONTEXT:
- For developers who want to understand how it works
- Explain design decisions
- Reference PROJECT_BRIEF.md philosophy
- Deep technical detail

TASK:
Create docs/ARCHITECTURE.md with sections:

1. Overview:
   - Philosophy: "No magic. Every line of code is inspectable."
   - Goals: Teaching MVC, transparency, hands-on learning

2. Tech Stack:
   - Backend: Python + Flask (why?)
   - Frontend: Vanilla JavaScript (why?)
   - Database: SQLite (why?)
   - Templating: Jinja2 (why?)

3. MVC Architecture:
   - Model layer (responsibilities, examples)
   - View layer (responsibilities, examples)
   - Controller layer (responsibilities, examples)
   - Diagram of data flow

4. Developer Panel Architecture:
   - Request tracking (middleware)
   - Method logging (decorators)
   - Database query logging
   - __DEBUG__ object injection
   - Frontend rendering

5. Lesson Engine Architecture:
   - JSON-based lessons
   - Progress tracking (localStorage)
   - Checkpoint validation
   - Mode system (Tutorial vs Exploration)

6. Database Schema:
   - Users table
   - Tasks table
   - Relationships (foreign keys)
   - Why this structure?

7. Request-Response Flow:
   - Step-by-step walkthrough
   - Example: GET /tasks
   - Trace through all layers
   - Show timing and logging

8. Code Organization:
   - File structure
   - Naming conventions
   - Documentation style
   - Testing approach

9. Design Decisions:
   - Why Flask? (vs Django, FastAPI)
   - Why vanilla JS? (vs React, Vue)
   - Why SQLite? (vs PostgreSQL)
   - Why client-side lesson progress? (vs backend)

10. Future Enhancements:
    - Backend lesson progress sync
    - Automated tests
    - More advanced lessons
    - User authentication

IMPORTANT:
- Technical but readable
- Include diagrams (ASCII art is fine)
- Explain *why* not just *what*
- Reference specific files and line numbers
- Link to code examples

When complete:
- Commit: "docs: create architecture documentation"
- Ask user to review for technical accuracy
```

**Test Steps**: Review ARCHITECTURE.md for completeness and clarity

#### Feature 5.5: LESSONS.md Guide
**Time**: 30min
**Files to create**:
- `/docs/LESSONS.md`

**Agent Prompt**:
```
You are creating a lesson guide for instructors and learners.

CONTEXT:
- Overview of all 8 lessons
- Learning objectives
- What students will build
- Tips for instructors

TASK:
Create docs/LESSONS.md with sections:

1. Introduction:
   - How the lesson system works
   - Tutorial vs Exploration Mode
   - Estimated total time (2-3 hours)

2. Lesson Overview Table:
   | Lesson | Title | Time | Objectives | Checkpoint |
   |--------|-------|------|------------|------------|
   | 1 | Understand MVC | 5min | Learn MVC roles | Quiz |
   | ... | ... | ... | ... | ... |

3. Detailed Lesson Breakdowns:

   For each lesson (1-8):
   - Title and objectives
   - What you'll learn
   - What you'll build (if coding lesson)
   - Key concepts covered
   - Prerequisites
   - Checkpoint description
   - Tips for success
   - Common mistakes to avoid

4. Learning Path:
   - Linear progression (can't skip)
   - Why this order?
   - Each lesson builds on previous

5. Tips for Learners:
   - Use developer panel actively
   - Don't rush checkpoints
   - Experiment in Exploration Mode
   - Read code comments
   - Ask questions

6. Tips for Instructors:
   - How to guide students
   - What to emphasize
   - Common questions
   - Extension activities

7. Troubleshooting:
   - Checkpoint not passing
   - Lesson not loading
   - Progress lost
   - Reset progress

IMPORTANT:
- Clear learning outcomes for each lesson
- Set realistic time expectations
- Encourage active learning
- Make it encouraging (not intimidating)

When complete:
- Commit: "docs: create lesson guide"
- Ask user to review for educational clarity
```

**Test Steps**: Review LESSONS.md, verify lesson descriptions match JSON content

#### Feature 5.6: Final Testing & Bug Fixes
**Time**: 60min
**Files**: Various (as needed)

**Agent Prompt**:
```
You are performing final comprehensive testing and bug fixes.

CONTEXT:
- End-to-end testing of all features
- Fix any bugs found
- Ensure everything works smoothly
- Prepare for release

TASK:

1. Test Tutorial Mode:
   - Start from Lesson 1
   - Complete all 8 lessons
   - Verify checkpoints work
   - Check progress tracking
   - Test locked features
   - Verify dev panel integration

2. Test Exploration Mode:
   - Create users
   - Create tasks with relationships
   - Update and delete
   - Verify dev panel shows correct data
   - All 5 dev panel tabs

3. Test Developer Panel:
   - State Inspector: verify view data
   - Method Calls: verify all methods logged
   - Database Inspector: verify queries shown
   - Network Inspector: verify request details
   - Flow Diagram: verify animation works

4. Test Edge Cases:
   - Invalid form inputs
   - Missing required fields
   - Foreign key constraints
   - Null assignee handling
   - Large datasets

5. Test Deployment:
   - Docker setup
   - Local npm setup
   - Database initialization
   - Fresh install experience

6. Fix Bugs:
   - Document each bug found
   - Fix immediately
   - Test fix
   - Commit with "fix: [description]"

7. Performance Check:
   - Page load times
   - Dev panel rendering
   - Database query optimization
   - No N+1 queries (unless intentional for teaching)

8. Browser Compatibility:
   - Chrome
   - Firefox
   - Safari
   - Edge

IMPORTANT:
- Test like a new user (fresh perspective)
- Don't skip edge cases
- Fix bugs before moving on
- Document workarounds if needed
- Ensure seed data is realistic

When complete:
- Commit: "test: comprehensive end-to-end testing complete"
- Ask user to do final acceptance testing
```

**Test Steps**: Follow the test plan above, user performs final acceptance testing

---

## Summary

### Total Features: 39 micro-features across 5 phases

**Phase 0**: 1 feature (scaffolding)
**Phase 1**: 9 features (Core MVC)
**Phase 2**: 14 features (Async JSON API + Developer Panel)
  - Features 2.1-2.7: Async JSON API architecture (COMPLETED)
  - Features 2.8-2.14: Developer Panel UI and tabs (PENDING)
**Phase 3**: 6 features (Lesson Engine)
**Phase 4**: 5 features (Mode Toggle & Polish)
**Phase 5**: 6 features (Deployment & Docs)

### Estimated Total Time
- Development: ~25-30 hours
- Testing after each feature: ~5-7 hours
- **Total**: ~30-37 hours

### Dependencies
- Each feature builds on previous ones
- Follow order within phases
- Can't skip features
- Test after each commit

### Success Criteria
After completing all features, the app should:
- ✅ Run with one command (docker-compose up)
- ✅ Teach MVC through transparent developer panel
- ✅ Guide learners through 8 structured lessons
- ✅ Allow free exploration after tutorials
- ✅ Be fully documented and shareable
- ✅ Work on all major browsers
- ✅ Handle errors gracefully

---

## Next Steps

1. User reviews and approves this plan
2. Start with Feature 0.1 (Project Scaffolding)
3. Work through features sequentially
4. Test after each commit
5. User acceptance testing at major milestones (end of each phase)

---

**Plan Created**: 2026-01-03
**Last Updated**: 2026-01-03 (Updated for async JSON architecture)
**Status**: Phase 2.1-2.7 Completed, Ready for Phase 2.8 (Dev Panel UI)
**Architecture**: Hybrid dual-mode controllers supporting both traditional HTML and async JSON
**Agent-Friendly**: Yes (detailed prompts included)
