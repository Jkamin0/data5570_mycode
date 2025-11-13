# Habit Tracker - Full Stack Application

A complete habit tracking application built with Django REST Framework and React Native/Expo.

## Features

- User authentication (register/login)
- Create, read, update, and delete habits
- Daily habit check-ins with toggle functionality
- Streak tracking (current and longest streaks)
- Calendar view showing completion history
- Completion rate statistics
- Responsive mobile-first UI
- RESTful API with Token authentication

## Tech Stack

### Backend
- Django 5.2.8
- Django REST Framework 3.16.1
- django-cors-headers 4.9.0
- SQLite database (can be migrated to PostgreSQL/AWS RDS)
- Token-based authentication

### Frontend
- React Native (Expo SDK 54)
- Redux Toolkit for state management
- Expo Router for navigation
- Axios for API calls
- React Native Calendars for calendar views
- AsyncStorage for local data persistence

## Project Structure

```
HW4/
├── backend/                    # Django backend
│   ├── habittracker/          # Django project settings
│   │   ├── settings.py        # Configuration including CORS
│   │   └── urls.py            # Main URL routing
│   ├── habits/                # Habits app
│   │   ├── models.py          # Habit and HabitLog models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # API viewsets and endpoints
│   │   ├── urls.py            # App URL routing
│   │   └── admin.py           # Django admin configuration
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Python dependencies
│
└── frontend/                  # Expo/React Native frontend
    ├── app/                   # Expo Router pages
    │   ├── (auth)/           # Authentication pages
    │   │   ├── login.js      # Login screen
    │   │   └── register.js   # Registration screen
    │   ├── (tabs)/           # Main app tabs
    │   │   ├── index.js      # Habits list screen
    │   │   └── profile.js    # User profile screen
    │   └── habit/[id].js     # Habit detail/calendar screen
    ├── store/                # Redux store
    │   ├── index.js          # Store configuration
    │   ├── authSlice.js      # Authentication state
    │   └── habitsSlice.js    # Habits state
    ├── services/             # API services
    │   └── api.js            # Axios configuration and API methods
    └── package.json          # Node dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get auth token
- `POST /api/auth/logout/` - Logout (requires auth)
- `GET /api/auth/user/` - Get current user (requires auth)

### Habits
- `GET /api/habits/` - List all user's habits
- `POST /api/habits/` - Create a new habit
- `GET /api/habits/{id}/` - Get habit details
- `PATCH /api/habits/{id}/` - Update habit
- `DELETE /api/habits/{id}/` - Delete habit
- `POST /api/habits/{id}/toggle_today/` - Toggle habit completion for today
- `GET /api/habits/{id}/logs/` - Get habit logs (with date filters)

### Logs
- `GET /api/logs/` - List logs (with filters)
- `POST /api/logs/` - Create a log entry
- `PATCH /api/logs/{id}/` - Update log entry
- `DELETE /api/logs/{id}/` - Delete log entry

## Database Models

### Habit
- user (ForeignKey to User)
- name (CharField)
- description (TextField)
- color (CharField, default: #3B82F6)
- icon (CharField, default: star)
- created_at (DateTimeField)
- updated_at (DateTimeField)

### HabitLog
- habit (ForeignKey to Habit)
- date (DateField)
- completed (BooleanField)
- notes (TextField)
- created_at (DateTimeField)
- updated_at (DateTimeField)

## Setup Instructions

See [SETUP.md](./SETUP.md) for detailed local development setup instructions.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions including:
- Deploying Django to AWS EC2
- Setting up Cloudflare tunnel for HTTPS
- Deploying Expo app to EAS Hosting
- Database migration to AWS RDS (optional)

## Development Notes

### CORS Configuration
The backend is configured to allow requests from:
- `http://localhost:8081` (Expo default)
- `http://127.0.0.1:8081`
- `http://localhost:19006` (Expo web)
- `http://127.0.0.1:19006`

For production, update `CORS_ALLOWED_ORIGINS` in `backend/habittracker/settings.py`.

### Authentication Flow
1. User registers or logs in
2. Backend returns auth token
3. Token stored in AsyncStorage
4. Token sent in Authorization header: `Token <token>`
5. All habit/log operations require authentication

### State Management
- Redux Toolkit with separate slices for auth and habits
- Async thunks for API calls
- Automatic token refresh on app load
- Protected routes via Expo Router

## Screenshots

(Add screenshots of your app here)

## License

This project is for educational purposes as part of DATA5570 coursework.
