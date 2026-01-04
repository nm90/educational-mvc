# Docker Deployment Guide

## Overview

The Educational MVC App is fully containerized for easy deployment and development. This guide covers both development and production Docker setups.

## Quick Start

### Development Mode (Hot Reload)

```bash
docker-compose up
```

This command:
- Builds the Docker image
- Starts the Flask server on port 5000
- Mounts local code for hot reload
- Creates persistent database volume
- Enables debug mode

Access the app at: **http://localhost:5000**

### Stop the Application

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```

## Configuration

### Environment Variables

The following environment variables can be configured in `docker-compose.yml`:

| Variable | Default | Description |
|----------|---------|-------------|
| `FLASK_ENV` | `development` | Flask environment (development/production) |
| `FLASK_DEBUG` | `1` | Enable Flask debug mode (1=on, 0=off) |
| `DATABASE_PATH` | `/app/data/educational_mvc.db` | SQLite database file location |
| `SECRET_KEY` | `dev-secret-key-change-in-production` | Flask secret key for sessions |

### Production Configuration

For production deployment, uncomment the `app-prod` service in `docker-compose.yml`:

```yaml
services:
  app-prod:
    build: .
    container_name: educational-mvc-prod
    ports:
      - "5000:5000"
    volumes:
      - db-data:/app/data
      - ./backend/logs:/app/backend/logs
    environment:
      - FLASK_ENV=production
      - DATABASE_PATH=/app/data/educational_mvc.db
      - SECRET_KEY=${SECRET_KEY:-change-this-secret-key}
    restart: always
    networks:
      - mvc-network
```

Then set your production secret key:

```bash
export SECRET_KEY="your-secure-random-key-here"
docker-compose up app-prod -d
```

## Docker Architecture

### Image Details

- **Base Image**: `python:3.11-slim`
- **Exposed Port**: 5000
- **Health Check**: HTTP GET to `/health` endpoint every 30 seconds
- **Working Directory**: `/app`

### Volumes

1. **db-data** (Persistent)
   - Stores SQLite database
   - Survives container restarts
   - Located at `/app/data/` in container

2. **Code Volumes** (Development only)
   - `./backend:/app/backend` - Backend code hot reload
   - `./lessons:/app/lessons` - Lesson files

3. **Logs Volume**
   - `./backend/logs:/app/backend/logs` - Application logs

### Network

- **Network Name**: `mvc-network`
- **Driver**: bridge
- **Purpose**: Isolates container communication

## Database Management

### Initial Setup

The database is automatically created and seeded on first run:

1. Container starts
2. Flask app checks if database exists at `DATABASE_PATH`
3. If not found, creates schema from `schema.sql`
4. Runs seed data from `seed.py`
5. Database is ready with sample users and tasks

### Reset Database

To reset the database to initial state:

```bash
# Stop containers
docker-compose down

# Remove database volume
docker volume rm educational-mvc_db-data

# Start fresh
docker-compose up
```

### Backup Database

```bash
# Create backup
docker-compose exec app cp /app/data/educational_mvc.db /app/data/backup.db

# Copy to host
docker cp educational-mvc-app:/app/data/backup.db ./backup.db
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup.db educational-mvc-app:/app/data/educational_mvc.db

# Restart container
docker-compose restart app
```

## Development Workflow

### Build and Run

```bash
# Build image
docker-compose build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down
```

### Code Changes

Development mode mounts your local code, so changes are reflected immediately:

1. Edit files in `./backend/` or `./lessons/`
2. Flask auto-reloads (debug mode enabled)
3. Refresh browser to see changes

### Debugging

#### View Application Logs

```bash
docker-compose logs -f app
```

#### Execute Commands in Container

```bash
# Interactive shell
docker-compose exec app bash

# Run Python script
docker-compose exec app python backend/database/seed.py

# Check database
docker-compose exec app ls -la /app/data/
```

#### Inspect Container

```bash
# Container details
docker inspect educational-mvc-app

# Container resource usage
docker stats educational-mvc-app

# Container processes
docker-compose exec app ps aux
```

## Troubleshooting

### Port 5000 Already in Use

If another service is using port 5000, change it in `docker-compose.yml`:

```yaml
ports:
  - "8080:5000"  # Access at http://localhost:8080
```

### Database Permission Errors

Ensure the data volume directory has correct permissions:

```bash
docker-compose exec app ls -la /app/data/
docker-compose exec app chmod 755 /app/data/
```

### Container Won't Start

Check logs for errors:

```bash
docker-compose logs app
```

Common issues:
- Missing `requirements.txt`
- Invalid Python syntax
- Database schema errors

### Image Build Fails

Clear Docker cache and rebuild:

```bash
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up
```

## Production Deployment

### Best Practices

1. **Use Production Mode**
   - Set `FLASK_ENV=production`
   - Disable debug mode: `FLASK_DEBUG=0`
   - Set strong `SECRET_KEY` from environment variable

2. **Secure Configuration**
   - Never commit secrets to version control
   - Use Docker secrets or environment variables
   - Restrict container permissions

3. **Resource Limits**
   
   Add to `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
       reservations:
         cpus: '0.5'
         memory: 256M
   ```

4. **Persistent Logs**
   - Mount log directory to host
   - Use log rotation
   - Monitor log files

5. **Health Checks**
   - Container includes built-in health check
   - Monitor `/health` endpoint
   - Set up alerting for failures

### Deployment Commands

```bash
# Build production image
docker-compose build app-prod

# Start production service
docker-compose up -d app-prod

# Check status
docker-compose ps

# View logs
docker-compose logs -f app-prod

# Stop service
docker-compose stop app-prod
```

## Multi-Container Setup (Future)

To add more services (e.g., Redis, PostgreSQL), extend `docker-compose.yml`:

```yaml
services:
  app:
    # ... existing config ...
    depends_on:
      - db
  
  db:
    image: postgres:15
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret

volumes:
  db-data:
  postgres-data:
```

## Docker Commands Reference

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi educational-mvc_app

# Build without cache
docker-compose build --no-cache
```

### Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop educational-mvc-app

# Remove container
docker rm educational-mvc-app

# Restart container
docker-compose restart app
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect educational-mvc_db-data

# Remove volume
docker volume rm educational-mvc_db-data

# Remove unused volumes
docker volume prune
```

### Network Management

```bash
# List networks
docker network ls

# Inspect network
docker network inspect educational-mvc_mvc-network

# Remove network
docker network rm educational-mvc_mvc-network
```

## Performance Optimization

### Image Size Reduction

The Dockerfile uses several optimization techniques:

1. **Slim base image**: `python:3.11-slim` (smaller than full Python image)
2. **No cache**: `pip install --no-cache-dir` (reduces layer size)
3. **Multi-stage build ready**: Can add build stage for compiled dependencies
4. **Minimal system packages**: Only installs gcc when needed

### Runtime Performance

- Use production WSGI server (gunicorn) instead of Flask dev server
- Enable response caching
- Optimize database queries
- Use connection pooling

Example with gunicorn:

```bash
# Install gunicorn
pip install gunicorn

# Update CMD in Dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "backend.app:app"]
```

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review Docker logs: `docker-compose logs`
3. Inspect container: `docker-compose exec app bash`
4. Check GitHub issues

## Related Documentation

- [README.md](README.md) - Project overview
- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) - Architecture details
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Development roadmap
