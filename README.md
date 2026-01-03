# Educational MVC App

An interactive, full-stack educational application designed to teach developers how MVC architecture actually works. This app emphasizes transparency through a developer panel that shows every step of the request-response cycle.

**Philosophy**: No magic. Every line of code is inspectable. Developers can watch data flow through the MVC layers in real-time.

## Quick Start

### Local Setup

```bash
npm run setup   # Install dependencies and initialize database
npm run start   # Start Flask server on http://localhost:5000
```

### Docker Setup

```bash
docker-compose up
```

## Project Structure

```
educational-mvc/
├── backend/                 # Python Flask server
│   ├── app.py              # Flask application entry point
│   ├── models/             # Model layer (User, Task)
│   ├── controllers/        # Controller layer (routes, orchestration)
│   ├── utils/              # Decorators, logging, request tracking
│   ├── database/           # SQLite connection, schema, migrations
│   └── templates/          # Jinja2 view templates
├── frontend/               # JavaScript client
│   ├── public/
│   │   ├── index.html      # Main HTML entry
│   │   ├── css/            # Stylesheets
│   │   └── js/             # Client-side JavaScript
│   │       ├── main.js     # App initialization
│   │       ├── devPanel.js # Developer panel component
│   │       └── lessons.js  # Lesson engine
├── lessons/                # JSON lesson files (Lesson 1-8)
├── docker/                 # Docker configuration
├── docs/                   # Documentation
├── package.json            # npm scripts and dependencies
├── requirements.txt        # Python dependencies
└── docker-compose.yml      # Docker orchestration
```

## Tech Stack

- **Frontend**: Vanilla JavaScript (no framework)
- **Backend**: Python 3 + Flask
- **Templating**: Jinja2
- **Database**: SQLite
- **Deployment**: Docker

## Features

### Developer Transparency
- Real-time method call logging
- SQL query inspection
- Request/response visualization
- Data flow tracking through MVC layers
- State inspection at any point

### Learning Modes
- **Tutorial Mode**: Guided learning with 8 progressive lessons
- **Exploration Mode**: Full access with transparent developer tools

## Documentation

For detailed architecture and design decisions, see [PROJECT_BRIEF.md](PROJECT_BRIEF.md).

## Getting Started with Development

1. Complete local setup (see Quick Start above)
2. The Flask server will start on `http://localhost:5000`
3. Open your browser and begin the tutorial
4. Use the Developer Panel to inspect all MVC operations

## License

MIT
