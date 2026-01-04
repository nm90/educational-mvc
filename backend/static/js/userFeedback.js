/**
 * User Feedback System - Toast notifications, confirmations, and loading indicators
 *
 * MVC Role: USER INTERFACE CONTROLLER
 * - Manages user feedback UI elements (toasts, modals, spinners)
 * - Provides consistent feedback for user actions
 * - Improves user experience with visual feedback
 *
 * Learning Purpose:
 * - Shows how to create reusable UI components
 * - Demonstrates event-driven feedback system
 * - Shows graceful error handling with user-friendly messages
 *
 * Usage Examples:
 *   UserFeedback.toast('Success!', 'success');
 *   UserFeedback.showConfirmation('Delete this?', () => { ... });
 *   UserFeedback.showLoading();
 *   UserFeedback.hideLoading();
 */

class UserFeedback {
    /**
     * Initialize the feedback system
     *
     * Creates the toast container if it doesn't exist.
     * Should be called once on page load.
     */
    static init() {
        console.log('[UserFeedback] Initializing feedback system...');

        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    /**
     * Show a toast notification
     *
     * Displays a temporary message to the user with appropriate styling.
     * Automatically dismisses after 5 seconds.
     *
     * Learning Purpose:
     * - Shows how to create transient UI elements
     * - Demonstrates error handling patterns
     * - Shows animation integration
     *
     * @param {string} message - Message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in ms (default 5000)
     */
    static toast(message, type = 'info', duration = 5000) {
        try {
            const container = document.getElementById('toast-container');
            if (!container) {
                console.warn('[UserFeedback] Toast container not found, initializing...');
                this.init();
                return this.toast(message, type, duration);
            }

            // Create toast element
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');

            // Icon based on type
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ⓘ'
            };

            const html = `
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <span class="toast-message">${this.escapeHtml(message)}</span>
                <button class="toast-close" aria-label="Close notification" onclick="this.parentElement.remove()">×</button>
            `;

            toast.innerHTML = html;
            container.appendChild(toast);

            console.log(`[UserFeedback] Toast (${type}): ${message}`);

            // Auto-dismiss after duration
            const timeoutId = setTimeout(() => {
                if (toast.parentElement) {
                    toast.classList.add('removing');
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);

            // Clear timeout if manually closed
            toast.querySelector('.toast-close').addEventListener('click', () => {
                clearTimeout(timeoutId);
            });

        } catch (error) {
            console.error('[UserFeedback] Error showing toast:', error);
            // Fallback to console log if toast fails
            console.log(`[Fallback] ${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Show a success toast notification
     *
     * @param {string} message - Success message
     * @param {number} duration - Duration in ms
     */
    static success(message, duration = 5000) {
        this.toast(message, 'success', duration);
    }

    /**
     * Show an error toast notification
     *
     * @param {string} message - Error message
     * @param {number} duration - Duration in ms
     */
    static error(message, duration = 7000) {
        this.toast(message, 'error', duration);
    }

    /**
     * Show a warning toast notification
     *
     * @param {string} message - Warning message
     * @param {number} duration - Duration in ms
     */
    static warning(message, duration = 6000) {
        this.toast(message, 'warning', duration);
    }

    /**
     * Show an info toast notification
     *
     * @param {string} message - Info message
     * @param {number} duration - Duration in ms
     */
    static info(message, duration = 5000) {
        this.toast(message, 'info', duration);
    }

    /**
     * Show a confirmation dialog
     *
     * Displays a modal dialog with OK and Cancel buttons.
     * The user must choose an action to dismiss.
     *
     * Learning Purpose:
     * - Shows how to create modal dialogs
     * - Demonstrates Promise-based async UI
     * - Shows confirmation pattern for destructive actions
     *
     * @param {string} title - Dialog title
     * @param {string} message - Message to display
     * @param {Object} options - Options object
     * @returns {Promise<boolean>} - true if confirmed, false if cancelled
     */
    static showConfirmation(title, message, options = {}) {
        return new Promise((resolve) => {
            try {
                const {
                    confirmText = 'Confirm',
                    cancelText = 'Cancel',
                    confirmClass = 'btn-primary',
                    isDangerous = false
                } = options;

                // Create overlay
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                overlay.setAttribute('role', 'alertdialog');
                overlay.setAttribute('aria-modal', 'true');
                overlay.setAttribute('aria-labelledby', 'confirm-title');

                // Create dialog
                const dialog = document.createElement('div');
                dialog.className = 'modal-dialog';

                // Create header
                const header = document.createElement('div');
                header.className = 'modal-header';
                const titleEl = document.createElement('h2');
                titleEl.id = 'confirm-title';
                titleEl.textContent = title;
                header.appendChild(titleEl);

                // Create body
                const body = document.createElement('div');
                body.className = 'modal-body';
                body.textContent = message;

                // Create footer with buttons
                const footer = document.createElement('div');
                footer.className = 'modal-footer';

                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'btn btn-secondary';
                cancelBtn.textContent = cancelText;
                cancelBtn.onclick = () => {
                    cleanup();
                    resolve(false);
                };

                const confirmBtn = document.createElement('button');
                confirmBtn.className = `btn ${isDangerous ? 'btn-danger' : confirmClass}`;
                confirmBtn.textContent = confirmText;
                confirmBtn.onclick = () => {
                    cleanup();
                    resolve(true);
                };

                footer.appendChild(cancelBtn);
                footer.appendChild(confirmBtn);

                // Assemble dialog
                dialog.appendChild(header);
                dialog.appendChild(body);
                dialog.appendChild(footer);
                overlay.appendChild(dialog);

                // Close on overlay click (outside dialog)
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        cleanup();
                        resolve(false);
                    }
                });

                // Close on Escape key
                const closeOnEscape = (e) => {
                    if (e.key === 'Escape') {
                        cleanup();
                        resolve(false);
                    }
                };

                const cleanup = () => {
                    overlay.remove();
                    document.removeEventListener('keydown', closeOnEscape);
                };

                // Add to DOM
                document.body.appendChild(overlay);
                document.addEventListener('keydown', closeOnEscape);

                // Focus on confirm button
                confirmBtn.focus();

                console.log('[UserFeedback] Showing confirmation:', title);

            } catch (error) {
                console.error('[UserFeedback] Error showing confirmation:', error);
                resolve(false); // Default to cancel on error
            }
        });
    }

    /**
     * Show a loading spinner
     *
     * Displays a fullscreen loading indicator.
     * Use hideLoading() to remove it.
     *
     * Learning Purpose:
     * - Shows how to create blocking UI elements
     * - Demonstrates feedback during long operations
     *
     * @param {string} message - Optional message to display
     */
    static showLoading(message = 'Loading...') {
        try {
            // Remove existing loading indicator if present
            this.hideLoading();

            // Create loading overlay
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
            `;

            // Create spinner container
            const container = document.createElement('div');
            container.style.cssText = `
                text-align: center;
            `;

            // Create spinner
            const spinner = document.createElement('div');
            spinner.className = 'spinner';

            // Create message
            const messageEl = document.createElement('p');
            messageEl.textContent = message;
            messageEl.style.cssText = `
                margin-top: 15px;
                color: #666;
                font-size: 14px;
            `;

            container.appendChild(spinner);
            container.appendChild(messageEl);
            overlay.appendChild(container);
            document.body.appendChild(overlay);

            console.log('[UserFeedback] Showing loading:', message);

        } catch (error) {
            console.error('[UserFeedback] Error showing loading:', error);
        }
    }

    /**
     * Hide the loading spinner
     */
    static hideLoading() {
        try {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.remove();
                console.log('[UserFeedback] Hiding loading');
            }
        } catch (error) {
            console.error('[UserFeedback] Error hiding loading:', error);
        }
    }

    /**
     * Show form validation errors
     *
     * Highlights form fields with errors and shows error messages.
     *
     * Learning Purpose:
     * - Shows error handling for form validation
     * - Demonstrates field-level error feedback
     *
     * @param {HTMLElement} form - The form element
     * @param {Object} errors - Object with field names as keys and error messages as values
     */
    static showFormErrors(form, errors) {
        try {
            // Clear previous errors
            form.querySelectorAll('.form-error').forEach(el => el.remove());
            form.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));

            // Show new errors
            Object.entries(errors).forEach(([fieldName, errorMessage]) => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    // Mark field as error
                    const formGroup = field.closest('.form-group') || field.parentElement;
                    if (formGroup) {
                        formGroup.classList.add('error');
                    }

                    // Add error message
                    const errorEl = document.createElement('div');
                    errorEl.className = 'form-error';
                    errorEl.textContent = errorMessage;
                    field.parentElement.insertBefore(errorEl, field.nextSibling);

                    console.log(`[UserFeedback] Field error (${fieldName}): ${errorMessage}`);
                }
            });

            // Focus on first error field
            const firstErrorField = form.querySelector('.form-group.error input, .form-group.error select');
            if (firstErrorField) {
                firstErrorField.focus();
            }

        } catch (error) {
            console.error('[UserFeedback] Error showing form errors:', error);
        }
    }

    /**
     * Clear form errors
     *
     * @param {HTMLElement} form - The form element
     */
    static clearFormErrors(form) {
        try {
            form.querySelectorAll('.form-error').forEach(el => el.remove());
            form.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
        } catch (error) {
            console.error('[UserFeedback] Error clearing form errors:', error);
        }
    }

    /**
     * Escape HTML special characters
     *
     * Prevents XSS attacks by escaping HTML in user-provided text.
     *
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UserFeedback.init());
} else {
    UserFeedback.init();
}
