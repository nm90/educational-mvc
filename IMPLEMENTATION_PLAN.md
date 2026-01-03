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

### Phase 2: Method Logging & Developer Panel

**Goal**: Full dev panel showing Python execution (all 5 tabs functional)

*[Rest of the plan continues with all features 2.1-2.10, 3.1-3.6, 4.1-4.5, and 5.1-5.6 - same content as above]*

---

## Summary

### Total Features: 35 micro-features across 5 phases

**Phase 0**: 1 feature (scaffolding)
**Phase 1**: 9 features (Core MVC)
**Phase 2**: 10 features (Developer Panel)
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
**Ready for Implementation**: Yes
**Agent-Friendly**: Yes (detailed prompts included)
**Location**: /home/neil/projects/educational-mvc/IMPLEMENTATION_PLAN.md
