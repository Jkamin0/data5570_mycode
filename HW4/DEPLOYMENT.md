# Deployment Guide

This guide covers deploying the Habit Tracker application to production.

## Overview

- **Backend**: Django on AWS EC2 with Cloudflare Tunnel for HTTPS
- **Frontend**: Expo app on EAS Hosting
- **Database**: SQLite (local) or AWS RDS PostgreSQL (production)

## Backend Deployment (AWS EC2)

### Prerequisites
- AWS EC2 instance (Ubuntu recommended)
- SSH access to your EC2 instance
- Cloudflare account (free)

### 1. Prepare EC2 Instance

SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

Update system packages:
```bash
sudo apt update
sudo apt upgrade -y
```

Install Python and dependencies:
```bash
sudo apt install -y python3 python3-pip git
```

### 2. Clone and Setup Project

```bash
# Clone your repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo/HW4/backend

# Install Python packages
pip3 install -r requirements.txt --break-system-packages
```

### 3. Configure Django for Production

Edit `habittracker/settings.py`:

```python
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'your-production-secret-key-here'  # Generate a new one!

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Add your EC2 IP and domain
ALLOWED_HOSTS = ['your-ec2-ip', 'your-cloudflare-domain.com', 'localhost']

# Update CORS for production
CORS_ALLOWED_ORIGINS = [
    'https://your-expo-app-url.com',
    'https://your-cloudflare-tunnel-url.trycloudflare.com',
]

# Or for testing (NOT recommended for production):
# CORS_ALLOW_ALL_ORIGINS = True
```

### 4. Run Migrations

```bash
python3 manage.py migrate
python3 manage.py createsuperuser  # Create admin account
```

### 5. Start Django Server

```bash
python3 manage.py runserver 0.0.0.0:8000
```

For production, consider using Gunicorn:
```bash
pip3 install gunicorn --break-system-packages
gunicorn habittracker.wsgi:application --bind 0.0.0.0:8000
```

### 6. Setup Cloudflare Tunnel (for HTTPS)

Install cloudflared:
```bash
curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-archive-keyring.gpg >/dev/null

echo "deb [signed-by=/usr/share/keyrings/cloudflare-archive-keyring.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list

sudo apt update
sudo apt install -y cloudflared
```

Start the tunnel:
```bash
cloudflared tunnel --url http://localhost:8000
```

This will provide you with a HTTPS URL like:
```
https://random-words-123.trycloudflare.com
```

Add this URL to your Django `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.

### 7. Keep Server Running (Production)

Use a process manager like systemd or supervisor to keep Django running.

Example systemd service (`/etc/systemd/system/habittracker.service`):
```ini
[Unit]
Description=Habit Tracker Django App
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/your-repo/HW4/backend
ExecStart=/usr/bin/python3 /home/ubuntu/your-repo/HW4/backend/manage.py runserver 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable habittracker
sudo systemctl start habittracker
```

## Frontend Deployment (EAS Hosting)

### Prerequisites
- Expo account (free at https://expo.dev)
- EAS CLI installed

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure EAS

```bash
cd HW4/frontend
eas build:configure
```

### 4. Update API Base URL

Edit `frontend/services/api.js`:

```javascript
// Change from localhost to your Cloudflare tunnel URL
const API_BASE_URL = 'https://your-cloudflare-tunnel-url.trycloudflare.com/api';
```

### 5. Update app.json

Add your EAS project configuration:

```json
{
  "expo": {
    "name": "HabitTracker",
    "slug": "habit-tracker",
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### 6. Build and Deploy

Create a production build:
```bash
eas build --platform all
```

Or for specific platforms:
```bash
eas build --platform android
eas build --platform ios
```

Deploy to EAS Hosting:
```bash
npx expo export
eas update
```

### 7. Get Hosted URL

After deploying, EAS will provide you with a URL:
```
https://expo.dev/@yourusername/habit-tracker
```

You can also use:
```bash
eas build:list
```

## Database Migration to AWS RDS (Optional)

### 1. Create RDS Instance

1. Go to AWS RDS Console
2. Create a PostgreSQL database
3. Note the endpoint, username, and password

### 2. Install PostgreSQL Adapter

```bash
pip3 install psycopg2-binary --break-system-packages
```

### 3. Update Django Settings

Edit `habittracker/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'habittracker',
        'USER': 'your-db-username',
        'PASSWORD': 'your-db-password',
        'HOST': 'your-rds-endpoint.rds.amazonaws.com',
        'PORT': '5432',
    }
}
```

### 4. Migrate Database

```bash
python3 manage.py migrate
python3 manage.py createsuperuser
```

## Testing Deployment

### 1. Test Backend API

```bash
# Test health
curl https://your-cloudflare-url.trycloudflare.com/api/

# Test auth endpoint
curl -X POST https://your-cloudflare-url.trycloudflare.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123","password_confirm":"testpass123"}'
```

### 2. Test Frontend

1. Open the Expo hosted URL
2. Register a new account
3. Create a habit
4. Mark it complete
5. View the calendar

## Monitoring and Maintenance

### Check Django Logs

```bash
# If using systemd
sudo journalctl -u habittracker -f

# Or check Django logs directly
tail -f /path/to/django/logs
```

### Check Cloudflare Tunnel

```bash
ps aux | grep cloudflared
```

### Update Application

```bash
# Backend
cd HW4/backend
git pull
python3 manage.py migrate
sudo systemctl restart habittracker

# Frontend
cd HW4/frontend
git pull
npm install
npx expo export
eas update
```

## Security Considerations

### Production Checklist

- [ ] Change `SECRET_KEY` in Django settings
- [ ] Set `DEBUG = False`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Use specific `CORS_ALLOWED_ORIGINS` (not `CORS_ALLOW_ALL_ORIGINS`)
- [ ] Use HTTPS for all connections
- [ ] Use environment variables for secrets
- [ ] Enable Django's security middleware
- [ ] Set up proper database backups
- [ ] Use strong passwords for database and admin
- [ ] Keep dependencies up to date

### Environment Variables

Create a `.env` file (never commit this!):
```bash
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ALLOWED_HOSTS=your-domain.com,your-ec2-ip
```

Use `python-decodenv` to load:
```bash
pip3 install python-dotenv
```

In `settings.py`:
```python
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG') == 'True'
```

## Troubleshooting

### Cloudflare Tunnel Disconnects
- The free tunnel may disconnect. Restart with `cloudflared tunnel --url http://localhost:8000`
- Consider using a named tunnel for stability

### CORS Errors
- Verify the Cloudflare URL is in `CORS_ALLOWED_ORIGINS`
- Check that `CorsMiddleware` is properly configured
- Test API directly with curl to isolate frontend vs backend issues

### App Not Connecting
- Verify backend is running and accessible
- Check API_BASE_URL in frontend matches Cloudflare URL
- Test backend endpoint directly in browser

## Submission

For your homework submission, provide:

1. **GitHub Repository URL**: Link to your code repository
2. **Expo Hosted App URL**: The EAS hosting URL (e.g., `https://expo.dev/@username/habit-tracker`)
3. **Backend API URL** (optional): Your Cloudflare tunnel URL if you deployed the backend

Example submission:
```
Repository: https://github.com/yourusername/data5570_mycode
Expo App: https://expo.dev/@yourusername/habit-tracker
Backend API: https://random-words-123.trycloudflare.com
```
