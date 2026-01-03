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
            return false;
        }

        // Move to next step
        this.currentStepIndex++;
        this.lessonProgress.currentStep = this.currentStepIndex;
        this.saveProgress();

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
    checkCodeCheckpoint(checkpoint) {
        // Future implementation: validate user's code
        console.log('Code checkpoint - not yet implemented');
        return false;
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
}

// Make available globally for browser console access
window.LessonEngine = LessonEngine;
