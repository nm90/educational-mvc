"""
Response helper utilities for dual-mode controllers (HTML and JSON).

MVC Role: Utilities / Cross-cutting Concerns
- Enables controllers to serve both traditional HTML and modern JSON API responses
- Standardizes JSON response format with embedded __DEBUG__ data
- Detects client intent (HTML vs JSON) from request headers

Learning Purpose:
- Demonstrates how modern APIs support multiple response formats
- Shows content negotiation in practice
- Explains progressive enhancement pattern
- Enables transparent debugging for async requests

Design Notes:
- HTML mode (traditional): controller returns render_template() or redirect()
- JSON mode (modern): controller returns JSON with data + __DEBUG__
- Same route handles both - determined by Accept header or format parameter
- __DEBUG__ embedded directly in JSON response (no separate requests)
"""

from flask import jsonify, request, g
from typing import Any, Dict, Optional, Tuple


def wants_json() -> bool:
    """
    Determine if the client wants a JSON response.

    Checks multiple indicators:
    1. Accept header contains 'application/json'
    2. Query parameter ?format=json
    3. X-Requested-With header (indicates fetch/XHR request)

    Returns:
        bool: True if client wants JSON, False for HTML

    Example:
        >>> # Client: fetch('/users', {headers: {'Accept': 'application/json'}})
        >>> wants_json()  # Returns True

        >>> # Client: <form action="/users" method="POST">
        >>> wants_json()  # Returns False (browser default)

    Educational Note:
    This demonstrates content negotiation - the same endpoint can serve
    multiple formats based on client preference.
    """
    # Check Accept header (standard HTTP way to request JSON)
    accept = request.headers.get('Accept', '')
    if 'application/json' in accept:
        return True

    # Check query parameter (explicit format request)
    # Useful for testing or when Accept header can't be set
    if request.args.get('format') == 'json':
        return True

    # Check X-Requested-With header (set by fetch() and jQuery)
    # Indicates this is an XHR/async request
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return True

    # Default: HTML mode (traditional form POST)
    return False


def success_response(
    data: Any = None,
    redirect: Optional[str] = None,
    status: int = 200
) -> Tuple[Any, int]:
    """
    Create a standardized success JSON response with __DEBUG__.

    This is the response format for successful operations in JSON mode.
    The response includes all request tracking data for developer transparency.

    Args:
        data: The response data (user object, task list, etc.)
              Can be any JSON-serializable Python object
        redirect: Optional URL the client should navigate to after success
                  (useful for forms that should redirect to detail page)
        status: HTTP status code (default 200 for success, 201 for created)

    Returns:
        Tuple of (JSON response, HTTP status code)

    Response Format:
        {
            "success": true,
            "data": {
                "user": {"id": 1, "name": "Alice", ...},
                "redirect": "/users/1"  # If redirect parameter provided
            },
            "__DEBUG__": {
                "request_id": "uuid-here",
                "method_calls": [
                    {
                        "method_name": "User.create",
                        "args": ["Alice", "alice@example.com"],
                        "return_value": {"id": 1, ...},
                        "duration_ms": 5.2
                    },
                    ...
                ],
                "db_queries": [
                    {
                        "query": "INSERT INTO users (name, email) VALUES (?, ?)",
                        "params": ["Alice", "alice@example.com"],
                        "duration_ms": 3.1
                    },
                    ...
                ],
                "timing": {
                    "request_start": 1234567890.123,
                    "request_end": 1234567890.456
                }
            }
        }

    Example:
        >>> # In controller
        >>> user = User.create("Alice", "alice@example.com")
        >>> return success_response(
        ...     data={'user': user},
        ...     redirect=url_for('users.show', user_id=user['id'])
        ... )

    Educational Note:
    The __DEBUG__ object is embedded in the JSON response, not injected
    separately like in HTML mode. This allows the JavaScript client to
    receive all request data in a single response without redirects.
    """
    # Build response data dictionary
    response_data = {
        'success': True,
        'data': data or {}
    }

    # Add redirect URL to data if provided
    if redirect:
        response_data['data']['redirect'] = redirect

    # Embed __DEBUG__ object if tracking is available
    # (should always be available during normal request handling)
    if hasattr(g, 'tracking') and hasattr(g, 'request_id'):
        response_data['__DEBUG__'] = {
            'request_id': g.request_id,
            'method_calls': g.tracking['method_calls'],
            'db_queries': g.tracking['db_queries'],
            'errors': g.tracking.get('errors', []),
            'timing': g.tracking['timing'],
            'view_data': g.tracking.get('view_data', {}),
            'request_info': g.tracking.get('request_info', {})
        }

    # Return JSON response with appropriate status code
    return jsonify(response_data), status


def error_response(
    message: str,
    field: Optional[str] = None,
    code: Optional[str] = None,
    status: int = 400
) -> Tuple[Any, int]:
    """
    Create a standardized error JSON response with __DEBUG__.

    This is the response format for failed operations in JSON mode.
    Provides detailed error information for client-side error handling.

    Args:
        message: Human-readable error message (shown to user)
        field: Optional field name that caused the error
               (useful for form field highlighting on client)
        code: Optional machine-readable error code
              Examples: 'VALIDATION_ERROR', 'NOT_FOUND', 'DUPLICATE_EMAIL'
        status: HTTP status code (400 for validation, 404 for not found, etc.)

    Returns:
        Tuple of (JSON response, HTTP status code)

    Response Format:
        {
            "success": false,
            "error": {
                "message": "Email format invalid: bad-email",
                "field": "email",  # Optional: which field failed
                "code": "VALIDATION_ERROR"  # Optional: error type
            },
            "__DEBUG__": {
                "request_id": "uuid-here",
                "method_calls": [...],
                "db_queries": [...],
                "timing": {...}
            }
        }

    Example:
        >>> # Validation error in controller
        >>> try:
        ...     user = User.create(name, email)
        ... except ValueError as e:
        ...     return error_response(
        ...         message=str(e),
        ...         field='email',
        ...         code='VALIDATION_ERROR',
        ...         status=400
        ...     )

    Educational Note:
    The error response includes:
    1. Human message for UI display
    2. Field name for form highlighting
    3. Error code for programmatic handling
    4. Full __DEBUG__ trace for understanding why validation failed
    """
    # Build error details
    error_data = {
        'message': message
    }

    # Add field name if provided (for form field highlighting)
    if field:
        error_data['field'] = field

    # Add error code if provided (for programmatic error handling)
    if code:
        error_data['code'] = code

    # Build full response
    response_data = {
        'success': False,
        'error': error_data
    }

    # Embed __DEBUG__ object if tracking is available
    # Even on errors, we want to see what the Model tried to do
    if hasattr(g, 'tracking') and hasattr(g, 'request_id'):
        response_data['__DEBUG__'] = {
            'request_id': g.request_id,
            'method_calls': g.tracking['method_calls'],
            'db_queries': g.tracking['db_queries'],
            'errors': g.tracking.get('errors', []),
            'timing': g.tracking['timing'],
            'view_data': g.tracking.get('view_data', {}),
            'request_info': g.tracking.get('request_info', {})
        }

    # Return JSON response with appropriate error status code
    return jsonify(response_data), status
