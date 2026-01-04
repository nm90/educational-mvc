/**
 * MVC Form Handler - Intercepts form submissions and converts to async JSON requests
 *
 * Educational Focus:
 * - Shows how to progressively enhance HTML forms with JavaScript
 * - Demonstrates event interception without breaking HTML semantics
 * - Handles form serialization and async submission
 * - Updates page without full reload
 * - Works without JavaScript (HTML forms still submit normally)
 *
 * Usage: Add data-async attribute to any form to enable:
 * <form action="/users" method="POST" data-async>
 */

class MvcFormHandler {
    /**
     * Initialize form handling for all forms with data-async attribute.
     * Call this once when the page loads.
     */
    static init() {
        // Find all forms marked for async handling
        const forms = document.querySelectorAll('form[data-async]');

        forms.forEach(form => {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        });

        console.log(`✓ Initialized async form handling for ${forms.length} form(s)`);
    }

    /**
     * Handle form submission - prevent default and send async request instead.
     *
     * @param {Event} event - Form submit event
     */
    static async handleSubmit(event) {
        // Prevent default form submission (no page reload)
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');

        // Serialize form data to JSON
        const formData = this.serializeForm(form);

        // Get form action and method
        const url = form.action;
        const method = (form.method || 'POST').toUpperCase();

        try {
            // Disable submit button during request
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.setAttribute('data-original-text', submitButton.textContent);
                submitButton.textContent = 'Submitting...';
            }

            // Send async JSON request
            const response = await MvcApi.post(url, formData);

            // Handle response based on success flag
            if (response.success) {
                this.handleSuccess(form, response);
            } else {
                this.handleError(form, response.error, response.__DEBUG__);
            }

        } catch (error) {
            // Network error or other exception
            this.handleError(form, {
                message: `Network error: ${error.message}`
            });

        } finally {
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                const originalText = submitButton.getAttribute('data-original-text');
                submitButton.textContent = originalText || 'Submit';
            }
        }
    }

    /**
     * Serialize HTML form data to JSON object.
     * Converts FormData to plain object for JSON.stringify().
     *
     * @param {HTMLFormElement} form
     * @returns {object} Form data as key-value pairs
     */
    static serializeForm(form) {
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    /**
     * Handle successful form submission.
     *
     * @param {HTMLFormElement} form
     * @param {object} response - Success response from server
     */
    static handleSuccess(form, response) {
        // Save __DEBUG__ data to sessionStorage if present
        if (response.__DEBUG__) {
            this.saveDebugDataFromResponse(response.__DEBUG__);
        }

        // Show success message
        this.showMessage('success', 'Success!');

        // If redirect specified, navigate to it after a short delay
        if (response.data && response.data.redirect) {
            setTimeout(() => {
                window.location.href = response.data.redirect;
            }, 500);
        } else {
            // Otherwise, reset form and stay on page
            form.reset();
        }
    }

    /**
     * Handle form submission error.
     *
     * @param {HTMLFormElement} form
     * @param {object} error - Error object from server
     * @param {object} debugData - Optional __DEBUG__ object from response
     */
    static handleError(form, error, debugData) {
        // Save __DEBUG__ data to sessionStorage if present
        // This ensures error requests appear in devPanel history
        if (debugData) {
            this.saveDebugDataFromResponse(debugData);
        }

        // Show error message to user
        this.showMessage('error', error.message || 'An error occurred');

        // If field specified, highlight it for user attention
        if (error.field) {
            const field = form.querySelector(`[name="${error.field}"]`);
            if (field) {
                field.classList.add('error-field');
                field.focus();

                // Remove highlighting after user starts typing
                field.addEventListener('input', function removeHighlight() {
                    field.classList.remove('error-field');
                    field.removeEventListener('input', removeHighlight);
                });
            }
        }
    }

    /**
     * Save __DEBUG__ data from JSON response to devPanel.
     *
     * Called after receiving a JSON response from the server.
     * Notifies the devPanel to add the request to history and update the UI.
     *
     * @param {object} debugData - The __DEBUG__ object from response
     */
    static saveDebugDataFromResponse(debugData) {
        if (!debugData || !debugData.request_info) {
            return;
        }

        // Use the global devPanel instance to add the request
        // This updates both the internal state and the UI
        if (window.devPanel && typeof window.devPanel.addExternalRequest === 'function') {
            window.devPanel.addExternalRequest(debugData);
        } else {
            console.warn('[MvcFormHandler] devPanel not available, debug data not saved');
        }
    }

    /**
     * Display a transient flash message to the user.
     *
     * @param {string} type - 'success' or 'error'
     * @param {string} message - Message text to display
     */
    static showMessage(type, message) {
        // Create flash message element
        const flash = document.createElement('div');
        flash.className = `flash flash-${type}`;
        flash.setAttribute('role', 'alert');
        flash.textContent = message;

        // Add basic styling
        Object.assign(flash.style, {
            padding: '12px 16px',
            margin: '16px',
            borderRadius: '4px',
            marginBottom: '16px',
            display: 'block',
            animation: 'slideDown 0.3s ease-out'
        });

        if (type === 'success') {
            flash.style.backgroundColor = '#d4edda';
            flash.style.color = '#155724';
            flash.style.border = '1px solid #c3e6cb';
        } else {
            flash.style.backgroundColor = '#f8d7da';
            flash.style.color = '#721c24';
            flash.style.border = '1px solid #f5c6cb';
        }

        // Insert at top of main content
        const main = document.querySelector('main') || document.body;
        main.insertBefore(flash, main.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            flash.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => flash.remove(), 300);
        }, 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MvcFormHandler.init();
});
