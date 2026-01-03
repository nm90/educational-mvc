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
     * Attaches event listeners for interactive components.
     */
    updateCurrentTab() {
        const content = this.tabContents[this.currentTab];
        if (content) {
            content.innerHTML = this.renderTabContent(this.currentTab);

            // Attach listeners for State Inspector tab
            if (this.currentTab === 'state') {
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    this.attachStateInspectorListeners();
                });
            }
        }
    }

    /**
     * renderTabContent(tabName) - Generate HTML for tab content
     *
     * Dispatches to appropriate render method based on tab type.
     * Currently implements State Inspector. Others show placeholders.
     *
     * Future features:
     * - Methods: Show method call tree with args/return values
     * - Flow: Animated flow diagram (View → Controller → Model → DB)
     * - Network: List all HTTP requests with details
     * - Database: Show SQL queries with execution time
     */
    renderTabContent(tabName) {
        if (tabName === 'state') {
            return this.renderStateInspector();
        }

        const tabLabels = {
            'methods': 'Method Calls',
            'flow': 'Flow Diagram',
            'network': 'Network Inspector',
            'database': 'Database Inspector'
        };

        const tabDescriptions = {
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
     * renderStateInspector() - Render expandable JSON tree of view_data
     *
     * MVC Flow:
     * - Reads view_data from backend (window.__DEBUG__.view_data)
     * - Shows what data the controller passed to the view/template
     * - Students can see exactly what values are available in Jinja2 templates
     *
     * Features:
     * - Expandable/collapsible JSON tree structure
     * - Search box to filter by key name
     * - Copy button to copy entire JSON to clipboard
     * - Syntax highlighting for types (strings, numbers, booleans, null)
     * - Shows object/array sizes
     *
     * Lesson Reference:
     * - Lesson 2: Understanding data flow View ← Controller ← Model
     * - Lesson 5: What data reaches templates
     */
    renderStateInspector() {
        const viewData = this.debugData.view_data || {};

        // Check if data is empty
        if (!viewData || Object.keys(viewData).length === 0) {
            return `
                <div class="state-inspector-empty">
                    <p>No view data passed to template</p>
                    <p style="font-size: 10px; margin-top: 10px; color: #858585;">
                        The controller sent no data to the view
                    </p>
                </div>
            `;
        }

        // Create controls (search box + copy button)
        let html = `
            <div class="state-inspector-controls">
                <input
                    type="text"
                    class="state-inspector-search"
                    placeholder="Search keys..."
                    id="state-inspector-search"
                    aria-label="Search state keys"
                />
                <button
                    class="state-inspector-copy-btn"
                    id="state-inspector-copy"
                    title="Copy view_data JSON to clipboard"
                    aria-label="Copy JSON"
                >
                    Copy JSON
                </button>
            </div>
            <div class="state-inspector-tree" id="state-inspector-tree">
        `;

        // Build JSON tree
        const treeHtml = this.createTreeNode('view_data', viewData, 0);
        html += treeHtml + '</div>';

        // After HTML is inserted, attach event listeners
        // (done in updateCurrentTab via attachStateInspectorListeners)
        return html;
    }

    /**
     * createTreeNode(key, value, depth) - Recursively create tree node HTML
     *
     * Renders a single node in the JSON tree. Handles:
     * - Objects (collapsible)
     * - Arrays (collapsible with indices)
     * - Primitives (strings, numbers, booleans)
     * - Null/undefined
     *
     * @param {string} key - The key name (or index for arrays)
     * @param {*} value - The value to display
     * @param {number} depth - Current recursion depth (for indentation)
     * @returns {string} HTML string for this node and children
     */
    createTreeNode(key, value, depth) {
        const type = Array.isArray(value) ? 'array' : typeof value;
        const isExpandable = value !== null && (type === 'object' || type === 'array');

        let html = '<div class="tree-node" style="margin-left: ' + (depth * 16) + 'px">';

        // Toggle button (only for expandable items)
        if (isExpandable) {
            html += `
                <button
                    class="tree-node-toggle collapsed"
                    tabindex="0"
                    aria-expanded="false"
                >
                    ▶
                </button>
            `;
        } else {
            html += '<span style="display: inline-block; width: 16px; margin: 0 4px 0 0;"></span>';
        }

        // Key and type info
        html += '<span class="tree-node-content">';
        html += `<span class="tree-node-key">${this.escapeHtml(key)}</span>`;

        if (isExpandable) {
            // Object or Array
            const size = Array.isArray(value) ? value.length : Object.keys(value).length;
            const typeLabel = Array.isArray(value) ? `Array[${size}]` : `Object {${size}}`;
            html += ` <span class="tree-node-type">${typeLabel}</span>`;
        } else {
            // Primitive value
            const displayValue = this.formatValue(value);
            html += ` ${displayValue}`;
        }

        html += '</span>';

        // Children (for objects and arrays)
        if (isExpandable) {
            html += '<div class="tree-node-children hidden">';

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    html += this.createTreeNode(index.toString(), item, depth + 1);
                });
            } else {
                Object.entries(value).forEach(([k, v]) => {
                    html += this.createTreeNode(k, v, depth + 1);
                });
            }

            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    /**
     * formatValue(value) - Format primitive value with syntax highlighting
     *
     * Returns HTML span with appropriate color class based on type.
     *
     * @param {*} value - The value to format
     * @returns {string} HTML string with syntax highlighting
     */
    formatValue(value) {
        if (value === null) {
            return '<span class="tree-node-null">null</span>';
        }

        if (value === undefined) {
            return '<span class="tree-node-null">undefined</span>';
        }

        const type = typeof value;

        switch (type) {
            case 'string':
                return `<span class="tree-node-string">"${this.escapeHtml(value)}"</span>`;

            case 'number':
                return `<span class="tree-node-number">${value}</span> <span class="tree-node-type">(number)</span>`;

            case 'boolean':
                return `<span class="tree-node-boolean">${value ? 'true' : 'false'}</span>`;

            default:
                return `<span class="tree-node-value">${this.escapeHtml(String(value))}</span>`;
        }
    }

    /**
     * escapeHtml(str) - Escape HTML special characters
     *
     * Prevents XSS by escaping user-provided strings.
     *
     * @param {string} str - String to escape
     * @returns {string} Escaped string safe for HTML
     */
    escapeHtml(str) {
        if (typeof str !== 'string') {
            return String(str);
        }
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * attachStateInspectorListeners() - Attach event handlers for State Inspector
     *
     * Handles:
     * - Toggle button clicks to expand/collapse tree nodes
     * - Search box to filter tree by key name
     * - Copy button to copy JSON to clipboard
     */
    attachStateInspectorListeners() {
        const tree = document.getElementById('state-inspector-tree');
        const searchInput = document.getElementById('state-inspector-search');
        const copyBtn = document.getElementById('state-inspector-copy');

        if (!tree) return;

        // Attach toggle listeners to all toggle buttons
        const toggleButtons = tree.querySelectorAll('.tree-node-toggle');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleNode(btn);
            });

            // Keyboard support: Space/Enter to toggle
            btn.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.toggleNode(btn);
                }
            });
        });

        // Search box listener
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTree(e.target.value.toLowerCase());
            });
        }

        // Copy button listener
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const viewData = this.debugData.view_data || {};
                const json = JSON.stringify(viewData, null, 2);

                navigator.clipboard.writeText(json).then(() => {
                    // Show "copied" feedback
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('copied');

                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('[DevPanel] Failed to copy JSON:', err);
                    alert('Failed to copy JSON to clipboard');
                });
            });
        }
    }

    /**
     * toggleNode(toggleBtn) - Expand/collapse a tree node
     *
     * @param {HTMLElement} toggleBtn - The toggle button element
     */
    toggleNode(toggleBtn) {
        const childrenDiv = toggleBtn.parentElement.querySelector('.tree-node-children');
        if (!childrenDiv) return;

        const isHidden = childrenDiv.classList.contains('hidden');

        if (isHidden) {
            // Expand
            childrenDiv.classList.remove('hidden');
            toggleBtn.classList.remove('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            // Collapse
            childrenDiv.classList.add('hidden');
            toggleBtn.classList.add('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * filterTree(searchTerm) - Filter tree nodes by key name
     *
     * Shows/hides tree nodes based on whether their key matches the search term.
     * Parent nodes are automatically shown if any child matches.
     *
     * @param {string} searchTerm - The search term (lowercase)
     */
    filterTree(searchTerm) {
        const tree = document.getElementById('state-inspector-tree');
        if (!tree) return;

        const nodes = tree.querySelectorAll('.tree-node');
        const visibleNodes = new Set();

        // First pass: identify matching nodes
        nodes.forEach(node => {
            const keyElement = node.querySelector('.tree-node-key');
            if (keyElement) {
                const keyText = keyElement.textContent.toLowerCase();
                if (searchTerm === '' || keyText.includes(searchTerm)) {
                    visibleNodes.add(node);

                    // Mark all parent nodes as visible too
                    let parent = node.parentElement?.closest('.tree-node');
                    while (parent) {
                        visibleNodes.add(parent);
                        parent = parent.parentElement?.closest('.tree-node');
                    }
                }
            }
        });

        // Second pass: show/hide nodes
        nodes.forEach(node => {
            if (visibleNodes.has(node)) {
                node.style.display = '';
                // Expand parents to show matched children
                const toggleBtn = node.querySelector('.tree-node-toggle');
                if (toggleBtn && searchTerm !== '') {
                    const childrenDiv = node.querySelector('.tree-node-children');
                    if (childrenDiv) {
                        childrenDiv.classList.remove('hidden');
                        toggleBtn.classList.remove('collapsed');
                        toggleBtn.setAttribute('aria-expanded', 'true');
                    }
                }
            } else {
                node.style.display = 'none';
            }
        });
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
