# Local Development Setup

This guide will help you set up the Habit Tracker application for local development.

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- Expo Go app on your mobile device (optional, for testing on physical device)

## Backend Setup

### 1. Navigate to the backend directory
```bash
cd HW4/backend
```

### 2. Install Python dependencies
```bash
# Install pip if not already installed
python3 -m pip install --user --break-system-packages pip

# Install Django and dependencies
pip3 install -r requirements.txt --break-system-packages
```

Or alternatively:
```bash
python3 -m pip install django djangorestframework django-cors-headers --break-system-packages
```

### 3. Run database migrations
```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

### 4. Create a superuser (optional, for Django admin access)
```bash
python3 manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 5. Start the Django development server
```bash
python3 manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

You can access:
- Django Admin: `http://localhost:8000/admin/`
- API Root: `http://localhost:8000/api/`
- Habits endpoint: `http://localhost:8000/api/habits/`

## Frontend Setup

### 1. Navigate to the frontend directory
```bash
cd HW4/frontend
```

### 2. Install Node dependencies
```bash
npm install
```

If you encounter peer dependency issues:
```bash
npm install --legacy-peer-deps
```

### 3. Configure API base URL

The API base URL is set in `frontend/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

For testing on a physical device, you may need to change this to your machine's local IP address:
```javascript
const API_BASE_URL = 'http://192.168.1.XXX:8000/api';
```

### 4. Start the Expo development server
```bash
npm start
```

Or use specific commands:
```bash
npm run android  # Run on Android emulator
npm run ios      # Run on iOS simulator (Mac only)
npm run web      # Run in web browser
```

### 5. Testing the app

**Option A: Physical Device**
1. Install Expo Go app from App Store or Google Play
2. Scan the QR code shown in the terminal
3. The app will load on your device

**Option B: Emulator/Simulator**
1. Have Android Studio (Android) or Xcode (iOS) installed
2. Press 'a' for Android or 'i' for iOS in the terminal
3. The app will launch in the emulator

**Option C: Web Browser**
1. Press 'w' in the terminal
2. The app will open in your default browser

## Testing the Application

### 1. Start both servers

Terminal 1 (Backend):
```bash
cd HW4/backend
python3 manage.py runserver
```

Terminal 2 (Frontend):
```bash
cd HW4/frontend
npm start
```

### 2. Register a new account

1. Open the app on your device/emulator
2. Tap "Sign Up" on the login screen
3. Enter username, email (optional), and password
4. Tap "Sign Up" button

### 3. Create habits

1. After login, tap "+ Add Habit"
2. Enter habit name and description
3. Tap "Create"

### 4. Track habits

1. Tap the checkbox next to a habit to mark it complete for today
2. Tap on a habit to view its detail page with calendar and statistics
3. View your profile in the Profile tab

## Troubleshooting

### CORS Errors
If you see CORS errors in the console:
1. Check that `corsheaders` is in INSTALLED_APPS
2. Verify `CorsMiddleware` is first in MIDDLEWARE
3. Ensure your frontend URL is in `CORS_ALLOWED_ORIGINS`

### Connection Refused
If the frontend can't connect to the backend:
1. Verify Django server is running (`python3 manage.py runserver`)
2. Check the API_BASE_URL in `frontend/services/api.js`
3. If using a physical device, use your computer's local IP instead of localhost

### Token Authentication Issues
If you're logged out immediately:
1. Check browser/console for errors
2. Verify token is being saved in AsyncStorage
3. Check that Authorization header is being sent with requests

### Metro Bundler Issues
If Expo isn't loading:
```bash
# Clear cache and restart
npm start --clear
```

Or:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

## Database Management

### View database content
```bash
python3 manage.py shell
```

Then in the Python shell:
```python
from habits.models import Habit, HabitLog
from django.contrib.auth.models import User

# List all users
User.objects.all()

# List all habits
Habit.objects.all()

# List logs for a specific habit
habit = Habit.objects.first()
habit.logs.all()
```

### Reset database
```bash
rm db.sqlite3
python3 manage.py migrate
python3 manage.py createsuperuser
```

## Next Steps

After successfully running the app locally, see [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on deploying to production.
