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
from flask import Flask, jsonify
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

# Import Request Tracking Middleware
# Middleware logs all method calls and database queries for the developer panel
from backend.utils.request_tracker import register_request_tracking

# ============================================================================
# APPLICATION INITIALIZATION
# ============================================================================
# Create Flask app instance
# Flask uses this to identify the application and locate resources

app = Flask(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================
# Configuration values for the Flask application
# - SECRET_KEY: Used for session security (use environment variable in production)
# - DATABASE_PATH: Location of SQLite database file

# Get SECRET_KEY from environment variable, with fallback for development
# WARNING: In production, always set a strong SECRET_KEY via environment variable
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Database path: Located in the database folder
DATABASE_DIR = os.path.join(os.path.dirname(__file__), 'database')
app.config['DATABASE_PATH'] = os.path.join(DATABASE_DIR, 'educational_mvc.db')

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

    Why here?
    - App needs working database before handling requests
    - Centralized initialization ensures consistency
    - Seed data provides examples for learning
    """
    db_path = app.config['DATABASE_PATH']
    schema_path = os.path.join(DATABASE_DIR, 'schema.sql')

    # Check if database file already exists
    if os.path.exists(db_path):
        print(f"Database found: {db_path}")
        return

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

        print("Schema created successfully!")

        # Import and run seed data
        # We import here to avoid circular imports
        from database.seed import insert_seed_data
        insert_seed_data()

        print("Database initialization complete!")

    except Exception as e:
        print(f"Error initializing database: {e}")
        raise


# Run database initialization
init_database()


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

@app.errorhandler(404)
def not_found(error):
    """
    Handle 404 Not Found errors.

    Called when a requested URL doesn't match any route.
    Returns JSON error response for API consistency.
    """
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """
    Handle 500 Internal Server errors.

    Called when an unhandled exception occurs.
    Returns JSON error response for API consistency.

    Note: In development, Flask shows detailed error pages.
    In production, this handler provides a clean error response.
    """
    return jsonify({"error": "Internal server error"}), 500


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
