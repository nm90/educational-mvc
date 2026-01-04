"""
Decorators for method invocation logging.

MVC Role: Utilities / Cross-cutting Concerns
- @log_method_call: Automatically logs method invocations for developer panel
- Captures method name, arguments, return value, and execution time
- Handles exceptions, large return values, and graceful degradation outside request context

Learning Purpose:
- Demonstrates Python decorators for transparent feature enhancement
- Shows how to add logging without modifying model code
- Enables the "no magic" philosophy - all method calls are visible in dev panel
- Lesson 2 covers how this decorator makes the MVC flow visible

Design Notes:
- Uses functools.wraps to preserve method metadata
- Uses time.perf_counter() for precise timing (not wall-clock time)
- Handles exceptions by logging them without re-raising (passes through)
- Truncates large return values to prevent bloating debug object
- Gracefully skips logging if Flask request context unavailable
"""

import functools
import time
import json
from typing import Any, Callable


def log_method_call(func: Callable) -> Callable:
    """
    Decorator to log method invocations for developer panel transparency.

    Captures method execution details and stores in Flask's request-scoped
    tracking object. This enables the developer panel to show the complete
    method call stack for each request.

    MVC Flow Impact:
    1. When a Controller route handler runs, this decorator sets g.controller_name
       (used by Network Inspector to show which controller handled the request)
    2. When a Controller calls a Model method, this decorator intercepts it
    3. Records method name, arguments, return value, and execution time
    4. Stores in g.tracking['method_calls'] (request-scoped)
    5. After request completes, Flask middleware injects all tracking data
       into HTML as window.__DEBUG__ object
    6. Developer panel reads window.__DEBUG__ and displays method call tree

    Dev Panel Shows:
    - Network Inspector: Controller name (e.g., "tasks.create") for all requests
    - Hierarchical tree of all method calls during request
    - Each method shows: arguments, return value, execution time
    - Developers can inspect data without modifying code
    - Demonstrates the exact sequence of method calls in MVC flow

    Edge Cases Handled:
    - Methods that raise exceptions: logs exception, passes it through
    - Large return values (> 1000 chars): truncated to prevent bloat
    - Methods called outside request context: skips logging gracefully
    - Static methods vs instance methods: handles both correctly
    - Methods with sensitive data: optional filtering (future enhancement)

    Example Usage:
    ```python
    @log_method_call
    def create(name, email):
        # Validation and database logic here
        return new_user

    @log_method_call
    def validate(name, email):
        # Validation logic
        return None  # Validation methods often return None on success
    ```

    Args:
        func: The function/method to decorate

    Returns:
        Wrapped function that logs invocations and returns original result

    Covered in: Lesson 2 (making method calls visible),
                Lesson 3 (logging Model methods)
    """

    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        # Try to import Flask components (fail gracefully if not in request context)
        try:
            from flask import g, request
        except RuntimeError:
            # Not in Flask request context - just run the function
            return func(*args, **kwargs)

        # Set controller name for devPanel Network Inspector
        # Uses request.endpoint which gives us "blueprint.function_name" (e.g., "tasks.create")
        # Only set if not already set (first decorated function wins - the route handler)
        # This ensures POST requests display controller name just like GET requests
        if not hasattr(g, 'controller_name') or g.controller_name == 'Unknown':
            try:
                # request.endpoint gives us "blueprint.function" format
                # e.g., "tasks.create", "users.index", "lessons.validate_checkpoint"
                g.controller_name = request.endpoint or func.__name__
            except RuntimeError:
                # No request context - use function name as fallback
                g.controller_name = func.__name__

        # Extract method name for logging
        # For instance methods, args[0] is 'self' - extract class from it
        # For static methods, use __qualname__ which has format "ClassName.method_name"
        is_controller_method = False
        if args and hasattr(args[0], '__class__') and \
           hasattr(args[0].__class__, func.__name__):
            # Instance method: include class name
            class_name = args[0].__class__.__name__
            method_name = f"{class_name}.{func.__name__}"
            logged_args = args[1:]  # Remove 'self' from args
        elif '.' in func.__qualname__:
            # Static method or class method: __qualname__ contains "ClassName.method_name"
            method_name = func.__qualname__
            logged_args = args
        else:
            # Regular function (likely a Flask route handler / controller method)
            # Use request.endpoint for qualified name (e.g., "users.create", "tasks.index")
            # This makes controller methods show up properly in the Method Calls list
            is_controller_method = True
            try:
                method_name = request.endpoint or func.__name__
            except RuntimeError:
                method_name = func.__name__
            logged_args = args

        # For controller methods, log at the START of execution
        # This is critical because success_response() captures tracking data before
        # the controller method finishes, so we need to log before calling the function
        # We'll store the log entry index to update duration after execution
        controller_log_index = None
        if is_controller_method and hasattr(g, 'tracking'):
            controller_log_index = len(g.tracking['method_calls'])
            _log_method_call(
                method_name=method_name,
                args=_sanitize_args(logged_args),
                kwargs=_sanitize_kwargs(kwargs),
                return_value='[pending]',
                duration_ms=0,
                exception=None
            )

        # Record start time (using perf_counter for more accurate timing)
        # perf_counter is better than time.time() because:
        # - Not affected by system clock adjustments
        # - Higher resolution
        # - Monotonic (always increases)
        start_time = time.perf_counter()

        # Call the actual method
        # We don't catch exceptions here - they should propagate
        # But we do log them before they propagate
        exception_occurred = None
        result = None

        try:
            result = func(*args, **kwargs)
        except Exception as e:
            # Record that an exception occurred
            exception_occurred = e
            # Calculate duration before re-raising
            duration_ms = (time.perf_counter() - start_time) * 1000

            # For controller methods, update the existing log entry
            if is_controller_method and controller_log_index is not None:
                if hasattr(g, 'tracking') and controller_log_index < len(g.tracking['method_calls']):
                    g.tracking['method_calls'][controller_log_index]['duration_ms'] = round(duration_ms, 2)
                    g.tracking['method_calls'][controller_log_index]['exception'] = str(e)
                    g.tracking['method_calls'][controller_log_index]['return_value'] = None
            else:
                # Log the exception call for non-controller methods
                _log_method_call(
                    method_name=method_name,
                    args=_sanitize_args(logged_args),
                    kwargs=_sanitize_kwargs(kwargs),
                    return_value=None,
                    duration_ms=round(duration_ms, 2),
                    exception=str(e)
                )
            # Re-raise the exception so normal error handling continues
            raise

        # Calculate duration in milliseconds
        duration_ms = (time.perf_counter() - start_time) * 1000

        # For controller methods, update the existing log entry with final data
        if is_controller_method and controller_log_index is not None:
            if hasattr(g, 'tracking') and controller_log_index < len(g.tracking['method_calls']):
                g.tracking['method_calls'][controller_log_index]['duration_ms'] = round(duration_ms, 2)
                g.tracking['method_calls'][controller_log_index]['return_value'] = '[Response]'
        else:
            # Prepare return value for logging (truncate if too large)
            logged_return_value = _truncate_value(result)

            # Log the successful call for non-controller methods
            _log_method_call(
                method_name=method_name,
                args=_sanitize_args(logged_args),
                kwargs=_sanitize_kwargs(kwargs),
                return_value=logged_return_value,
                duration_ms=round(duration_ms, 2),
                exception=None
            )

        # Return the original result (not the truncated version)
        return result

    return wrapper


def _log_method_call(method_name: str, args: list, kwargs: dict,
                     return_value: Any, duration_ms: float, exception: str = None) -> None:
    """
    Internal helper to log method call to Flask's request-scoped tracking.

    This is called by the @log_method_call decorator. It stores method
    invocation data in Flask's g.tracking['method_calls'] for later
    injection into the HTML response as the __DEBUG__ object.

    Args:
        method_name: Qualified method name (e.g., 'User.create')
        args: Arguments passed to method (already sanitized)
        kwargs: Keyword arguments passed to method (already sanitized)
        return_value: What the method returned (already truncated)
        duration_ms: How long the method took to execute
        exception: Exception message if one occurred, None otherwise
    """
    try:
        from flask import g
    except RuntimeError:
        # Not in Flask request context - skip logging
        return

    # Don't log if tracking not initialized (shouldn't happen, but be safe)
    if not hasattr(g, 'tracking'):
        return

    # Create log entry
    call_entry = {
        'method_name': method_name,
        'args': args,
        'kwargs': kwargs,
        'return_value': return_value,
        'duration_ms': duration_ms,
        'timestamp': time.time(),
    }

    # Add exception info if one occurred
    if exception:
        call_entry['exception'] = exception

    # Add to tracking list
    g.tracking['method_calls'].append(call_entry)


def _truncate_value(value: Any, max_length: int = 1000) -> Any:
    """
    Truncate large return values to prevent bloating the debug object.

    The debug object is injected into every HTML response. If methods
    return very large values (e.g., entire dataset), this can create
    huge HTML responses. This function ensures we only log a reasonable
    summary of return values.

    Args:
        value: The value to potentially truncate
        max_length: Maximum string representation length

    Returns:
        Original value if small, truncated representation if large

    Examples:
        >>> _truncate_value({'name': 'Alice'})
        {'name': 'Alice'}  # Small dict, kept as-is

        >>> _truncate_value('x' * 2000)
        'xxxx...xxxx [TRUNCATED to 1000 chars]'  # Large string, truncated

        >>> _truncate_value([1,2,3,4,5])
        [1,2,3,4,5]  # Small list, kept as-is
    """
    try:
        # Try to get string representation
        str_value = str(value)

        # If it's small enough, return the original value
        if len(str_value) <= max_length:
            return value

        # If it's too large, return a truncated string representation
        truncation_msg = f' ... [TRUNCATED to {max_length} chars]'
        return str_value[:max_length - len(truncation_msg)] + truncation_msg

    except Exception:
        # If something goes wrong, just return the value as-is
        return value


def _sanitize_args(args: tuple) -> list:
    """
    Convert args tuple to list and make safe for JSON serialization.

    The debug object is JSON-stringified before injection into HTML.
    Some Python objects aren't JSON-serializable. This function converts
    them to safe representations.

    Args:
        args: Positional arguments tuple

    Returns:
        List of JSON-safe argument representations

    Notes:
    - Generally we want to show arguments for debugging
    - But we should filter out sensitive data (passwords, tokens)
    - For now, we just convert to strings (future: add sensitive field list)
    """
    sanitized = []
    for arg in args:
        if isinstance(arg, (str, int, float, bool, type(None))):
            # These are already JSON-serializable
            sanitized.append(arg)
        else:
            # Convert to string representation
            # Future enhancement: check if field is sensitive data
            sanitized.append(str(arg)[:100])  # Limit string length

    return sanitized


def _sanitize_kwargs(kwargs: dict) -> dict:
    """
    Make kwargs safe for JSON serialization.

    The debug object is JSON-stringified before injection into HTML.
    This function converts non-JSON-serializable values to safe representations.

    Args:
        kwargs: Keyword arguments dictionary

    Returns:
        Dictionary with JSON-safe values

    Notes:
    - Generally we want to show kwargs for debugging
    - But we should filter out sensitive data (passwords, tokens)
    - For now, we just convert to strings (future: add sensitive field list)
    """
    sanitized = {}
    for key, value in kwargs.items():
        if isinstance(value, (str, int, float, bool, type(None))):
            # These are already JSON-serializable
            sanitized[key] = value
        else:
            # Convert to string representation
            # Future enhancement: check if field is sensitive data
            sanitized[key] = str(value)[:100]  # Limit string length

    return sanitized
