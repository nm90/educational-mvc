# Lesson Guide - Educational MVC App

**Complete guide for learners and instructors**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Lesson Overview](#lesson-overview)
3. [Detailed Lesson Breakdowns](#detailed-lesson-breakdowns)
4. [Learning Path](#learning-path)
5. [Tips for Learners](#tips-for-learners)
6. [Tips for Instructors](#tips-for-instructors)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

### How the Lesson System Works

The Educational MVC App includes **8 progressive lessons** that teach the Model-View-Controller pattern through interactive, hands-on learning. Each lesson builds on the previous one, taking you from basic concepts to building complete features.

**Two Learning Modes:**

1. **Tutorial Mode** (Recommended for new learners)
   - Guided, step-by-step progression through all 8 lessons
   - Lessons must be completed in order
   - Checkpoints validate understanding before advancing
   - Developer panel highlights relevant information
   - Features unlock as you learn

2. **Exploration Mode** (For review and experimentation)
   - Full access to all features
   - No restrictions or lesson progression
   - Use after completing tutorials
   - Experiment with the codebase freely
   - Developer panel remains available

**Estimated Time:** 2-3 hours for focused completion
- Lessons 1-5: ~50 minutes (observation and understanding)
- Lessons 6-7: ~45 minutes (guided coding exercises)
- Lesson 8: ~45+ minutes (capstone project)

**What Makes This Different:**

Unlike traditional tutorials, you don't just read about MVC - you **see it happen in real-time** through the Developer Panel. Every method call, database query, and data transformation is visible and inspectable.

---

## Lesson Overview

| Lesson | Title | Time | Type | Key Concepts | Checkpoint |
|--------|-------|------|------|--------------|------------|
| **1** | Understand MVC Pattern | 5 min | Conceptual | MVC roles, separation of concerns | Quiz |
| **2** | Understand Data Flow | 10 min | Observation | Request-response cycle, layer communication | Quiz |
| **3** | Explore User Model | 10 min | Interactive | Model validation, business logic | Code: Add email validation |
| **4** | Explore Task Model | 15 min | Interactive | Relationships, foreign keys, N+1 problem, JOINs | Code: Update task status |
| **5** | Understand Controllers | 12 min | Observation | Orchestration, thin controllers, error handling | Quiz |
| **6** | Create Task Status Filter | 20 min | Coding | GET requests, query parameters, filtering | Build: Filter feature |
| **7** | Create Priority Update | 25 min | Coding | POST requests, targeted updates, validation | Build: Update feature |
| **8** | Build Comments Feature | 45+ min | Capstone | Complete feature from scratch, relationships | Build: Comments system |

**Total:** ~142 minutes (2 hours 22 minutes) minimum, allowing extra time for exploration and experimentation.

---

## Detailed Lesson Breakdowns

### Lesson 1: Understand the MVC Pattern

**Duration:** 5 minutes  
**Type:** Conceptual  
**Difficulty:** Beginner

#### What You'll Learn

- What Model, View, and Controller actually mean (not abstract definitions)
- The specific role and responsibility of each layer
- How MVC creates separation of concerns
- Where different types of logic belong in your application

#### Objectives

1. Understand the role of each MVC component
2. See how data flows through the layers
3. Recognize where logic belongs in each layer

#### Key Concepts Covered

- **Model**: Data structure, validation rules, business logic, database operations
- **View**: Display data, render HTML, collect user input (no logic)
- **Controller**: Orchestrate between Models and Views, handle requests

#### What You'll Build

Nothing yet - this lesson establishes the foundational concepts you'll apply in later lessons.

#### Prerequisites

- None - start here!

#### Checkpoint

**Quiz**: "Which MVC layer handles validation rules?"
- Tests your understanding of Model responsibilities

#### Tips for Success

- Don't skip this lesson - these concepts are essential
- As you read, think about web apps you've used
- Consider: where does validation happen? Where does data display happen?
- The Developer Panel references will make more sense in Lesson 2

#### Common Mistakes to Avoid

- ❌ Thinking of MVC as strict rules rather than guidelines
- ❌ Trying to memorize definitions instead of understanding roles
- ✅ Focus on *why* each layer exists, not just *what* it does

---

### Lesson 2: Understand Data Flow

**Duration:** 10 minutes  
**Type:** Observation  
**Difficulty:** Beginner

#### What You'll Learn

- How a request travels from browser click through all MVC layers
- What happens at each step (Controller → Model → Database → View)
- How the Developer Panel reveals the complete flow
- The sequence of method calls and database queries

#### Objectives

1. Trace a complete request through all MVC layers
2. Understand how data flows from user action to database query
3. See how the developer panel reveals the entire flow
4. Recognize which layer handles which responsibility

#### Key Concepts Covered

- HTTP requests and routes
- Controller methods receiving requests
- Model methods querying databases
- Views rendering responses
- The Developer Panel's 5 tabs (State, Methods, Flow, Network, Database)

#### What You'll Do

You'll click "View Tasks" and then use the Developer Panel to trace what happens:
1. User interaction (View layer - browser)
2. HTTP GET request sent
3. Controller receives and routes request
4. Model queries database with SQL
5. View renders HTML with data
6. Response sent back to browser

#### Prerequisites

- Lesson 1 completed

#### Checkpoint

**Quiz**: "In the MVC flow you just traced, which layer executed the SQL query?"
- Tests your ability to identify Model responsibilities in practice

#### Tips for Success

- Keep the Developer Panel open the entire time
- Switch between all 5 tabs to see different aspects
- Click on method names in the Method Call Stack to see details
- Notice the timing - the whole request takes ~15ms!

#### Common Mistakes to Avoid

- ❌ Rushing through - take time to explore each Developer Panel tab
- ❌ Skipping the Developer Panel entirely
- ✅ Click around, expand things, see what's available
- ✅ Compare what you see in each tab (Method Stack vs Database Inspector)

---

### Lesson 3: Explore the User Model

**Duration:** 10 minutes  
**Type:** Interactive + Coding  
**Difficulty:** Beginner

#### What You'll Learn

- How Models validate data before saving
- Why validation belongs in the Model (not Controller or View)
- How to read Model code and understand its role
- How validation prevents bad data from reaching the database

#### Objectives

1. Understand Model validation rules
2. See how create, read, and update operations work in a Model
3. Watch validation methods in the dev panel
4. Learn that validation belongs in the Model, not the Controller

#### Key Concepts Covered

- Email validation with regex patterns
- Required field validation
- Raising `ValueError` for invalid data
- The `@log_method_call` decorator
- Why validation is a Model responsibility

#### What You'll Build

**Code Checkpoint**: Add email validation for `.edu` domain only
- Modify `User.validate()` to check email ends with `.edu`
- See validation errors caught before database insertion
- Watch the Developer Panel show your validation running

#### Prerequisites

- Lessons 1-2 completed
- Basic understanding of validation concepts

#### Checkpoint

**Code**: Add email validation rule
- Write code to check `email.endswith('.edu')`
- Raise `ValueError` with appropriate message
- Test with valid and invalid emails

#### Tips for Success

- Read the existing validation code first
- Look for patterns: "check → raise error if invalid"
- Test with intentionally invalid data to see errors
- Use the hints if you get stuck

#### Common Mistakes to Avoid

- ❌ Putting validation in the Controller instead of Model
- ❌ Forgetting to raise ValueError (just checking isn't enough)
- ✅ Follow the existing validation pattern
- ✅ Test both valid and invalid inputs

---

### Lesson 4: Explore the Task Model

**Duration:** 15 minutes  
**Type:** Interactive + Coding  
**Difficulty:** Intermediate

#### What You'll Learn

- Database relationships (one-to-many, foreign keys)
- The N+1 query problem and how to avoid it
- SQL JOINs for efficient data loading (eager loading)
- How Models handle complex queries

#### Objectives

1. Understand one-to-many relationships between Users and Tasks
2. See foreign keys and referential integrity
3. Learn what the N+1 query problem is and how to avoid it
4. Watch JOINs in action through the developer panel
5. Understand eager loading vs lazy loading

#### Key Concepts Covered

- **Foreign keys**: `owner_id` and `assignee_id` point to Users
- **N+1 problem**: Making N separate queries instead of 1 query with JOINs
- **INNER JOIN**: Required relationships (every task has an owner)
- **LEFT JOIN**: Optional relationships (tasks may not have assignees)
- **Eager loading**: Loading related data in one query
- **Lazy loading**: Loading related data as needed (causes N+1)

#### What You'll Build

**Code Checkpoint**: Update a task's status to 'done'
- Use the UI or API to change task status
- Watch the Developer Panel show the UPDATE query
- See the `updated_at` timestamp automatically update

#### Prerequisites

- Lessons 1-3 completed
- Understanding of basic SQL helpful but not required

#### Checkpoint

**Code**: Update task status
- Navigate to a task edit page
- Change status to 'done'
- Observe the UPDATE query in Database Inspector
- See the updated task in the list

#### Tips for Success

- Pay special attention to the N+1 problem explanation - it's crucial
- Compare queries with and without `include_relations=True`
- Count how many queries run in the Database Inspector
- Notice how JOINs reduce query count from N+1 to 1

#### Common Mistakes to Avoid

- ❌ Not understanding why N+1 is a problem
- ❌ Confusing INNER JOIN with LEFT JOIN
- ✅ Check Database Inspector to count actual queries
- ✅ Understand that one query with JOINs > many simple queries

---

### Lesson 5: Understand Controllers

**Duration:** 12 minutes  
**Type:** Observation  
**Difficulty:** Beginner-Intermediate

#### What You'll Learn

- Controllers are orchestrators, not workers
- The "thin controller" principle
- How Controllers coordinate multiple Models
- Error handling patterns in Controllers

#### Objectives

1. Understand the Controller's orchestration role
2. See how Controllers coordinate multiple Models
3. Learn the 'thin controller' principle
4. Trace a complete request through the TaskController

#### Key Concepts Covered

- **Orchestration**: Controllers call Models but don't do the work
- **Thin controllers**: Minimal logic, maximum coordination
- **Multi-model coordination**: One Controller can call multiple Models
- **Error handling**: Controllers catch and display Model errors
- **Not found handling**: Checking for None returns from Models

#### What You'll Observe

You'll trace several Controller methods:
1. `index()` - Lists tasks (simple orchestration)
2. `new()` - Prepares form (calls User model for dropdowns)
3. `create()` - Creates task (error handling example)
4. `show()` - Displays one task (not-found handling)

#### Prerequisites

- Lessons 1-4 completed

#### Checkpoint

**Quiz**: "Which statement BEST describes a Controller's responsibility?"
- Tests your understanding of orchestration vs execution

#### Tips for Success

- Notice how simple Controller code is compared to Model code
- Count how many lines are in Controller methods vs Model methods
- Watch for try/except blocks - Controllers handle Model errors
- See how Controllers prepare data for multiple Models (User + Task)

#### Common Mistakes to Avoid

- ❌ Putting business logic in Controllers
- ❌ Writing SQL queries in Controllers
- ✅ Keep Controllers thin - they just coordinate
- ✅ All validation and business logic belongs in Models

---

### Lesson 6: Create Task Status Filter

**Duration:** 20 minutes  
**Type:** Coding Exercise (First Feature Build)  
**Difficulty:** Intermediate

#### What You'll Learn

- How to add a complete MVC feature
- Query parameter handling (GET requests)
- Filtering data based on user input
- All three layers working together

#### Objectives

1. Add a new Model method (`Task.by_status`)
2. Add query parameter handling to Controller
3. Add filter buttons to the View
4. See the complete MVC flow for a new feature

#### Key Concepts Covered

- Query parameters in URLs (`?status=done`)
- SQL WHERE clauses for filtering
- Conditional logic in Controllers
- Active state in Views (highlighting current filter)
- GET requests for read-only operations

#### What You'll Build

**Complete Feature**: Task status filtering
- **Part 1**: Model - Add `Task.by_status()` method with SQL query
- **Part 2**: Controller - Handle `?status=` query parameter
- **Part 3**: View - Add filter buttons (All, Todo, In Progress, Done)

Result: Users can click filter buttons to see only tasks with specific statuses.

#### Prerequisites

- Lessons 1-5 completed
- Basic Python knowledge
- Basic HTML knowledge

#### Checkpoint

Each part has its own code checkpoint:
1. Model method passes static analysis
2. Controller update works with query params
3. View renders filter buttons correctly

**Final Quiz**: "Which MVC layer contains the SQL query logic?"

#### Tips for Success

- Complete all 3 parts in order (Model → Controller → View)
- Test after each part before moving to the next
- Use the Developer Panel to verify each layer works
- Look at existing code for patterns to follow

#### Common Mistakes to Avoid

- ❌ Skipping the Model and putting SQL in the Controller
- ❌ Forgetting to handle invalid status values
- ❌ Not passing `current_status` to the View for highlighting
- ✅ Follow the MVC pattern strictly - it's the whole point!

---

### Lesson 7: Create Priority Update Feature

**Duration:** 25 minutes  
**Type:** Coding Exercise (POST Requests)  
**Difficulty:** Intermediate

#### What You'll Learn

- POST requests for data modification
- Targeted updates (changing one field)
- Form submission and validation
- Complete error handling in MVC

#### Objectives

1. Add a specialized Model method for priority updates
2. Create a new POST route in the Controller
3. Add inline priority controls to the View
4. Handle validation errors in the MVC flow

#### Key Concepts Covered

- **POST vs GET**: GET reads, POST modifies
- **Targeted updates**: Update one field without touching others
- **Form auto-submit**: `onchange="this.form.submit()"`
- **Error handling**: Try/except for ValueError in Controllers
- **Flash messages**: User feedback for success/errors

#### What You'll Build

**Complete Feature**: Inline priority updates
- **Part 1**: Model - Add `Task.update_priority()` method
- **Part 2**: Controller - Add `POST /tasks/<id>/priority` route
- **Part 3**: View - Add inline priority dropdown with auto-submit

Result: Users can change task priority directly from task list without opening edit form.

#### Prerequisites

- Lessons 1-6 completed
- Understanding of forms and POST requests helpful

#### Checkpoint

Each part has its own code checkpoint:
1. Model method validates and updates priority only
2. Controller route handles POST and errors
3. View form submits on dropdown change

**Final Quiz**: "Which layer validates that 'high' is a valid priority?"

#### Tips for Success

- Similar to Lesson 6 but with POST instead of GET
- Test validation by trying invalid priority values
- Watch Database Inspector to see UPDATE queries
- Notice how Model validation protects database integrity

#### Common Mistakes to Avoid

- ❌ Using GET for updates (always use POST for modifications)
- ❌ Updating all fields when you only want to change one
- ❌ Forgetting to check for validation errors
- ✅ Create specialized methods for specific operations

---

### Lesson 8: Build Comments Feature from Scratch

**Duration:** 45+ minutes  
**Type:** Capstone Project  
**Difficulty:** Advanced

#### What You'll Learn

- How to design a complete feature from scratch
- Database schema design with relationships
- Complete Model with CRUD operations
- Controller with nested RESTful routes
- View integration with forms and display

#### Objectives

1. Design a new database table schema
2. Create a complete Model with CRUD and validation
3. Build Controller routes for comments
4. Add a comments section to the task detail View
5. Handle relationships between Comments, Tasks, and Users

#### Key Concepts Covered

- **Schema design**: Deciding table structure and relationships
- **Foreign keys**: Comments belong to Tasks and Users
- **CRUD operations**: Create, Read, Update (no update in this version), Delete
- **Nested routes**: `/tasks/<id>/comments` (RESTful design)
- **Form handling**: POST to create comments
- **Relationships**: Loading related data (comment.user)
- **N+1 avoidance**: JOINs for efficient comment loading

#### What You'll Build

**Complete Feature**: Comments on tasks

**Part A - Schema Design:**
- Create `comments` table with foreign keys

**Part B - Comment Model:**
- `Comment.validate()` - Validate content and foreign keys
- `Comment.create()` - Insert new comment
- `Comment.get_by_task_id()` - Get all comments for a task with user info
- `Comment.delete()` - (Optional) Delete a comment

**Part C - CommentController:**
- `POST /tasks/<id>/comments` - Create comment route
- Blueprint registration in app.py

**Part D - View Updates:**
- Update `TaskController.show()` to load comments
- Add comments section to task detail template
- Add comment form
- Display comments with author and timestamp

**Part E - Integration:**
- Test complete flow
- Verify relationships work
- Check Developer Panel for efficiency

Result: Users can add and view comments on any task, with author names and timestamps.

#### Prerequisites

- **All lessons 1-7 completed** (this builds on everything)
- Comfortable with Python, SQL basics, and HTML
- Understanding of relationships from Lesson 4
- Confidence with MVC pattern

#### Checkpoint

Multiple checkpoints throughout:
1. Schema validation (Part A)
2. Model method implementation (Part B)
3. Controller route creation (Part C)
4. View updates and display (Part D)

**Final Quiz**: "Which statement correctly describes the relationships?"

#### Tips for Success

- **Don't rush** - this is a capstone project
- Do each part completely before moving to the next
- Test frequently using the Developer Panel
- Read hints if you get stuck - they provide structure
- Reference Lessons 4 (relationships) and 6-7 (feature building)

#### Common Mistakes to Avoid

- ❌ Trying to do everything at once
- ❌ Skipping schema design (Part A) and going straight to code
- ❌ Forgetting to register the CommentController blueprint
- ❌ Not including user information (causing N+1 queries)
- ✅ Follow the 5-part structure methodically
- ✅ Test after each part before proceeding

#### Extension Activities

After completing the basic feature, try:
- Add delete comment functionality
- Add edit comment functionality
- Add comment count badges to task lists
- Add real-time comment updates (without page refresh)

---

## Learning Path

### Linear Progression

The lessons are designed to be completed **in order** - you cannot skip ahead. This is intentional.

### Why This Order?

```
Lesson 1: Foundation
    ↓  Learn what MVC is
    
Lesson 2: Observation
    ↓  See MVC in action
    
Lesson 3: Model Focus
    ↓  Deep dive into Model layer
    
Lesson 4: Relationships
    ↓  Understand complex Models
    
Lesson 5: Controller Focus
    ↓  Deep dive into Controller layer
    
Lesson 6: First Feature (GET)
    ↓  Apply knowledge to read operations
    
Lesson 7: Second Feature (POST)
    ↓  Apply knowledge to write operations
    
Lesson 8: Capstone
    ↓  Build complete feature independently
    
Completion: MVC Mastery!
```

### Each Lesson Builds on Previous

| Lesson | Requires Knowledge From | Adds New Concepts |
|--------|-------------------------|-------------------|
| 1 | None | MVC basics |
| 2 | Lesson 1 | Request flow, Developer Panel |
| 3 | Lessons 1-2 | Model validation, code reading |
| 4 | Lessons 1-3 | Relationships, N+1, JOINs |
| 5 | Lessons 1-4 | Orchestration, thin controllers |
| 6 | Lessons 1-5 | Feature building, GET requests |
| 7 | Lessons 1-6 | POST requests, targeted updates |
| 8 | Lessons 1-7 | Complete feature design, capstone |

### Time Management

**Minimum Time:** 2 hours 22 minutes (straight through, no breaks)

**Recommended Time:** 3-4 hours with breaks
- Session 1 (45 min): Lessons 1-3
- Break (10 min)
- Session 2 (45 min): Lessons 4-5
- Break (10 min)
- Session 3 (30 min): Lesson 6
- Break (10 min)
- Session 4 (30 min): Lesson 7
- Break (15 min)
- Session 5 (60 min): Lesson 8

### Can I Skip Lessons?

**No, and here's why:**

- Lesson 6 assumes you understand Models (Lessons 3-4) and Controllers (Lesson 5)
- Lesson 7 builds on the filtering pattern from Lesson 6
- Lesson 8 requires concepts from ALL previous lessons

Skipping lessons will leave you confused and frustrated. Trust the process!

---

## Tips for Learners

### Before You Start

1. **Set aside focused time** - 3-4 hours without distractions
2. **Use a modern browser** - Chrome, Firefox, or Edge (for Developer Panel)
3. **Have the app running** - `npm start` or `docker-compose up`
4. **Open the Developer Panel** - Bottom right corner, keep it visible
5. **Have a code editor ready** - VS Code, Sublime, or your preferred editor

### During Lessons 1-5 (Observation)

- **Read code comments carefully** - They explain architectural decisions
- **Use all 5 Developer Panel tabs** - Each shows different information
- **Don't rush** - Understanding is more important than speed
- **Take notes** - Write down "aha!" moments
- **Pause and explore** - Click things, see what happens
- **Ask "why?"** - Why is this in the Model? Why not the Controller?

### During Lessons 6-8 (Coding)

- **Read existing code first** - Look for patterns to follow
- **Follow the MVC pattern strictly** - Even if you know "easier" ways
- **Test frequently** - After each part, verify it works
- **Use hints liberally** - They're there to help, not to trick you
- **Check the Developer Panel constantly** - Verify your code is being called
- **Make mistakes intentionally** - Try invalid data to see validation work
- **Compare before/after** - See how your code changes the flow

### Using the Developer Panel Effectively

**State Inspector Tab:**
- See what data the Controller passed to the View
- Expand nested objects (task.owner, task.assignee)
- Verify data structure is what you expect

**Method Call Stack Tab:**
- See the order of method calls
- Click to see arguments and return values
- Trace from Controller → Model → Database
- Check execution times (is it fast?)

**Flow Diagram Tab:**
- Watch the animated request flow
- See timing for each phase
- Understand the MVC cycle visually

**Network Inspector Tab:**
- See HTTP request details
- Check status codes (200, 404, 500)
- View request method (GET, POST)

**Database Inspector Tab:**
- Count queries (watch for N+1 problems)
- See exact SQL being executed
- Check query timing
- Understand JOINs and WHERE clauses

### When You Get Stuck

1. **Read the hints** - They provide step-by-step guidance
2. **Check the Developer Panel** - Are your methods being called?
3. **Read error messages** - They usually tell you exactly what's wrong
4. **Review previous lessons** - The pattern is established in Lessons 1-5
5. **Look at existing code** - User and Task models show the pattern
6. **Check the console** - Python errors appear in terminal
7. **Restart the server** - Sometimes Flask needs a fresh start

### After Each Lesson

- **Experiment** - Try breaking things to understand how they work
- **Explore related code** - Read other files to see patterns
- **Switch to Exploration Mode** - Try creating users and tasks freely
- **Review the Developer Panel** - Go back and look at previous requests
- **Reflect** - Can you explain what you learned to someone else?

---

## Tips for Instructors

### Using This in a Classroom

**Recommended Approach:**

1. **Demonstration (30 min):**
   - Walk through Lessons 1-2 together
   - Project the Developer Panel on a screen
   - Explain each tab and what it shows
   - Answer questions about MVC concepts

2. **Guided Practice (60 min):**
   - Students complete Lessons 3-5 independently
   - Circulate to answer questions
   - Pause the class to discuss key concepts (N+1 problem, validation)
   - Have students share what they see in the Developer Panel

3. **Hands-On Coding (90 min):**
   - Students complete Lessons 6-8 independently
   - Provide extra support during Lesson 8 (capstone)
   - Encourage pair programming
   - Review common mistakes as a group

4. **Wrap-Up (30 min):**
   - Discuss what they built
   - Compare different approaches (if students customized)
   - Talk about applying MVC to other projects
   - Q&A session

**Total classroom time:** ~3.5 hours (one afternoon session or two 2-hour sessions)

### What to Emphasize

**Lesson 1:**
- MVC is about separation of concerns, not rigid rules
- Each layer has ONE responsibility
- Reinforce where validation belongs (Model, always Model)

**Lesson 2:**
- The Developer Panel is your X-ray vision
- Watch the flow - it makes MVC concrete
- Count the steps - Controller → Model → Database → View

**Lesson 3:**
- Validation in Model = consistency across all entry points
- ValueError is the pattern for validation errors
- Models protect data integrity

**Lesson 4:**
- N+1 problem is THE most common performance issue
- JOINs solve N+1 - one query > many queries
- Relationships are handled at the database level (foreign keys)

**Lesson 5:**
- Thin controllers are maintainable controllers
- Controllers coordinate, they don't compute
- Error handling belongs in Controller, errors come from Model

**Lesson 6:**
- This is your template for all GET-based features
- Model → Controller → View, always in that order
- Test each layer before moving to the next

**Lesson 7:**
- POST vs GET - modification vs reading
- Specialized methods > generic methods (update_priority > update)
- Always validate in Model, handle errors in Controller

**Lesson 8:**
- This is real-world feature development
- Schema design comes first (think before coding)
- Relationships require thought (foreign keys, JOINs, deletion cascade)

### Common Questions Students Ask

**Q: "Why can't I skip to Lesson 8?"**
A: Lesson 8 requires concepts from all previous lessons. You'd be lost. Trust the progression.

**Q: "Why is validation in the Model? Can't the Controller do it?"**
A: If validation is in the Controller, every Controller that creates/updates must duplicate it. Model validation ensures consistency across all entry points (web form, API, admin panel, console).

**Q: "What's the difference between INNER JOIN and LEFT JOIN?"**
A: INNER JOIN requires both sides to exist (task.owner). LEFT JOIN allows right side to be NULL (task.assignee can be empty).

**Q: "Why is the N+1 problem bad?"**
A: 100 tasks = 101 queries (1 for tasks, 100 for owners) = slow. One query with JOIN = fast. With 1000 tasks, the difference is dramatic.

**Q: "Can I put some logic in the View?"**
A: Display logic only (if/else for showing/hiding, loops for lists). No calculations, no validation, no database queries.

**Q: "The Developer Panel isn't showing my method calls"**
A: Did you add the `@log_method_call` decorator? Did you restart the Flask server?

**Q: "My checkpoint isn't passing - what's wrong?"**
A: Read the validation error carefully. Use the hints. Check that you're following the exact pattern shown.

### Extension Activities

After students complete all 8 lessons:

1. **Add User Profile Edit**
   - Let users edit their own name and email
   - Add avatar upload (optional)
   - Show user's tasks and comments

2. **Add Task Categories**
   - Create a categories table
   - Add many-to-many relationship (tasks can have multiple categories)
   - Build category filter

3. **Add Search**
   - Full-text search across task titles and descriptions
   - Use SQL LIKE or FTS (full-text search)
   - Display search results with highlighting

4. **Add Real Authentication**
   - Replace fake user_id with session-based auth
   - Add login/logout
   - Restrict actions (users can only edit their own tasks)

5. **Add Bulk Operations**
   - Mark multiple tasks as done
   - Change priority for multiple tasks
   - Delete multiple tasks

### Assessment Ideas

**Formative (During Lessons):**
- Observe students using the Developer Panel
- Check checkpoint completion
- Ask students to explain what they see in Method Call Stack

**Summative (After All Lessons):**
- Build a new feature (similar to Lesson 8):
  - Tags for tasks
  - Attachments on tasks
  - Task history/audit log
- Code review: identify which layer code belongs in
- Debugging exercise: fix deliberately broken MVC code

---

## Troubleshooting

### Checkpoint Not Passing

**Problem:** "I wrote the code but the checkpoint validator says it's wrong."

**Solutions:**
1. Read the validation error message carefully - it tells you what's missing
2. Check the hints - they provide the exact pattern needed
3. Look at existing code for the pattern (User model for Lesson 3, Task model for Lesson 4)
4. Make sure you're using the exact method names suggested
5. Verify your indentation and syntax (Python is whitespace-sensitive)
6. Copy the code template and fill in only the sections marked "ADD YOUR CODE HERE"

**Common checkpoint issues:**
- Forgot `@log_method_call` decorator
- Used wrong method name (`get_all` vs `get_all_tasks`)
- Missed required validation (email format, status values)
- Didn't include necessary imports

### Lesson Not Loading

**Problem:** "The lesson content isn't appearing in the sidebar."

**Solutions:**
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console for JavaScript errors (F12)
3. Verify lesson JSON files exist in `lessons/` directory
4. Check that Flask server is running and accessible
5. Try clearing browser localStorage: `localStorage.clear()` in console
6. Restart the Flask server: `npm start` or `docker-compose restart`

### Progress Lost

**Problem:** "I completed lessons but now I'm back at Lesson 1."

**Solutions:**
1. Check if you're in a private/incognito browser window (localStorage doesn't persist)
2. Verify browser localStorage: `localStorage.getItem('mvc_lesson_progress')` in console
3. Did you switch browsers? Progress is per-browser
4. Did you clear browser data? That clears localStorage

**Prevention:**
- Use the same browser throughout
- Don't use incognito/private mode
- Don't clear browser data during lessons

### Reset Progress

**Problem:** "I want to start over from Lesson 1."

**Solutions:**

**Option 1 - Clear just lesson progress:**
```javascript
// In browser console (F12)
localStorage.removeItem('mvc_lesson_progress');
location.reload();
```

**Option 2 - Clear everything:**
```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

**Option 3 - Use the UI:**
- Go to Settings (if available)
- Click "Reset All Progress"

### Developer Panel Not Showing Data

**Problem:** "The Developer Panel is empty or not updating."

**Solutions:**
1. **Check if window.__DEBUG__ exists:**
   ```javascript
   // In browser console
   console.log(window.__DEBUG__);
   ```
   If undefined, the backend isn't injecting debug data.

2. **Verify Flask server is running correctly:**
   - Check terminal for errors
   - Visit http://localhost:5000 and verify page loads
   - Check that request_tracker middleware is registered in app.py

3. **Refresh after each action:**
   - Click something (view tasks, create user)
   - Developer Panel updates after page load

4. **Check browser console:**
   - F12 to open console
   - Look for JavaScript errors that might break Developer Panel
   - Verify devPanel.js is loading

### Method Calls Not Appearing

**Problem:** "My Model method runs but doesn't show in Method Call Stack."

**Solutions:**
1. **Add the decorator:**
   ```python
   @log_method_call  # ← This is required!
   def my_method(self):
       pass
   ```

2. **Import the decorator:**
   ```python
   from backend.utils.decorators import log_method_call
   ```

3. **Restart Flask server:**
   - Changes to decorators require restart
   - Ctrl+C then `npm start` again

4. **Check the decorator is working:**
   - Look in `flask.g.tracking['method_calls']`
   - If empty, decorator isn't firing

### Database Query Not Executing

**Problem:** "My SQL query doesn't run or returns no results."

**Solutions:**
1. **Check syntax:**
   - SQLite uses `?` for placeholders, not `%s`
   - String literals need single quotes: `WHERE status = 'done'`

2. **Verify parameters:**
   ```python
   # Correct:
   execute_query("SELECT * FROM tasks WHERE id = ?", (task_id,))
   
   # Wrong:
   execute_query("SELECT * FROM tasks WHERE id = ?", task_id)  # Missing tuple!
   ```

3. **Check table and column names:**
   - `tasks` not `task`
   - `owner_id` not `owner`
   - Use Database Inspector to see actual table structure

4. **Look at Database Inspector:**
   - See the exact query being executed
   - Check for SQL syntax errors
   - Verify parameters are being passed correctly

### Server Won't Start

**Problem:** "Flask server crashes or won't start."

**Solutions:**
1. **Check Python syntax:**
   - Look for syntax errors in terminal output
   - Missing colons, incorrect indentation
   - Unclosed strings or brackets

2. **Verify imports:**
   - All imports at top of file
   - Correct paths: `from backend.models.user import User`
   - No circular imports

3. **Check port availability:**
   - Is port 5000 already in use?
   - Kill existing Flask process or use different port

4. **Reinstall dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Check database file:**
   - Does `backend/database/educational_mvc.db` exist?
   - Run seed script: `python backend/database/seed.py`

### Form Submission Not Working

**Problem:** "Clicking submit doesn't create/update the record."

**Solutions:**
1. **Check form action and method:**
   ```html
   <form action="{{ url_for('tasks.create') }}" method="POST">
   ```

2. **Verify input names match Controller:**
   ```html
   <input name="title">  <!-- Controller: request.form.get('title') -->
   ```

3. **Check for flash messages:**
   - Are errors being shown?
   - Look for validation error messages

4. **Look at Network Inspector:**
   - Is the POST request being sent?
   - What status code? (200, 400, 500?)
   - Check request payload

5. **Check Developer Panel Method Call Stack:**
   - Is the Controller method being called?
   - Is the Model method being called?
   - Is validation raising an error?

---

## Additional Resources

### Further Reading

- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) - Complete project philosophy and design decisions
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical deep dive into implementation
- [README.md](../README.md) - Setup instructions and feature overview

### Community

- [GitHub Issues](https://github.com/yourusername/educational-mvc/issues) - Report bugs or ask questions
- [Discussions](https://github.com/yourusername/educational-mvc/discussions) - Share your experience, ask for help

### Next Steps After Completion

Once you've completed all 8 lessons:

1. **Build your own features** - Practice with Exploration Mode
2. **Apply to other frameworks** - MVC concepts transfer (Rails, Django, Laravel)
3. **Read the source code** - Understand how the Developer Panel works
4. **Contribute** - Add new lessons, fix bugs, improve documentation
5. **Teach others** - Best way to solidify understanding

---

**Happy learning! Remember: MVC is a pattern, not a prison. Understand the principles, then adapt them to your needs.**

---

*Last updated: January 2026*