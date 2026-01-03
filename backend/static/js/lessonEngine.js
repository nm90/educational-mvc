/**
 * Lesson Engine - Manages Tutorial Mode lessons
 *
 * MVC Role: CLIENT-SIDE CONTROLLER
 * - Loads lesson data from JSON files
 * - Manages lesson progression and progress tracking
 * - Handles checkpoints and quiz validation
 * - Persists progress to localStorage
 *
 * Learning Purpose:
 * - Shows how to structure learning content
 * - Demonstrates state management (current lesson, step, progress)
 * - Implements checkpoint validation
 * - Uses localStorage for client-side persistence
 *
 * Lesson Reference:
 * - Lesson 1: Understanding MVC (first lesson in system)
 */

class LessonEngine {
    /**
     * Constructor - Initialize LessonEngine instance
     *
     * Usage:
     *   const engine = new LessonEngine();
     *   await engine.loadLesson(1);
     */
    constructor() {
        this.currentLesson = null;
        this.currentStepIndex = 0;
        this.lessonProgress = this.loadProgress();
        this.lessonPanelElement = null;
    }

    /**
     * Load a lesson from JSON file
     *
     * MVC Flow:
     * 1. Client requests lesson data via fetch (simulating Model retrieval)
     * 2. Server returns lesson JSON
     * 3. Store in this.currentLesson
     * 4. Render lesson UI (Controller responsibility)
     *
     * @param {number} lessonId - Lesson ID to load (1-8)
     * @returns {Promise<object>} - The loaded lesson object
     */
    async loadLesson(lessonId) {
        try {
            // Validate lesson ID is in valid range
            if (lessonId < 1 || lessonId > 8) {
                throw new Error(`Invalid lesson ID: ${lessonId}. Must be between 1 and 8.`);
            }

            // Fetch lesson JSON from /lessons/ directory
            // Note: Flask serves this directory as static files
            const response = await fetch(`/lessons/lesson-${lessonId}.json`);

            // Check if fetch was successful
            if (!response.ok) {
                throw new Error(`Failed to load lesson ${lessonId}: ${response.statusText}`);
            }

            // Parse JSON response
            const lesson = await response.json();

            // Validate lesson JSON structure
            this.validateLessonStructure(lesson);

            // Store lesson in memory
            this.currentLesson = lesson;

            // Load progress for this lesson (or start at step 0)
            if (this.lessonProgress.currentLesson === lessonId) {
                this.currentStepIndex = this.lessonProgress.currentStep || 0;
            } else {
                // New lesson - start at beginning
                this.currentStepIndex = 0;
                this.lessonProgress.currentLesson = lessonId;
                this.saveProgress();
            }

            // Create and render the lesson panel UI
            await this.createPanel();
            this.renderCurrentStep();
            this.updateProgress();
            this.attachEventListeners();

            console.log(`✅ Lesson ${lessonId} loaded: "${lesson.title}"`);
            return lesson;

        } catch (error) {
            console.error(`❌ Error loading lesson ${lessonId}:`, error);
            throw error;
        }
    }

    /**
     * Validate that lesson JSON has required structure
     *
     * Checks:
     * - Has required top-level fields
     * - Steps array is present and non-empty
     * - Each step has required fields
     *
     * @param {object} lesson - Lesson object to validate
     * @throws {Error} - If structure is invalid
     */
    validateLessonStructure(lesson) {
        // Check required top-level fields
        const requiredFields = ['id', 'title', 'description', 'steps'];
        for (const field of requiredFields) {
            if (!(field in lesson)) {
                throw new Error(`Lesson missing required field: ${field}`);
            }
        }

        // Check steps array
        if (!Array.isArray(lesson.steps) || lesson.steps.length === 0) {
            throw new Error('Lesson must have at least one step');
        }

        // Check each step has required fields
        for (let i = 0; i < lesson.steps.length; i++) {
            const step = lesson.steps[i];
            const stepRequiredFields = ['id', 'title', 'content'];
            for (const field of stepRequiredFields) {
                if (!(field in step)) {
                    throw new Error(`Step ${i} missing required field: ${field}`);
                }
            }
        }
    }

    /**
     * Get current step object
     *
     * @returns {object|null} - Current step or null if no lesson loaded
     */
    getCurrentStep() {
        if (!this.currentLesson || !this.currentLesson.steps) {
            return null;
        }
        return this.currentLesson.steps[this.currentStepIndex] || null;
    }

    /**
     * Get progress information (e.g., "Step 2 of 5")
     *
     * @returns {object} - Object with current and total step counts
     */
    getProgress() {
        return {
            currentStep: this.currentStepIndex + 1,
            totalSteps: this.currentLesson?.steps?.length || 0
        };
    }

    /**
     * Move to next step
     *
     * MVC Flow:
     * 1. Check if current step has checkpoint
     * 2. If yes, validate checkpoint first
     * 3. Update this.currentStepIndex
     * 4. Save progress to localStorage
     * 5. Re-render UI
     *
     * @returns {Promise<boolean>} - True if moved to next step, false if blocked by checkpoint
     */
    async nextStep() {
        const currentStep = this.getCurrentStep();

        // If this step has a checkpoint, validate it first
        if (currentStep?.checkpoint) {
            const passed = await this.checkCheckpoint(currentStep);
            if (!passed) {
                console.log('❌ Checkpoint not passed. Complete checkpoint before continuing.');
                return false;
            }
            console.log('✅ Checkpoint passed!');
        }

        // Check if there are more steps
        if (this.currentStepIndex >= this.currentLesson.steps.length - 1) {
            console.log('✅ You have completed all steps in this lesson!');
            this.markLessonComplete();

            // Auto-load next lesson if available
            const nextLessonId = this.currentLesson.id + 1;
            if (nextLessonId <= 8) {
                console.log(`📚 Loading Lesson ${nextLessonId}...`);
                setTimeout(() => {
                    this.loadLesson(nextLessonId);
                }, 500);
            }

            return false;
        }

        // Move to next step
        this.currentStepIndex++;
        this.lessonProgress.currentStep = this.currentStepIndex;
        this.saveProgress();

        // Update UI to show new step
        this.renderCurrentStep();
        this.updateProgress();

        console.log(`Moving to step ${this.currentStepIndex + 1}...`);
        return true;
    }

    /**
     * Move to previous step
     *
     * @returns {boolean} - True if moved, false if already at first step
     */
    previousStep() {
        if (this.currentStepIndex === 0) {
            console.log('Already at the first step');
            return false;
        }

        this.currentStepIndex--;
        this.lessonProgress.currentStep = this.currentStepIndex;
        this.saveProgress();

        // Update UI to show previous step
        this.renderCurrentStep();
        this.updateProgress();

        console.log(`Moving to step ${this.currentStepIndex + 1}...`);
        return true;
    }

    /**
     * Check/validate a checkpoint
     *
     * Checkpoint Types:
     * - "quiz": Multiple choice question - validate user's answer
     * - "code": Code validation - (future: would validate code solution)
     *
     * @param {object} step - Step object containing checkpoint
     * @returns {Promise<boolean>} - True if checkpoint passed
     */
    async checkCheckpoint(step) {
        if (!step?.checkpoint) {
            return true;
        }

        const checkpoint = step.checkpoint;

        // Quiz checkpoint
        if (checkpoint.type === 'quiz') {
            return this.checkQuizCheckpoint(checkpoint);
        }

        // Code checkpoint (future implementation)
        if (checkpoint.type === 'code') {
            return this.checkCodeCheckpoint(checkpoint);
        }

        console.warn(`Unknown checkpoint type: ${checkpoint.type}`);
        return false;
    }

    /**
     * Validate quiz checkpoint
     *
     * Prompts user with question and checks answer.
     * In a real implementation, would show UI form instead of prompt().
     *
     * @param {object} checkpoint - Checkpoint object with quiz data
     * @returns {boolean} - True if correct answer selected
     */
    checkQuizCheckpoint(checkpoint) {
        // In a real implementation, this would show a UI form
        // For now, return false to indicate user needs to answer
        console.log('Quiz Checkpoint:', checkpoint.question);
        console.log('Options:', checkpoint.options);
        return false;  // User hasn't answered yet
    }

    /**
     * Validate code checkpoint
     *
     * Future: Would validate user's code implementation.
     * For now, placeholder for future implementation.
     *
     * @param {object} checkpoint - Checkpoint object with code requirements
     * @returns {boolean} - True if code is valid
     */
    async checkCodeCheckpoint(checkpoint) {
        /**
         * Validate code checkpoint by submitting to backend.
         *
         * MVC Flow:
         * 1. Get code from textarea
         * 2. POST to /lessons/<id>/checkpoint
         * 3. Backend validates using CheckpointValidator
         * 4. Show validation result in UI
         * 5. Return pass/fail to control lesson progression
         *
         * Dev Panel Shows:
         * - CheckpointValidator.validate_checkpoint() method call
         * - Validation logic with args and return values
         * - Execution time
         */
        const codeInput = document.getElementById('lesson-code-input');
        if (!codeInput) {
            console.error('Code input element not found');
            return false;
        }

        const code = codeInput.value.trim();
        if (!code) {
            this.showValidationResult({
                success: false,
                data: {
                    passed: false,
                    message: 'Please enter some code before validating',
                    errors: ['Code input is empty']
                }
            });
            return false;
        }

        // Show loading state on submit button
        const submitBtn = document.querySelector('.lesson-code-submit');
        const originalText = submitBtn ? submitBtn.textContent : 'Validate Code';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Validating...';
        }

        try {
            // POST code to backend for validation
            const response = await fetch(`/lessons/${this.currentLesson.id}/checkpoint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    checkpoint_id: `lesson_${this.currentLesson.id}_checkpoint`,
                    code: code,
                    lesson_id: this.currentLesson.id
                })
            });

            const result = await response.json();

            // Show validation result in UI
            this.showValidationResult(result);

            // Update dev panel if available
            if (window.DevPanel && result.__DEBUG__) {
                window.DevPanel.updateDebugData(result.__DEBUG__);
            }

            return result.data?.passed || false;

        } catch (error) {
            console.error('Checkpoint validation error:', error);
            this.showValidationResult({
                success: false,
                data: {
                    passed: false,
                    message: 'Failed to validate code',
                    errors: [error.message]
                }
            });
            return false;
        } finally {
            // Restore button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    }

    /**
     * Submit answer to quiz checkpoint
     *
     * Called when user selects an answer to quiz question.
     *
     * @param {string} answer - User's selected answer
     * @returns {boolean} - True if answer is correct
     */
    submitQuizAnswer(answer) {
        const currentStep = this.getCurrentStep();
        if (!currentStep?.checkpoint) {
            return false;
        }

        const checkpoint = currentStep.checkpoint;
        const isCorrect = answer === checkpoint.correct;

        if (isCorrect) {
            console.log('✅ Correct answer!');
        } else {
            console.log(`❌ Incorrect. The correct answer is: ${checkpoint.correct}`);
        }

        return isCorrect;
    }

    /**
     * Mark current lesson as complete
     *
     * Adds to completedLessons array and saves to localStorage
     */
    markLessonComplete() {
        if (!this.lessonProgress.completedLessons) {
            this.lessonProgress.completedLessons = [];
        }

        if (!this.lessonProgress.completedLessons.includes(this.currentLesson.id)) {
            this.lessonProgress.completedLessons.push(this.currentLesson.id);
        }

        this.saveProgress();
        console.log(`✅ Lesson ${this.currentLesson.id} marked as complete!`);
    }

    /**
     * Check if lesson is completed
     *
     * @param {number} lessonId - Lesson ID to check
     * @returns {boolean} - True if lesson is in completedLessons
     */
    isLessonComplete(lessonId) {
        return this.lessonProgress.completedLessons?.includes(lessonId) || false;
    }

    /**
     * Save progress to localStorage
     *
     * Persists:
     * - Current lesson ID
     * - Current step in that lesson
     * - List of completed lessons
     *
     * Called after:
     * - Moving to new step
     * - Completing lesson
     * - Starting new lesson
     */
    saveProgress() {
        try {
            const progressData = {
                currentLesson: this.lessonProgress.currentLesson,
                currentStep: this.lessonProgress.currentStep || 0,
                completedLessons: this.lessonProgress.completedLessons || [],
                lastSaved: new Date().toISOString()
            };

            localStorage.setItem('lessonProgress', JSON.stringify(progressData));
            console.log('💾 Progress saved to localStorage');
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    /**
     * Load progress from localStorage
     *
     * Returns:
     * - Current lesson progress (or empty object if first time)
     * - Allows user to resume where they left off
     *
     * @returns {object} - Progress object from localStorage
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('lessonProgress');
            if (saved) {
                const progress = JSON.parse(saved);
                console.log('📖 Progress loaded from localStorage:', progress);
                return progress;
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }

        // First time - return empty progress object
        return {
            currentLesson: null,
            currentStep: 0,
            completedLessons: []
        };
    }

    /**
     * Reset all progress
     *
     * Clears localStorage and resets lesson engine.
     * Used for testing or when user wants to start over.
     */
    resetProgress() {
        localStorage.removeItem('lessonProgress');
        this.lessonProgress = {
            currentLesson: null,
            currentStep: 0,
            completedLessons: []
        };
        this.currentLesson = null;
        this.currentStepIndex = 0;
        console.log('🔄 Progress reset');
    }

    /**
     * Get lesson by ID
     *
     * @param {number} lessonId - Lesson ID to fetch
     * @returns {Promise<object>} - Lesson object
     */
    async getLesson(lessonId) {
        return this.loadLesson(lessonId);
    }

    /**
     * Get all completed lessons
     *
     * @returns {array} - Array of completed lesson IDs
     */
    getCompletedLessons() {
        return this.lessonProgress.completedLessons || [];
    }

    /**
     * Get completion percentage
     *
     * @returns {number} - Percentage of lessons completed (0-100)
     */
    getCompletionPercentage() {
        const completed = this.getCompletedLessons().length;
        const total = 8;  // Total lessons in the system
        return Math.round((completed / total) * 100);
    }

    /**
     * Debug: Print current lesson info to console
     */
    printCurrentLessonInfo() {
        if (!this.currentLesson) {
            console.log('No lesson loaded');
            return;
        }

        console.group(`📚 Lesson ${this.currentLesson.id}: ${this.currentLesson.title}`);
        console.log('Description:', this.currentLesson.description);
        console.log('Estimated time:', this.currentLesson.estimated_time);

        const progress = this.getProgress();
        console.log(`Progress: Step ${progress.currentStep} of ${progress.totalSteps}`);

        const currentStep = this.getCurrentStep();
        console.group(`Current Step: ${currentStep.title}`);
        console.log('Content:', currentStep.content);
        if (currentStep.hint) {
            console.log('Hint:', currentStep.hint);
        }
        if (currentStep.checkpoint) {
            console.log('Checkpoint:', currentStep.checkpoint);
        }
        console.groupEnd();

        console.groupEnd();
    }

    /**
     * Create lesson panel HTML structure
     *
     * Builds the complete lesson panel DOM and inserts into page.
     * This is the VIEW layer - just creates HTML, no logic.
     *
     * @returns {Promise<void>}
     */
    async createPanel() {
        // Check if panel already exists
        let panelContainer = document.getElementById('lesson-panel');
        if (panelContainer) {
            panelContainer.remove();
        }

        // Create main panel container
        panelContainer = document.createElement('div');
        panelContainer.id = 'lesson-panel';

        // Build lesson selector options
        let lessonOptions = '';
        for (let i = 1; i <= 8; i++) {
            const isCompleted = this.lessonProgress.completedLessons?.includes(i);
            const isSelected = this.currentLesson.id === i;
            const completedBadge = isCompleted ? ' ✓' : '';
            lessonOptions += `<option value="${i}" ${isSelected ? 'selected' : ''}>Lesson ${i}${completedBadge}</option>`;
        }

        panelContainer.innerHTML = `
            <div class="lesson-panel-header">
                <div class="lesson-selector-wrapper">
                    <label for="lesson-selector" class="lesson-selector-label">Jump to Lesson:</label>
                    <select id="lesson-selector" class="lesson-selector">
                        ${lessonOptions}
                    </select>
                </div>
                <h2 class="lesson-panel-title">${this.currentLesson.title}</h2>
                <p class="lesson-panel-subtitle">${this.currentLesson.description}</p>
                <div class="lesson-progress-bar">
                    <div class="lesson-progress-fill"></div>
                </div>
                <p class="lesson-progress-text"></p>
            </div>

            <div class="lesson-panel-content">
                <!-- Step content will be inserted here -->
            </div>

            <div class="lesson-panel-actions">
                <button class="lesson-btn" id="lesson-prev-btn" title="Previous step (← arrow key)">← Previous</button>
                <button class="lesson-btn lesson-btn-primary" id="lesson-next-btn" title="Next step (→ arrow key)">Next →</button>
            </div>
        `;

        // Store reference and add to body
        this.lessonPanelElement = panelContainer;
        document.body.insertBefore(panelContainer, document.body.firstChild);

        // Adjust body margin for fixed sidebar
        document.body.classList.add('lesson-panel-visible');

        // Add keyboard navigation support
        this.setupKeyboardNavigation();
    }

    /**
     * Render the current step content
     *
     * Updates the lesson panel with current step's:
     * - Title and content
     * - Hint button (if hint exists)
     * - Checkpoint UI (if checkpoint exists)
     *
     * @returns {void}
     */
    renderCurrentStep() {
        const currentStep = this.getCurrentStep();
        if (!currentStep) return;

        const contentArea = document.querySelector('.lesson-panel-content');
        contentArea.innerHTML = '';

        // Create step section
        const stepSection = document.createElement('div');
        stepSection.className = 'lesson-step';
        stepSection.innerHTML = `
            <h3 class="lesson-step-title">${currentStep.title}</h3>
            <p class="lesson-step-content">${currentStep.content}</p>
        `;

        contentArea.appendChild(stepSection);

        // Add hint button if hint exists
        if (currentStep.hint) {
            const hintBtn = document.createElement('button');
            hintBtn.className = 'lesson-hint-button';
            hintBtn.textContent = '💡 Show Hint';
            hintBtn.addEventListener('click', () => this.showHint(currentStep));

            const hintContent = document.createElement('div');
            hintContent.className = 'lesson-hint-content';
            hintContent.innerHTML = currentStep.hint;
            hintContent.id = 'lesson-hint-text';

            stepSection.appendChild(hintBtn);
            stepSection.appendChild(hintContent);
        }

        // Render checkpoint if present
        if (currentStep.checkpoint) {
            this.renderCheckpoint(currentStep.checkpoint, contentArea);
        }

        // Update button states
        this.updateButtonStates();
    }

    /**
     * Render a checkpoint (quiz or code validation)
     *
     * Creates UI for:
     * - Quiz: Radio buttons with question and options
     * - Code: Text input with validation
     *
     * @param {object} checkpoint - Checkpoint data
     * @param {HTMLElement} container - Container to append checkpoint to
     * @returns {void}
     */
    renderCheckpoint(checkpoint, container) {
        const checkpointDiv = document.createElement('div');
        checkpointDiv.className = 'lesson-checkpoint';
        checkpointDiv.innerHTML = `<div class="lesson-checkpoint-title">🎯 Checkpoint</div>`;

        if (checkpoint.type === 'quiz') {
            this.renderQuizCheckpoint(checkpoint, checkpointDiv);
        } else if (checkpoint.type === 'code') {
            this.renderCodeCheckpoint(checkpoint, checkpointDiv);
        }

        container.appendChild(checkpointDiv);
    }

    /**
     * Render a quiz checkpoint
     *
     * @param {object} checkpoint - Quiz checkpoint data
     * @param {HTMLElement} container - Container to render into
     * @returns {void}
     */
    renderQuizCheckpoint(checkpoint, container) {
        const quizDiv = document.createElement('div');
        quizDiv.className = 'lesson-quiz';

        const questionDiv = document.createElement('div');
        questionDiv.className = 'lesson-quiz-question';
        questionDiv.innerHTML = `<strong>${checkpoint.question}</strong>`;
        quizDiv.appendChild(questionDiv);

        // Create radio buttons for each option
        checkpoint.options.forEach((option) => {
            const label = document.createElement('label');
            label.className = 'lesson-quiz-option';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'quiz-answer';
            radio.value = option;

            radio.addEventListener('change', () => {
                const isCorrect = this.submitQuizAnswer(option);
                if (isCorrect) {
                    // Show success message
                    const messageDiv = container.querySelector('.lesson-validation-message');
                    if (messageDiv) {
                        messageDiv.remove();
                    }
                    const successMsg = document.createElement('div');
                    successMsg.className = 'lesson-validation-message success';
                    successMsg.textContent = '✅ Correct! You can now move to the next step.';
                    container.appendChild(successMsg);
                } else {
                    // Show error message
                    const messageDiv = container.querySelector('.lesson-validation-message');
                    if (messageDiv) {
                        messageDiv.remove();
                    }
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'lesson-validation-message error';
                    errorMsg.textContent = `❌ Incorrect. Try again!`;
                    container.appendChild(errorMsg);
                }
            });

            label.appendChild(radio);
            label.appendChild(document.createTextNode(' ' + option));
            quizDiv.appendChild(label);
        });

        container.appendChild(quizDiv);
    }

    /**
     * Render a code checkpoint
     *
     * @param {object} checkpoint - Code checkpoint data
     * @param {HTMLElement} container - Container to render into
     * @returns {void}
     */
    renderCodeCheckpoint(checkpoint, container) {
        /**
         * Render code checkpoint UI with textarea and validation.
         *
         * Creates:
         * - Instructions div
         * - Textarea with code template (if provided)
         * - Submit button for validation
         * - Result container for feedback
         */
        const codeDiv = document.createElement('div');
        codeDiv.className = 'lesson-code-checkpoint';

        // Instructions
        const instructions = document.createElement('div');
        instructions.className = 'lesson-code-instructions';
        instructions.innerHTML = checkpoint.instructions;

        // Code template (if provided)
        let initialCode = '';
        if (checkpoint.codeTemplate) {
            initialCode = checkpoint.codeTemplate;
        }

        // Textarea for code input
        const textarea = document.createElement('textarea');
        textarea.className = 'lesson-code-input';
        textarea.placeholder = 'Write your code here...';
        textarea.id = 'lesson-code-input';
        textarea.rows = 15;
        textarea.value = initialCode;
        textarea.spellcheck = false;

        // Submit button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'lesson-btn lesson-btn-secondary lesson-code-submit';
        submitBtn.textContent = 'Validate Code';
        submitBtn.addEventListener('click', async () => {
            const passed = await this.checkCodeCheckpoint(checkpoint);
            // Update next button state if checkpoint passed
            if (passed) {
                const nextBtn = document.getElementById('lesson-next-btn');
                if (nextBtn) {
                    nextBtn.disabled = false;
                }
            }
        });

        // Validation result area (initially hidden)
        const resultDiv = document.createElement('div');
        resultDiv.className = 'lesson-validation-result';
        resultDiv.id = 'lesson-validation-result';

        codeDiv.appendChild(instructions);
        codeDiv.appendChild(textarea);
        codeDiv.appendChild(submitBtn);
        codeDiv.appendChild(resultDiv);

        container.appendChild(codeDiv);
    }

    /**
     * Display validation result in UI.
     *
     * Shows:
     * - Success/failure message
     * - Error details
     * - Hints for improvement
     *
     * @param {object} result - Validation result from backend
     * @returns {void}
     */
    showValidationResult(result) {
        const resultDiv = document.getElementById('lesson-validation-result');
        if (!resultDiv) {
            console.error('Validation result div not found');
            return;
        }

        const data = result.data || {};
        const passed = data.passed || false;

        // Clear previous result
        resultDiv.innerHTML = '';
        resultDiv.className = 'lesson-validation-result';

        // Add pass/fail class
        if (passed) {
            resultDiv.classList.add('success');
        } else {
            resultDiv.classList.add('error');
        }

        // Message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'validation-message';
        messageDiv.innerHTML = `<strong>${passed ? '✅' : '❌'} ${data.message}</strong>`;
        resultDiv.appendChild(messageDiv);

        // Errors
        if (data.errors && data.errors.length > 0) {
            const errorsDiv = document.createElement('div');
            errorsDiv.className = 'validation-errors';
            errorsDiv.innerHTML = '<strong>Issues:</strong><ul>' +
                data.errors.map(err => `<li>${err}</li>`).join('') +
                '</ul>';
            resultDiv.appendChild(errorsDiv);
        }

        // Hints
        if (data.hints && data.hints.length > 0) {
            const hintsDiv = document.createElement('div');
            hintsDiv.className = 'validation-hints';
            hintsDiv.innerHTML = '<strong>💡 Hints:</strong><ul>' +
                data.hints.map(hint => `<li>${hint}</li>`).join('') +
                '</ul>';
            resultDiv.appendChild(hintsDiv);
        }

        // Show the result
        resultDiv.style.display = 'block';
    }

    /**
     * Show hint for current step
     *
     * Reveals hint text and tracks hint usage.
     *
     * @param {object} step - Current step
     * @returns {void}
     */
    showHint(step) {
        const hintContent = document.getElementById('lesson-hint-text');
        const hintBtn = document.querySelector('.lesson-hint-button');

        if (hintContent && hintBtn) {
            hintContent.classList.toggle('visible');
            hintBtn.classList.toggle('revealed');

            if (hintContent.classList.contains('visible')) {
                hintBtn.textContent = '💡 Hide Hint';
                console.log('💡 Hint revealed for step:', step.title);
            } else {
                hintBtn.textContent = '💡 Show Hint';
            }
        }
    }

    /**
     * Update progress bar and step indicators
     *
     * Updates:
     * - Progress bar fill percentage
     * - "Step X of Y" text
     * - Step completion indicators
     *
     * @returns {void}
     */
    updateProgress() {
        const progress = this.getProgress();
        const percentage = (progress.currentStep / progress.totalSteps) * 100;

        // Update progress bar
        const progressFill = document.querySelector('.lesson-progress-fill');
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }

        // Update progress text
        const progressText = document.querySelector('.lesson-progress-text');
        if (progressText) {
            progressText.textContent = `Step ${progress.currentStep} of ${progress.totalSteps}`;
        }
    }

    /**
     * Update button states (enabled/disabled)
     *
     * Disables previous button at first step
     * Disables next button at last step
     *
     * @returns {void}
     */
    updateButtonStates() {
        const progress = this.getProgress();
        const prevBtn = document.getElementById('lesson-prev-btn');
        const nextBtn = document.getElementById('lesson-next-btn');

        if (prevBtn) {
            prevBtn.disabled = progress.currentStep === 1;
        }

        if (nextBtn) {
            // Disable next if last step and has checkpoint (unless passed)
            const currentStep = this.getCurrentStep();
            const isLastStep = progress.currentStep === progress.totalSteps;

            if (isLastStep) {
                nextBtn.textContent = '✅ Completed!';
                nextBtn.disabled = true;
            } else if (currentStep?.checkpoint && currentStep.checkpoint.type === 'quiz') {
                // Check if quiz is answered
                const selectedAnswer = document.querySelector('input[name="quiz-answer"]:checked');
                nextBtn.disabled = !selectedAnswer;
            } else {
                nextBtn.disabled = false;
            }
        }
    }

    /**
     * Attach event listeners to action buttons
     *
     * - Next/Previous buttons
     * - Keyboard navigation (arrow keys)
     *
     * @returns {void}
     */
    attachEventListeners() {
        const nextBtn = document.getElementById('lesson-next-btn');
        const prevBtn = document.getElementById('lesson-prev-btn');
        const lessonSelector = document.getElementById('lesson-selector');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousStep());
        }

        // Lesson selector dropdown
        if (lessonSelector) {
            lessonSelector.addEventListener('change', (event) => {
                const lessonId = parseInt(event.target.value);
                this.loadLesson(lessonId);
            });
        }
    }

    /**
     * Setup keyboard navigation
     *
     * - Left arrow: Previous step
     * - Right arrow: Next step
     *
     * @returns {void}
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                this.previousStep();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                this.nextStep();
            }
        });
    }
}

// Make available globally for browser console access
window.LessonEngine = LessonEngine;
