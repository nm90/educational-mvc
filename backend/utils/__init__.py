"""
Backend utilities module.

Contains helper functions and middleware for the Flask application:
- Request tracking: Logs all method calls and database queries per request
- Decorators: @log_method_call for automatic invocation capture
- Request context: Uses Flask 'g' object for request-scoped data storage
"""
