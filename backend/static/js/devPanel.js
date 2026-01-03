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

            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                // Attach listeners for State Inspector tab
                if (this.currentTab === 'state') {
                    this.attachStateInspectorListeners();
                }

                // Attach listeners for Method Calls tab
                if (this.currentTab === 'methods') {
                    this.attachMethodCallListeners();
                }

                // Attach listeners for Database Query tab
                if (this.currentTab === 'database') {
                    this.attachDatabaseQueryListeners();
                }

                // Attach listeners for Network Inspector tab
                if (this.currentTab === 'network') {
                    this.attachNetworkInspectorListeners();
                }
            });
        }
    }

    /**
     * renderTabContent(tabName) - Generate HTML for tab content
     *
     * Dispatches to appropriate render method based on tab type.
     * Currently implements State Inspector, Method Calls, Database Inspector, and Network Inspector.
     *
     * Future features:
     * - Flow: Animated flow diagram (View → Controller → Model → DB)
     */
    renderTabContent(tabName) {
        if (tabName === 'state') {
            return this.renderStateInspector();
        }

        if (tabName === 'methods') {
            return this.renderMethodCalls();
        }

        if (tabName === 'database') {
            return this.renderDatabaseQueries();
        }

        if (tabName === 'network') {
            return this.renderNetworkInspector();
        }

        const tabLabels = {
            'flow': 'Flow Diagram'
        };

        const tabDescriptions = {
            'flow': 'Watch the request flow through MVC layers in real-time'
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
     * renderMethodCalls() - Render method call timeline with filtering and details
     *
     * MVC Flow:
     * - Reads method_calls from backend (window.__DEBUG__.method_calls)
     * - Shows all Python method calls during request execution
     * - Displays in chronological order with execution time
     * - Students can see the flow of method calls through Model/Controller layers
     *
     * Features:
     * - Expandable method nodes showing arguments and return values
     * - Color-coding by layer (Model=blue, Controller=green, Utility=gray)
     * - Search/filter by method name
     * - Filter by layer (Models only, Controllers only)
     * - Performance filter (show methods > 10ms)
     * - Total execution time at top
     * - JSON syntax highlighting in arguments/return values
     *
     * Lesson Reference:
     * - Lesson 2: Understanding MVC flow through method calls
     * - Lesson 5: How controllers call models and utilities
     */
    renderMethodCalls() {
        const calls = this.debugData.method_calls || [];

        // Check if data is empty
        if (!calls || calls.length === 0) {
            return `
                <div class="method-calls-empty">
                    <p>No method calls tracked</p>
                    <p style="font-size: 10px; margin-top: 10px; color: #858585;">
                        Method call tracking not enabled or no calls made
                    </p>
                </div>
            `;
        }

        // Calculate total execution time
        const totalTime = calls.reduce((sum, call) => sum + (call.duration || 0), 0);

        // Create controls for filtering
        let html = `
            <div class="method-calls-header">
                <div class="method-calls-summary">
                    <strong>${calls.length} calls, ${totalTime.toFixed(1)}ms total</strong>
                </div>
                <div class="method-calls-controls">
                    <input
                        type="text"
                        class="method-calls-search"
                        placeholder="Search methods..."
                        id="method-calls-search"
                        aria-label="Search method calls"
                    />
                    <div class="method-calls-filters">
                        <label style="display: inline-flex; align-items: center; margin-right: 15px;">
                            <input
                                type="checkbox"
                                id="filter-models-only"
                                class="method-calls-filter"
                                data-filter="models"
                                aria-label="Show only Model methods"
                            />
                            <span style="margin-left: 5px; font-size: 12px;">Models Only</span>
                        </label>
                        <label style="display: inline-flex; align-items: center; margin-right: 15px;">
                            <input
                                type="checkbox"
                                id="filter-controllers-only"
                                class="method-calls-filter"
                                data-filter="controllers"
                                aria-label="Show only Controller methods"
                            />
                            <span style="margin-left: 5px; font-size: 12px;">Controllers Only</span>
                        </label>
                        <label style="display: inline-flex; align-items: center;">
                            <input
                                type="checkbox"
                                id="filter-slow"
                                class="method-calls-filter"
                                data-filter="slow"
                                aria-label="Show only methods > 10ms"
                            />
                            <span style="margin-left: 5px; font-size: 12px;">Slow (>10ms)</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="method-calls-list" id="method-calls-list">
        `;

        // Render each method call
        calls.forEach((call, index) => {
            html += this.createMethodCallNode(call, index);
        });

        html += '</div>';
        return html;
    }

    /**
     * createMethodCallNode(call, index) - Create expandable node for a single method call
     *
     * Shows:
     * - Method name (e.g., "Task.get_all")
     * - Execution duration in milliseconds
     * - Click to expand → arguments, kwargs, return value
     * - Color-coded by layer
     *
     * @param {Object} call - Method call object {method, args, kwargs, return_value, duration}
     * @param {number} index - Index of this call in the list
     * @returns {string} HTML for this method call node
     */
    createMethodCallNode(call, index) {
        const { method, args = [], kwargs = {}, return_value, duration = 0 } = call;
        const layer = this.getMethodLayer(method);
        const layerColor = {
            'model': 'layer-model',
            'controller': 'layer-controller',
            'utility': 'layer-utility'
        }[layer] || 'layer-utility';

        const nodeId = `method-call-${index}`;

        let html = `
            <div class="method-call-node ${layerColor}" data-layer="${layer}" data-duration="${duration}" data-method="${method}">
                <button
                    class="method-call-toggle collapsed"
                    data-node-id="${nodeId}"
                    tabindex="0"
                    aria-expanded="false"
                    aria-controls="${nodeId}-details"
                >
                    ▶
                </button>
                <div class="method-call-header">
                    <span class="method-call-name">${this.escapeHtml(method)}</span>
                    <span class="method-call-duration">${duration.toFixed(1)}ms</span>
                </div>
                <div
                    id="${nodeId}-details"
                    class="method-call-details hidden"
                    role="region"
                    aria-labelledby="${nodeId}"
                >
                    <div class="method-call-section">
                        <div class="method-call-section-title">Arguments</div>
                        ${this.formatMethodArguments(args, kwargs)}
                    </div>
                    <div class="method-call-section">
                        <div class="method-call-section-title">Return Value</div>
                        ${this.formatReturnValue(return_value)}
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * getMethodLayer(methodName) - Determine which MVC layer a method belongs to
     *
     * Identifies whether a method is from Model, Controller, or Utility layer
     * based on naming conventions:
     * - Model methods: ClassName.method_name (e.g., "User.get_all", "Task.create")
     * - Controller methods: method_name or "route_handler" (e.g., "index", "create", "handle_request")
     * - Utility methods: module.function (e.g., "decorators.track_request", "logging.log_call")
     *
     * @param {string} methodName - Full method name to classify
     * @returns {string} 'model', 'controller', or 'utility'
     */
    getMethodLayer(methodName) {
        if (!methodName) return 'utility';

        const lowerName = methodName.toLowerCase();

        // Model: Uppercase first letter indicates class (e.g., "User.get_all", "Task.create")
        if (/^[A-Z][a-zA-Z0-9]*\.[a-z_]+$/.test(methodName)) {
            return 'model';
        }

        // Controller: route handlers, commonly lowercase method names (e.g., "index", "create", "show")
        if (lowerName.includes('route') || lowerName.includes('handler') ||
            lowerName.includes('index') || lowerName.includes('create') ||
            lowerName.includes('update') || lowerName.includes('delete') ||
            lowerName.includes('show') || lowerName.includes('edit')) {
            return 'controller';
        }

        // Utility: everything else (helpers, decorators, logging, etc.)
        return 'utility';
    }

    /**
     * formatMethodArguments(args, kwargs) - Format method arguments and kwargs
     *
     * @param {Array} args - Positional arguments
     * @param {Object} kwargs - Keyword arguments
     * @returns {string} HTML showing formatted arguments
     */
    formatMethodArguments(args, kwargs) {
        let html = '<div class="method-args">';

        if (!args || args.length === 0) {
            if (!kwargs || Object.keys(kwargs).length === 0) {
                html += '<span style="color: #858585;">(none)</span>';
                html += '</div>';
                return html;
            }
        }

        // Format positional arguments
        if (args && args.length > 0) {
            html += '<div style="margin-bottom: 8px;">';
            html += '<span style="color: #858585; font-size: 11px;">Positional:</span>';
            html += '<pre style="margin: 4px 0; background: #1e1e1e; padding: 8px; border-radius: 4px; overflow-x: auto;">';
            args.forEach((arg, i) => {
                html += `<span class="tree-node-number">[${i}]</span> ${this.escapeHtml(JSON.stringify(arg))}\n`;
            });
            html += '</pre></div>';
        }

        // Format keyword arguments
        if (kwargs && Object.keys(kwargs).length > 0) {
            html += '<div>';
            html += '<span style="color: #858585; font-size: 11px;">Keyword:</span>';
            html += '<pre style="margin: 4px 0; background: #1e1e1e; padding: 8px; border-radius: 4px; overflow-x: auto;">';
            Object.entries(kwargs).forEach(([key, value]) => {
                html += `<span class="tree-node-key">${this.escapeHtml(key)}</span><span class="tree-node-value">: ${this.escapeHtml(JSON.stringify(value))}</span>\n`;
            });
            html += '</pre></div>';
        }

        html += '</div>';
        return html;
    }

    /**
     * formatReturnValue(value) - Format method return value
     *
     * @param {*} value - Return value to display
     * @returns {string} HTML showing formatted return value
     */
    formatReturnValue(value) {
        let html = '<div class="method-return">';

        if (value === null || value === undefined) {
            html += `<span style="color: #858585;">${value === null ? 'null' : 'undefined'}</span>`;
        } else {
            html += '<pre style="margin: 0; background: #1e1e1e; padding: 8px; border-radius: 4px; overflow-x: auto;">';
            html += this.escapeHtml(JSON.stringify(value, null, 2));
            html += '</pre>';
        }

        html += '</div>';
        return html;
    }

    /**
     * attachMethodCallListeners() - Attach event handlers for Method Calls tab
     *
     * Handles:
     * - Toggle button clicks to expand/collapse method details
     * - Search box to filter methods by name
     * - Layer and performance filter checkboxes
     */
    attachMethodCallListeners() {
        const list = document.getElementById('method-calls-list');
        const searchInput = document.getElementById('method-calls-search');
        const filterCheckboxes = document.querySelectorAll('.method-calls-filter');

        if (!list) return;

        // Attach toggle listeners to all toggle buttons
        const toggleButtons = list.querySelectorAll('.method-call-toggle');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMethodNode(btn);
            });

            // Keyboard support: Space/Enter to toggle
            btn.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.toggleMethodNode(btn);
                }
            });
        });

        // Search box listener
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterMethodCalls();
            });
        }

        // Filter checkbox listeners
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.filterMethodCalls();
            });
        });
    }

    /**
     * toggleMethodNode(toggleBtn) - Expand/collapse a method call node
     *
     * @param {HTMLElement} toggleBtn - The toggle button element
     */
    toggleMethodNode(toggleBtn) {
        const nodeId = toggleBtn.getAttribute('data-node-id');
        const detailsDiv = document.getElementById(nodeId + '-details');

        if (!detailsDiv) return;

        const isHidden = detailsDiv.classList.contains('hidden');

        if (isHidden) {
            // Expand
            detailsDiv.classList.remove('hidden');
            toggleBtn.classList.remove('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            // Collapse
            detailsDiv.classList.add('hidden');
            toggleBtn.classList.add('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * filterMethodCalls() - Filter method calls based on search and filter options
     *
     * Applies:
     * - Search term (matches method name)
     * - Layer filter (models only, controllers only)
     * - Performance filter (methods > 10ms)
     */
    filterMethodCalls() {
        const list = document.getElementById('method-calls-list');
        const searchInput = document.getElementById('method-calls-search');
        const showModelsOnly = document.getElementById('filter-models-only')?.checked || false;
        const showControllersOnly = document.getElementById('filter-controllers-only')?.checked || false;
        const showSlowOnly = document.getElementById('filter-slow')?.checked || false;

        if (!list || !searchInput) return;

        const searchTerm = searchInput.value.toLowerCase();
        const nodes = list.querySelectorAll('.method-call-node');

        nodes.forEach(node => {
            const methodName = node.getAttribute('data-method') || '';
            const layer = node.getAttribute('data-layer') || '';
            const duration = parseFloat(node.getAttribute('data-duration')) || 0;

            // Check if matches search
            const matchesSearch = searchTerm === '' || methodName.toLowerCase().includes(searchTerm);

            // Check layer filters
            let matchesLayer = true;
            if (showModelsOnly) {
                matchesLayer = layer === 'model';
            } else if (showControllersOnly) {
                matchesLayer = layer === 'controller';
            }

            // Check performance filter
            const matchesPerformance = !showSlowOnly || duration > 10;

            // Show/hide node
            if (matchesSearch && matchesLayer && matchesPerformance) {
                node.style.display = '';
            } else {
                node.style.display = 'none';
            }
        });
    }

    /**
     * renderDatabaseQueries() - Render database queries with timing and analysis
     *
     * MVC Flow:
     * - Reads db_queries from backend (window.__DEBUG__.db_queries)
     * - Shows all SQL queries executed during request
     * - Displays query text, parameters, result count, and execution time
     * - Highlights slow queries (> 50ms)
     * - Detects N+1 problems (duplicate queries)
     * - Students can optimize database access based on this data
     *
     * Features:
     * - Expandable query nodes showing full SQL, parameters, results
     * - Syntax highlighting for SQL keywords
     * - Total queries count and total execution time
     * - Warning for duplicate queries (N+1 problem detection)
     * - Filter to show only slow queries (> 50ms)
     * - Result row count for each query
     *
     * Lesson Reference:
     * - Lesson 4: Understanding and fixing N+1 query problems
     * - Lesson 2: How data flows from Model to Database
     */
    renderDatabaseQueries() {
        const queries = this.debugData.db_queries || [];

        // Check if data is empty
        if (!queries || queries.length === 0) {
            return `
                <div class="db-queries-empty">
                    <p>No SQL queries executed</p>
                    <p style="font-size: 10px; margin-top: 10px; color: #858585;">
                        This request didn't access the database
                    </p>
                </div>
            `;
        }

        // Calculate metrics
        const totalTime = queries.reduce((sum, q) => sum + (q.duration_ms || 0), 0);
        const duplicates = this.detectDuplicateQueries(queries);
        const hasN1Problem = Object.keys(duplicates).some(query => duplicates[query].count > 1);

        // Create header with summary and controls
        let html = `
            <div class="db-queries-header">
                <div class="db-queries-summary">
                    <strong>${queries.length} queries, ${totalTime.toFixed(1)}ms total</strong>
        `;

        // Add N+1 warning if duplicate queries detected
        if (hasN1Problem) {
            html += `
                    <div style="margin-top: 10px; padding: 8px; background: #4a3d2a; border-left: 3px solid #f59e0b; border-radius: 3px;">
                        <span style="color: #f59e0b;">⚠️ Warning: Duplicate queries detected (possible N+1 problem)</span>
                    </div>
            `;
        }

        html += `
                </div>
                <div class="db-queries-controls">
                    <label style="display: inline-flex; align-items: center;">
                        <input
                            type="checkbox"
                            id="filter-slow-queries"
                            class="db-queries-filter"
                            data-filter="slow"
                            aria-label="Show only slow queries"
                        />
                        <span style="margin-left: 5px; font-size: 12px;">Show only slow queries (&gt;50ms)</span>
                    </label>
                </div>
            </div>
            <div class="db-queries-list" id="db-queries-list">
        `;

        // Render each query
        queries.forEach((query, index) => {
            html += this.createQueryNode(query, index, duplicates);
        });

        html += '</div>';
        return html;
    }

    /**
     * createQueryNode(query, index, duplicates) - Create expandable node for a single SQL query
     *
     * Shows:
     * - SQL query text with syntax highlighting
     * - Execution duration in milliseconds
     * - Number of rows affected/returned
     * - Warning badge if > 50ms (slow)
     * - Warning badge if query is duplicated (N+1 problem)
     * - Click to expand → full formatted SQL, parameters, result details
     *
     * @param {Object} query - Query object {query, params, result_row_count, duration_ms}
     * @param {number} index - Index of this query in the list
     * @param {Object} duplicates - Object mapping queries to count info {query: {count, indices}}
     * @returns {string} HTML for this query node
     */
    createQueryNode(query, index, duplicates) {
        const { query: queryText, params = [], result_row_count = 0, duration_ms = 0 } = query;
        const nodeId = `db-query-${index}`;

        // Determine if this query is slow (>50ms)
        const isSlow = duration_ms > 50;

        // Determine if this query is a duplicate (N+1 problem)
        const isDuplicate = duplicates[queryText] && duplicates[queryText].count > 1;

        // Create short preview of query (first 80 chars)
        const shortQuery = queryText.length > 80 ? queryText.substring(0, 80) + '...' : queryText;

        let html = `
            <div class="db-query-node" data-duration="${duration_ms}" data-duplicate="${isDuplicate}">
                <button
                    class="db-query-toggle collapsed"
                    data-node-id="${nodeId}"
                    tabindex="0"
                    aria-expanded="false"
                    aria-controls="${nodeId}-details"
                >
                    ▶
                </button>
                <div class="db-query-header">
                    <span class="db-query-preview">${this.highlightSQL(shortQuery, true)}</span>
                    <div class="db-query-badges">
        `;

        // Add slow query badge
        if (isSlow) {
            html += `<span class="db-query-badge-slow">[SLOW]</span>`;
        }

        // Add duplicate query badge
        if (isDuplicate) {
            html += `<span class="db-query-badge-duplicate">[DUP x${duplicates[queryText].count}]</span>`;
        }

        // Add duration and result count
        html += `
                        <span class="db-query-duration">${duration_ms.toFixed(1)}ms</span>
                        <span class="db-query-result-count">${result_row_count} rows</span>
                    </div>
                </div>
                <div
                    id="${nodeId}-details"
                    class="db-query-details hidden"
                    role="region"
                    aria-labelledby="${nodeId}"
                >
                    <div class="db-query-section">
                        <div class="db-query-section-title">Query</div>
                        <pre class="db-query-sql">${this.highlightSQL(queryText, false)}</pre>
                    </div>
        `;

        // Show parameters if any
        if (params && params.length > 0) {
            html += `
                    <div class="db-query-section">
                        <div class="db-query-section-title">Parameters</div>
                        <pre style="margin: 0; background: #1e1e1e; padding: 8px; border-radius: 4px; overflow-x: auto;">
            `;
            params.forEach((param, i) => {
                html += `<span class="tree-node-number">[${i}]</span> ${this.escapeHtml(JSON.stringify(param))}\n`;
            });
            html += `</pre>
                    </div>
            `;
        }

        // Show result metadata
        html += `
                    <div class="db-query-section">
                        <div class="db-query-section-title">Result</div>
                        <div style="padding: 8px; background: #1e1e1e; border-radius: 4px;">
                            <span style="color: #858585;">Rows affected/returned:</span>
                            <span class="tree-node-number">${result_row_count}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * detectDuplicateQueries(queries) - Identify duplicate queries (N+1 detection)
     *
     * Returns an object mapping query text to count and indices of duplicates.
     * Used to highlight queries that appear multiple times in the same request.
     *
     * Example:
     * {
     *   'SELECT * FROM users WHERE id = ?': { count: 5, indices: [0, 3, 5, 7, 8] },
     *   'SELECT * FROM tasks WHERE owner_id = ?': { count: 3, indices: [2, 4, 6] }
     * }
     *
     * @param {Array} queries - Array of query objects
     * @returns {Object} Mapping of query text to duplicate info
     */
    detectDuplicateQueries(queries) {
        const duplicates = {};

        queries.forEach((q, index) => {
            const queryText = q.query || '';

            if (!duplicates[queryText]) {
                duplicates[queryText] = { count: 0, indices: [] };
            }

            duplicates[queryText].count++;
            duplicates[queryText].indices.push(index);
        });

        return duplicates;
    }

    /**
     * highlightSQL(sql, shortForm) - Apply syntax highlighting to SQL
     *
     * Highlights:
     * - Keywords: SELECT, FROM, WHERE, JOIN, etc. (blue, bold)
     * - Table/column names: (white)
     * - Values: (orange)
     *
     * @param {string} sql - SQL query text
     * @param {boolean} shortForm - If true, don't add newlines (for preview)
     * @returns {string} HTML string with syntax highlighting
     */
    highlightSQL(sql, shortForm = false) {
        if (!sql) return '';

        let highlighted = this.escapeHtml(sql);

        // SQL keywords to highlight (case-insensitive)
        const keywords = [
            'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
            'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'ORDER', 'BY', 'GROUP',
            'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
            'SET', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'PRIMARY', 'KEY',
            'AS', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
        ];

        // Highlight keywords
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<span class="sql-keyword">${keyword.toUpperCase()}</span>`);
        });

        // Highlight string values (quoted text)
        highlighted = highlighted.replace(/'([^']*)'/g, `<span class="sql-value">'$1'</span>`);

        // Highlight parameter placeholders
        highlighted = highlighted.replace(/\?/g, `<span class="sql-param">?</span>`);

        // Format with line breaks (unless short form)
        if (!shortForm) {
            highlighted = highlighted.replace(/SELECT/gi, '\nSELECT')
                                    .replace(/FROM/gi, '\nFROM')
                                    .replace(/WHERE/gi, '\nWHERE')
                                    .replace(/JOIN/gi, '\nJOIN')
                                    .replace(/LEFT/gi, '\nLEFT')
                                    .replace(/AND/gi, '\nAND')
                                    .replace(/OR/gi, '\nOR')
                                    .trim();
        }

        return highlighted;
    }

    /**
     * attachDatabaseQueryListeners() - Attach event handlers for Database Query tab
     *
     * Handles:
     * - Toggle button clicks to expand/collapse query details
     * - Slow query filter checkbox
     */
    attachDatabaseQueryListeners() {
        const list = document.getElementById('db-queries-list');
        const filterCheckbox = document.getElementById('filter-slow-queries');

        if (!list) return;

        // Attach toggle listeners to all toggle buttons
        const toggleButtons = list.querySelectorAll('.db-query-toggle');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleQueryNode(btn);
            });

            // Keyboard support: Space/Enter to toggle
            btn.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.toggleQueryNode(btn);
                }
            });
        });

        // Filter checkbox listener
        if (filterCheckbox) {
            filterCheckbox.addEventListener('change', () => {
                this.filterDatabaseQueries();
            });
        }
    }

    /**
     * toggleQueryNode(toggleBtn) - Expand/collapse a database query node
     *
     * @param {HTMLElement} toggleBtn - The toggle button element
     */
    toggleQueryNode(toggleBtn) {
        const nodeId = toggleBtn.getAttribute('data-node-id');
        const detailsDiv = document.getElementById(nodeId + '-details');

        if (!detailsDiv) return;

        const isHidden = detailsDiv.classList.contains('hidden');

        if (isHidden) {
            // Expand
            detailsDiv.classList.remove('hidden');
            toggleBtn.classList.remove('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            // Collapse
            detailsDiv.classList.add('hidden');
            toggleBtn.classList.add('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * filterDatabaseQueries() - Filter database queries based on slow query filter
     *
     * Shows only queries with duration > 50ms when filter is enabled
     */
    filterDatabaseQueries() {
        const list = document.getElementById('db-queries-list');
        const showSlowOnly = document.getElementById('filter-slow-queries')?.checked || false;

        if (!list) return;

        const nodes = list.querySelectorAll('.db-query-node');

        nodes.forEach(node => {
            const duration = parseFloat(node.getAttribute('data-duration')) || 0;

            // Show/hide based on filter
            if (!showSlowOnly || duration > 50) {
                node.style.display = '';
            } else {
                node.style.display = 'none';
            }
        });
    }

    /**
     * attachNetworkInspectorListeners() - Attach event handlers for Network Inspector
     *
     * Handles:
     * - Collapsible button clicks to expand/collapse header sections
     * - Toggle between showing and hiding headers
     */
    attachNetworkInspectorListeners() {
        const collapsibleBtns = document.querySelectorAll('.network-collapsible-btn');

        collapsibleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleNetworkSection(btn);
            });

            // Keyboard support: Space/Enter to toggle
            btn.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.toggleNetworkSection(btn);
                }
            });
        });
    }

    /**
     * toggleNetworkSection(btn) - Expand/collapse a network inspector section
     *
     * @param {HTMLElement} btn - The collapsible button element
     */
    toggleNetworkSection(btn) {
        const sectionId = btn.getAttribute('data-section');
        const contentDiv = document.getElementById(sectionId);

        if (!contentDiv) return;

        const isHidden = contentDiv.classList.contains('hidden');

        if (isHidden) {
            // Expand
            contentDiv.classList.remove('hidden');
            btn.classList.remove('collapsed');
            btn.setAttribute('aria-expanded', 'true');
        } else {
            // Collapse
            contentDiv.classList.add('hidden');
            btn.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * renderNetworkInspector() - Display HTTP request/response details
     *
     * MVC Flow:
     * - Shows complete request cycle from client to server
     * - Displays what was sent to server (method, URL, headers)
     * - Shows what came back (status, headers, controller handling)
     * - Helps students understand HTTP protocol and request/response cycle
     *
     * Features:
     * - Request section: method, URL, headers, body, timestamp
     * - Response section: status code (color-coded), headers, content-type, size, duration
     * - Collapsible header sections (often verbose)
     * - Shows which controller handled the request
     * - Timing information
     *
     * Lesson Reference:
     * - Lesson 5: Understanding Controllers and how they handle requests
     * - Lesson 2: Understanding how data flows from request to response
     */
    renderNetworkInspector() {
        // Get request info from debug data
        const request_info = this.debugData.request_info;
        const timing = this.debugData.timing || {};

        // If no request info, show empty state
        if (!request_info) {
            return `
                <div class="network-inspector-empty">
                    <p>No request information available</p>
                    <p style="font-size: 10px; margin-top: 10px; color: #858585;">
                        Backend is not yet tracking HTTP request details
                    </p>
                </div>
            `;
        }

        const { method = 'GET', url = '/', headers = {}, body = null, status = 200, controller = 'Unknown', content_type = 'text/html' } = request_info;

        // Calculate request duration from timing data
        const duration = timing.request_start && timing.request_end
            ? ((timing.request_end - timing.request_start) * 1000).toFixed(1)
            : 'N/A';

        // Determine status code color
        let statusColor = '#4ec9b0';
        if (status >= 500) {
            statusColor = '#f48771';
        } else if (status >= 400) {
            statusColor = '#ce9178';
        } else if (status >= 300) {
            statusColor = '#c8ae9d';
        } else if (status >= 200) {
            statusColor = '#4ec9b0';
        }

        // Count headers
        const headerCount = Object.keys(headers).length;

        let html = `
            <div class="network-inspector">
                <div class="network-section">
                    <div class="network-section-title">REQUEST</div>
                    <div class="network-request-line">
                        <span class="network-method">${this.escapeHtml(method)}</span>
                        <span class="network-url">${this.escapeHtml(url)}</span>
                    </div>

                    <div class="network-collapsible-section">
                        <button class="network-collapsible-btn collapsed" data-section="request-headers">
                            ▼ Request Headers <span class="network-count">{${headerCount}}</span>
                        </button>
                        <div class="network-collapsible-content hidden" id="request-headers">
        `;

        // Render request headers
        Object.entries(headers).forEach(([key, value]) => {
            html += `<div class="network-header-line"><span class="network-header-key">${this.escapeHtml(key)}:</span> <span class="network-header-value">${this.escapeHtml(String(value))}</span></div>`;
        });

        html += `
                        </div>
                    </div>
        `;

        // Show request body if POST
        if (body && method === 'POST') {
            html += `
                    <div class="network-collapsible-section">
                        <button class="network-collapsible-btn collapsed" data-section="request-body">
                            ▼ Request Body
                        </button>
                        <div class="network-collapsible-content hidden" id="request-body">
                            <pre class="network-body">${this.escapeHtml(JSON.stringify(body, null, 2))}</pre>
                        </div>
                    </div>
            `;
        }

        html += `
                </div>

                <div class="network-section">
                    <div class="network-section-title">RESPONSE</div>
                    <div class="network-status-line" style="border-left: 3px solid ${statusColor};">
                        <span class="network-status" style="color: ${statusColor};">Status: ${status}</span>
                        <span class="network-status-badge" style="background-color: ${statusColor}; opacity: 0.2; padding: 2px 6px; border-radius: 3px; font-size: 11px;">
        `;

        if (status >= 500) {
            html += 'ERROR';
        } else if (status >= 400) {
            html += 'CLIENT ERROR';
        } else if (status >= 300) {
            html += 'REDIRECT';
        } else {
            html += '✓ OK';
        }

        html += `
                        </span>
                    </div>

                    <div class="network-metadata">
                        <div class="network-metadata-item">
                            <span class="network-label">Controller:</span>
                            <span class="network-value">${this.escapeHtml(controller)}</span>
                        </div>
                        <div class="network-metadata-item">
                            <span class="network-label">Content-Type:</span>
                            <span class="network-value">${this.escapeHtml(content_type)}</span>
                        </div>
                        <div class="network-metadata-item">
                            <span class="network-label">Duration:</span>
                            <span class="network-value">${duration} ms</span>
                        </div>
                    </div>

                    <div class="network-collapsible-section">
                        <button class="network-collapsible-btn collapsed" data-section="response-headers">
                            ▼ Response Headers <span class="network-count">{${headerCount}}</span>
                        </button>
                        <div class="network-collapsible-content hidden" id="response-headers">
        `;

        // Render response headers (same as request for now, in reality would be different)
        Object.entries(headers).forEach(([key, value]) => {
            html += `<div class="network-header-line"><span class="network-header-key">${this.escapeHtml(key)}:</span> <span class="network-header-value">${this.escapeHtml(String(value))}</span></div>`;
        });

        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;

        return html;
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
