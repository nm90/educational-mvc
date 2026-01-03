/**
 * MVC API Client - Educational fetch() wrapper for async JSON requests
 *
 * Purpose: Centralize all API communication with consistent error handling
 * and __DEBUG__ extraction for the developer panel.
 *
 * Educational Focus:
 * - Shows modern fetch() API usage with async/await
 * - Demonstrates error handling and response parsing
 * - Extracts __DEBUG__ from responses for transparency
 * - Makes async flow as visible as server-side requests
 */

class MvcApi {
    /**
     * Send a JSON request to the server.
     *
     * @param {string} url - API endpoint (e.g., '/users')
     * @param {object} options - fetch options (method, body, headers, etc.)
     * @returns {Promise<object>} - Parsed JSON response
     */
    static async request(url, options = {}) {
        // Set default headers for JSON requests
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',  // Signal this is an XHR/async request
            ...options.headers
        };

        try {
            // Make the fetch request
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Parse JSON response
            const data = await response.json();

            // Store and display __DEBUG__ data if present
            if (data.__DEBUG__) {
                // Store globally for dev panel access
                window.MVC_DEBUG = data.__DEBUG__;

                // Log to console for developer transparency
                console.group(`📡 API Response: ${options.method || 'GET'} ${url}`);
                console.log('Request ID:', data.__DEBUG__.request_id);
                console.log('Method Calls:', data.__DEBUG__.method_calls);
                console.log('DB Queries:', data.__DEBUG__.db_queries);
                console.log('Timing:', {
                    total_ms: (data.__DEBUG__.timing.request_end - data.__DEBUG__.timing.request_start) * 1000
                });
                console.groupEnd();
            }

            // Return the full response (controller will check data.success)
            return data;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * POST request helper for form submissions
     */
    static async post(url, formData) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    /**
     * PUT request helper for updates
     */
    static async put(url, formData) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
    }

    /**
     * DELETE request helper
     */
    static async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }
}

// Make available globally
window.MvcApi = MvcApi;
