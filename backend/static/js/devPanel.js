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

        // Request history tracking
        this.requestHistory = [];
        this.currentRequestId = null;
        this.viewingHistoryMode = false;
        this.MAX_HISTORY_SIZE = 20;

        // Resize state
        this.isResizing = false;
        this.resizeStartX = 0;
        this.resizeStartY = 0;
        this.resizeStartWidth = 0;
        this.resizeStartHeight = 0;

        // Bind resize methods so event listeners can be properly removed
        this.boundHandleResize = (e) => this.handleResize(e);
        this.boundStopResize = () => this.stopResize();

        // Initialize request history from sessionStorage
        this.loadHistoryFromStorage();
    }

    /**
     * init() - Initialize panel and attach to DOM
     *
     * MVC Flow:
     * 1. Create panel HTML structure (View)
     * 2. Insert into document
     * 3. Attach event listeners (Controller)
     * 4. Load debug data from window.__DEBUG__
     * 5. Listen for lesson changes for guided learning
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

        // Listen for lesson step changes to show relevant hints
        this.listenToLessonChanges();

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

        // Create request selector
        const requestSelector = document.createElement('div');
        requestSelector.id = 'request-selector-dropdown';
        requestSelector.className = 'request-selector-dropdown';

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

        // Create resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'dev-panel-resize-handle';
        resizeHandle.title = 'Drag to resize panel';
        resizeHandle.setAttribute('aria-label', 'Resize panel handle');

        // Assemble panel
        this.panelElement.appendChild(header);
        this.panelElement.appendChild(requestSelector);
        this.panelElement.appendChild(tabsBar);
        this.panelElement.appendChild(contentArea);
        this.panelElement.appendChild(resizeHandle);

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

        // Resize handle listeners
        const resizeHandle = this.panelElement.querySelector('.dev-panel-resize-handle');
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
        }

        // Keyboard shortcut: Alt+D to toggle panel
        document.addEventListener('keydown', (e) => {
            // Alt+D: Toggle developer panel
            if (e.altKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                this.toggle();
            }
            // Escape: Close developer panel if open
            if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
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

            // Save current request to history
            this.saveRequestToHistory();

            // Update request selector UI
            this.updateRequestSelector();

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

                // Attach listeners for Flow Diagram tab
                if (this.currentTab === 'flow') {
                    this.attachFlowDiagramListeners();
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

        if (tabName === 'flow') {
            return this.renderFlowDiagram();
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
        const totalTime = calls.reduce((sum, call) => sum + (call.duration_ms || 0), 0);

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
        const { method_name: method, args = [], kwargs = {}, return_value, duration_ms: duration = 0 } = call;
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
     * renderFlowDiagram() - Animated visual representation of MVC request flow
     *
     * MVC Flow:
     * - Shows visual diagram of request traveling through MVC layers
     * - Browser → Controller → Model → Database → Model → Controller → View → Browser
     * - Each phase highlighted with timing information
     * - Animated flow that plays sequentially through each phase
     * - Interactive controls for loop, speed adjustment
     *
     * Features:
     * - SVG diagram with boxes for each layer
     * - Animated arrows showing data flow
     * - Timing breakdown for each phase
     * - Play/pause/reset animation controls
     * - Speed control (1x, 2x, 5x)
     * - Loop animation option
     * - Phase highlighting as animation progresses
     *
     * Lesson Reference:
     * - Lesson 1: Understanding MVC pattern visually
     * - Lesson 2: Seeing data flow through all MVC layers
     */
    renderFlowDiagram() {
        const timing = this.debugData.timing || {};
        const method_calls = this.debugData.method_calls || [];
        const db_queries = this.debugData.db_queries || [];

        // Calculate timing for each phase
        const phases = this.calculateFlowPhases(timing, method_calls, db_queries);
        const totalTime = phases.reduce((sum, p) => sum + p.duration, 0);

        // Create header with timing summary
        let html = `
            <div class="flow-diagram-container">
                <div class="flow-diagram-header">
                    <h3 style="margin: 0 0 10px 0; color: #4ec9b0;">MVC Request Flow</h3>
                    <div class="flow-timing-summary">
                        <div style="color: #d4d4d4; margin-bottom: 8px;">
                            <strong>Total Request: ${totalTime.toFixed(1)}ms</strong>
                        </div>
                        <div class="flow-phase-breakdown">
        `;

        // Show timing for each phase
        let phaseNumber = 1;
        phases.forEach((phase, index) => {
            html += `
                            <div class="flow-phase-timing" style="font-size: 11px; line-height: 1.8;">
                                <span style="color: #858585;">${phaseNumber}.</span>
                                <span style="color: #9cdcfe;">${phase.name}</span>
                                <span style="color: #b5cea8;">${phase.duration.toFixed(1)}ms</span>
                            </div>
            `;
            phaseNumber++;
        });

        html += `
                        </div>
                    </div>
                </div>

                <div class="flow-diagram-controls">
                    <button class="flow-control-btn" id="flow-play-btn" title="Play animation">▶ Play</button>
                    <button class="flow-control-btn" id="flow-pause-btn" title="Pause animation">⏸ Pause</button>
                    <button class="flow-control-btn" id="flow-reset-btn" title="Reset animation">↻ Reset</button>

                    <div class="flow-control-separator"></div>

                    <select id="flow-speed-select" class="flow-control-select" title="Animation speed">
                        <option value="1">Speed: 1x</option>
                        <option value="2">Speed: 2x</option>
                        <option value="5">Speed: 5x</option>
                    </select>

                    <label style="display: inline-flex; align-items: center; margin-left: 10px; font-size: 11px; color: #d4d4d4;">
                        <input type="checkbox" id="flow-loop-checkbox" />
                        <span style="margin-left: 5px;">Loop</span>
                    </label>
                </div>

                <div class="flow-diagram-svg-container" id="flow-diagram-container">
                    ${this.createFlowDiagramSVG(phases)}
                </div>
            </div>
        `;

        return html;
    }

    /**
     * calculateFlowPhases(timing, method_calls, db_queries) - Break down request into phases
     *
     * Identifies timing for each MVC phase:
     * 1. Request received by browser
     * 2. Controller processing
     * 3. Model methods
     * 4. Database queries
     * 5. View rendering
     * 6. Response sent
     *
     * @param {Object} timing - Timing object from debug data
     * @param {Array} method_calls - Method call array
     * @param {Array} db_queries - Database query array
     * @returns {Array} Array of phase objects with name and duration
     */
    calculateFlowPhases(timing, method_calls, db_queries) {
        // Default phase breakdown
        const phases = [
            { name: 'Request → Controller', duration: 0.5 },
            { name: 'Controller Processing', duration: 0 },
            { name: 'Model Methods', duration: 0 },
            { name: 'Database Queries', duration: 0 },
            { name: 'View Rendering', duration: 0 },
            { name: 'Response → Browser', duration: 0.5 }
        ];

        // Calculate controller duration from method calls
        const controllerCalls = method_calls.filter(c => this.getMethodLayer(c.method) === 'controller');
        const controllerDuration = controllerCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
        if (controllerDuration > 0) phases[1].duration = controllerDuration;

        // Calculate model duration
        const modelCalls = method_calls.filter(c => this.getMethodLayer(c.method) === 'model');
        const modelDuration = modelCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
        if (modelDuration > 0) phases[2].duration = modelDuration;

        // Calculate database duration
        const dbDuration = db_queries.reduce((sum, q) => sum + (q.duration_ms || 0), 0);
        if (dbDuration > 0) phases[3].duration = dbDuration;

        // View rendering - use remaining time or estimate
        // If we have accurate timing, use it; otherwise estimate
        if (timing.request_start && timing.request_end) {
            const totalDuration = (timing.request_end - timing.request_start) * 1000;
            const measuredDuration = controllerDuration + modelDuration + dbDuration;
            phases[4].duration = Math.max(0, totalDuration - measuredDuration - 1);
        } else {
            phases[4].duration = 10; // Default estimate
        }

        return phases;
    }

    /**
     * createFlowDiagramSVG(phases) - Create SVG visualization of MVC flow
     *
     * Draws:
     * - Boxes for each layer (Browser, Controller, Model, Database, View)
     * - Arrows showing flow direction
     * - Animated dashed lines to show current flow
     * - Color coding for each layer
     *
     * @param {Array} phases - Array of phase objects with name and duration
     * @returns {string} SVG HTML string
     */
    createFlowDiagramSVG(phases) {
        const boxWidth = 70;
        const boxHeight = 50;
        const boxSpacing = 95; // Space between box centers
        const startX = 15;
        const startY = 30;

        // Define the flow layers and their properties
        const layers = [
            { label: '🌐\nBrowser', color: '#7fb3d5', phaseIndex: 0 },
            { label: '⚙️\nController', color: '#4ec9b0', phaseIndex: 1 },
            { label: '📊\nModel', color: '#569cd6', phaseIndex: 2 },
            { label: '🗄️\nDatabase', color: '#d19a66', phaseIndex: 3 },
            { label: '📊\nModel', color: '#569cd6', phaseIndex: -1 },  // Return phase
            { label: '⚙️\nController', color: '#4ec9b0', phaseIndex: -1 },  // Return phase
            { label: '👁️\nView', color: '#ce9178', phaseIndex: 4 },
            { label: '🌐\nBrowser', color: '#7fb3d5', phaseIndex: 5 }
        ];

        let svg = `<svg class="flow-diagram-svg" viewBox="0 0 960 120" preserveAspectRatio="xMidYMid meet">`;

        // Draw boxes and arrows
        let xPos = startX;
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const isDatabase = i === 3;

            // Draw box
            svg += `
                <g class="flow-layer flow-layer-${i}" data-phase="${layer.phaseIndex}">
                    <rect class="flow-box" x="${xPos}" y="${startY}" width="${boxWidth}" height="${boxHeight}"
                          fill="${layer.color}" opacity="0.2" stroke="${layer.color}" stroke-width="2" rx="4"/>
                    <text class="flow-label" x="${xPos + boxWidth/2}" y="${startY + boxHeight/2 + 6}"
                          text-anchor="middle" font-size="11" fill="${layer.color}">${layer.label}</text>
                </g>
            `;

            // Draw arrow to next layer (except for last layer)
            if (i < layers.length - 1) {
                const nextX = xPos + boxSpacing;
                svg += `
                    <line class="flow-arrow flow-arrow-${i}" x1="${xPos + boxWidth}" y1="${startY + boxHeight/2}"
                          x2="${nextX}" y2="${startY + boxHeight/2}" stroke="currentColor" stroke-width="2"
                          fill="none" marker-end="url(#arrowhead)"/>
                    <text class="flow-arrow-label" x="${(xPos + boxWidth + nextX) / 2}" y="${startY + boxHeight/2 - 8}"
                          text-anchor="middle" font-size="9" fill="#858585">${phases[layer.phaseIndex]?.duration.toFixed(1) || '0'}ms</text>
                `;
            }

            xPos += boxSpacing;
        }

        // Arrow marker definition
        svg += `
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#858585" />
                </marker>
            </defs>
        </svg>`;

        return svg;
    }

    /**
     * attachFlowDiagramListeners() - Attach event handlers for Flow Diagram animation
     *
     * Handles:
     * - Play/pause/reset animation buttons
     * - Speed selection dropdown
     * - Loop checkbox
     */
    attachFlowDiagramListeners() {
        const playBtn = document.getElementById('flow-play-btn');
        const pauseBtn = document.getElementById('flow-pause-btn');
        const resetBtn = document.getElementById('flow-reset-btn');
        const speedSelect = document.getElementById('flow-speed-select');
        const loopCheckbox = document.getElementById('flow-loop-checkbox');
        const container = document.getElementById('flow-diagram-container');

        if (!container) return;

        // Store animation state
        if (!this.flowAnimation) {
            this.flowAnimation = {
                isPlaying: false,
                currentPhase: -1,
                speed: 1,
                loop: false,
                animationId: null
            };
        }

        // Play button
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.flowAnimation.isPlaying = true;
                playBtn.style.opacity = '0.5';
                pauseBtn.style.opacity = '1';
                this.playFlowAnimation();
            });
        }

        // Pause button
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.flowAnimation.isPlaying = false;
                playBtn.style.opacity = '1';
                pauseBtn.style.opacity = '0.5';
                if (this.flowAnimation.animationId) {
                    cancelAnimationFrame(this.flowAnimation.animationId);
                }
            });
        }

        // Reset button
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.flowAnimation.currentPhase = -1;
                this.flowAnimation.isPlaying = false;
                playBtn.style.opacity = '1';
                pauseBtn.style.opacity = '0.5';

                // Reset all layers
                const layers = container.querySelectorAll('.flow-layer');
                layers.forEach(layer => {
                    layer.classList.remove('active', 'completed');
                });

                if (this.flowAnimation.animationId) {
                    cancelAnimationFrame(this.flowAnimation.animationId);
                }
            });
        }

        // Speed select
        if (speedSelect) {
            speedSelect.addEventListener('change', (e) => {
                this.flowAnimation.speed = parseFloat(e.target.value);
            });
        }

        // Loop checkbox
        if (loopCheckbox) {
            loopCheckbox.addEventListener('change', (e) => {
                this.flowAnimation.loop = e.target.checked;
            });
        }

        // Auto-play when tab opens
        this.playFlowAnimation();
    }

    /**
     * playFlowAnimation() - Execute flow animation sequence
     *
     * Animates through each phase, highlighting layers sequentially
     * with timing delays. Respects speed setting and loop option.
     */
    playFlowAnimation() {
        if (!this.flowAnimation) return;

        const container = document.getElementById('flow-diagram-container');
        if (!container) return;

        const layers = container.querySelectorAll('.flow-layer');
        const phaseSequence = [0, 1, 2, 3, 4, 5, 6, 7]; // Layer indices to animate through
        let sequenceIndex = 0;

        const animateNextPhase = () => {
            if (!this.flowAnimation.isPlaying) return;

            // Remove previous highlighting
            layers.forEach((layer, index) => {
                if (index === phaseSequence[sequenceIndex - 1]) {
                    layer.classList.remove('active');
                    layer.classList.add('completed');
                }
            });

            // Highlight current layer
            if (sequenceIndex < phaseSequence.length) {
                const currentLayerIndex = phaseSequence[sequenceIndex];
                if (layers[currentLayerIndex]) {
                    layers[currentLayerIndex].classList.add('active');
                }

                sequenceIndex++;

                // Calculate delay based on phase timing (from timing summary)
                // Use a base delay and multiply by speed factor
                let delay = 400; // Base delay in ms
                delay = Math.max(100, delay / this.flowAnimation.speed);

                this.flowAnimation.animationId = setTimeout(animateNextPhase, delay);
            } else {
                // Animation sequence complete
                if (this.flowAnimation.loop) {
                    // Reset and restart
                    layers.forEach(layer => layer.classList.remove('active', 'completed'));
                    sequenceIndex = 0;
                    this.flowAnimation.animationId = setTimeout(animateNextPhase, 500);
                } else {
                    // Stop animation
                    this.flowAnimation.isPlaying = false;
                    const playBtn = document.getElementById('flow-play-btn');
                    const pauseBtn = document.getElementById('flow-pause-btn');
                    if (playBtn) playBtn.style.opacity = '1';
                    if (pauseBtn) pauseBtn.style.opacity = '0.5';
                }
            }
        };

        if (this.flowAnimation.isPlaying) {
            animateNextPhase();
        }
    }

    /**
     * restoreState() - Restore panel state from localStorage
     *
     * Remembers:
     * - Whether panel was open/closed
     * - Which tab was active
     * - Panel dimensions (width and height)
     */
    restoreState() {
        const wasOpen = localStorage.getItem('devPanel-open') === 'true';
        const lastTab = localStorage.getItem('devPanel-tab') || 'state';

        if (wasOpen) {
            this.open();
        }

        this.switchTab(lastTab);
        this.restoreSize();
    }

    /**
     * loadHistoryFromStorage() - Load request history from sessionStorage
     *
     * Called during constructor to restore history from previous requests
     * in the same session. History is cleared when tab closes.
     */
    loadHistoryFromStorage() {
        try {
            const stored = sessionStorage.getItem('devPanel-requestHistory');
            if (stored) {
                this.requestHistory = JSON.parse(stored);
                console.log('[DevPanel] Request history loaded from storage:', this.requestHistory.length, 'requests');
            }
        } catch (err) {
            console.warn('[DevPanel] Failed to load request history from storage:', err);
            this.requestHistory = [];
        }
    }

    /**
     * saveHistoryToStorage() - Save request history to sessionStorage
     *
     * Persists request history so it survives page reloads within same session.
     * Cleared automatically when tab is closed.
     */
    saveHistoryToStorage() {
        try {
            sessionStorage.setItem('devPanel-requestHistory', JSON.stringify(this.requestHistory));
        } catch (err) {
            console.warn('[DevPanel] Failed to save request history to storage:', err);
        }
    }

    /**
     * saveRequestToHistory() - Save current request to history
     *
     * Called when new __DEBUG__ data is loaded.
     * Stores:
     * - Request ID
     * - HTTP method
     * - URL
     * - Timestamp
     * - Full debug data
     * - Summary info (method call count, query count, etc.)
     *
     * Limits history to MAX_HISTORY_SIZE (20) items, removing oldest first.
     */
    saveRequestToHistory() {
        if (!this.debugData || !this.debugData.request_info) {
            return;
        }

        const requestInfo = this.debugData.request_info;
        const requestId = requestInfo.request_id || this.debugData.request_id;

        if (!requestId) {
            console.warn('[DevPanel] No request_id found in debug data, skipping history save');
            return;
        }

        // Don't save duplicate request IDs (same request)
        if (this.currentRequestId === requestId) {
            return;
        }

        this.currentRequestId = requestId;

        // Create history entry
        const historyEntry = {
            request_id: requestId,
            method: requestInfo.method || 'GET',
            url: requestInfo.url || '/',
            timestamp: requestInfo.timestamp || Date.now() / 1000,
            debugData: JSON.parse(JSON.stringify(this.debugData)), // Deep copy
            summary: {
                methodCallCount: (this.debugData.method_calls || []).length,
                queryCount: (this.debugData.db_queries || []).length,
                status: requestInfo.status || 200,
                duration_ms: (this.debugData.timing?.request_end - this.debugData.timing?.request_start) * 1000 || 0
            }
        };

        // Add to history (at beginning, most recent first)
        this.requestHistory.unshift(historyEntry);

        // Trim to MAX_HISTORY_SIZE
        if (this.requestHistory.length > this.MAX_HISTORY_SIZE) {
            this.requestHistory = this.requestHistory.slice(0, this.MAX_HISTORY_SIZE);
        }

        // Save to storage
        this.saveHistoryToStorage();

        // Set viewing mode to current
        this.viewingHistoryMode = false;

        console.log('[DevPanel] Request saved to history. History size:', this.requestHistory.length);
    }

    /**
     * selectRequest(requestId) - Load and display a historical request
     *
     * When user clicks a previous request in the selector, this loads that
     * request's debug data and updates all tabs to show historical data.
     * Shows "Viewing request from X ago" indicator.
     *
     * @param {string} requestId - The request_id to load
     */
    selectRequest(requestId) {
        // Find the request in history
        const historyEntry = this.requestHistory.find(r => r.request_id === requestId);
        if (!historyEntry) {
            console.warn('[DevPanel] Request not found in history:', requestId);
            return;
        }

        // Load the historical debug data
        this.debugData = historyEntry.debugData;
        this.viewingHistoryMode = true;
        this.currentRequestId = requestId;

        // Update all UI elements
        this.updateRequestSelector();
        this.updateCurrentTab();

        console.log('[DevPanel] Loaded historical request:', requestId);
    }

    /**
     * updateRequestSelector() - Render and update the request selector dropdown
     *
     * Displays:
     * - Current request indicator
     * - List of recent requests (up to 20)
     * - Each with method, url, timestamp, and summary info
     * - Color-coded by HTTP method
     * - Clear history button
     */
    updateRequestSelector() {
        const selectorContainer = document.getElementById('request-selector-dropdown');
        if (!selectorContainer) return;

        let html = '';

        // Header showing current status
        const currentReq = this.requestHistory[0];
        if (currentReq) {
            const timeAgo = this.getTimeAgoString(currentReq.timestamp);
            if (this.viewingHistoryMode) {
                html += `<div class="request-selector-status">📋 Viewing history (${timeAgo})</div>`;
            } else {
                html += `<div class="request-selector-status">● Current: ${currentReq.method} ${currentReq.url}</div>`;
            }
        }

        // List of requests
        html += '<div class="request-list">';

        if (this.requestHistory.length === 0) {
            html += '<div class="request-list-empty">No requests recorded</div>';
        } else {
            this.requestHistory.forEach((req, index) => {
                const isCurrentRequest = index === 0 && !this.viewingHistoryMode;
                const isSelected = req.request_id === this.currentRequestId;
                const methodColor = this.getMethodColor(req.method);
                const timeAgo = this.getTimeAgoString(req.timestamp);

                html += `
                    <button
                        class="request-item ${isSelected ? 'selected' : ''} ${isCurrentRequest ? 'current' : ''}"
                        data-request-id="${req.request_id}"
                        title="Click to view request details"
                    >
                        <span class="request-method" style="color: ${methodColor};">${req.method}</span>
                        <span class="request-url">${req.url}</span>
                        <span class="request-time">${timeAgo}</span>
                        <span class="request-summary">
                            ${req.summary.methodCallCount} calls • ${req.summary.queryCount} queries • ${req.summary.duration_ms.toFixed(0)}ms
                        </span>
                    </button>
                `;
            });
        }

        html += '</div>';

        // Clear history button
        if (this.requestHistory.length > 0) {
            html += `
                <div class="request-selector-footer">
                    <button class="request-clear-btn" id="request-clear-history-btn">
                        🗑️ Clear History
                    </button>
                </div>
            `;
        }

        selectorContainer.innerHTML = html;

        // Attach event listeners
        requestAnimationFrame(() => {
            this.attachRequestSelectorListeners();
        });
    }

    /**
     * attachRequestSelectorListeners() - Attach event handlers to request selector
     */
    attachRequestSelectorListeners() {
        // Request item click handlers
        const requestItems = document.querySelectorAll('.request-item');
        requestItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const requestId = item.getAttribute('data-request-id');
                this.selectRequest(requestId);
            });
        });

        // Clear history button
        const clearBtn = document.getElementById('request-clear-history-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Clear all request history? This cannot be undone.')) {
                    this.clearRequestHistory();
                }
            });
        }
    }

    /**
     * clearRequestHistory() - Clear all request history
     *
     * Called when user clicks "Clear History" button with confirmation.
     * Resets to current request after clearing.
     */
    clearRequestHistory() {
        this.requestHistory = [];
        this.viewingHistoryMode = false;
        this.currentRequestId = null;

        // Save empty history
        this.saveHistoryToStorage();

        // Update UI
        this.updateRequestSelector();
        this.updateCurrentTab();

        console.log('[DevPanel] Request history cleared');
    }

    /**
     * getMethodColor(method) - Get color for HTTP method badge
     *
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
     * @returns {string} Hex color code
     */
    getMethodColor(method) {
        const colors = {
            'GET': '#4ec9b0',      // Teal
            'POST': '#86c06c',     // Green
            'PUT': '#d19a66',      // Orange
            'DELETE': '#f48771',   // Red
            'PATCH': '#9cdcfe',    // Blue
            'HEAD': '#858585',     // Gray
            'OPTIONS': '#858585'   // Gray
        };
        return colors[method?.toUpperCase()] || '#858585';
    }

    /**
     * getTimeAgoString(timestamp) - Format timestamp as "X ago" string
     *
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {string} Formatted time string (e.g., "2 min ago", "30 sec ago")
     */
    getTimeAgoString(timestamp) {
        const now = Date.now() / 1000;
        const secondsAgo = Math.floor(now - timestamp);

        if (secondsAgo < 60) {
            return secondsAgo + 's ago';
        } else if (secondsAgo < 3600) {
            const minutesAgo = Math.floor(secondsAgo / 60);
            return minutesAgo + ' min ago';
        } else {
            const hoursAgo = Math.floor(secondsAgo / 3600);
            return hoursAgo + 'h ago';
        }
    }

    /**
     * startResize(event) - Start panel resize operation
     *
     * Called when user presses mouse down on resize handle.
     * Saves initial state and attaches mouse tracking listeners.
     *
     * @param {MouseEvent} event - The mousedown event
     */
    startResize(event) {
        if (event.button !== 0) return; // Only handle left mouse button

        event.preventDefault();
        this.isResizing = true;
        this.resizeStartX = event.clientX;
        this.resizeStartY = event.clientY;
        this.resizeStartWidth = this.panelElement.offsetWidth;
        this.resizeStartHeight = this.panelElement.offsetHeight;

        // Add class for visual feedback
        this.panelElement.classList.add('resizing');

        // Attach global mouse listeners using bound methods for proper cleanup
        document.addEventListener('mousemove', this.boundHandleResize);
        document.addEventListener('mouseup', this.boundStopResize);

        console.log('[DevPanel] Resize started');
    }

    /**
     * handleResize(event) - Handle mouse movement during resize
     *
     * Updates panel width and height based on mouse movement.
     * The resize handle is at top-left, so:
     * - Moving left decreases width
     * - Moving up decreases height
     * - Moving right increases width
     * - Moving down increases height
     *
     * @param {MouseEvent} event - The mousemove event
     */
    handleResize(event) {
        if (!this.isResizing) return;

        event.preventDefault();

        // Calculate delta from initial position
        const deltaX = event.clientX - this.resizeStartX;
        const deltaY = event.clientY - this.resizeStartY;

        // Calculate new dimensions (with minimum size constraints)
        // For top-left resize: moving left/up decreases size
        const minWidth = 300;
        const minHeight = 200;
        const newWidth = Math.max(minWidth, this.resizeStartWidth - deltaX);
        const newHeight = Math.max(minHeight, this.resizeStartHeight - deltaY);

        // Apply new dimensions
        this.panelElement.style.width = newWidth + 'px';
        this.panelElement.style.height = newHeight + 'px';
    }

    /**
     * stopResize() - End panel resize operation
     *
     * Called when user releases mouse button.
     * Removes mouse tracking listeners and saves size preference.
     */
    stopResize() {
        if (!this.isResizing) return;

        this.isResizing = false;
        this.panelElement.classList.remove('resizing');

        // Remove global mouse listeners using bound methods
        document.removeEventListener('mousemove', this.boundHandleResize);
        document.removeEventListener('mouseup', this.boundStopResize);

        // Save new size to localStorage
        this.saveSize();

        console.log('[DevPanel] Resize ended');
    }

    /**
     * saveSize() - Save panel dimensions to localStorage
     *
     * Persists current width and height so next page load
     * restores the user's preferred panel size.
     */
    saveSize() {
        const width = this.panelElement.offsetWidth;
        const height = this.panelElement.offsetHeight;

        localStorage.setItem('devPanel-width', width.toString());
        localStorage.setItem('devPanel-height', height.toString());

        console.log('[DevPanel] Size saved:', { width, height });
    }

    /**
     * restoreSize() - Restore panel dimensions from localStorage
     *
     * Applies saved width and height from previous session.
     * If not found, uses CSS defaults.
     */
    restoreSize() {
        const savedWidth = localStorage.getItem('devPanel-width');
        const savedHeight = localStorage.getItem('devPanel-height');

        if (savedWidth) {
            this.panelElement.style.width = savedWidth + 'px';
        }

        if (savedHeight) {
            this.panelElement.style.height = savedHeight + 'px';
        }

        if (savedWidth || savedHeight) {
            console.log('[DevPanel] Size restored:', { savedWidth, savedHeight });
        }
    }

    /**
     * highlightTab(tabName) - Highlight a tab for lesson guidance
     *
     * Called when a lesson step has a devPanelHint.
     * Adds visual emphasis to guide students to the relevant tab.
     *
     * Effects:
     * - Adds pulsing border animation to tab button
     * - Auto-opens the tab
     * - Adds "Lesson recommends" badge
     * - Highlights disappear when user clicks another tab
     *
     * @param {string} tabName - Tab to highlight (state, methods, flow, network, database)
     * @returns {void}
     */
    highlightTab(tabName) {
        // Validate tab exists
        if (!this.tabs[tabName]) {
            console.warn(`[DevPanel] Tab "${tabName}" not found for lesson hint`);
            return;
        }

        // Remove any existing highlights
        this.clearHighlights();

        // Get the tab button
        const tabBtn = this.tabs[tabName];

        // Add pulsing highlight class
        tabBtn.classList.add('lesson-hint-highlight');

        // Add "Lesson recommends" badge to tab
        const badge = document.createElement('span');
        badge.className = 'lesson-hint-badge';
        badge.textContent = '✨ Lesson';
        badge.title = 'This tab has been recommended by the current lesson';
        tabBtn.appendChild(badge);

        // Auto-switch to the recommended tab (if not already on it)
        if (this.currentTab !== tabName) {
            this.switchTab(tabName);
        }

        // Auto-open the panel if closed
        if (!this.isOpen) {
            this.open();
        }

        console.log(`[DevPanel] Lesson hint: Highlighted tab "${tabName}"`);
    }

    /**
     * clearHighlights() - Remove all lesson-related highlights
     *
     * Called when:
     * - User clicks another tab (dismisses the hint)
     * - Lesson step changes
     * - Tutorial Mode is exited
     *
     * Removes:
     * - Pulsing border animation
     * - "Lesson recommends" badges
     * - Any other lesson-related visual emphasis
     *
     * @returns {void}
     */
    clearHighlights() {
        // Remove highlight class from all tabs
        Object.entries(this.tabs).forEach(([name, btn]) => {
            btn.classList.remove('lesson-hint-highlight');

            // Remove badge
            const badge = btn.querySelector('.lesson-hint-badge');
            if (badge) {
                badge.remove();
            }
        });

        console.log('[DevPanel] Cleared all lesson highlights');
    }

    /**
     * listenToLessonChanges() - Subscribe to lesson step changes
     *
     * Sets up event listener to respond to lesson navigation.
     * When students move between lesson steps, this updates dev panel hints.
     *
     * MVC Flow:
     * 1. Student clicks "Next Step" in lesson panel
     * 2. LessonEngine emits 'lesson:stepChanged' event
     * 3. DevPanel catches event and extracts devPanelHint
     * 4. If hint exists, calls highlightTab()
     * 5. If no hint, clears previous highlights
     *
     * Event data structure:
     * {
     *   lessonId: 2,
     *   stepId: "2-3",
     *   step: { title, content, hint, devPanelHint, checkpoint },
     *   devPanelHint: { tab: "methods", message: "..." }
     * }
     *
     * @returns {void}
     */
    listenToLessonChanges() {
        // Listen for lesson step changes
        document.addEventListener('lesson:stepChanged', (event) => {
            const detail = event.detail || {};
            const devPanelHint = detail.devPanelHint;

            if (devPanelHint) {
                // Student is on a step with a dev panel hint
                console.log('[DevPanel] Lesson hint received:', devPanelHint);

                // Highlight the recommended tab
                this.highlightTab(devPanelHint.tab);

                // Optional: Log the message for debugging
                if (devPanelHint.message) {
                    console.log(`[DevPanel] Lesson says: ${devPanelHint.message}`);
                }
            } else {
                // No hint for this step - clear previous highlights
                this.clearHighlights();
            }
        });

        // Also listen when lesson mode is closed
        document.addEventListener('lesson:modeChanged', (event) => {
            const detail = event.detail || {};
            if (!detail.tutorialModeActive) {
                // Tutorial mode closed - clear highlights
                this.clearHighlights();
                console.log('[DevPanel] Tutorial mode exited, cleared highlights');
            }
        });

        console.log('[DevPanel] Listening for lesson changes');
    }
}

// Global function to save request data immediately when __DEBUG__ is available
// This runs before DevPanel initialization to ensure POST requests are captured
// even if the page redirects before DevPanel fully loads
window.saveDebugDataIfAvailable = function() {
    if (window.__DEBUG__ && window.__DEBUG__.request_info) {
        try {
            // Quick save to sessionStorage before page potentially redirects
            const requestInfo = window.__DEBUG__.request_info;
            const requestId = window.__DEBUG__.request_id;

            if (requestId) {
                // Load existing history
                let history = [];
                try {
                    const stored = sessionStorage.getItem('devPanel-requestHistory');
                    if (stored) {
                        history = JSON.parse(stored);
                    }
                } catch (e) {
                    history = [];
                }

                // Check if this request is already saved
                const alreadySaved = history.some(r => r.request_id === requestId);
                if (!alreadySaved && history.length < 20) {
                    // Create history entry
                    const entry = {
                        request_id: requestId,
                        method: requestInfo.method || 'GET',
                        url: requestInfo.url || '/',
                        timestamp: requestInfo.timestamp || Date.now() / 1000,
                        debugData: JSON.parse(JSON.stringify(window.__DEBUG__)),
                        summary: {
                            methodCallCount: (window.__DEBUG__.method_calls || []).length,
                            queryCount: (window.__DEBUG__.db_queries || []).length,
                            status: requestInfo.status || 200,
                            duration_ms: (window.__DEBUG__.timing?.request_end - window.__DEBUG__.timing?.request_start) * 1000 || 0
                        }
                    };

                    // Add to history
                    history.unshift(entry);
                    if (history.length > 20) {
                        history = history.slice(0, 20);
                    }

                    // Save to storage
                    sessionStorage.setItem('devPanel-requestHistory', JSON.stringify(history));
                }
            }
        } catch (err) {
            console.warn('[DevPanel] Error saving debug data:', err);
        }
    }
};

// Call immediately in case __DEBUG__ is already set
window.saveDebugDataIfAvailable();

// Initialize panel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DevPanel().init();
    });
} else {
    // DOM is already loaded (e.g., script loaded after page render)
    new DevPanel().init();
}
