# YNAB-Style Budgeting App - Frontend

This is the React Native frontend for the YNAB-style budgeting application, built with Expo.

## Tech Stack

- React Native with Expo
- Redux Toolkit for state management
- React-Redux for React bindings
- Axios for API calls

## Project Structure

```
frontend/
├── screens/         # UI screens (to be created)
├── store/           # Redux store and slices
│   ├── slices/     # Redux slices (to be created)
│   └── index.js    # Store configuration
├── services/        # API service layer
│   └── api.js      # Backend API client
├── components/      # Reusable UI components (to be created)
└── App.js          # Main app component with Redux Provider
```

## Getting Started

### Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
cd frontend
npm install
```

### Run the App

```bash
npm start
```

Then:
- Press `w` to open in web browser
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator (macOS only)
- Scan QR code with Expo Go app on your phone

## Backend Connection

The API service is configured to connect to `http://localhost:8000/api` by default.

To change this, update the `API_BASE_URL` in `services/api.js`.

## Available API Endpoints

The following API endpoints are available from the backend:

- `/api/accounts/` - Account management
- `/api/categories/` - Budget categories
- `/api/allocations/` - Budget allocations and money movement
- `/api/transactions/` - Transaction tracking

## Next Steps (Priority 2 Tasks)

1. **US07** - Redux Store Setup: Create slices for accounts, categories, allocations, and transactions
2. **US08** - Screen: View Accounts
3. **US09** - Screen: Create Account
4. **US10** - Screen: Add/Edit Budget Categories

## Status

**US06 - Create React + Redux + Expo Project: COMPLETE**

Basic project structure is set up and ready for development of UI screens and Redux slices.
