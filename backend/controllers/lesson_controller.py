"""
Lesson Controller - Handles lesson progress and code checkpoint validation.

MVC Role: CONTROLLER
- Receives HTTP requests for lesson operations
- Calls CheckpointValidator utility to validate code
- Manages lesson progress in Flask session
- Returns validation results (JSON API)

Controller Responsibilities:
1. Parse incoming request data (JSON with code submission)
2. Load lesson JSON files for validator configuration
3. Call CheckpointValidator methods
4. Manage Flask session for progress tracking
5. Return JSON responses with __DEBUG__ data

What This Controller Does NOT Do:
- Validation logic (CheckpointValidator handles that)
- File parsing (loads JSON, doesn't parse)
- Database storage (uses session, not database)

Learning Purpose:
- Demonstrates stateful session management
- Shows validation orchestration
- Progressive enhancement (API responses)

Lesson Reference:
- Lesson 3: Introduces code checkpoints
- Lessons 6, 7, 8: Advanced checkpoint validation

URL Prefix: /lessons
Routes:
    POST /lessons/<id>/checkpoint - Validate code checkpoint
    GET  /lessons/<id>/progress    - Get lesson progress
    POST /lessons/<id>/progress    - Update lesson progress
"""

import json
import os
import time
from typing import Dict, Any, Optional
from flask import Blueprint, request, session

# Import utilities
from backend.utils.decorators import log_method_call
from backend.utils.response_helpers import wants_json, success_response, error_response
from backend.utils.checkpoint_validator import CheckpointValidator

# ============================================================================
# BLUEPRINT SETUP
# ============================================================================
lessons_bp = Blueprint('lessons', __name__, url_prefix='/lessons')

# Lesson JSON files directory
LESSONS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    'lessons'
)


# ============================================================================
# VALIDATE CODE CHECKPOINT
# ============================================================================
@lessons_bp.route('/<int:lesson_id>/checkpoint', methods=['POST'], strict_slashes=False)
@log_method_call
def validate_checkpoint(lesson_id):
    """
    Validate code checkpoint submission.

    MVC Flow:
    1. Controller receives POST with code submission
    2. Extract checkpoint_id and code from request
    3. Load lesson JSON to get validator config
    4. Call CheckpointValidator.validate_checkpoint() (Utility layer)
    5. Track attempt in Flask session
    6. If passed, mark checkpoint complete
    7. Return JSON response with validation result + __DEBUG__ data

    HTTP: POST /lessons/<id>/checkpoint
    Content-Type: application/json

    Request:
    {
        'checkpoint_id': '3-5',
        'code': 'if not email.endswith(...)',
        'lesson_id': 3
    }

    Response:
    {
        'success': true,
        'data': {
            'passed': true/false,
            'message': 'Validation successful!',
            'hints': [...],
            'errors': [...]
        },
        '__DEBUG__': {
            'method_calls': [...],  # Shows CheckpointValidator.validate_checkpoint call
            'db_queries': [],       # No DB queries in this flow
            ...
        }
    }

    Dev Panel Shows:
    - CheckpointValidator.validate_checkpoint() method call
    - Arguments: lesson_id, checkpoint_id, code, config
    - Return value: validation result dict
    - Duration of validation

    ✅ DO: Let Model/Utility do work, Controller orchestrates
    ✅ DO: Return validation results, not raise exceptions
    ⚠️ DON'T: Duplicate validation logic here

    Covered in: Lesson 3+ (code checkpoint pattern)
    """
    # Extract request data
    data = request.get_json()
    if not data:
        return error_response(
            message='Request must be JSON',
            code='INVALID_REQUEST',
            status=400
        )

    checkpoint_id = data.get('checkpoint_id')
    submitted_code = data.get('code', '')

    if not checkpoint_id or not submitted_code:
        return error_response(
            message='Missing checkpoint_id or code',
            code='MISSING_FIELDS',
            status=400
        )

    # Load lesson JSON to get checkpoint validator config
    lesson_file = os.path.join(LESSONS_DIR, f'lesson-{lesson_id}.json')
    if not os.path.exists(lesson_file):
        return error_response(
            message=f'Lesson {lesson_id} not found',
            code='LESSON_NOT_FOUND',
            status=404
        )

    try:
        with open(lesson_file, 'r') as f:
            lesson_data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        return error_response(
            message=f'Error reading lesson file: {str(e)}',
            code='LESSON_READ_ERROR',
            status=500
        )

    # Get checkpoint configuration from lesson JSON
    checkpoint_config = lesson_data.get('checkpoint', {}).get('validator')
    if not checkpoint_config:
        return error_response(
            message='Checkpoint has no validator configuration',
            code='NO_VALIDATOR',
            status=400
        )

    # Track attempt in session (before validation)
    _track_checkpoint_attempt(lesson_id, checkpoint_id, submitted_code)

    # Validate checkpoint (calls utility layer)
    # ✅ DO: Utility returns result dict, not exceptions
    validation_result = CheckpointValidator.validate_checkpoint(
        lesson_id=lesson_id,
        checkpoint_id=checkpoint_id,
        submitted_code=submitted_code,
        checkpoint_config=checkpoint_config
    )

    # Update progress if checkpoint passed
    if validation_result.get('passed'):
        _mark_checkpoint_complete(lesson_id, checkpoint_id)

    # Return result with embedded __DEBUG__ data
    # success_response() automatically includes method calls and DB queries
    return success_response(
        data=validation_result,
        status=200
    )


# ============================================================================
# GET LESSON PROGRESS
# ============================================================================
@lessons_bp.route('/<int:lesson_id>/progress', methods=['GET'])
@log_method_call
def get_progress(lesson_id):
    """
    Get user's progress for a lesson.

    MVC Flow:
    1. Controller receives GET request
    2. Retrieve progress from Flask session
    3. Return progress data as JSON

    HTTP: GET /lessons/<id>/progress

    Response:
    {
        'success': true,
        'data': {
            'current_step': '3-5',
            'completed_checkpoints': ['3-5'],
            'attempts': {
                '3-5': {
                    'count': 2,
                    'last_code': 'if not email.endswith...',
                    'passed': True,
                    'timestamp': 1234567890
                }
            }
        },
        '__DEBUG__': {...}
    }

    Dev Panel Shows:
    - This method call
    - No DB queries
    - Session data accessed

    ✅ DO: Return session data as-is for client-side progress tracking
    ⚠️ DON'T: Modify session here, just read

    Covered in: Lesson 3+ (progress tracking pattern)
    """
    progress = _get_lesson_progress(lesson_id)
    return success_response(data=progress)


# ============================================================================
# UPDATE LESSON PROGRESS
# ============================================================================
@lessons_bp.route('/<int:lesson_id>/progress', methods=['POST'], strict_slashes=False)
@log_method_call
def update_progress(lesson_id):
    """
    Update lesson progress (current step).

    Used by frontend to track which step user is on.

    MVC Flow:
    1. Controller receives POST with step data
    2. Update Flask session
    3. Mark session as modified
    4. Return updated progress

    HTTP: POST /lessons/<id>/progress

    Request:
    {
        'current_step': '3-2'
    }

    Response:
    {
        'success': true,
        'data': {
            'current_step': '3-2'
        },
        '__DEBUG__': {...}
    }

    Dev Panel Shows:
    - This method call
    - Session data modified

    ✅ DO: Update session and mark modified
    ⚠️ DON'T: Validate step against lesson structure (client handles)

    Covered in: Lesson 3+ (session state management)
    """
    data = request.get_json()
    if not data:
        return error_response(
            message='Request must be JSON',
            code='INVALID_REQUEST',
            status=400
        )

    current_step = data.get('current_step')
    if not current_step:
        return error_response(
            message='Missing current_step',
            code='MISSING_FIELD',
            status=400
        )

    # Update session
    if 'lesson_progress' not in session:
        session['lesson_progress'] = {}

    lesson_key = str(lesson_id)
    if lesson_key not in session['lesson_progress']:
        session['lesson_progress'][lesson_key] = {}

    session['lesson_progress'][lesson_key]['current_step'] = current_step
    session.modified = True

    return success_response(data={'current_step': current_step})


# ============================================================================
# HELPER FUNCTIONS - Session Management
# ============================================================================

def _get_lesson_progress(lesson_id: int) -> Dict[str, Any]:
    """
    Get progress for a specific lesson from session.

    Initializes progress structure if not present.

    Args:
        lesson_id: Lesson ID

    Returns:
        Lesson progress dict with:
        - current_step: Current step identifier
        - completed_checkpoints: List of completed checkpoint IDs
        - checkpoint_attempts: Dict of attempt tracking per checkpoint
    """
    if 'lesson_progress' not in session:
        session['lesson_progress'] = {}

    lesson_key = str(lesson_id)
    if lesson_key not in session['lesson_progress']:
        session['lesson_progress'][lesson_key] = {
            'current_step': None,
            'completed_checkpoints': [],
            'checkpoint_attempts': {}
        }

    return session['lesson_progress'][lesson_key]


def _track_checkpoint_attempt(lesson_id: int, checkpoint_id: str, code: str):
    """
    Track a checkpoint validation attempt in session.

    Increments attempt counter and stores code submission.

    Args:
        lesson_id: Lesson ID
        checkpoint_id: Checkpoint identifier
        code: User's submitted code
    """
    progress = _get_lesson_progress(lesson_id)

    if 'checkpoint_attempts' not in progress:
        progress['checkpoint_attempts'] = {}

    if checkpoint_id not in progress['checkpoint_attempts']:
        progress['checkpoint_attempts'][checkpoint_id] = {
            'count': 0,
            'last_code': '',
            'passed': False,
            'timestamp': None
        }

    progress['checkpoint_attempts'][checkpoint_id]['count'] += 1
    progress['checkpoint_attempts'][checkpoint_id]['last_code'] = code
    progress['checkpoint_attempts'][checkpoint_id]['timestamp'] = int(time.time())

    session.modified = True


def _mark_checkpoint_complete(lesson_id: int, checkpoint_id: str):
    """
    Mark a checkpoint as complete in session.

    Adds checkpoint to completed list and updates attempt record.

    Args:
        lesson_id: Lesson ID
        checkpoint_id: Checkpoint identifier
    """
    progress = _get_lesson_progress(lesson_id)

    if 'completed_checkpoints' not in progress:
        progress['completed_checkpoints'] = []

    if checkpoint_id not in progress['completed_checkpoints']:
        progress['completed_checkpoints'].append(checkpoint_id)

    # Update attempt record
    if checkpoint_id in progress.get('checkpoint_attempts', {}):
        progress['checkpoint_attempts'][checkpoint_id]['passed'] = True

    session.modified = True
