/**
 * Developer Panel - Main UI Component
 *
 * MVC Role: CLIENT-SIDE CONTROLLER
 * - Manages the developer panel UI component
 * - Reads debug data from window.__DEBUG__ (injected by backend)
 * - Handles user interactions (toggle, tab switching)
 * - Displays execution flow, method calls, and queries
 *
 * Learning Purpose:
 * - Shows students the transparent execution of their MVC application
 * - Displays method calls, database queries, and data flow
 * - Makes backend operations visible in the frontend
 *
 * Lesson Reference:
 * - Lesson 2: How data flows through MVC
 * - Lesson 5: Understanding Controllers and API calls
 */

class DevPanel {
    /**
     * Constructor - Initialize DevPanel instance
     */
    constructor() {
        this.isOpen = false;
        this.currentTab = 'state';
        this.debugData = window.__DEBUG__ || {};
        this.panelElement = null;
        this.toggleButton = null;
        this.tabs = {};
        this.tabContents = {};
    }

    /**
     * init() - Initialize panel and attach to DOM
     *
     * MVC Flow:
     * 1. Create panel HTML structure (View)
     * 2. Insert into document
     * 3. Attach event listeners (Controller)
     * 4. Load debug data from window.__DEBUG__
     *
     * Called once on page load.
     */
    init() {
        console.log('[DevPanel] Initializing developer panel...');

        // Create panel HTML structure
        this.createPanelHTML();

        // Attach event listeners
        this.attachEventListeners();

        // Load debug data from backend
        this.loadDebugData();

        // Restore panel state from localStorage
        this.restoreState();

        console.log('[DevPanel] Developer panel ready');
    }

    /**
     * createPanelHTML() - Create the HTML structure for the panel
     *
     * Creates:
     * - Toggle button (floating)
     * - Panel container
     * - Tab buttons
     * - Tab content areas (placeholders)
     */
    createPanelHTML() {
        // Create toggle button
        this.toggleButton = document.createElement('button');
        this.toggleButton.id = 'dev-panel-toggle';
        this.toggleButton.innerHTML = '◉';
        this.toggleButton.title = 'Toggle Developer Panel (Alt+D)';
        this.toggleButton.setAttribute('aria-label', 'Toggle Developer Panel');

        // Create main panel container
        this.panelElement = document.createElement('div');
        this.panelElement.id = 'dev-panel';
        this.panelElement.setAttribute('aria-label', 'Developer Panel');
        this.panelElement.setAttribute('role', 'region');

        // Create header
        const header = document.createElement('div');
        header.className = 'dev-panel-header';

        const title = document.createElement('h2');
        title.className = 'dev-panel-title';
        title.textContent = 'Developer Panel';
        title.style.margin = '0';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'dev-panel-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close panel';
        closeBtn.setAttribute('aria-label', 'Close panel');

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Create tabs bar
        const tabsBar = document.createElement('div');
        tabsBar.className = 'dev-panel-tabs';
        tabsBar.setAttribute('role', 'tablist');

        // Define tab names
        const tabNames = [
            { name: 'state', label: 'State Inspector' },
            { name: 'methods', label: 'Method Calls' },
            { name: 'flow', label: 'Flow Diagram' },
            { name: 'network', label: 'Network' },
            { name: 'database', label: 'Database' }
        ];

        // Create tab buttons
        tabNames.forEach((tab, index) => {
            const tabBtn = document.createElement('button');
            tabBtn.className = `dev-panel-tab ${index === 0 ? 'active' : ''}`;
            tabBtn.textContent = tab.label;
            tabBtn.setAttribute('data-tab', tab.name);
            tabBtn.setAttribute('role', 'tab');
            tabBtn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            tabBtn.setAttribute('aria-controls', `tab-${tab.name}`);

            tabsBar.appendChild(tabBtn);
            this.tabs[tab.name] = tabBtn;
        });

        // Create content container
        const contentArea = document.createElement('div');
        contentArea.className = 'dev-panel-content';

        // Create tab content areas
        tabNames.forEach((tab, index) => {
            const content = document.createElement('div');
            content.id = `tab-${tab.name}`;
            content.className = `dev-panel-tab-content ${index === 0 ? 'active' : ''}`;
            content.setAttribute('role', 'tabpanel');
            content.setAttribute('aria-labelledby', `tab-${tab.name}-button`);

            // Placeholder content
            content.innerHTML = `
                <div class="dev-panel-placeholder">
                    <p>${tab.label}</p>
                    <strong>Content coming in next feature</strong>
                </div>
            `;

            contentArea.appendChild(content);
            this.tabContents[tab.name] = content;
        });

        // Assemble panel
        this.panelElement.appendChild(header);
        this.panelElement.appendChild(tabsBar);
        this.panelElement.appendChild(contentArea);

        // Insert into document
        document.body.appendChild(this.toggleButton);
        document.body.appendChild(this.panelElement);
    }

    /**
     * attachEventListeners() - Attach handlers for user interactions
     */
    attachEventListeners() {
        // Toggle button click
        this.toggleButton.addEventListener('click', () => this.toggle());

        // Close button click
        const closeBtn = this.panelElement.querySelector('.dev-panel-close-btn');
        closeBtn.addEventListener('click', () => this.close());

        // Tab button clicks
        Object.entries(this.tabs).forEach(([tabName, tabBtn]) => {
            tabBtn.addEventListener('click', () => this.switchTab(tabName));
        });

        // Keyboard shortcut: Alt+D to toggle panel
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * loadDebugData() - Read __DEBUG__ object from window
     *
     * The backend injects window.__DEBUG__ with:
     * - Method calls with timing
     * - Database queries executed
     * - Request information
     * - Data passed to view
     */
    loadDebugData() {
        if (window.__DEBUG__) {
            this.debugData = window.__DEBUG__;
            console.log('[DevPanel] Debug data loaded:', this.debugData);
            // Update current tab display
            this.updateCurrentTab();
        } else {
            console.warn('[DevPanel] No __DEBUG__ object found. Backend may not be injecting it.');
        }
    }

    /**
     * toggle() - Show/hide panel with state persistence
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * open() - Show the panel
     */
    open() {
        this.isOpen = true;
        this.panelElement.classList.add('active');
        this.toggleButton.classList.add('open');
        localStorage.setItem('devPanel-open', 'true');
        console.log('[DevPanel] Opened');
    }

    /**
     * close() - Hide the panel
     */
    close() {
        this.isOpen = false;
        this.panelElement.classList.remove('active');
        this.toggleButton.classList.remove('open');
        localStorage.setItem('devPanel-open', 'false');
        console.log('[DevPanel] Closed');
    }

    /**
     * switchTab(tabName) - Switch active tab
     *
     * Shows content for selected tab and hides others.
     * Updates visual indicators (active states).
     */
    switchTab(tabName) {
        // Validate tab exists
        if (!this.tabContents[tabName]) {
            console.warn(`[DevPanel] Tab "${tabName}" not found`);
            return;
        }

        // Update current tab
        this.currentTab = tabName;
        localStorage.setItem('devPanel-tab', tabName);

        // Hide all tab contents
        Object.entries(this.tabContents).forEach(([name, content]) => {
            content.classList.remove('active');
        });

        // Hide all tab buttons (deactivate)
        Object.entries(this.tabs).forEach(([name, btn]) => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        // Show selected tab content
        this.tabContents[tabName].classList.add('active');

        // Highlight active tab button
        this.tabs[tabName].classList.add('active');
        this.tabs[tabName].setAttribute('aria-selected', 'true');

        console.log(`[DevPanel] Switched to tab: ${tabName}`);

        // Update tab content with latest data
        this.updateCurrentTab();
    }

    /**
     * updateCurrentTab() - Render content for current tab
     *
     * Called when:
     * - Tab is switched
     * - New debug data is loaded
     *
     * Delegates to renderTabContent() to display tab-specific data.
     */
    updateCurrentTab() {
        const content = this.tabContents[this.currentTab];
        if (content) {
            content.innerHTML = this.renderTabContent(this.currentTab);
        }
    }

    /**
     * renderTabContent(tabName) - Generate HTML for tab content
     *
     * Future features:
     * - State: Display app state, view data, data types
     * - Methods: Show method call tree with args/return values
     * - Flow: Animated flow diagram (View → Controller → Model → DB)
     * - Network: List all HTTP requests with details
     * - Database: Show SQL queries with execution time
     *
     * Currently shows placeholder "Coming soon" message.
     */
    renderTabContent(tabName) {
        const tabLabels = {
            'state': 'State Inspector',
            'methods': 'Method Calls',
            'flow': 'Flow Diagram',
            'network': 'Network Inspector',
            'database': 'Database Inspector'
        };

        const tabDescriptions = {
            'state': 'View current app state and data passed to templates',
            'methods': 'See every Python method call with arguments and return values',
            'flow': 'Watch the request flow through MVC layers in real-time',
            'network': 'Inspect all HTTP requests and responses',
            'database': 'Review all SQL queries and execution timing'
        };

        return `
            <div class="dev-panel-placeholder">
                <p><strong>${tabLabels[tabName] || 'Tab'}</strong></p>
                <p>${tabDescriptions[tabName] || ''}</p>
                <p style="margin-top: 20px; color: #4ec9b0;">
                    Tab content coming in next features
                </p>
            </div>
        `;
    }

    /**
     * restoreState() - Restore panel state from localStorage
     *
     * Remembers:
     * - Whether panel was open/closed
     * - Which tab was active
     */
    restoreState() {
        const wasOpen = localStorage.getItem('devPanel-open') === 'true';
        const lastTab = localStorage.getItem('devPanel-tab') || 'state';

        if (wasOpen) {
            this.open();
        }

        this.switchTab(lastTab);
    }
}

// Initialize panel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DevPanel().init();
    });
} else {
    // DOM is already loaded (e.g., script loaded after page render)
    new DevPanel().init();
}
