# Educational MVC App - Project Brief

## Overview

An interactive, full-stack educational application designed to teach backend and full-stack developers how MVC architecture actually works. The app emphasizes transparency through a developer panel that shows every step of the request-response cycle, from user interaction through Python backend logic to HTML rendering.

**Philosophy**: No magic. Every line of code is inspectable. Developers can watch data flow through the MVC layers in real-time.

---

## Discovery Interview Results

### Target Audience
- **Primary**: Backend/full-stack developers
- **Secondary**: Anyone learning MVC architecture
- **Approach**: One linear learning path (experts benefit from beginner mindset)

### Core Problem Being Solved
- MVC is too abstract for developers to understand without seeing it in action
- Hard to debug MVC apps without understanding the architecture underneath
- Need a reference implementation that's well-documented and transparent

### Developer Transparency Requirements
1. **Data flow visualization** - See Model/View/Controller connections
2. **Real-time state inspection** - Current data at any moment
3. **Method invocation logging** - Every method call visible with args/return values
4. **Network request inspector** - Full HTTP request/response details
5. **SQL query inspection** - See all database queries with execution details
6. **Code annotations** - Inline explanations of architecture decisions

### Operational Requirements
- **Two modes**: Tutorial Mode (guided learning) vs Exploration Mode (free experimentation)
- **Linear lesson path**: Everyone follows same progression
- **Shareable setup**: Docker + npm, one-command startup
- **Language split**: JavaScript frontend (client), Python backend (server)
  - Makes client-server separation crystal clear
  - Different languages = obvious architectural boundary
- **Templating**: EJS for simplicity and clarity
- **Database**: SQLite (cost-efficient, zero setup, great for learning)

---

## Key Design Decisions

### Architecture
```
Browser (JavaScript) ←→ HTTP ←→ Python Flask Server
  ↓
  User interacts with HTML/JS

Server receives request ↓
  Flask routes to Controller ↓
    Controller calls Model methods (logged) ↓
      Model validates, queries database ↓
        SQLite returns data ↓
      Model returns data ↓
    Controller renders Jinja2 template ↓
  Response includes __DEBUG__ JSON with method calls/queries ↓
Browser receives HTML + debug data ↓
  JavaScript renders page ↓
  Dev Panel displays full flow from Python backend
```

**Why this approach**:
- Clear separation: Python = server logic, JavaScript = client interactivity
- Transparent: Every step logged and visible in dev panel
- Educational: Shows realistic full-stack architecture
- Self-documenting: Code comments explain MVC role in each file

### Tech Stack
| Component | Technology | Reason |
|-----------|-----------|--------|
| Frontend | Vanilla JavaScript | No framework magic hiding the MVC pattern |
| Backend | Python 3 + Flask | Explicit, learnable, shows server-side MVC clearly |
| Templating | Jinja2 (backend), EJS would be frontend alternative | Simple, readable syntax |
| Database | SQLite | Zero setup, file-based, perfect for learning relationships |
| State Tracking | Request-scoped context (Flask `g`) | Logs method calls per request |
| Method Logging | Python decorators (@log_method_call) | Automatic invocation capture |

### Learning Modes

**Tutorial Mode**
- Guided, linear experience through 8 lessons
- Lesson sidebar shows current step and next steps
- Code checkpoints validate progress before allowing next lesson
- Dev panel highlights relevant information for current lesson
- Features locked until lessons completed
- Purpose: Systematic learning from beginner to advanced

**Exploration Mode**
- No restrictions, full access to all features
- Dev panel is primary learning tool
- Users can create/edit/delete freely
- Can inspect any request and trace full flow
- Purpose: Reinforce understanding through experimentation

---

## Data Model

### Users
```python
{
  id: int (primary key),
  name: string,
  email: string (unique),
  created_at: timestamp
}
```

### Tasks
```python
{
  id: int (primary key),
  title: string,
  description: string,
  status: enum ('todo' | 'in-progress' | 'done'),
  priority: enum ('low' | 'medium' | 'high'),
  owner_id: int (foreign key → Users.id),
  assignee_id: int (foreign key → Users.id, nullable),
  created_at: timestamp,
  updated_at: timestamp
}
```

**Why this structure**:
- Shows realistic one-to-many relationships
- Demonstrates foreign keys and JOINs
- Reveals N+1 query problems and solutions
- Complex enough to be meaningful, simple enough to focus on architecture

### Lesson Progress (Session Storage)
- Tracks which lessons completed
- Current lesson and step
- Code attempts for validation

---

## Tutorial Mode Learning Path (8 Lessons)

**Lesson 1: Understand MVC Pattern** (5 min)
- Concept: What are Model, View, Controller?
- Interactive diagram showing three layers
- Dev panel highlights components as explained

**Lesson 2: Understand Data Flow** (10 min)
- Watch task load and trace flow through MVC
- Dev panel shows each step (Controller → Model → Database → View)
- Checkpoint: Identify which layer is doing what

**Lesson 3: Explore User Model** (10 min)
- Examine User.js code and comments
- Create new user, watch model validation and methods
- Dev panel shows validate() and create() being called
- Checkpoint: Add new validation rule

**Lesson 4: Explore Task Model** (15 min)
- Understand relationships (owner, assignee)
- Create task and watch database JOINs
- Learn N+1 query problem
- Checkpoint: Update task status

**Lesson 5: Understand Controllers** (12 min)
- See how controllers orchestrate between models and views
- Trace a request through TaskController methods
- Checkpoint: Explain what controller method does

**Lesson 6: Create Task Status Filter** (20 min)
- **First coding exercise**: Add status query parameter
- Create Task.byStatus() model method
- Update view with filter buttons
- Checkpoint: Filter works, dev panel shows query

**Lesson 7: Create Priority Update Feature** (25 min)
- Add ability to change task priority
- Create POST endpoint, form, validation
- Similar complexity to lesson 6 but slightly different

**Lesson 8: Create Comments Feature** (45+ min, multi-part)
- **Advanced**: Build feature from scratch
- Part A: Create Comment model (id, task_id, user_id, text)
- Part B: Create CommentController with CRUD
- Part C: Add comments to task detail view
- Part D: Handle relationships and queries
- Checkpoints at each step
- **Goal**: They've built complete MVC feature independently

---

## Developer Panel Features

### Tabs

1. **State Inspector**
   - Current app data (users, tasks)
   - Data passed to current view
   - Nested object exploration (task.owner details)
   - Data types shown

2. **Method Call Stack**
   - Tree of all Python method calls during request
   - Click to see arguments and return values
   - Click filename to view code
   - Execution time for each method

3. **Flow Diagram**
   - Animated visualization of request flow
   - View → Controller → Model → DB → View
   - Highlights current executing step
   - Shows timing for each phase

4. **Network Inspector**
   - All HTTP requests made
   - Full request/response details
   - Headers, body, status code
   - Which controller action handled it

5. **Database Inspector**
   - All SQL queries executed
   - Query text, parameters, results
   - Which method triggered query
   - Execution time per query

### Magic: __DEBUG__ Object
- Python Flask attaches debug JSON to every HTML response
- Includes all method calls, queries, timing data
- JavaScript dev panel reads and displays it
- Shows complete flow without frontend making extra requests

---

## Self-Documenting Code Principles

Every Python file includes:
- **Docstring block**: Explains MVC role, what concept it demonstrates, related lessons
- **Inline comments**: Why things work this way, common mistakes, ✅ DO / ⚠️ DON'T patterns
- **Method documentation**: What each method does in MVC flow
- **Lessons referenced**: Links to which tutorial covers this code

Example comment style:
```python
@log_method_call
def create(title, description, priority, owner_id, assignee_id=None):
    """
    Create a new task.

    MVC Flow:
    1. Controller receives form data
    2. Create Task object
    3. Call validate() - keeps validation in Model
    4. Call database.insert()
    5. Return to controller to render view

    Dev Panel shows:
    - Task.create() method call with arguments
    - Task.validate() being called
    - INSERT query being executed
    - Return value (new task ID)
    """
```

---

## Feature Requirements

### Core MVC Implementation
- ✅ User model with validation
- ✅ Task model with relationships (owner, assignee)
- ✅ User controller with CRUD
- ✅ Task controller with CRUD
- ✅ Jinja2 templates for views
- ✅ Proper separation of concerns

### Developer Transparency
- ✅ Method invocation logging with @log_method_call decorator
- ✅ Request tracking (assign unique ID, track through all layers)
- ✅ SQL query logging (which method triggered, how long)
- ✅ Data flow visualization in dev panel
- ✅ State inspection (what data was passed to view)
- ✅ Code viewer in dev panel (highlight current executing line)

### Interactive Lessons
- ✅ Lesson loader (read JSON files, track progress)
- ✅ Lesson panel UI (sidebar with steps, hints)
- ✅ Code checkpoints (validate code before next lesson)
- ✅ Hints system (provide help without spoiling)
- ✅ 8 lessons total covering MVC concepts

### Mode System
- ✅ Tutorial Mode (guided, locked features, lesson progression)
- ✅ Exploration Mode (full access, dev panel primary tool)
- ✅ Mode toggle in UI
- ✅ Progress persisted in localStorage

### Deployment & Setup
- ✅ Docker setup (one-command: docker-compose up)
- ✅ Local setup (npm install, npm run setup, npm start)
- ✅ Database auto-creation with seed data
- ✅ Pre-populated users and tasks for learning
- ✅ Clear README with setup instructions

---

## Implementation Phases

### Phase 1: Core Python MVC + SQLite
**Deliverable**: Working task app with CRUD operations
- Flask app setup with routes
- SQLite database and schema
- User and Task models with validation
- UserController and TaskController
- Jinja2 templates for all views
- No dev panel yet

### Phase 2: Method Logging & Developer Panel
**Deliverable**: Full dev panel showing Python execution
- @log_method_call decorator implementation
- Request tracking middleware
- Database query logging
- Dev panel UI (tabs, styling)
- All 5 dev panel tabs functional
- __DEBUG__ object injection into responses

### Phase 3: Lesson Engine
**Deliverable**: Tutorial mode with structured lessons
- Lesson loader and progress tracking
- Lesson panel UI component
- Code checkpoint validator
- 8 lesson JSON files
- Hints system

### Phase 4: Mode Toggle & Polish
**Deliverable**: Both modes fully working
- Tutorial vs Exploration mode toggle
- Lesson progression enforcement
- Feature visibility based on mode
- UI/UX refinements

### Phase 5: Deployment
**Deliverable**: Ready to share with others
- Docker and docker-compose files
- npm setup scripts
- Comprehensive documentation
- ARCHITECTURE.md explaining design
- LESSONS.md lesson guide
- SETUP.md deployment guide

---

## Success Criteria

A developer completing this app should:

✅ Understand what MVC actually is (not abstract, concrete layers)
✅ See data flow from user interaction through database and back
✅ Understand why Model has validation (business logic)
✅ Understand why Controller orchestrates (not does all work)
✅ Understand why View just displays (no logic)
✅ Debug any request by reading dev panel
✅ Build new MVC features following the pattern
✅ Understand relationships and foreign keys
✅ See N+1 query problems and solutions
✅ Recognize anti-patterns (logic in wrong layer)
✅ Set up and run the app with one command
✅ Share it with others easily

---

## Assumptions & Constraints

### Assumptions
- Users have basic JavaScript knowledge
- Python is readable enough without prior experience (simple syntax)
- SQLite understanding isn't required (dev panel shows queries)
- Learners benefit from seeing both frontend and backend code

### Constraints
- Keep complexity low (task example, not complex domain)
- No external dependencies needed (Flask, SQLite included by default)
- One linear path (don't branch lessons based on skill level)
- Focus on teaching MVC, not building production features

### Out of Scope
- User authentication/authorization
- Real-time updates or WebSockets
- Advanced query optimization (beyond showing N+1 problem)
- Deployment to cloud platforms
- Mobile responsiveness (desktop-focused for clarity)

---

## Next Steps

This brief is the input for another agent to:
1. Create detailed technical specification
2. Break down implementation tasks
3. Define file structures precisely
4. Create code templates and examples
5. Generate step-by-step implementation guide

The spec should reference this brief for context on design decisions and philosophy.

---

## Project Status
- ✅ Discovery interview completed
- ✅ Requirements gathered
- ✅ Architecture designed
- ✅ Tech stack chosen
- ✅ Learning path planned
- ✅ Data models defined
- ⏳ Awaiting spec generation from another agent
- ⏳ Implementation to begin

---

**Created**: 2026-01-03
**Prepared for**: Spec generation agent
**Context**: Educational MVC App with transparent developer features
