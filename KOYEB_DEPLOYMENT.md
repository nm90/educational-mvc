# Koyeb Deployment Checklist

This guide walks through deploying the educational-mvc project to Koyeb. All necessary configuration files have been prepared.

## Prerequisites

- [x] Project files ready (Procfile, .koyebignore, koyeb.yaml created)
- [ ] GitHub account created
- [ ] GitHub repository created and code pushed
- [ ] Koyeb account created (https://app.koyeb.com)

## Step 1: Prepare Your GitHub Repository

### 1.1 Ensure Code is Pushed to GitHub

```bash
git add Procfile .koyebignore koyeb.yaml
git commit -m "chore: add Koyeb deployment configuration"
git push origin main
```

If you haven't created a GitHub repository yet:
```bash
git remote add origin https://github.com/YOUR_USERNAME/educational-mvc.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Files Are in Repository

Visit your GitHub repository and confirm these files are present:
- `Procfile`
- `.koyebignore`
- `koyeb.yaml`
- `Dockerfile` (already exists)
- `requirements.txt` (already exists)
- `backend/app.py` (already exists)

## Step 2: Install Koyeb GitHub App

### 2.1 Connect Koyeb to GitHub

1. Go to [Koyeb Dashboard](https://app.koyeb.com)
2. Click your profile icon (top right) → **Settings**
3. Navigate to **Connected Accounts** or **GitHub Integration**
4. Click **Install GitHub App**
5. You'll be redirected to GitHub authorization
6. Select your GitHub account/organization
7. Choose **All repositories** or **Only select repositories** (select your educational-mvc repo)
8. Click **Install**

### 2.2 Verify Installation

Back in Koyeb dashboard, confirm the GitHub app is connected and shows your account.

## Step 3: Create Service in Koyeb

### 3.1 Start New Deployment

1. In Koyeb dashboard, click **+ Create Service**
2. Select **Deploy with Git**

### 3.2 Select Repository

1. Choose **GitHub** as the git provider
2. Find and select `educational-mvc` from the repository list
   - If not visible, click **Refresh** or check GitHub integration status
3. Confirm the repository URL appears
4. Click **Next**

### 3.3 Configure Git Settings

1. **Branch**: Set to `main` (default)
2. **Builder**: Select **Dockerfile** (auto-detected from your repository)
3. **Dockerfile path**: Leave as `Dockerfile` (default)
4. Keep **Autodeploy** enabled (redeploys automatically on push)
5. Click **Next**

### 3.4 Configure Service

**Name & Ports**:
- Service name: `educational-mvc` (auto-filled)
- HTTP Port: `5000` (auto-detected)
- Click **Next** to proceed

**Environment Variables** (Important):

1. Add the following environment variables:

| Key | Value | Required |
|-----|-------|----------|
| `FLASK_ENV` | `production` | Yes |
| `PYTHONUNBUFFERED` | `1` | Yes |
| `SECRET_KEY` | *(generate strong random string)* | Yes |
| `DATABASE_PATH` | `/tmp/educational_mvc.db` | No |

**Generate a Strong SECRET_KEY** (paste one of these options):

Option A - Use Python:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Option B - Use OpenSSL:
```bash
openssl rand -hex 32
```

Example output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

Copy the generated string and paste it as the `SECRET_KEY` value in Koyeb.

2. For **DATABASE_PATH**:
   - Set to: `/tmp/educational_mvc.db`
   - Note: Database will reset on each deployment (ephemeral). This is acceptable for an educational project. See "Database Persistence" section below for persistent alternatives.

3. Click **Next**

### 3.5 Configure Instance & Scaling

**Instance Type**:
- Select **Eco** or **Starter** (smallest available tier for cost efficiency)
- Adjust based on your needs and budget

**Regions**:
- Select at least one region close to your users
- Example: `Paris` for European traffic, `Washington D.C.` for US traffic
- Click **+** to add multiple regions for redundancy

**Scaling**:
- Min instances: `1`
- Max instances: `1` (for educational project with minimal traffic)
- Increase these values if you expect higher concurrency

**Health Check** (should be auto-configured):
- HTTP endpoint: `/health`
- Interval: `30s` (default)
- Timeout: `10s` (default)

Click **Next**

### 3.6 Review & Deploy

1. Review all settings:
   - Git source: GitHub, main branch
   - Service: educational-mvc, port 5000
   - Environment variables: FLASK_ENV, PYTHONUNBUFFERED, SECRET_KEY set
   - Instance: Eco tier
   - Regions: Selected
   - Health check: Enabled

2. Click **Create & Deploy**

3. You'll see the deployment progress screen. Wait for:
   - ✅ **Building** → Image building from Dockerfile
   - ✅ **Pushing** → Image pushed to Koyeb registry
   - ✅ **Deploying** → Service starting
   - ✅ **Running** → Service is live

## Step 4: Verify Deployment

### 4.1 Check Service Status

In the Koyeb dashboard, your service card should show:
- Status: **Running** (green checkmark)
- Deployment: **Success**
- Last update: Recent timestamp

### 4.2 Test the Application

1. Click the service name → **Overview**
2. Under **Public Domains**, copy the auto-generated URL (format: `https://educational-mvc-[random].koyeb.app`)
3. Open the URL in your browser
4. Verify:
   - Application loads without errors
   - Can navigate to lessons
   - Developer panel shows MVC tracing
   - Health check endpoint works: `https://educational-mvc-[random].koyeb.app/health`

### 4.3 Check Logs

1. In service dashboard, click **Logs** tab
2. Verify:
   - Flask startup messages appear
   - No Python errors or exceptions
   - Database initialized successfully
   - "Running on..." message shows port 5000

## Step 5: Configure Custom Domain (Optional)

If you have a custom domain:

1. In service dashboard, click **Settings** → **Domains**
2. Click **+ Add Domain**
3. Enter your domain (e.g., `my-app.example.com`)
4. Follow DNS setup instructions:
   - Add CNAME record to your DNS provider pointing to Koyeb endpoint
5. Wait for DNS propagation (usually 5-15 minutes)
6. Access app via custom domain

## Step 6: Monitor & Maintain

### Automatic Deployments
- Every push to the `main` branch triggers automatic redeployment
- The `.koyebignore` file prevents rebuilds for documentation/config-only changes
- Check deployment history in the **Deployments** tab

### View Metrics
1. Click **Metrics** tab in service dashboard
2. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### View Logs
1. Click **Logs** tab
2. Monitor for errors, warnings, or performance issues
3. Use filters by severity level

### Update Service
To change settings (regions, scaling, environment variables):
1. Click **Settings**
2. Modify configuration
3. Click **Save** and **Deploy** to apply changes

## Troubleshooting

### Deployment Fails During Build

**Check logs for**:
```
ERROR: Could not find requirements.txt
AttributeError: 'NoneType' object has no attribute...
```

**Solutions**:
- Verify `requirements.txt` is in repository root
- Check Python syntax in `backend/app.py`
- Ensure all imports can be resolved

### Service Crashes After Deploy (Status: Failed/Unhealthy)

1. Click **Logs** tab and search for errors
2. Common issues:
   - **Missing environment variables**: Verify SECRET_KEY is set
   - **Port conflict**: Ensure nothing else uses port 5000
   - **Database errors**: Check database file permissions
   - **Import errors**: Verify requirements.txt has all dependencies

3. Fix the issue locally, commit, and push to trigger redeploy:
```bash
git add .
git commit -m "fix: deployment issue"
git push origin main
```

### Health Check Fails

If logs show health check failures:
1. Verify `/health` endpoint exists in `backend/app.py`
2. Check if service is actually running and responding
3. Increase health check timeout in **Settings** → **Health Check**
4. Check if FLASK_ENV is set to `production`

## Database Persistence Strategy

**Current Setup (Ephemeral)**:
- Database resets on each deployment
- Good for educational/demo purposes
- No additional costs

**To Enable Persistent Storage**:

### Option 1: PostgreSQL (Recommended for Production)
1. Create PostgreSQL database (Heroku Postgres, Railway, AWS RDS)
2. Update `backend/app.py` to use PostgreSQL instead of SQLite
3. Set environment variable `DATABASE_URL` with connection string
4. Redeploy

### Option 2: Koyeb Persistent Volumes
1. In service **Settings** → **Disks**
2. Create persistent volume (e.g., `/data`)
3. Set `DATABASE_PATH=/data/educational_mvc.db`
4. Redeploy

Data persists across redeployments but may have performance overhead.

## Environment Variables Reference

All variables set during deployment:

| Variable | Value | Purpose |
|----------|-------|---------|
| `FLASK_ENV` | `production` | Disables debug mode, optimizes Flask |
| `PYTHONUNBUFFERED` | `1` | Python outputs logs immediately (required for container logs) |
| `SECRET_KEY` | *[random hex string]* | Cryptographic key for Flask sessions |
| `DATABASE_PATH` | `/tmp/educational_mvc.db` | SQLite database location (optional, defaults to backend/database/) |

## Support & Additional Resources

- [Koyeb Docs: Build and Deploy](https://www.koyeb.com/docs/build-and-deploy)
- [Koyeb Docs: Environment Variables](https://www.koyeb.com/docs/reference/environment-variables)
- [Koyeb Docs: Health Checks](https://www.koyeb.com/docs/reference/health-checks)
- [Flask Documentation](https://flask.palletsprojects.com/)

## Deployment Summary

| Item | Status |
|------|--------|
| Procfile | ✅ Created |
| .koyebignore | ✅ Created |
| koyeb.yaml | ✅ Created |
| Dockerfile | ✅ Exists |
| requirements.txt | ✅ Exists |
| GitHub Repository | ⏳ Pending (push code) |
| Koyeb Account | ⏳ Pending (create account) |
| GitHub App Installation | ⏳ Pending (authorize) |
| Service Deployment | ⏳ Pending (follow steps above) |

---

**Last Updated**: January 2025
**Project**: educational-mvc
**Deployment Target**: Koyeb
