/**
 * Mode Manager - Tutorial vs Exploration Mode Switcher
 *
 * MVC Role: CLIENT-SIDE CONTROLLER
 * - Manages application mode state (Tutorial or Exploration)
 * - Controls visibility of UI components based on mode
 * - Persists mode preference to localStorage
 * - Emits events for mode changes
 *
 * Learning Purpose:
 * - Demonstrates client-side state management
 * - Shows localStorage API for client-side persistence
 * - Implements observer pattern with custom events
 * - Shows conditional UI rendering based on application state
 *
 * Lesson Reference:
 * - Feature 4.1: Mode Switcher Component
 *
 * Modes:
 * - Tutorial: Guided learning experience with lesson panel visible
 * - Exploration: Free-form experimentation with full feature access
 */

class ModeManager {
    /**
     * Constructor - Initialize ModeManager
     *
     * Loads saved mode preference from localStorage and applies it.
     * If no preference is saved, defaults to Tutorial mode.
     *
     * Usage:
     *   const modeManager = new ModeManager();
     *   modeManager.init();
     */
    constructor() {
        this.currentMode = 'tutorial'; // default mode
        this.modeChangeCallbacks = [];

        // Initialize by loading saved preference
        this.init();
    }

    /**
     * Initialize Mode Manager
     *
     * MVC Flow:
     * 1. Load mode preference from localStorage
     * 2. Apply mode (show/hide components)
     * 3. Register event listeners for toggle switch
     * 4. Set initial checkbox state
     *
     * @returns {void}
     */
    init() {
        try {
            // Load saved mode from localStorage
            const savedMode = localStorage.getItem('appMode');
            this.currentMode = savedMode || 'tutorial';

            // Apply the current mode
            this.applyMode();

            // Register UI event listeners
            this.attachEventListeners();

            console.log(`✅ ModeManager initialized - Current mode: ${this.currentMode}`);

        } catch (error) {
            console.error('Failed to initialize ModeManager:', error);
        }
    }

    /**
     * Set application mode
     *
     * MVC Flow:
     * 1. Validate mode parameter ('tutorial' or 'exploration')
     * 2. Save new mode to localStorage
     * 3. Update this.currentMode
     * 4. Apply UI changes
     * 5. Emit mode change event
     *
     * @param {string} mode - 'tutorial' or 'exploration'
     * @returns {void}
     */
    setMode(mode) {
        // Validate mode parameter
        if (mode !== 'tutorial' && mode !== 'exploration') {
            console.error(`Invalid mode: ${mode}. Must be 'tutorial' or 'exploration'.`);
            return;
        }

        // Only update if mode actually changed
        if (this.currentMode === mode) {
            console.log(`Mode already set to: ${mode}`);
            return;
        }

        // Update mode
        this.currentMode = mode;

        // Save to localStorage for persistence
        try {
            localStorage.setItem('appMode', mode);
            console.log(`💾 Mode saved to localStorage: ${mode}`);
        } catch (error) {
            console.error('Failed to save mode to localStorage:', error);
        }

        // Apply visual changes
        this.applyMode();

        // Notify listeners
        this.emitModeChange();
    }

    /**
     * Apply mode - Show/hide UI components based on current mode
     *
     * Tutorial Mode:
     * - Show lesson panel (full sidebar with lessons)
     * - Hide dev panel toggle (dev panel always visible in tutorial)
     * - Disable certain interactive features (locked based on lesson progress)
     *
     * Exploration Mode:
     * - Hide lesson panel (more screen space)
     * - Show dev panel toggle (user can toggle dev panel on/off)
     * - Unlock all features for free experimentation
     *
     * Dev Panel Note:
     * - In Tutorial Mode: Always visible, forced to help learning
     * - In Exploration Mode: Toggleable, user can hide to focus on the app
     *
     * @returns {void}
     */
    applyMode() {
        const isTutorial = this.currentMode === 'tutorial';

        // Update lesson panel visibility
        const lessonPanel = document.getElementById('lesson-panel');
        if (lessonPanel) {
            if (isTutorial) {
                // Tutorial: Show lesson panel
                lessonPanel.style.display = 'flex';
                document.body.classList.add('lesson-panel-visible');
            } else {
                // Exploration: Hide lesson panel
                lessonPanel.style.display = 'none';
                document.body.classList.remove('lesson-panel-visible');
            }
        }

        // Update dev panel visibility
        const devPanel = document.getElementById('dev-panel');
        const devPanelToggle = document.getElementById('dev-panel-toggle');

        if (devPanel) {
            if (isTutorial) {
                // Tutorial: Force dev panel visible (always visible)
                devPanel.classList.remove('hidden');
                devPanel.style.display = 'block';

                // Hide the toggle button (can't turn off in tutorial)
                if (devPanelToggle) {
                    devPanelToggle.style.display = 'none';
                }
            } else {
                // Exploration: Dev panel is toggleable
                if (devPanelToggle) {
                    devPanelToggle.style.display = 'inline-block';
                }
            }
        }

        // Update mode-specific UI styling
        document.body.classList.toggle('tutorial-mode', isTutorial);
        document.body.classList.toggle('exploration-mode', !isTutorial);

        // Log mode change
        const modeName = isTutorial ? 'Tutorial' : 'Exploration';
        console.log(`📝 Mode changed to: ${modeName}`);
    }

    /**
     * Get current application mode
     *
     * @returns {string} - 'tutorial' or 'exploration'
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Check if currently in Tutorial Mode
     *
     * @returns {boolean} - True if in tutorial mode
     */
    isTutorialMode() {
        return this.currentMode === 'tutorial';
    }

    /**
     * Check if currently in Exploration Mode
     *
     * @returns {boolean} - True if in exploration mode
     */
    isExplorationMode() {
        return this.currentMode === 'exploration';
    }

    /**
     * Register callback for mode changes
     *
     * Allows other components to be notified when mode changes.
     * Useful for:
     * - Lesson engine to pause/resume on mode change
     * - Dev panel to update visibility
     * - Feature flags to enable/disable functionality
     *
     * Usage:
     *   modeManager.onModeChange(() => {
     *     console.log('Mode changed to:', modeManager.getCurrentMode());
     *   });
     *
     * @param {Function} callback - Function to call on mode change
     * @returns {void}
     */
    onModeChange(callback) {
        if (typeof callback === 'function') {
            this.modeChangeCallbacks.push(callback);
        }
    }

    /**
     * Emit mode change event
     *
     * Calls all registered callbacks.
     * Also dispatches custom DOM event for broader notification.
     *
     * @returns {void}
     */
    emitModeChange() {
        // Call registered callbacks
        this.modeChangeCallbacks.forEach(callback => {
            try {
                callback(this.currentMode);
            } catch (error) {
                console.error('Error in mode change callback:', error);
            }
        });

        // Also dispatch custom event for other components
        const event = new CustomEvent('modeChanged', {
            detail: { mode: this.currentMode }
        });
        document.dispatchEvent(event);

        console.log(`🔄 Mode change event emitted: ${this.currentMode}`);
    }

    /**
     * Toggle between modes
     *
     * Switches from current mode to the other mode.
     * - Tutorial ↔ Exploration
     *
     * @returns {void}
     */
    toggleMode() {
        const newMode = this.currentMode === 'tutorial' ? 'exploration' : 'tutorial';
        this.setMode(newMode);
    }

    /**
     * Attach event listeners to UI elements
     *
     * Listens for:
     * - Mode toggle checkbox changes
     * - Keyboard shortcuts (future)
     *
     * @returns {void}
     */
    attachEventListeners() {
        const modeSwitch = document.getElementById('mode-switch');

        if (modeSwitch) {
            // Set initial checkbox state
            modeSwitch.checked = this.currentMode === 'exploration';

            // Listen for checkbox changes
            modeSwitch.addEventListener('change', (event) => {
                const newMode = event.target.checked ? 'exploration' : 'tutorial';
                this.setMode(newMode);
            });

            console.log('✅ Mode toggle event listeners attached');
        } else {
            console.warn('Mode switch element not found. UI may not respond to mode changes.');
        }
    }

    /**
     * Get mode display name
     *
     * @returns {string} - Human-readable mode name
     */
    getModeName() {
        return this.currentMode === 'tutorial' ? 'Tutorial Mode' : 'Exploration Mode';
    }

    /**
     * Get mode description
     *
     * @returns {string} - Description of current mode
     */
    getModeDescription() {
        if (this.currentMode === 'tutorial') {
            return 'Guided learning experience with lesson panel visible';
        } else {
            return 'Free experimentation with full feature access';
        }
    }

    /**
     * Debug: Print current mode info
     */
    printModeInfo() {
        console.group('📋 Mode Manager Info');
        console.log('Current Mode:', this.getModeName());
        console.log('Description:', this.getModeDescription());
        console.log('Tutorial Mode:', this.isTutorialMode());
        console.log('Exploration Mode:', this.isExplorationMode());
        console.log('Callbacks registered:', this.modeChangeCallbacks.length);
        console.groupEnd();
    }
}

// Make available globally for console access
window.ModeManager = ModeManager;
