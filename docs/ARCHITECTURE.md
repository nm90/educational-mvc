# Educational MVC App - Technical Architecture

**Version**: 1.0  
**Last Updated**: January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [MVC Architecture](#mvc-architecture)
4. [Developer Panel Architecture](#developer-panel-architecture)
5. [Lesson Engine Architecture](#lesson-engine-architecture)
6. [Database Schema](#database-schema)
7. [Request-Response Flow](#request-response-flow)
8. [Code Organization](#code-organization)
9. [Design Decisions](#design-decisions)
10. [Future Enhancements](#future-enhancements)

---

## Overview

### Philosophy

> **"No magic. Every line of code is inspectable."**

The Educational MVC App is built on the principle of **radical transparency**. Unlike typical web applications that hide their internal workings, this app exposes every method call, database query, and data transformation. This transparency is achieved through comprehensive instrumentation that captures and displays the complete execution flow without modifying the core business logic.

### Goals

1. **Teaching MVC**: Make the Model-View-Controller pattern concrete and visible
2. **Transparency**: Show exactly what happens during each request
3. **Hands-on Learning**: Enable experimentation with immediate feedback
4. **Self-Documentation**: Code that explains architectural decisions inline

### Architecture Principles

- **Separation of Concerns**: Clear boundaries between Model, View, and Controller
- **Request-Scoped Tracking**: All debugging data tied to individual requests
- **Non-Invasive Logging**: Decorators capture data without modifying business logic
- **Progressive Enhancement**: Works with traditional forms and modern JavaScript
- **Educational First**: Code readability and learning take priority over optimization

---

## Tech Stack

### Backend: Python + Flask

**Choice**: Flask 3.0+  
**Why Flask?**

- **Explicit over implicit**: No "magic" - routes and handlers are obvious
- **Minimal boilerplate**: Small learning curve, clear request handling
- **Flexible**: Doesn't enforce strict patterns, allowing us to teach MVC directly
- **Jinja2 templating**: Server-side rendering makes View layer visible
- **Request context**: Flask's `g` object perfect for request-scoped tracking

**vs Django**: Django's ORM and admin interface add too much abstraction  
**vs FastAPI**: Async patterns add complexity; Flask's simplicity better for learning

### Frontend: Vanilla JavaScript

**Choice**: ES6+ JavaScript (no framework)  
**Why Vanilla?**

- **No framework magic**: Every DOM manipulation is explicit
- **Clear client-server boundary**: JavaScript = client, Python = server
- **Focus on MVC**: No React state management or Vue reactivity to explain
- **Progressive enhancement**: Works with traditional forms, enhanced with fetch()
- **Developer panel transparency**: Direct access to `window.__DEBUG__` object

**vs React**: Would shift focus to React patterns instead of MVC  
**vs Vue**: Component abstraction hides request/response cycle  
**vs jQuery**: Modern ES6+ syntax is more readable and widely adopted

### Database: SQLite

**Choice**: SQLite 3  
**Why SQLite?**

- **Zero setup**: File-based, no server configuration
- **Embedded**: Runs in-process, no network overhead
- **SQL transparency**: Raw SQL visible (not hidden by heavy ORM)
- **Perfect for learning**: Full relational database without infrastructure
- **Portable**: Database file can be reset, shared, inspected with tools

**vs PostgreSQL**: Requires server setup, authentication, configuration  
**vs MySQL**: Same setup overhead as PostgreSQL  
**vs In-Memory DB**: Data persists across restarts (better for learning)

### Templating: Jinja2

**Choice**: Jinja2 (Flask's default)  
**Why Jinja2?**

- **Server-side rendering**: Makes View layer explicit
- **Similar to ERB/Blade**: Transferable skills to Rails, Laravel
- **Template inheritance**: Demonstrates DRY principles (`base.html` → child templates)
- **Context variables**: Shows exactly what data View receives from Controller
- **Minimal logic**: Encourages keeping logic in Model/Controller (where it belongs)

**Key Pattern**: Controllers pass data → Jinja2 renders HTML → Browser displays

---

## MVC Architecture

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                         USER REQUEST                         │
│                    (Browser → Flask Route)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                          │
│  Files: backend/controllers/*_controller.py                  │
│                                                               │
│  Responsibilities:                                            │
│  • Receive HTTP requests (GET, POST, PUT, DELETE)            │
│  • Extract and validate request parameters                   │
│  • Call appropriate Model methods                            │
│  • Handle exceptions from Model layer                        │
│  • Prepare data for View (formatting, selecting fields)      │
│  • Render template with data OR return JSON                  │
│  • Set HTTP status codes and headers                         │
│                                                               │
│  ⚠️  Controllers DO NOT:                                     │
│  • Validate business rules (that's Model's job)              │
│  • Write SQL queries (that's Model's job)                    │
│  • Contain HTML (that's View's job)                          │
│  • Perform calculations (that's Model's job)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       MODEL LAYER                            │
│  Files: backend/models/*.py                                  │
│                                                               │
│  Responsibilities:                                            │
│  • Define data structures and relationships                  │
│  • Validate business rules (email format, required fields)   │
│  • Interact with database (CRUD operations)                  │
│  • Implement business logic (status transitions, etc.)       │
│  • Return clean data structures (dicts, lists)               │
│  • Raise exceptions for validation errors                    │
│                                                               │
│  ⚠️  Models DO NOT:                                          │
│  • Know about HTTP requests/responses                        │
│  • Render HTML or format data for display                    │
│  • Redirect users or set flash messages                      │
│  • Import Flask request/response objects                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│  Files: backend/database/connection.py, schema.sql           │
│                                                               │
│  • SQLite database with foreign key constraints              │
│  • Connection wrapper logs all queries                       │
│  • Parameterized queries prevent SQL injection               │
│  • Indexes optimize common queries                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (Data flows back up)
┌─────────────────────────────────────────────────────────────┐
│                        VIEW LAYER                            │
│  Files: backend/templates/*.html                             │
│                                                               │
│  Responsibilities:                                            │
│  • Receive data from Controller (context variables)          │
│  • Render HTML with data (loops, conditionals)               │
│  • Display information to user                               │
│  • Provide forms for user input                              │
│  • Link to CSS and JavaScript                                │
│                                                               │
│  ⚠️  Views DO NOT:                                           │
│  • Contain business logic or validation                      │
│  • Query the database directly                               │
│  • Perform calculations (beyond simple formatting)           │
│  • Make decisions about what data to show                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       RENDERED HTML                          │
│                   (Response → Browser)                       │
└─────────────────────────────────────────────────────────────┘
```

### Example: Creating a Task

**Flow Trace**:

1. **User Action**: Submits form with title, description, priority
2. **Controller** (`task_controller.py`):
   ```python
   @tasks_bp.route('/tasks/new', methods=['POST'])
   @log_method_call
   def create():
       # Extract form data (Controller responsibility)
       title = request.form.get('title')
       description = request.form.get('description')
       priority = request.form.get('priority', 'medium')
       owner_id = request.form.get('owner_id')
       
       try:
           # Call Model to create task (Model responsibility)
           task = Task.create(
               title=title,
               description=description,
               priority=priority,
               owner_id=owner_id
           )
           
           # Prepare data for View (Controller responsibility)
           return tracked_render_template('tasks/show.html', task=task)
       
       except ValueError as e:
           # Handle validation error (Controller responsibility)
           return render_template('tasks/new.html', error=str(e)), 400
   ```

3. **Model** (`task.py`):
   ```python
   @log_method_call
   def create(title, description, priority, owner_id, assignee_id=None):
       """Model handles validation and database interaction."""
       # Validate business rules (Model responsibility)
       Task.validate(title, description, priority, owner_id)
       
       # Insert into database (Model responsibility)
       conn = get_db()
       cursor = conn.cursor()
       cursor.execute("""
           INSERT INTO tasks (title, description, priority, owner_id, assignee_id)
           VALUES (?, ?, ?, ?, ?)
       """, (title, description, priority, owner_id, assignee_id))
       conn.commit()
       
       # Return clean data structure (Model responsibility)
       task_id = cursor.lastrowid
       return Task.find(task_id)
   ```

4. **View** (`tasks/show.html`):
   ```html
   <!-- View renders data received from Controller -->
   <h1>{{ task.title }}</h1>
   <p>{{ task.description }}</p>
   <span class="priority-{{ task.priority }}">{{ task.priority }}</span>
   <p>Owner: {{ task.owner.name }}</p>
   ```

### Key Files

| File | Layer | Purpose |
|------|-------|---------|
| `backend/controllers/task_controller.py` | Controller | Task routes and request handling |
| `backend/controllers/user_controller.py` | Controller | User routes and request handling |
| `backend/models/task.py` | Model | Task business logic and validation |
| `backend/models/user.py` | Model | User business logic and validation |
| `backend/templates/tasks/*.html` | View | Task display templates |
| `backend/templates/users/*.html` | View | User display templates |

---

## Developer Panel Architecture

The Developer Panel is the core innovation that makes MVC transparent. It captures and displays every aspect of request processing.

### How It Works

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: Request Initialization (before_request middleware)   │
│  File: backend/utils/request_tracker.py:111-149              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
         Generate UUID → Store in flask.g.request_id
         Initialize g.tracking = {
             'method_calls': [],
             'db_queries': [],
             'timing': {...},
             'view_data': {},
             'request_info': {...}
         }

┌──────────────────────────────────────────────────────────────┐
│  STEP 2: Method Logging (@log_method_call decorator)         │
│  File: backend/utils/decorators.py:29-159                    │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
         Every Model method decorated with @log_method_call
         Decorator captures:
         • Method name (e.g., "Task.create")
         • Arguments (args and kwargs)
         • Return value
         • Execution time (in milliseconds)
         • Timestamp
         
         Stores in g.tracking['method_calls'].append(...)

┌──────────────────────────────────────────────────────────────┐
│  STEP 3: Database Query Logging                              │
│  File: backend/database/connection.py                         │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
         Database wrapper intercepts all SQL queries
         Captures:
         • Query text ("SELECT * FROM users WHERE id = ?")
         • Parameters ([1])
         • Result row count
         • Execution time
         
         Stores in g.tracking['db_queries'].append(...)

┌──────────────────────────────────────────────────────────────┐
│  STEP 4: View Data Tracking                                  │
│  File: backend/utils/request_tracker.py:384-424              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
         tracked_render_template() wrapper captures context
         Before rendering, stores all template variables:
         {'users': [...], 'current_user': {...}, ...}
         
         Stores in g.tracking['view_data']

┌──────────────────────────────────────────────────────────────┐
│  STEP 5: Response Injection (after_request middleware)       │
│  File: backend/utils/request_tracker.py:151-223              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
         After controller finishes, but before sending response:
         1. Collect all tracking data from g.tracking
         2. JSON.stringify() the complete __DEBUG__ object
         3. Inject as <script>window.__DEBUG__ = {...};</script>
         4. Insert before </body> tag in HTML response
         
         Response now contains:
         • Original HTML content
         • Complete execution trace in window.__DEBUG__

┌──────────────────────────────────────────────────────────────┐
│  STEP 6: Developer Panel Rendering                           │
│  File: backend/static/js/devPanel.js                         │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
         JavaScript reads window.__DEBUG__ and populates:
         
         TAB 1 - State Inspector:
         • Shows view_data object
         • Nested object explorer (click to expand)
         • Data types and values
         
         TAB 2 - Method Call Stack:
         • Tree view of method_calls array
         • Expandable to show args, kwargs, return values
         • Execution time per method
         
         TAB 3 - Flow Diagram:
         • Animated visualization of MVC flow
         • Highlights: Controller → Model → DB → View
         • Timing information for each phase
         
         TAB 4 - Network Inspector:
         • Shows request_info object
         • HTTP method, URL, headers, status code
         • Which controller handled the request
         
         TAB 5 - Database Inspector:
         • Lists all db_queries
         • SQL text, parameters, row counts
         • Execution time per query
         • Identifies N+1 problems
```

### Key Implementation Details

#### Request-Scoped Storage

Flask's `g` object provides request-scoped storage that's automatically cleaned up:

```python
# File: backend/utils/request_tracker.py:111-136
def before_request():
    """Initialize tracking for each request."""
    g.request_id = str(uuid.uuid4())  # Unique ID per request
    g.tracking = init_request_tracking()  # Fresh tracking dict
```

**Why `g`?**
- Automatically created/destroyed per request
- Thread-safe (each request gets its own `g`)
- Available throughout request lifecycle
- No manual cleanup needed

#### Decorator Pattern for Logging

The `@log_method_call` decorator adds logging without modifying method code:

```python
# File: backend/utils/decorators.py:29-159
@log_method_call
def create(name, email):
    # Method code stays clean - no logging logic here
    validate(name, email)
    # ... database operations ...
    return new_user
```

**How it works**:
1. Decorator wraps the function
2. Records start time before calling function
3. Calls actual function and captures result
4. Records end time and calculates duration
5. Stores method name, args, result, duration in `g.tracking`
6. Returns original result (transparent to caller)

#### Debug Object Injection

After the controller finishes but before sending response:

```python
# File: backend/utils/request_tracker.py:191-217
def after_request(response):
    """Inject __DEBUG__ into HTML responses."""
    if 'text/html' in response.content_type:
        # Get HTML as string
        html = response.get_data(as_text=True)
        
        # Build debug object
        debug = {
            'request_id': g.request_id,
            'method_calls': g.tracking['method_calls'],
            'db_queries': g.tracking['db_queries'],
            'timing': g.tracking['timing'],
            'view_data': g.tracking['view_data'],
            'request_info': g.tracking['request_info']
        }
        
        # Inject before </body>
        script = f'<script>window.__DEBUG__ = {json.dumps(debug)};</script>'
        html = html.replace('</body>', f'{script}</body>')
        
        response.set_data(html)
    
    return response
```

**Why before `</body>`?**
- Ensures DOM is loaded before scripts run
- Easy to find when viewing page source
- Doesn't interfere with `<head>` content

### Developer Panel Tabs

| Tab | Data Source | Purpose |
|-----|-------------|---------|
| **State Inspector** | `__DEBUG__.view_data` | Shows data passed to template |
| **Method Call Stack** | `__DEBUG__.method_calls` | Shows all Python method invocations |
| **Flow Diagram** | `__DEBUG__.timing` + `method_calls` | Visualizes MVC request flow |
| **Network Inspector** | `__DEBUG__.request_info` | Shows HTTP request/response details |
| **Database Inspector** | `__DEBUG__.db_queries` | Shows all SQL queries executed |

---

## Lesson Engine Architecture

The Lesson Engine provides structured, progressive learning through 8 lessons.

### JSON-Based Lessons

Lessons are stored as JSON files in `lessons/` directory:

```json
{
  "id": 3,
  "title": "Explore User Model",
  "duration": "10 min",
  "type": "interactive",
  "objectives": [
    "Understand model validation",
    "See model methods in action",
    "Inspect method calls in developer panel"
  ],
  "steps": [
    {
      "id": 1,
      "title": "Open User Model",
      "description": "Navigate to backend/models/user.py",
      "code_reference": "backend/models/user.py:1-50",
      "hints": ["Look for @log_method_call decorator", "Find validate() method"]
    },
    {
      "id": 2,
      "title": "Create a User",
      "description": "Use the form to create a new user",
      "action": "create_user",
      "validation": "user_created"
    }
  ],
  "checkpoint": {
    "type": "code",
    "task": "Add email domain validation",
    "test": "user_email_validation"
  }
}
```

**Why JSON?**
- Easy to edit without recompiling
- Can be dynamically loaded
- Separates content from code
- Future: Load lessons from API/database

### Progress Tracking (localStorage)

Lesson progress is stored client-side:

```javascript
// File: backend/static/js/lessons.js
const progress = {
  current_lesson: 3,
  completed_lessons: [1, 2],
  lesson_3_progress: {
    current_step: 2,
    completed_steps: [1],
    attempts: 1,
    started_at: 1234567890
  },
  mode: 'tutorial' // or 'exploration'
};

localStorage.setItem('mvc_lesson_progress', JSON.stringify(progress));
```

**Why localStorage?**
- No backend authentication needed (simpler for learning)
- Progress persists across sessions
- No database schema needed for lessons
- Can be reset easily for testing
- Future: sync to backend for multi-device

### Checkpoint Validation

Lessons 6-8 include coding challenges with validation:

```javascript
// File: backend/static/js/lessons.js
function validateCheckpoint(lesson_id, checkpoint_data) {
  switch (lesson_id) {
    case 6:
      // Task Status Filter checkpoint
      // Verify: Task.byStatus() method exists
      // Verify: Filter query parameter works
      // Verify: Dev panel shows correct query
      return checkTaskStatusFilter();
    
    case 7:
      // Priority Update checkpoint
      // Verify: POST /tasks/:id/priority endpoint works
      // Verify: Validation prevents invalid priorities
      return checkPriorityUpdate();
    
    case 8:
      // Comments Feature checkpoint (multi-part)
      // Part A: Comment model exists
      // Part B: CommentController exists
      // Part C: Comments appear in task view
      // Part D: Relationships work correctly
      return checkCommentsFeature();
  }
}
```

**Validation Approach**:
- Check for specific files/functions (AST parsing if needed)
- Test actual functionality (make request, verify response)
- Inspect developer panel for correct method calls/queries
- Progressive hints if checkpoint fails

### Mode System (Tutorial vs Exploration)

The app has two modes:

**Tutorial Mode**:
- Guided lesson progression
- Features locked until lessons completed
- Dev panel highlights relevant information
- Lesson sidebar always visible
- Checkpoints required to advance

**Exploration Mode**:
- No restrictions
- All features unlocked
- Full CRUD access
- Dev panel always available
- No lesson progression

Toggle stored in localStorage:
```javascript
localStorage.setItem('mvc_mode', 'tutorial'); // or 'exploration'
```

---

## Database Schema

### Entity-Relationship Diagram

```
┌─────────────────────────────┐
│          USERS              │
├─────────────────────────────┤
│ id         INTEGER PK       │
│ name       TEXT NOT NULL    │
│ email      TEXT NOT NULL    │◄───┐
│            UNIQUE           │    │
│ created_at DATETIME         │    │
└─────────────────────────────┘    │
                                   │
                                   │ Foreign Key
                                   │ (owner_id)
                                   │
┌─────────────────────────────┐    │
│          TASKS              │    │
├─────────────────────────────┤    │
│ id          INTEGER PK      │    │
│ title       TEXT NOT NULL   │    │
│ description TEXT            │    │
│ status      TEXT NOT NULL   │    │
│             CHECK (...)     │    │
│ priority    TEXT NOT NULL   │    │
│             CHECK (...)     │    │
│ owner_id    INTEGER ────────┼────┘
│             NOT NULL        │
│ assignee_id INTEGER ────────┼───┐
│             NULL OK         │   │
│ created_at  DATETIME        │   │
│ updated_at  DATETIME        │   │
└─────────────────────────────┘   │
                                  │ Foreign Key
                                  │ (assignee_id)
                                  │
                                  ▼
                         (Also references USERS)
```

### Tables

#### Users Table

```sql
-- File: backend/database/schema.sql:23-43
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

**Key Points**:
- `id`: Auto-incrementing primary key
- `email`: UNIQUE constraint prevents duplicate accounts
- Index on `email` for fast lookups during authentication
- `created_at`: Automatic timestamp on row creation

#### Tasks Table

```sql
-- File: backend/database/schema.sql:54-111
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Status enum with CHECK constraint
    status TEXT NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'in-progress', 'done')),
    
    -- Priority enum with CHECK constraint
    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Foreign keys to users table
    owner_id INTEGER NOT NULL,
    assignee_id INTEGER,  -- Can be NULL
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_tasks_owner
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_tasks_assignee
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for foreign keys and common queries
CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
```

**Key Points**:
- CHECK constraints enforce valid enum values
- `owner_id` required (every task has a creator)
- `assignee_id` optional (tasks can be unassigned)
- `ON DELETE CASCADE`: Deleting user deletes their owned tasks
- `ON DELETE SET NULL`: Deleting user unassigns their assigned tasks
- Composite index on `(status, priority)` optimizes filtered queries

### Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Tasks (owned) | One-to-Many | One user can own many tasks |
| User → Tasks (assigned) | One-to-Many | One user can be assigned many tasks |
| Task → User (owner) | Many-to-One | Each task has one owner |
| Task → User (assignee) | Many-to-One | Each task may have one assignee |

### Why This Structure?

**Educational Value**:
- **Foreign Keys**: Demonstrates relationships and referential integrity
- **JOINs**: Lesson 4 shows how to fetch task with owner details in one query
- **N+1 Problem**: Can demonstrate by fetching tasks one-by-one vs batch fetch
- **Indexes**: Show performance difference with/without indexes
- **Constraints**: Show database-level validation vs application-level

**Realistic Complexity**:
- Simple enough to understand quickly
- Complex enough to demonstrate real patterns
- Multiple relationships (owner vs assignee)
- Nullable foreign keys (optional assignment)

---

## Request-Response Flow

### Complete Example: GET /tasks

Let's trace a request through every layer with exact timing:

```
T=0ms: User clicks "View Tasks" link
       Browser sends: GET /tasks HTTP/1.1
       
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T=1ms: Flask receives request
       
       ┌─────────────────────────────────────────────────────────┐
       │ before_request() middleware                             │
       │ File: backend/utils/request_tracker.py:111              │
       │                                                          │
       │ • Generate request_id: "abc123..."                      │
       │ • Initialize g.tracking = {}                            │
       │ • Record timing.request_start = 1234567890.001          │
       └─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T=2ms: Route to controller
       
       ┌─────────────────────────────────────────────────────────┐
       │ Flask routing matches: GET /tasks                       │
       │ Calls: TaskController.index()                           │
       │ File: backend/controllers/task_controller.py:25         │
       └─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T=3ms: Controller calls Model
       
       ┌─────────────────────────────────────────────────────────┐
       │ @tasks_bp.route('/tasks')                               │
       │ @log_method_call                                        │
       │ def index():                                            │
       │     # Extract query parameters                          │
       │     status_filter = request.args.get('status')          │
       │                                                          │
       │     # Call Model to get tasks                           │
       │     if status_filter:                                   │
       │         tasks = Task.by_status(status_filter) ───┐      │
       │     else:                                         │      │
       │         tasks = Task.get_all() ───────────────────┼─┐   │
       │                                                   │ │   │
       │     # Prepare data for View                      │ │   │
       │     return tracked_render_template(...) ─────────┼─┼──┐│
       └───────────────────────────────────────────────────┼─┼──┼┘
                                                           │ │  │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━│━━│
T=4ms: Model method called                                │ │  │
                                                           ▼ │  │
       ┌─────────────────────────────────────────────────────┼──┼┐
       │ Task.get_all()                                   │  │  ││
       │ File: backend/models/task.py:45                  │  │  ││
       │                                                  │  │  ││
       │ @log_method_call  ◄── Decorator logs this call  │  │  ││
       │ def get_all():                                   │  │  ││
       │     conn = get_db() ────────────────────────┐    │  │  ││
       │     cursor = conn.cursor()                  │    │  │  ││
       │                                             │    │  │  ││
       │     cursor.execute("""                      │    │  │  ││
       │         SELECT t.*,                         │    │  │  ││
       │                u_owner.name as owner_name,  │    │  │  ││
       │                u_assignee.name as assignee_name │ │ ││
       │         FROM tasks t                        │    │  │  ││
       │         LEFT JOIN users u_owner             │    │  │  ││
       │             ON t.owner_id = u_owner.id      │    │  │  ││
       │         LEFT JOIN users u_assignee          │    │  │  ││
       │             ON t.assignee_id = u_assignee.id│    │  │  ││
       │         ORDER BY t.created_at DESC          │    │  │  ││
       │     """)  ──────────────────────────────────┼─┐  │  │  ││
       │                                             │ │  │  │  ││
       │     return [dict(row) for row in cursor]    │ │  │  │  ││
       └─────────────────────────────────────────────┼─┼──┼──┼──┼┘
                                                     │ │  │  │  │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━│━━│━━│━━│
T=5ms: Database query executed                      ▼ │  │  │  │
                                                      │  │  │  │
       ┌──────────────────────────────────────────────┼──┼──┼──┼┐
       │ Database wrapper (connection.py)          │  │  │  │  ││
       │                                           │  │  │  │  ││
       │ • Logs query to g.tracking['db_queries']  │  │  │  │  ││
       │ • Executes SQL against SQLite             │  │  │  │  ││
       │ • Returns rows (3 tasks found)            │  │  │  │  ││
       │ • Duration: 2.3ms                         │  │  │  │  ││
       └──────────────────────────────────────────────┼──┼──┼──┼┘
                                                      │  │  │  │
       Log entry added to g.tracking['db_queries']:   │  │  │  │
       {                                              │  │  │  │
         'query': 'SELECT t.*, ...',                  │  │  │  │
         'params': [],                                │  │  │  │
         'result_row_count': 3,                       │  │  │  │
         'duration_ms': 2.3                           │  │  │  │
       }                                              │  │  │  │
                                                      │  │  │  │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━│━━│━━│
T=7ms: Model returns data to Controller               │  │  │  │
                                                      ▼  │  │  │
       tasks = [                                        │  │  │
         {'id': 1, 'title': 'Buy milk', ...},           │  │  │
         {'id': 2, 'title': 'Write docs', ...},         │  │  │
         {'id': 3, 'title': 'Deploy app', ...}          │  │  │
       ]                                                │  │  │
                                                        │  │  │
       Log entry added to g.tracking['method_calls']:   │  │  │
       {                                                │  │  │
         'method_name': 'Task.get_all',                 │  │  │
         'args': [],                                    │  │  │
         'kwargs': {},                                  │  │  │
         'return_value': [...],                         │  │  │
         'duration_ms': 3.5                             │  │  │
       }                                                │  │  │
                                                        │  │  │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━│━━│
T=8ms: Controller prepares View data                   │  │  │
                                                        │  │  │
       Controller has tasks, now renders template ─────┼──┼──┘
                                                        │  │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━│━━━
T=9ms: Render template                                 │  │
                                                        ▼  │
       ┌──────────────────────────────────────────────────┼───┐
       │ tracked_render_template('tasks/index.html',   │  │   │
       │                         tasks=tasks)          │  │   │
       │                                               │  │   │
       │ • Calls track_view_data({'tasks': tasks}) ◄───┼──┘   │
       │ • Renders Jinja2 template                    │       │
       │ • Returns HTML string                        │       │
       └──────────────────────────────────────────────────────┘
       
       View data logged to g.tracking['view_data']:
       {
         'tasks': [
           {'id': 1, 'title': 'Buy milk', ...},
           ...
         ]
       }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T=12ms: Template rendering complete
       
       HTML generated:
       <!DOCTYPE html>
       <html>
       <head>...</head>
       <body>
         <h1>Tasks</h1>
         <ul>
           <li>Buy milk</li>
           <li>Write docs</li>
           <li>Deploy app</li>
         </ul>
       </body>
       </html>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T=13ms: after_request() middleware
       
       ┌─────────────────────────────────────────────────────────┐
       │ after_request() middleware                              │
       │ File: backend/utils/request_tracker.py:151              │
       │                                                          │
       │ • Record timing.request_end = 1234567890.013            │
       │ • Build __DEBUG__ object from g.tracking                │
       │ • JSON.stringify(__DEBUG__)                             │
       │ • Inject before </body> tag:                            │
       │   <script>window.__DEBUG__ = {...};</script>            │
       └─────────────────────────────────────────────────────────┘
       
       Modified HTML now contains:
       ...
         <script>window.__DEBUG__ = {
           "request_id": "abc123...",
           "method_calls": [
             {"method_name": "Task.get_all", ...}
           ],
           "db_queries": [
             {"query": "SELECT t.*, ...", ...}
           ],
           "timing": {
             "request_start": 1234567890.001,
             "request_end": 1234567890.013
           },
           "view_data": {
             "tasks": [...]
           },
           "request_info": {
             "method": "GET",
             "url": "/tasks",
             "status": 200
           }
         };</script>
       </body>
       </html>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T=15ms: Flask sends response
       
       HTTP/1.1 200 OK
       Content-Type: text/html; charset=utf-8
       Content-Length: 5432
       
       <!DOCTYPE html>...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T=50ms: Browser receives response (network latency)
       
       1. Browser parses HTML
       2. Renders task list
       3. Executes <script> tags
       4. window.__DEBUG__ becomes available to JavaScript

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T=60ms: Developer Panel initializes
       
       ┌─────────────────────────────────────────────────────────┐
       │ devPanel.js reads window.__DEBUG__                      │
       │ File: backend/static/js/devPanel.js                     │
       │                                                          │
       │ • State Inspector: Displays view_data                   │
       │ • Method Stack: Displays method_calls tree              │
       │ • Flow Diagram: Animates request flow                   │
       │ • Network: Displays request_info                        │
       │ • Database: Displays db_queries                         │
       └─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T=70ms: Page fully rendered
       
       User sees:
       • Task list with 3 tasks
       • Developer panel with 5 tabs
       • Complete execution trace
```

### Timing Breakdown

| Phase | Duration | What Happened |
|-------|----------|---------------|
| Middleware init | 1ms | Generate request ID, initialize tracking |
| Routing | 1ms | Flask matches route to controller |
| Controller logic | 1ms | Extract parameters, prepare to call model |
| Model method | 3.5ms | Call Task.get_all(), includes DB query |
| Database query | 2.3ms | Execute SQL, fetch rows |
| Template rendering | 3ms | Jinja2 renders HTML with data |
| Debug injection | 2ms | Build and inject __DEBUG__ object |
| **Total server time** | **15ms** | Ready to send response |
| Network | 35ms | Browser receives response |
| Client-side | 10ms | Parse HTML, execute JS, render panel |
| **Total end-to-end** | **70ms** | User sees complete page |

---

## Code Organization

### File Structure

```
backend/
├── app.py                      # Application entry point
│                               # - Flask app initialization
│                               # - Blueprint registration
│                               # - Middleware setup
│                               # - Error handlers
│
├── controllers/                # Controller layer
│   ├── __init__.py
│   ├── task_controller.py      # Task CRUD routes
│   ├── user_controller.py      # User CRUD routes
│   └── lesson_controller.py    # Lesson endpoints
│
├── models/                     # Model layer
│   ├── __init__.py
│   ├── task.py                 # Task model with validation
│   └── user.py                 # User model with validation
│
├── database/                   # Database layer
│   ├── __init__.py
│   ├── connection.py           # SQLite connection wrapper
│   ├── schema.sql              # Table definitions
│   └── seed.py                 # Sample data initialization
│
├── utils/                      # Utilities / Cross-cutting concerns
│   ├── __init__.py
│   ├── decorators.py           # @log_method_call decorator
│   ├── request_tracker.py      # Request tracking middleware
│   ├── response_helpers.py     # JSON response helpers
│   └── checkpoint_validator.py # Lesson checkpoint validation
│
├── templates/                  # View layer (Jinja2 templates)
│   ├── base.html               # Base layout (inherited by all)
│   ├── home.html               # Home page
│   ├── tasks/
│   │   ├── index.html          # List all tasks
│   │   ├── show.html           # Task detail
│   │   ├── new.html            # Create task form
│   │   └── edit.html           # Edit task form
│   └── users/
│       ├── index.html          # List all users
│       ├── show.html           # User detail
│       ├── new.html            # Create user form
│       └── edit.html           # Edit user form
│
└── static/                     # Static assets
    ├── css/
    │   ├── main.css            # Application styles
    │   ├── devpanel.css        # Developer panel styles
    │   └── lessons.css         # Lesson panel styles
    └── js/
        ├── main.js             # Application initialization
        ├── devPanel.js         # Developer panel component
        ├── lessons.js          # Lesson engine
        ├── mvc-api.js          # API client wrapper
        └── mvc-forms.js        # Form interception handler
```

### Naming Conventions

**Files**:
- Controllers: `{resource}_controller.py` (e.g., `task_controller.py`)
- Models: `{resource}.py` (e.g., `task.py`)
- Templates: `{resource}/{action}.html` (e.g., `tasks/index.html`)
- Blueprints: `{resource}s_bp` (e.g., `tasks_bp`, `users_bp`)

**Functions/Methods**:
- Controller actions: `index`, `show`, `new`, `create`, `edit`, `update`, `destroy`
- Model methods: `get_all`, `find`, `create`, `update`, `delete`, `validate`
- Utilities: descriptive verbs (`log_method_call`, `track_view_data`)

**Variables**:
- Descriptive names: `task`, `tasks`, `user`, `users`
- Avoid abbreviations: `description` not `desc`, `assignee` not `asgn`
- Query params: `{field}_filter`, `{field}_sort` (e.g., `status_filter`)

### Documentation Style

Every file includes:

1. **Module Docstring**:
   ```python
   """
   Brief description of file.
   
   MVC Role: Model / Controller / View / Utilities
   - Responsibility 1
   - Responsibility 2
   
   Learning Purpose:
   - What concept does this demonstrate?
   - Why is it structured this way?
   
   Covered in: Lesson X, Lesson Y
   """
   ```

2. **Function Docstrings**:
   ```python
   def create(title, description, priority, owner_id):
       """
       Create a new task.
       
       MVC Flow:
       1. Controller receives form data
       2. Calls this Model method
       3. Model validates data
       4. Model inserts into database
       5. Returns task dict to Controller
       
       Args:
           title (str): Task title
           description (str): Task description
           priority (str): 'low', 'medium', or 'high'
           owner_id (int): User ID of task creator
       
       Returns:
           dict: Created task with all fields
       
       Raises:
           ValueError: If validation fails
       
       Dev Panel Shows:
       - Method call with arguments
       - Validation being called
       - INSERT query being executed
       - Return value (new task)
       """
   ```

3. **Inline Comments**:
   ```python
   # ✅ DO: Keep validation in Model layer
   # This ensures business rules are enforced consistently
   # regardless of how the task is created (web form, API, CLI)
   Task.validate(title, description, priority, owner_id)
   
   # ⚠️ DON'T: Put validation in Controller
   # Controllers should orchestrate, not validate
   # if len(title) < 3:
   #     return error_response("Title too short")
   ```

### Testing Approach

Currently manual testing during development. Future test structure:

```
tests/
├── unit/
│   ├── test_user_model.py      # Model validation tests
│   ├── test_task_model.py      # Model business logic tests
│   └── test_decorators.py      # Decorator functionality tests
│
├── integration/
│   ├── test_user_controller.py # Controller route tests
│   ├── test_task_controller.py # Controller route tests
│   └── test_database.py        # Database connection tests
│
└── e2e/
    ├── test_lesson_flow.py     # Complete lesson progression
    └── test_crud_flow.py       # Full CRUD cycle tests
```

---

## Design Decisions

### Why Flask? (vs Django, FastAPI)

**Chosen: Flask**

| Criterion | Flask | Django | FastAPI |
|-----------|-------|--------|---------|
| Learning curve | ✅ Low | ❌ Steep | ✅ Low |
| Explicit routing | ✅ Yes | ⚠️  Magic | ✅ Yes |
| MVC visibility | ✅ Clear | ❌ Hidden | ⚠️  API-focused |
| Template rendering | ✅ Jinja2 | ✅ Django Templates | ❌ Not primary |
| Request context | ✅ Simple | ⚠️  Complex | ⚠️  Async |
| Educational fit | ✅ Perfect | ❌ Too opinionated | ⚠️  Too modern |

**Decision**: Flask's simplicity and explicitness make MVC patterns visible. No "magic" to explain.

### Why Vanilla JS? (vs React, Vue, jQuery)

**Chosen: Vanilla JavaScript (ES6+)**

| Criterion | Vanilla JS | React | Vue | jQuery |
|-----------|------------|-------|-----|--------|
| No framework abstraction | ✅ Yes | ❌ Virtual DOM | ❌ Reactivity | ⚠️  $() wrapper |
| Learning curve | ✅ Standard JS | ❌ Steep | ⚠️  Medium | ✅ Low |
| MVC focus | ✅ Clear | ❌ Component-focused | ❌ Component-focused | ✅ Clear |
| Modern patterns | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Outdated |
| Build step needed | ✅ No | ❌ Yes | ⚠️  Optional | ✅ No |
| Educational fit | ✅ Perfect | ❌ Different pattern | ❌ Different pattern | ⚠️  Outdated |

**Decision**: Vanilla JS keeps focus on server-side MVC. No framework patterns to learn separately.

### Why SQLite? (vs PostgreSQL, MySQL)

**Chosen: SQLite**

| Criterion | SQLite | PostgreSQL | MySQL |
|-----------|--------|------------|-------|
| Setup complexity | ✅ None | ❌ High | ❌ High |
| Configuration | ✅ None | ❌ Required | ❌ Required |
| Learning curve | ✅ Low | ⚠️  Medium | ⚠️  Medium |
| SQL visibility | ✅ Clear | ✅ Clear | ✅ Clear |
| Portability | ✅ File-based | ❌ Server | ❌ Server |
| Educational fit | ✅ Perfect | ⚠️  Overkill | ⚠️  Overkill |

**Decision**: SQLite requires zero setup, making the app instantly runnable. Focus stays on MVC, not database administration.

### Why Client-Side Lesson Progress? (vs Backend)

**Chosen: localStorage (client-side)**

| Criterion | localStorage | Backend Database |
|-----------|--------------|------------------|
| Setup complexity | ✅ None | ❌ Requires schema |
| Authentication needed | ✅ No | ❌ Yes |
| Multi-device sync | ❌ No | ✅ Yes |
| Privacy | ✅ Local only | ⚠️  Stored on server |
| Learning curve | ✅ Simple | ⚠️  More complex |
| Reset difficulty | ✅ Easy | ⚠️  Requires endpoint |

**Decision**: localStorage keeps setup simple. Future enhancement can sync to backend for multi-device.

---

## Future Enhancements

### Phase 1: Testing Infrastructure

**Goal**: Add comprehensive test coverage

- **Unit tests** for Models (validation, business logic)
- **Integration tests** for Controllers (route handling)
- **E2E tests** for complete user flows
- **Test runner**: pytest with coverage reporting

**Rationale**: Currently relies on manual testing. Automated tests enable confident refactoring.

### Phase 2: Backend Lesson Progress Sync

**Goal**: Persist lesson progress to database

- Add `lesson_progress` table with user_id, lesson_id, status
- API endpoints for saving/loading progress
- Sync localStorage to backend on lesson completion
- Enable multi-device lesson progression

**Rationale**: Users can continue lessons on different devices.

### Phase 3: More Advanced Lessons

**Goal**: Expand beyond 8 lessons

- **Lesson 9**: Implement soft deletes and audit trails
- **Lesson 10**: Add full-text search with LIKE queries
- **Lesson 11**: Implement pagination for large result sets
- **Lesson 12**: Add user authentication and sessions
- **Lesson 13**: Implement role-based access control

**Rationale**: Advanced lessons for developers who complete basics.

### Phase 4: User Authentication

**Goal**: Add login system to demonstrate auth in MVC

- User registration and login (bcrypt password hashing)
- Session management (Flask-Login or custom)
- Route protection (@login_required decorator)
- Lesson about where auth logic belongs (Model vs Controller)

**Rationale**: Auth is a common MVC concern worth teaching.

### Phase 5: API Mode

**Goal**: Demonstrate MVC with JSON APIs

- Controllers return JSON instead of HTML
- Frontend JavaScript SPA consumes API
- Same Model layer, different View layer
- Lesson about MVC in REST APIs

**Rationale**: Modern apps often separate frontend/backend. Show how MVC applies to APIs.

### Phase 6: Internationalization (i18n)

**Goal**: Support multiple languages

- Lesson on where translation logic belongs (View layer)
- Demonstrate language switching
- Show how Model stays language-agnostic

**Rationale**: i18n demonstrates View layer responsibility.

### Phase 7: Performance Optimization

**Goal**: Teach performance patterns in MVC

- Query optimization (N+1 detection)
- Caching strategies (where to cache in MVC)
- Database indexing deep dive
- Profiling tools integration

**Rationale**: Performance is important; show how MVC helps identify bottlenecks.

### Phase 8: Deployment Guide

**Goal**: Teach production deployment

- Environment configuration
- Production vs development settings
- Database migrations
- Monitoring and logging
- Docker production configuration

**Rationale**: Complete the learning path from development to production.

---

## Appendix A: Key File References

| File | Lines | Purpose |
|------|-------|---------|
| `backend/app.py` | 1-481 | Flask app initialization, middleware, routes |
| `backend/controllers/task_controller.py` | 1-350 | Task CRUD routes |
| `backend/controllers/user_controller.py` | 1-300 | User CRUD routes |
| `backend/models/task.py` | 1-250 | Task model with validation |
| `backend/models/user.py` | 1-180 | User model with validation |
| `backend/utils/decorators.py` | 29-159 | @log_method_call decorator |
| `backend/utils/request_tracker.py` | 111-529 | Request tracking middleware |
| `backend/database/schema.sql` | 1-141 | Database schema definitions |
| `backend/static/js/devPanel.js` | - | Developer panel component |
| `backend/static/js/lessons.js` | - | Lesson engine |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **MVC** | Model-View-Controller - architectural pattern separating data, presentation, and logic |
| **Model** | Layer responsible for data, validation, and business logic |
| **View** | Layer responsible for presenting data to users (templates, HTML) |
| **Controller** | Layer responsible for handling requests and orchestrating Model/View |
| **Blueprint** | Flask's way of organizing routes into modules (e.g., tasks_bp, users_bp) |
| **Request Context** | Flask's per-request storage (g object) automatically cleaned up after response |
| **Middleware** | Code that runs before/after every request (before_request, after_request) |
| **Decorator** | Python function that wraps another function to add behavior (@log_method_call) |
| **ORM** | Object-Relational Mapping - abstraction over SQL (we intentionally avoid heavy ORMs) |
| **N+1 Problem** | Performance issue where N queries are executed when 1 would suffice |
| **Foreign Key** | Database column referencing another table's primary key (relationships) |
| **Jinja2** | Python templating engine for server-side HTML rendering |
| **localStorage** | Browser API for persisting data client-side (lesson progress) |

---

**For questions or clarifications, see [README.md](../README.md) or [PROJECT_BRIEF.md](PROJECT_BRIEF.md).**
