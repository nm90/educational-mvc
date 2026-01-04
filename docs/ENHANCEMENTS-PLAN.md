# Enhancements Plan

This document outlines planned improvements to the Educational MVC application, organized by priority based on development goals.

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
    │   └── lessonPanel.css     # Lesson panel styles
    └── js/
        ├── main.js             # Application initialization
        ├── devPanel.js         # Developer panel component
        ├── lessonEngine.js     # Lesson engine
        ├── modeManager.js      # Tutorial/Exploration mode toggle
        ├── userFeedback.js     # Toast notifications
        ├── mvc-api.js          # API client wrapper
        └── mvc-forms.js        # Form interception handler

lessons/                        # JSON lesson files (Lesson 1-8)
docs/                           # Documentation
implementation-scripts/         # Helper scripts for development
```

---

## Priority 1: DevPanel Improvements

These enhancements improve the debugging and learning experience, forming the foundation for effective lessons.

### 1.1 Graceful SQL Exception Handling

**Goal**: Surface SQL exceptions (like `UNIQUE constraint failed`) in the devPanel with full debug information.

**Implementation**:
- Modify `backend/database/connection.py` to catch `sqlite3.IntegrityError` and other SQL exceptions
- Wrap exceptions in a structured format: `{ "error_type": "...", "message": "...", "raw": "..." }`
- In the application UI: show user-friendly messages (e.g., "Email already exists")
- In devPanel: display full raw SQL error details for educational purposes
- Ensure exceptions flow through `request_tracker.py` for logging

**Files**:
- `backend/database/connection.py` - catch and structure exceptions
- `backend/utils/request_tracker.py` - add `errors` collection to debug data
- `backend/static/js/devPanel.js` - render errors in a new "Errors" tab or section

---

### 1.2 Log DELETE Requests in Console and Request Viewer

**Goal**: Ensure DELETE HTTP methods appear in devPanel logging.

**Investigation needed**: Check if DELETE requests bypass the `before_request`/`after_request` middleware or if the response format differs.

**Files**:
- `backend/utils/request_tracker.py` - verify middleware covers all HTTP methods
- `backend/static/js/mvc-api.js` - ensure DELETE responses are processed for debug data

---

### 1.3 Log Controller Name for POST Requests

**Goal**: Display the controller/method name in devPanel for POST operations, matching GET behavior.

**Files**:
- `backend/controllers/*.py` - ensure `@log_method_call` decorator is applied to POST handlers
- `backend/utils/request_tracker.py` - verify controller name capture for POST routes

---

### 1.4 Expand Click Area for Collapsible Sections

**Goal**: Make the entire header row clickable to expand/collapse devPanel sections, not just the tiny triangle icon.

**Implementation**:
- Add click handler to the full header row element
- Update CSS cursor to `pointer` on hover for entire row
- Ensure other interactive elements in the header (if any) don't conflict

**Files**:
- `backend/static/js/devPanel.js` - expand click handler to header row
- `backend/static/css/devpanel.css` - update cursor and hover styles

---

### 1.5 Strip HTML Comments for Controller HTML Responses

**Goal**: When displaying HTML output in devPanel, strip inline comments to reduce noise, replacing them with a single note pointing to the source file.

**Implementation**:
- Before displaying HTML in devPanel, run regex to remove `<!-- ... -->` comments
- Prepend a single comment: `<!-- See source: templates/[path].html for inline comments -->`
- Do NOT truncate the rest of the HTML content
- No toggle for original comments (hide completely per user preference)

**Files**:
- `backend/static/js/devPanel.js` - add `stripHtmlComments(html, templatePath)` utility
- Apply to HTML response display in relevant devPanel tab

---

## Priority 2: Flow Diagram Enhancement

### 2.1 Interactive Flow Boxes with Pop-up Details

**Goal**: Add click selection to flow diagram boxes, showing contextual details in a pop-up.

**Details to show** (based on box type):
- **Controller box**: Method name, file path, link to view source
- **Model box**: Method name, file path, link to view source
- **Database box**: SQL statement, execution time, link to database code
- **View box**: Template file path, link to view source

**Implementation**:
- Add `data-flow-type` and `data-flow-meta` attributes to flow box elements
- On click, render a pop-up/tooltip with metadata
- Include clickable "View Source" link (opens file or scrolls to relevant devPanel section)
- Add keyboard accessibility (Enter/Space to activate)

**Files**:
- `backend/static/js/devPanel.js` - add flow box click handlers and pop-up rendering
- `backend/static/css/devpanel.css` - pop-up styling, selected state

---

## Priority 3: UI/UX Fixes

### 3.1 Code Editor Keyboard Navigation

**Goal**: Prevent Ctrl+Arrow and Ctrl+Shift+Arrow from navigating lesson steps when focus is in the code editor area.

**Implementation**:
- In `lessonEngine.js`, check if keyboard event target is within a code input/textarea
- If so, allow default editor behavior for Ctrl+Arrow combinations
- Only trigger lesson navigation when focus is outside editable areas
- Specific keys to intercept: Ctrl+Left, Ctrl+Right, Ctrl+Shift+Left, Ctrl+Shift+Right

**Files**:
- `backend/static/js/lessonEngine.js` - modify keyboard event handlers

---

### 3.2 Resizable Lesson Panel

**Goal**: Allow users to resize the lesson panel to their preference.

**Implementation**:
- Add a drag handle to the lesson panel edge
- Implement drag-to-resize with mouse events
- Persist width to localStorage (key: `lessonPanelWidth`)
- Restore saved width on page load
- Set reasonable min/max constraints

**Files**:
- `backend/static/js/lessonEngine.js` - add resize logic and localStorage persistence
- `backend/static/css/lessonPanel.css` - drag handle styling, min/max widths

---

## Priority 4: Bug Fixes

### 4.1 POST /lessons/3/checkpoint Returns 400

**Investigation**:
- Check `backend/controllers/lesson_controller.py` for checkpoint handling
- Verify request body format matches what `checkpoint_validator.py` expects
- Test checkpoint validation logic for lesson 3 specifically

**Files**:
- `backend/controllers/lesson_controller.py`
- `backend/utils/checkpoint_validator.py`
- `lessons/lesson-3.json` - verify checkpoint definition

---

### 4.2 Lesson 1 Completion Not Working

**Investigation**:
- Check `lessonEngine.js` progress tracking logic
- Verify localStorage keys for lesson 1 completion
- Test step-by-step to identify where completion fails

**Files**:
- `backend/static/js/lessonEngine.js`
- `lessons/lesson-1.json`

---

## Priority 5: Lesson Content Updates

### 5.1 Update Lesson 3: Remove UI Validation

**Goal**: Remove built-in UI validation from lesson 3 so students can add it themselves in a later lesson.

**Implementation**:
- Edit `lessons/lesson-3.json` to remove validation-related instructions
- Update any code checkpoints that assume validation exists
- Add comments in the lesson about validation being added later

**Files**:
- `lessons/lesson-3.json`

---

### 5.2 New Lesson: Front-End Validation

**Goal**: Teach students to add client-side validation, highlighting the benefit of avoiding network calls for invalid data.

**Content outline**:
1. Explain why client-side validation matters (UX, bandwidth)
2. Walk through adding validation to a form
3. Show devPanel before/after: no network request when validation fails
4. Checkpoint: student implements validation for another field

**Files**:
- Create `lessons/lesson-9.json` (or next available number)

---

### 5.3 New Lesson: Remove Duplicate User Query

**Goal**: Teach students to identify and eliminate redundant database queries in POST /tasks.

**Content outline**:
1. Use devPanel to show the duplicate query
2. Explain the performance impact
3. Guide refactoring to eliminate redundancy
4. Checkpoint: verify query count reduced

**Files**:
- Create new lesson JSON file
- May need to temporarily add the duplicate query if it was already fixed

---

### 5.4 New Lesson: Controller Logging for DevPanel

**Goal**: Teach students how the `@log_method_call` decorator works and how to add logging to new controller methods.

**Content outline**:
1. Examine existing decorator usage
2. Explain what data gets captured
3. Add decorator to an undecorated method
4. Verify it appears in devPanel

**Files**:
- Create new lesson JSON file

---

## Implementation Order

Based on the priority structure and dependencies:

1. **DevPanel foundation** (1.1-1.5) - Enables better debugging for all other work
2. **Bug fixes** (4.1-4.2) - Unblocks lesson functionality
3. **Flow diagram** (2.1) - Enhances educational value
4. **UI/UX** (3.1-3.2) - Quality of life improvements
5. **Lesson 3 update** (5.1) - Prepares for new validation lesson
6. **New lessons** (5.2-5.4) - Added as lessons 9, 10, 11

---

## Technical Notes

- **localStorage keys in use**: `lessonProgress`, `currentLesson` (add `lessonPanelWidth`)
- **Debug data injection point**: `request_tracker.py` `after_request` handler
- **Key JS files**: `devPanel.js`, `lessonEngine.js`, `mvc-api.js`
- **Decorator location**: `backend/utils/decorators.py`
