# Educational MVC App

![Python Version](https://img.shields.io/badge/python-3.11%2B-blue)
![Flask](https://img.shields.io/badge/flask-3.0%2B-green)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**Learn MVC architecture by watching it work in real-time.**

An interactive, full-stack educational application that makes Model-View-Controller architecture transparent and understandable. See every method call, database query, and data transformation as it happens.

---

## 📋 Overview

### What is this app?

The Educational MVC App is a teaching tool designed to demystify the Model-View-Controller architectural pattern. Unlike traditional tutorials that explain MVC in abstract terms, this app lets you **see** MVC in action through a comprehensive developer panel that logs and visualizes every step of the request-response cycle.

### Who is it for?

- **Backend developers** learning MVC architecture
- **Full-stack developers** wanting to understand server-side patterns
- **Students** studying software architecture
- **Anyone** who wants to see how data flows through a web application

### What will you learn?

By completing the 8 interactive lessons and exploring the codebase, you'll understand:

- ✅ What Model, View, and Controller layers actually do
- ✅ How data flows from user interaction through database and back
- ✅ Why business logic belongs in Models (not Controllers)
- ✅ How Controllers orchestrate without doing all the work
- ✅ Why Views should only display data (no logic)
- ✅ How to debug MVC apps by tracing request flow
- ✅ Database relationships and common query patterns
- ✅ Anti-patterns and how to avoid them

**Philosophy**: No magic. Every line of code is inspectable. Developers can watch data flow through the MVC layers in real-time.

For detailed architecture and design decisions, see [PROJECT_BRIEF.md](PROJECT_BRIEF.md).

---

## ✨ Features

### 🔍 **Transparent MVC Architecture**

Every layer of the MVC pattern is visible and instrumented:

- **Models**: User and Task models with validation, relationships, and database operations
- **Views**: Jinja2 templates that render data (no logic)
- **Controllers**: Route handlers that orchestrate between Models and Views

### 🛠️ **Developer Panel (5 Tabs)**

A comprehensive debugging interface that shows:

1. **State Inspector** - Current app data, view data, nested object exploration
2. **Method Call Stack** - Tree view of all Python method calls with arguments and return values
3. **Flow Diagram** - Animated visualization of request flow through MVC layers
4. **Network Inspector** - All HTTP requests with headers, body, and status codes
5. **Database Inspector** - SQL queries with parameters, results, and execution times

### 📚 **Tutorial Mode (8 Progressive Lessons)**

Structured learning path from beginner to advanced:

- **Lesson 1**: Understand MVC Pattern (5 min)
- **Lesson 2**: Understand Data Flow (10 min)
- **Lesson 3**: Explore User Model (10 min)
- **Lesson 4**: Explore Task Model (15 min)
- **Lesson 5**: Understand Controllers (12 min)
- **Lesson 6**: Create Task Status Filter (20 min) - First coding exercise
- **Lesson 7**: Create Priority Update Feature (25 min)
- **Lesson 8**: Create Comments Feature (45+ min) - Build from scratch

### 🔓 **Exploration Mode**

- Full access to all features without restrictions
- Create, edit, and delete users and tasks freely
- Inspect any request and trace complete flow
- Experiment with code changes and see results immediately

### 📖 **Self-Documenting Code**

Every file includes:

- Docstrings explaining MVC role and purpose
- Inline comments with architecture explanations
- ✅ DO / ⚠️ DON'T patterns
- References to relevant lessons

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

The easiest way to get started:

```bash
# One-command setup and run
docker-compose up

# Access the app at http://localhost:5000
# Database and logs persist in Docker volumes
```

**Linux Users**: If you get a permission error, add your user to the docker group:

```bash
sudo usermod -aG docker $USER
newgrp docker  # Apply group changes immediately
```

For detailed Docker instructions and troubleshooting, see [DOCKER.md](DOCKER.md).

### Option 2: Local Setup

For development or if you prefer running directly:

```bash
# Install dependencies and initialize database
npm install
npm run setup

# Start the Flask server
npm start

# Visit http://localhost:5000
```

That's it! Open your browser and start learning.

---

## 📦 Detailed Setup

### Prerequisites

**Required:**
- Python 3.11 or higher
- pip (Python package manager)

**Optional:**
- Node.js 14+ and npm (for convenience scripts)
- Docker and Docker Compose (for containerized setup)

### Installation Steps

#### Method 1: Local Installation (Recommended for Development)

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/educational-mvc.git
cd educational-mvc
```

2. **Create Python virtual environment (recommended)**

```bash
# Create virtual environment
python3 -m venv venv

# Activate it (Linux/Mac)
source venv/bin/activate

# Activate it (Windows)
venv\Scripts\activate
```

3. **Install Python dependencies**

```bash
# If using venv (recommended)
pip install -r requirements.txt

# Or system-wide
pip3 install -r requirements.txt
```

4. **Initialize the database**

```bash
# This creates the SQLite database and seeds it with sample data
python3 backend/database/seed.py
```

5. **Start the application**

```bash
# Using npm scripts (if you have Node.js)
npm start

# Or directly with Python
python3 backend/app.py
```

6. **Open your browser**

Navigate to [http://localhost:5000](http://localhost:5000)

#### Method 2: Docker Installation (Recommended for Quick Start)

1. **Clone and start**

```bash
git clone https://github.com/yourusername/educational-mvc.git
cd educational-mvc
docker-compose up
```

2. **Access the app**

Navigate to [http://localhost:5000](http://localhost:5000)

The Docker setup handles all dependencies, database initialization, and configuration automatically.

### Database Initialization

The database is automatically created and seeded with sample data on first run:

- **Sample Users**: Alice (alice@example.com), Bob (bob@example.com)
- **Sample Tasks**: Multiple tasks with different statuses and priorities
- **Relationships**: Tasks are assigned to users

To reset the database:

```bash
# Remove database and re-seed
npm run reset

# Or manually
rm backend/database/educational_mvc.db
python3 backend/database/seed.py
```

### Running in Development Mode

Development mode enables Flask debug mode with auto-reload on code changes:

```bash
# Using npm
npm run dev

# Or directly
export FLASK_ENV=development  # Linux/Mac
set FLASK_ENV=development     # Windows
python3 backend/app.py
```

### Troubleshooting Common Issues

#### "Module not found" errors

**Problem**: Python can't find Flask or other dependencies

**Solution**: Make sure you've installed dependencies and activated your virtual environment:

```bash
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

#### Port 5000 already in use

**Problem**: Another application is using port 5000

**Solution**: Stop the other application or change the port in `backend/app.py`:

```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change to 5001 or any free port
```

#### Database file locked

**Problem**: SQLite database is locked by another process

**Solution**: Close any other instances of the app or database browser, then:

```bash
npm run reset  # Recreates the database
```

#### Permission denied (Docker on Linux)

**Problem**: Docker requires root privileges

**Solution**: Add your user to the docker group:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### Changes not reflecting

**Problem**: Code changes don't appear in the browser

**Solution**: 
- Make sure you're running in development mode (`npm run dev`)
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Restart the Flask server

---

## 📖 Usage

### Tutorial Mode: Start Your Learning Journey

1. Open the app at [http://localhost:5000](http://localhost:5000)
2. Click **"Start Tutorial Mode"**
3. Begin with **Lesson 1: Understand MVC Pattern**
4. Follow the guided lessons (8 total)
5. Complete code challenges in Lessons 6-8
6. Use the Developer Panel to inspect everything

**Tip**: Don't rush! Each lesson builds on the previous one. Take time to explore the Developer Panel and understand what's happening.

### Exploration Mode: Experiment Freely

1. Click **"Exploration Mode"** from the home page
2. Create users and tasks
3. Watch the Developer Panel as you interact
4. Trace data flow through MVC layers
5. Inspect method calls, SQL queries, and network requests

**Tip**: Try breaking things! Delete users with tasks, update priorities, filter by status. The Developer Panel helps you understand what's happening at every step.

### Developer Panel: Your X-Ray Vision

The Developer Panel is always visible and updates with every request:

- **State Tab**: See current data passed to the view
- **Methods Tab**: Expand method calls to see arguments and return values
- **Flow Tab**: Watch the animated request flow visualization
- **Network Tab**: Inspect HTTP request and response details
- **Database Tab**: View SQL queries with execution times

**Tip**: Click on method names to see code snippets. Click on file paths to understand file structure.

### Lessons Overview

| Lesson | Title | Duration | Type | Description |
|--------|-------|----------|------|-------------|
| 1 | Understand MVC Pattern | 5 min | Conceptual | Learn the three layers |
| 2 | Understand Data Flow | 10 min | Observation | Trace a request through MVC |
| 3 | Explore User Model | 10 min | Interactive | See model validation in action |
| 4 | Explore Task Model | 15 min | Interactive | Understand relationships and JOINs |
| 5 | Understand Controllers | 12 min | Observation | See controller orchestration |
| 6 | Create Task Status Filter | 20 min | Coding | Build your first feature |
| 7 | Create Priority Update | 25 min | Coding | Add update functionality |
| 8 | Create Comments Feature | 45+ min | Coding | Build complete MVC feature |

**Total Time**: ~2.5 hours for focused completion, or explore at your own pace.

---

## 📁 Project Structure

```
educational-mvc/
├── backend/                     # Python Flask server
│   ├── app.py                  # Flask application entry point
│   ├── controllers/            # Controller layer (routes, orchestration)
│   │   ├── __init__.py
│   │   ├── home_controller.py  # Home and lesson routes
│   │   ├── task_controller.py  # Task CRUD operations
│   │   └── user_controller.py  # User CRUD operations
│   ├── models/                 # Model layer (business logic, validation)
│   │   ├── __init__.py
│   │   ├── task.py            # Task model with relationships
│   │   └── user.py            # User model with validation
│   ├── database/              # SQLite connection and schema
│   │   ├── __init__.py
│   │   ├── connection.py      # Database connection handler
│   │   ├── schema.sql         # Table definitions
│   │   └── seed.py           # Sample data initialization
│   ├── utils/                 # Helper utilities
│   │   ├── __init__.py
│   │   ├── decorators.py      # @log_method_call decorator
│   │   ├── logger.py          # Request and method logging
│   │   ├── request_tracking.py # Request ID and context
│   │   └── response_builder.py # __DEBUG__ object injection
│   ├── templates/             # Jinja2 view templates
│   │   ├── base.html          # Base layout
│   │   ├── home.html          # Home page
│   │   ├── tasks/
│   │   │   ├── index.html     # Task list
│   │   │   ├── show.html      # Task detail
│   │   │   ├── new.html       # Create task form
│   │   │   └── edit.html      # Edit task form
│   │   └── users/
│   │       ├── index.html     # User list
│   │       ├── show.html      # User detail
│   │       ├── new.html       # Create user form
│   │       └── edit.html      # Edit user form
│   ├── static/                # Static assets
│   │   ├── css/
│   │   │   ├── devpanel.css   # Developer panel styles
│   │   │   ├── main.css       # Main application styles
│   │   │   └── lessons.css    # Lesson panel styles
│   │   └── js/
│   │       ├── mvc-api.js     # API client with debug extraction
│   │       ├── mvc-forms.js   # Form interception handler
│   │       ├── devPanel.js    # Developer panel component
│   │       ├── lessons.js     # Lesson engine
│   │       └── main.js        # App initialization
│   └── logs/                  # Application logs
│       └── server.log
├── lessons/                   # JSON lesson files
│   ├── lesson-1.json          # MVC Pattern introduction
│   ├── lesson-2.json          # Data flow
│   ├── lesson-3.json          # User model
│   ├── lesson-4.json          # Task model
│   ├── lesson-5.json          # Controllers
│   ├── lesson-6.json          # Status filter (coding)
│   ├── lesson-7.json          # Priority update (coding)
│   └── lesson-8.json          # Comments feature (advanced)
├── docker/                    # Docker configuration
├── docs/                      # Documentation
├── implementation-scripts/    # Development helper scripts
├── package.json              # npm scripts and dependencies
├── requirements.txt          # Python dependencies
├── docker-compose.yml        # Docker orchestration
├── Dockerfile                # Docker image definition
├── PROJECT_BRIEF.md          # Architecture and design decisions
├── DOCKER.md                 # Docker setup instructions
└── README.md                 # This file
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `backend/app.py` | Flask app initialization, middleware, route registration |
| `backend/models/user.py` | User model with validation and database methods |
| `backend/models/task.py` | Task model with relationships and business logic |
| `backend/controllers/task_controller.py` | Task routes and controller methods |
| `backend/controllers/user_controller.py` | User routes and controller methods |
| `backend/utils/decorators.py` | `@log_method_call` decorator for method tracking |
| `backend/utils/request_tracking.py` | Request ID assignment and context management |
| `backend/database/connection.py` | SQLite connection with query logging |
| `backend/static/js/devPanel.js` | Developer panel UI component |
| `backend/static/js/lessons.js` | Lesson loader and progress tracker |

---

## 🎓 Learning Path

### Recommended Order

1. **Start with Tutorial Mode** - Complete Lessons 1-8 in order
2. **Switch to Exploration Mode** - Experiment with creating and modifying data
3. **Read the Code** - Open files referenced in the Developer Panel
4. **Read PROJECT_BRIEF.md** - Understand architectural decisions
5. **Experiment** - Try adding your own features
6. **Break Things** - See what happens when you violate MVC principles

### Study Tips

- **Use the Developer Panel constantly** - It's your window into MVC
- **Read inline comments** - Every file has architecture explanations
- **Trace data flow** - Follow a request from browser to database and back
- **Compare layers** - Notice what code belongs in Model vs Controller
- **Ask "why?"** - Why is validation in the Model? Why not in the Controller?

### After Completion

Once you've finished all 8 lessons:

- ✅ You understand MVC architecture deeply
- ✅ You can build new features following MVC patterns
- ✅ You can debug MVC apps by tracing flow
- ✅ You recognize when logic is in the wrong layer
- ✅ You can apply these patterns to other frameworks (Rails, Django, Laravel, etc.)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_BRIEF.md](PROJECT_BRIEF.md) | Complete project overview, architecture decisions, and philosophy |
| [DOCKER.md](DOCKER.md) | Docker setup, configuration, and troubleshooting |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Development roadmap and feature breakdown |

**Coming Soon:**
- `ARCHITECTURE.md` - Deep dive into implementation details
- `LESSONS.md` - Complete lesson guide with solutions
- `CONTRIBUTING.md` - Guide for contributors

---

## 🤝 Contributing

Contributions are welcome! This is an educational project, and improvements that make MVC clearer or easier to learn are highly valued.

### How to Contribute

1. **Report Issues**: Found a bug or have a suggestion? [Open an issue](https://github.com/yourusername/educational-mvc/issues)

2. **Improve Documentation**: Clarify explanations, fix typos, add examples

3. **Add Features**: 
   - New lessons
   - Additional models (e.g., Comments, Categories)
   - Developer panel enhancements
   - Better visualizations

4. **Enhance Code Quality**:
   - Add inline comments explaining MVC concepts
   - Improve error messages
   - Add validation examples

### Code Style

- **Python**: Follow PEP 8, use descriptive variable names
- **JavaScript**: Use ES6+, avoid frameworks (keep it vanilla)
- **Comments**: Explain *why*, not just *what*
- **Docstrings**: Include MVC flow explanations
- **Architecture**: Follow patterns in PROJECT_BRIEF.md

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes following code style guidelines
4. Test your changes thoroughly
5. Commit with clear messages (`git commit -m "feat: add user role validation"`)
6. Push to your fork (`git push origin feature/your-feature`)
7. Open a Pull Request with description of changes

---

## 📄 License

MIT License

Copyright (c) 2026 Educational MVC Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

This project was created to make MVC architecture transparent and understandable for developers at all levels. Special thanks to educators and developers who provided feedback during development.

---

## 📞 Support

- **Documentation**: Start with [PROJECT_BRIEF.md](PROJECT_BRIEF.md)
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/yourusername/educational-mvc/issues)
- **Questions**: Check existing issues or open a new discussion

---

**Ready to learn MVC?** Start with `docker-compose up` or `npm start` and open [http://localhost:5000](http://localhost:5000)!
