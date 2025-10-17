# ExpoApp

A React Native Expo application that demonstrates all the required features for the assignment.

## Features Implemented

### 1. React Hooks ✅
- **useState**: Used in multiple components for managing local state
  - Home screen: `welcomeMessage` and `currentTime` state
  - Todo screen: `inputText` state for the text input
- **useEffect**: Used in the home screen to update the current time every second

### 2. Parent-Child Component Relationship ✅
- **Parent**: `TodoScreen` component (`app/todos.js`)
- **Child**: `TodoItem` component (`components/TodoItem.js`)
- The parent renders multiple child components in a FlatList
- Props are passed from parent to child (item data, callback functions)

### 3. Multiple Pages with Navigation ✅
- **Home Page** (`app/index.js`): Welcome screen with navigation links
- **Counter Page** (`app/counter.js`): Redux counter demonstration
- **Todo Page** (`app/todos.js`): Todo list with parent-child components
- Uses `expo-router` for file-based routing and navigation

### 4. Redux Store and Reducer ✅
- **Store**: Configured in `store/store.js`
- **Reducer**: `counterSlice.js` with multiple actions:
  - `increment`, `decrement`, `incrementByAmount` for counter
  - `addItem`, `toggleItem`, `removeItem` for todo list
- **Dispatch**: Used throughout the app to update Redux state
- **useSelector**: Used to consume state from the Redux store

## Project Structure

```
ExpoApp/
├── app/
│   ├── _layout.js          # Root layout with Redux Provider
│   ├── index.js            # Home screen
│   ├── counter.js          # Counter screen with Redux
│   └── todos.js            # Todo list screen (parent component)
├── components/
│   └── TodoItem.js         # Todo item component (child component)
├── store/
│   ├── store.js            # Redux store configuration
│   └── counterSlice.js     # Redux slice with reducers
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration
└── package.json            # Dependencies and scripts
```

## How to Run

1. **Install dependencies** (if not already installed):
   ```bash
   cd /home/jkamino/data5570_mycode/ExpoApp
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on different platforms**:
   - Web: `npm run web`
   - Android: `npm run android` (requires Android emulator or device)
   - iOS: `npm run ios` (requires iOS simulator or device, macOS only)

## App Functionality

### Home Screen
- Displays a welcome message that can be toggled
- Shows current time that updates every second (useEffect demo)
- Navigation buttons to other screens

### Counter Screen
- Redux-powered counter with increment/decrement buttons
- Special "Add 5" button to demonstrate `incrementByAmount` action
- Demonstrates Redux dispatch and useSelector

### Todo List Screen
- Add new todo items using text input
- Toggle completion status by tapping on items
- Delete items using the red × button
- Shows statistics (total and completed items)
- Demonstrates parent-child component relationship

## Technologies Used

- React Native
- Expo
- Expo Router (file-based routing)
- Redux Toolkit
- React Redux
- React Hooks (useState, useEffect)
