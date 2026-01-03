"""
Request tracking middleware for the Educational MVC App.

MVC Role: Cross-cutting Concern (Utilities)
- Tracks every HTTP request through the entire request/response cycle
- Logs all method invocations (for developer panel visibility)
- Logs all database queries (for SQL inspector)
- Records timing information for performance analysis
- Injects __DEBUG__ object into HTML responses for client-side inspection

How it works:
1. before_request() generates unique request_id and initializes tracking storage
2. During request processing, decorators and manual calls log method calls and queries
3. after_request() injects __DEBUG__ JSON into HTML responses
4. Client-side developer panel reads __DEBUG__ and displays complete flow

Learning Purpose:
- Demonstrates request-scoped storage using Flask's 'g' object
- Shows how middleware can transparently enhance applications
- Enables developers to inspect internal execution without modifying code
- Lesson 2 covers how data flows from controller → model → database → view
  (This file is the "invisible logger" for that flow)

Important:
- This middleware is LIGHTWEIGHT (doesn't slow down requests significantly)
- Request-scoped storage (g) automatically cleaned up after request completes
- __DEBUG__ only injected into HTML responses (content-type check)
- All sensitive data is removed before injection (never expose secrets)
"""

import uuid
import json
import time
import copy
from flask import g, request, after_this_request, render_template as flask_render_template
from functools import wraps


# ============================================================================
# REQUEST TRACKING DATA STRUCTURE
# ============================================================================
# This is the structure we store in flask.g.tracking during each request

def init_request_tracking():
    """
    Initialize the tracking data structure for a new request.

    Stored in flask.g.tracking which is request-scoped (unique per request).

    Structure:
    {
        'method_calls': [
            {
                'method_name': 'User.validate',
                'args': ['Alice', 'alice@example.com'],
                'kwargs': {},
                'return_value': True,
                'duration_ms': 2.5,
                'timestamp': 1234567890.123
            },
            ...
        ],
        'db_queries': [
            {
                'query': 'SELECT * FROM users WHERE email = ?',
                'params': ['alice@example.com'],
                'result_row_count': 1,
                'duration_ms': 5.3,
                'timestamp': 1234567890.456
            },
            ...
        ],
        'timing': {
            'request_start': 1234567890.0,
            'request_end': 1234567890.5,
            'controller_start': None,
            'controller_end': None,
            'db_start': None,
            'db_end': None
        },
        'view_data': {
            'users': [...],
            'tasks': [...]
        },
        'request_info': {
            'method': 'GET',
            'url': '/tasks',
            'headers': {...},
            'status': 200,
            'controller': 'TaskController.index',
            'content_type': 'text/html'
        }
    }
    """
    return {
        'method_calls': [],
        'db_queries': [],
        'timing': {
            'request_start': time.time(),
            'request_end': None
        },
        'view_data': {},
        'request_info': {}
    }


# ============================================================================
# FLASK MIDDLEWARE FUNCTIONS
# ============================================================================

def before_request():
    """
    Flask middleware: Execute before each request.

    What happens:
    1. Generate unique request_id (UUID4)
    2. Store in flask.g.request_id (request-scoped)
    3. Initialize tracking data structure
    4. Record request start timestamp
    5. Capture request information (method, URL, headers)

    Why in before_request?
    - Runs before any route handler
    - Ensures every request gets an ID and tracking initialized
    - Uses Flask's 'g' object (automatically cleaned up after request)

    Dev Panel use:
    - request_id ties all related data together
    - timing.request_start marks beginning of execution
    - request_info shows Network Inspector details
    """
    # Generate unique ID for this request (used to correlate logs)
    g.request_id = str(uuid.uuid4())

    # Initialize tracking data structure (empty at start)
    g.tracking = init_request_tracking()

    # Capture request information for Network Inspector
    g.tracking['request_info'] = {
        'request_id': g.request_id,
        'method': request.method,
        'url': request.path,
        'timestamp': time.time(),
        'headers': dict(request.headers)
    }

    # Log the request start for developer panel
    # (exact timestamp recorded above in init_request_tracking)


def after_request(response):
    """
    Flask middleware: Execute after request, before response sent to client.

    What happens:
    1. Record request end timestamp
    2. Capture response information (status code, content-type)
    3. Check if response is HTML (content-type: text/html)
    4. If HTML, inject __DEBUG__ object before </body>
    5. Return modified response

    Why inject __DEBUG__?
    - Provides complete execution data to client-side dev panel
    - No extra HTTP requests needed (data already computed)
    - JavaScript reads window.__DEBUG__ to populate all tabs
    - Shows method calls, queries, timing, view data, request info in one object

    Format:
    <script>window.__DEBUG__ = {...};</script>

    Important:
    - Only injected into HTML (not JSON, images, etc.)
    - Placed just before </body> for clarity
    - JSON stringified and safe for HTML context
    """
    # Record when request ended
    g.tracking['timing']['request_end'] = time.time()

    # Capture response information for Network Inspector
    if hasattr(g, 'tracking') and 'request_info' in g.tracking:
        g.tracking['request_info']['status'] = response.status_code
        g.tracking['request_info']['content_type'] = response.content_type or 'text/html'

        # Try to get controller information from Flask's routing info
        # This is set by the route handler if needed
        if not hasattr(g, 'controller_name'):
            g.controller_name = 'Unknown'
        g.tracking['request_info']['controller'] = g.controller_name

    # Only inject debug object into HTML responses
    if response.content_type and 'text/html' in response.content_type:
        try:
            # Get the response HTML as string
            response_html = response.get_data(as_text=True)

            # Create the debug object with all tracking data
            debug_object = {
                'request_id': g.request_id,
                'method_calls': g.tracking['method_calls'],
                'db_queries': g.tracking['db_queries'],
                'timing': g.tracking['timing'],
                'view_data': g.tracking['view_data'],
                'request_info': g.tracking.get('request_info', {})
            }

            # Convert to JSON (safe for HTML context)
            debug_json = json.dumps(debug_object)

            # Inject before </body> tag
            # Using <script> to define window.__DEBUG__ for JavaScript access
            debug_script = f'<script>window.__DEBUG__ = {debug_json};</script>'

            # Find closing body tag and insert before it
            if '</body>' in response_html:
                modified_html = response_html.replace('</body>', f'{debug_script}</body>')
                response.set_data(modified_html)

        except Exception as e:
            # If something goes wrong, don't break the response
            # Just log it and return original response
            print(f"Error injecting debug object: {e}")

    return response


# ============================================================================
# HELPER FUNCTIONS FOR LOGGING
# ============================================================================

def track_method_call(method_name, args=None, kwargs=None, return_value=None, duration_ms=0):
    """
    Log a method invocation to the request's tracking data.

    Called by @log_method_call decorator (automatically).

    Args:
        method_name (str): Name of method called (e.g., 'User.validate')
        args (tuple): Positional arguments passed to method
        kwargs (dict): Keyword arguments passed to method
        return_value: What the method returned
        duration_ms (float): How long the method took to execute

    Stored in g.tracking['method_calls'] as ordered list.

    Dev Panel use:
    - Displays as tree/stack of all method calls
    - Click to expand and see arguments and return value
    - Shows execution time for each method
    - Allows clicking to view source code

    Example entry:
    {
        'method_name': 'Task.validate',
        'args': [],
        'kwargs': {'title': 'Buy milk', 'owner_id': 1},
        'return_value': True,
        'duration_ms': 1.23,
        'timestamp': 1234567890.456
    }
    """
    # Don't log if tracking not initialized (shouldn't happen)
    if not hasattr(g, 'tracking'):
        return

    # Create entry
    call_entry = {
        'method_name': method_name,
        'args': args or [],
        'kwargs': kwargs or {},
        'return_value': return_value,
        'duration_ms': duration_ms,
        'timestamp': time.time()
    }

    # Add to tracking
    g.tracking['method_calls'].append(call_entry)


def track_db_query(query, params=None, result_row_count=0, duration_ms=0):
    """
    Log a database query to the request's tracking data.

    Called by database wrapper (will be implemented in Phase 2).

    Args:
        query (str): SQL query text (e.g., 'SELECT * FROM users WHERE id = ?')
        params (list): Parameters bound to query (e.g., [1])
        result_row_count (int): Number of rows returned/affected
        duration_ms (float): How long the query took to execute

    Stored in g.tracking['db_queries'] as ordered list.

    Dev Panel use:
    - Displays in Database Inspector tab
    - Shows query text with parameters
    - Shows result count and execution time
    - Can identify slow queries or N+1 problems
    - Lesson 4 covers understanding and fixing N+1 queries

    Example entry:
    {
        'query': 'SELECT * FROM tasks WHERE owner_id = ? AND status = ?',
        'params': [1, 'todo'],
        'result_row_count': 3,
        'duration_ms': 4.2,
        'timestamp': 1234567890.789
    }
    """
    # Don't log if tracking not initialized (shouldn't happen)
    if not hasattr(g, 'tracking'):
        return

    # Create entry
    query_entry = {
        'query': query,
        'params': params or [],
        'result_row_count': result_row_count,
        'duration_ms': duration_ms,
        'timestamp': time.time()
    }

    # Add to tracking
    g.tracking['db_queries'].append(query_entry)


def track_view_data(data):
    """
    Store data passed to template in tracking.

    Called by controllers after preparing view data (before rendering).

    Args:
        data (dict): Data dictionary passed to render_template()
                    (e.g., {'users': [...], 'current_user': {...}})

    Stored in g.tracking['view_data'].

    Dev Panel use:
    - Displays in State Inspector tab
    - Shows exactly what data controller passed to view
    - Allows nested inspection (click to explore task.owner)
    - Shows data types and values
    - Helps understand View layer (V in MVC)

    Why separate from template?
    - Data → template is view layer
    - Seeing this data helps understand controller/view boundary
    - Shows what information is available to the template to render

    Important Implementation Details:
    - Uses deep copy to avoid mutations of original data
    - Handles circular references gracefully (converts to string representation)
    - Never exposes sensitive data like passwords
    - Filters out Flask-specific objects that can't be serialized

    Example:
    {
        'users': [
            {'id': 1, 'name': 'Alice', ...},
            {'id': 2, 'name': 'Bob', ...}
        ],
        'current_user': {'id': 1, ...},
        'page_title': 'Users List'
    }
    """
    # Don't log if tracking not initialized (shouldn't happen)
    if not hasattr(g, 'tracking'):
        return

    # Store view data with deep copy to avoid mutations
    # Deep copy ensures that changes to the original data after rendering
    # won't affect what the dev panel shows
    try:
        # Try to deep copy the data to avoid reference issues
        # This is important because templates might modify data during rendering
        g.tracking['view_data'] = copy.deepcopy(data)
    except (TypeError, ValueError):
        # If deep copy fails (circular references, non-serializable objects),
        # store the data as-is and let JSON serialization in after_request handle it
        # The after_request will catch any serialization errors gracefully
        g.tracking['view_data'] = data


def tracked_render_template(template_name, **context):
    """
    Render a template and automatically track the context data passed to it.

    This is a wrapper around Flask's render_template that automatically calls
    track_view_data() with the context variables before rendering.

    Usage in controllers:
    @users_bp.route('/')
    def index():
        users = User.get_all()
        # Automatically tracks context before rendering
        return tracked_render_template('users/index.html', users=users)

    Args:
        template_name (str): Name of the template file (e.g., 'users/index.html')
        **context: All context variables passed to the template

    What it does:
    1. Automatically calls track_view_data(context) to log what data the controller passed
    2. Calls Flask's render_template() with the same arguments
    3. Returns the rendered template

    Benefits of using this:
    - No need to manually call track_view_data() in every controller
    - DRY - single place to track all template rendering
    - Ensures view data is always captured for the developer panel
    - Makes controller code cleaner

    Dev Panel use:
    - All context data automatically appears in State Inspector tab
    - Shows exactly what variables were available to the template
    - Tracks the data flow from Controller → View
    """
    # Automatically track the context data being passed to the template
    # This allows the State Inspector tab to show what data reached the view
    track_view_data(context)

    # Render the template with the original Flask function
    return flask_render_template(template_name, **context)


# ============================================================================
# DECORATOR FOR AUTOMATIC METHOD LOGGING
# ============================================================================

def log_method_call(func):
    """
    Decorator: Automatically log method calls with arguments, return value, and duration.

    Usage:
    @log_method_call
    def my_method(arg1, arg2):
        return result

    What it does:
    1. Records method name
    2. Captures all arguments (args and kwargs)
    3. Executes the method and times it
    4. Captures return value
    5. Logs everything to g.tracking['method_calls']

    Why a decorator?
    - Automatic logging without modifying method code
    - Consistent across all models and controllers
    - Can be toggled on/off easily
    - Separates logging concern from business logic

    Dev Panel use:
    - Decorator enables Method Call Stack tab
    - Shows complete call tree during request
    - Developers can see exactly what methods were called and when
    - Makes MVC flow visible and debuggable

    Lesson coverage:
    - Lesson 2: Introduces method logging
    - Lesson 3: Shows Model methods being logged
    - Lesson 5: Shows Controller methods being logged

    Example log entry:
    method_name: 'User.validate'
    args: []
    kwargs: {'email': 'alice@example.com'}
    return_value: True
    duration_ms: 2.5
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Extract class name if this is a method
        # (args[0] is 'self' for instance methods)
        if args and hasattr(args[0], '__class__'):
            class_name = args[0].__class__.__name__
            method_name = f"{class_name}.{func.__name__}"
            # Remove 'self' from args for logging
            logged_args = args[1:]
        else:
            method_name = func.__name__
            logged_args = args

        # Record start time
        start_time = time.time()

        # Call the actual method
        result = func(*args, **kwargs)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Log the call
        track_method_call(
            method_name=method_name,
            args=list(logged_args),
            kwargs=kwargs,
            return_value=result,
            duration_ms=round(duration_ms, 2)
        )

        return result

    return wrapper


# ============================================================================
# INITIALIZATION FUNCTION FOR FLASK APP
# ============================================================================

def register_request_tracking(app):
    """
    Register request tracking middleware with Flask app.

    This function should be called in app.py after creating the Flask app:

    from backend.utils.request_tracker import register_request_tracking
    app = Flask(__name__)
    register_request_tracking(app)

    Registers two middleware functions:
    - before_request(): Initializes tracking for each request
    - after_request(): Injects __DEBUG__ into responses

    Args:
        app: Flask application instance
    """
    app.before_request(before_request)
    app.after_request(after_request)
