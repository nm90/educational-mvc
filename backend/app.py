"""
Flask application entry point for Educational MVC App.

MVC Role: Application Bootstrap
- Initializes the Flask web server
- Sets up configuration and CORS for frontend communication
- Handles database initialization on first run
- Defines basic routes and error handlers
- Controllers will be registered here (next feature)

Learning Purpose:
- Shows how web applications are structured
- Demonstrates server-side setup and configuration
- Entry point for understanding request/response flow
- Lesson 2 explains how requests flow from here to controllers

Note: This file is the "glue" that connects everything together.
Controllers will be added in the next feature to handle specific routes.
"""

import os
import sys
import sqlite3
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add project root to sys.path when running this script directly
# This enables "from backend..." imports to work with:
# - python backend/app.py
# - python3 backend/app.py
# - npm start
# Without this, Python would only add the backend/ directory to sys.path
if __name__ == '__main__' or __package__ is None:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

# Import Controllers (Blueprints)
# Controllers handle specific route groups and orchestrate between Models and Views
from backend.controllers.user_controller import users_bp
from backend.controllers.task_controller import tasks_bp
from backend.controllers.lesson_controller import lessons_bp

# Import Request Tracking Middleware
# Middleware logs all method calls and database queries for the developer panel
from backend.utils.request_tracker import register_request_tracking

# ============================================================================
# LOGGING SETUP
# ============================================================================
# Configure Python's logging module for error tracking and debugging
# Logs are written to both console and errors.log file

def setup_logging():
    """
    Configure logging for the application.

    Sets up:
    - File handler: logs all messages to errors.log
    - Console handler: logs warnings and errors to console
    - Format: includes timestamp, level, and message for debugging

    Learning Purpose:
    - Shows how to use Python's logging module
    - Demonstrates centralized error logging
    - Helps with debugging and production monitoring
    """
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    log_file = os.path.join(log_dir, 'errors.log')

    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    # File handler: logs everything
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)

    # Console handler: logs warnings and above
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.WARNING)
    console_formatter = logging.Formatter('%(levelname)s: %(message)s')
    console_handler.setFormatter(console_formatter)

    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


# ============================================================================
# APPLICATION INITIALIZATION
# ============================================================================
# Create Flask app instance
# Flask uses this to identify the application and locate resources

app = Flask(__name__)

# Set up logging
logger = setup_logging()

# ============================================================================
# CONFIGURATION
# ============================================================================
# Configuration values for the Flask application
# - SECRET_KEY: Used for session security (use environment variable in production)
# - DATABASE_PATH: Location of SQLite database file

# Get SECRET_KEY from environment variable, with fallback for development
# WARNING: In production, always set a strong SECRET_KEY via environment variable
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Database path: Use environment variable for Docker, fallback to local path
# Docker sets DATABASE_PATH=/app/data/educational_mvc.db for persistence
DATABASE_DIR = os.path.join(os.path.dirname(__file__), 'database')
app.config['DATABASE_PATH'] = os.environ.get(
    'DATABASE_PATH',
    os.path.join(DATABASE_DIR, 'educational_mvc.db')
)

# ============================================================================
# CORS SETUP
# ============================================================================
# Enable Cross-Origin Resource Sharing (CORS)
# This allows the frontend (running on a different port) to communicate with the backend
# Without CORS, browsers would block requests from the frontend to the API

CORS(app)


# ============================================================================
# REQUEST TRACKING MIDDLEWARE
# ============================================================================
# Register middleware to track all requests, method calls, and database queries
# This enables the developer panel to show complete execution flow
# See backend/utils/request_tracker.py for implementation details

register_request_tracking(app)


# ============================================================================
# REGISTER BLUEPRINTS (CONTROLLERS)
# ============================================================================
# Blueprints organize routes into logical groups
# Each controller is a Blueprint handling a specific resource
# URL prefixes are defined in the Blueprint (e.g., /users for users_bp)

# Register User Controller - handles /users routes
# Lesson 5 covers how controllers are registered and used
app.register_blueprint(users_bp)

# Register Task Controller - handles /tasks routes
# Demonstrates multi-model orchestration (Task + User)
app.register_blueprint(tasks_bp)

# Register Lesson Controller - handles /lessons routes
# Lesson system for tutorial mode and code checkpoints
app.register_blueprint(lessons_bp)


print("=" * 60)
print("EDUCATIONAL MVC APP - Starting Server")
print("=" * 60)


# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================
# Check if database exists; if not, create schema and seed data
# This runs once when the app starts for the first time

def init_database():
    """
    Initialize the database if it doesn't exist.

    MVC Flow:
    - This is application setup, not part of MVC pattern
    - Creates the database tables from schema.sql
    - Populates initial data from seed.py
    - Only runs on first startup
    - Logs all operations for debugging

    Why here?
    - App needs working database before handling requests
    - Centralized initialization ensures consistency
    - Seed data provides examples for learning
    
    Docker Support:
    - Creates database directory if using custom path (e.g., /app/data/)
    - Respects DATABASE_PATH environment variable
    """
    db_path = app.config['DATABASE_PATH']
    schema_path = os.path.join(DATABASE_DIR, 'schema.sql')
    
    # Ensure database directory exists (important for Docker volumes)
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        logger.info(f"Created database directory: {db_dir}")
        print(f"Created database directory: {db_dir}")

    # Check if database file already exists
    if os.path.exists(db_path):
        logger.info(f"Database found: {db_path}")
        print(f"Database found: {db_path}")
        return

    logger.info(f"Database not found. Creating new database...")
    print(f"Database not found. Creating new database...")
    print(f"Database path: {db_path}")

    try:
        # Create database and execute schema
        conn = sqlite3.connect(db_path)

        # Enable foreign key enforcement (SQLite requires this explicitly)
        conn.execute("PRAGMA foreign_keys = ON;")

        # Read and execute schema.sql
        with open(schema_path, 'r') as f:
            schema_sql = f.read()

        conn.executescript(schema_sql)
        conn.commit()
        conn.close()

        logger.info("Database schema created successfully!")
        print("Schema created successfully!")

        # Import and run seed data
        # We import here to avoid circular imports
        from database.seed import insert_seed_data
        insert_seed_data()

        logger.info("Database initialization complete!")
        print("Database initialization complete!")

    except FileNotFoundError as e:
        logger.error(f"Schema file not found: {schema_path}")
        print(f"Error: Schema file not found: {schema_path}")
        raise
    except sqlite3.Error as e:
        logger.error(f"Database initialization failed: {e}", exc_info=True)
        print(f"Error initializing database: {e}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error during database initialization: {e}")
        print(f"Error initializing database: {e}")
        raise


# Run database initialization
init_database()


# ============================================================================
# STATIC FILES CONFIGURATION
# ============================================================================
# Serve lesson JSON files from /lessons/ directory
# This allows the LessonEngine to fetch lesson data via fetch() calls

@app.route('/lessons/<path:filename>')
def serve_lesson(filename):
    """
    Serve lesson JSON files from the lessons directory.

    MVC Role: Data Provider
    - Returns lesson JSON files for LessonEngine to load
    - Part of the lesson system for Tutorial Mode
    - Implements security checks and error logging

    Learning Purpose:
    - Shows how static files are served from Flask
    - Demonstrates server providing JSON data to client
    - Part of the lesson loading infrastructure
    - Shows security best practices (preventing directory traversal)

    @param {string} filename - Name of lesson file (e.g., 'lesson-1.json')
    @returns {json} - Lesson data from JSON file
    """
    import os
    from flask import send_file

    lessons_dir = os.path.join(os.path.dirname(__file__), '..', 'lessons')
    file_path = os.path.join(lessons_dir, filename)

    # Security: Prevent directory traversal attacks
    # Ensure the requested file is within the lessons directory
    if not os.path.abspath(file_path).startswith(os.path.abspath(lessons_dir)):
        logger.warning(f"Directory traversal attempt detected: {filename} from {request.remote_addr}")
        return jsonify({
            "success": False,
            "error": {
                "message": "Invalid file path",
                "code": "INVALID_PATH"
            }
        }), 403

    # Check if file exists
    if not os.path.exists(file_path):
        logger.warning(f"Lesson file not found: {filename}")
        return jsonify({
            "success": False,
            "error": {
                "message": f"Lesson not found: {filename}",
                "code": "LESSON_NOT_FOUND",
                "suggestion": "Check the lesson ID and try again. Available lessons are 1-8."
            }
        }), 404

    try:
        # Serve JSON file
        logger.debug(f"Serving lesson file: {filename}")
        return send_file(file_path, mimetype='application/json')
    except Exception as e:
        logger.error(f"Error serving lesson file {filename}: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": {
                "message": "Failed to load lesson file",
                "code": "FILE_READ_ERROR"
            }
        }), 500


# ============================================================================
# BASIC ROUTES
# ============================================================================
# Placeholder routes until controllers are implemented
# These provide basic health checks and API info

@app.route('/')
def index():
    """
    Root endpoint - API welcome message.

    Returns basic information about the API.
    Controllers will handle actual application routes.
    """
    return jsonify({
        "name": "Educational MVC App API",
        "version": "1.0.0",
        "description": "Learn MVC architecture through interactive examples",
        "status": "running"
    })


@app.route('/health')
def health():
    """
    Health check endpoint.

    Used by Docker, load balancers, or monitoring tools to verify
    the server is running and responsive.

    Returns:
        JSON with status "ok" and HTTP 200
    """
    return jsonify({"status": "ok"})


# ============================================================================
# ERROR HANDLERS
# ============================================================================
# Custom error handlers for common HTTP errors
# Return JSON responses for consistency with API design
# Log technical details for debugging while showing user-friendly messages

@app.errorhandler(404)
def not_found(error):
    """
    Handle 404 Not Found errors.

    MVC Flow:
    - Called when a requested URL doesn't match any route
    - Logs request details for debugging
    - Returns helpful JSON error response for API consistency

    Learning Purpose:
    - Shows how to handle errors gracefully
    - Demonstrates logging for debugging
    - Returns consistent error format

    Note: Logs to both console and errors.log file
    """
    error_details = {
        'path': request.path,
        'method': request.method,
        'ip': request.remote_addr
    }
    logger.warning(f"404 Not Found: {request.method} {request.path} from {request.remote_addr}")

    return jsonify({
        "success": False,
        "error": {
            "message": f"Endpoint not found: {request.method} {request.path}",
            "code": "NOT_FOUND",
            "suggestion": "Check the API documentation or verify the correct endpoint path"
        }
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """
    Handle 500 Internal Server errors.

    MVC Flow:
    - Called when an unhandled exception occurs
    - Logs full error details including stack trace for debugging
    - Returns user-friendly error without exposing technical details

    Learning Purpose:
    - Shows how to handle unexpected errors
    - Demonstrates secure error handling (no stack traces to clients)
    - Shows how to preserve debugging information for developers

    Note: Full stack trace is logged to errors.log, not shown to client
    """
    logger.exception(f"500 Internal Server Error: {request.method} {request.path}")

    return jsonify({
        "success": False,
        "error": {
            "message": "An unexpected error occurred. Our team has been notified.",
            "code": "INTERNAL_SERVER_ERROR",
            "suggestion": "Try again later or contact support if the problem persists"
        }
    }), 500


@app.errorhandler(400)
def bad_request(error):
    """
    Handle 400 Bad Request errors.

    Called when the request is malformed or invalid.
    Provides helpful feedback without exposing implementation details.
    """
    logger.warning(f"400 Bad Request: {request.method} {request.path} - {str(error)}")

    return jsonify({
        "success": False,
        "error": {
            "message": "Invalid request format",
            "code": "BAD_REQUEST",
            "suggestion": "Check your request parameters and try again"
        }
    }), 400


# ============================================================================
# MAIN EXECUTION
# ============================================================================
# Entry point when running the file directly
# In production, use a WSGI server like gunicorn instead

if __name__ == '__main__':
    print("\nStarting Flask development server...")
    print("Visit: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)

    # Run Flask development server
    # - debug=True: Auto-reload on code changes, detailed error pages
    # - port=5000: Standard Flask port
    # - host='0.0.0.0': Accept connections from any IP (needed for Docker)
    app.run(debug=True, port=5000, host='0.0.0.0')
