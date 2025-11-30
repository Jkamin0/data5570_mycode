# YNAB-Style Budgeting App (MVP) – Project Plan

## Workflow

We will work on this project **one user story at a time**, in priority order. When a story is complete, it will be marked as complete in this document before moving on to the next story. This ensures focused development and clear progress tracking.

## 1. Introduction

This project aims to build an **MVP version of a budgeting application inspired by You Need A Budget (YNAB)**. The goal is to allow users to:

- Enter their income
- Create budget categories
- Assign available funds to those categories (“give every dollar a job”)
- Log spending and see updated category balances
- Move funds between categories when overspending occurs

The focus is on the **core value of proactive budgeting**, without advanced features such as bank integration, goal tracking, analytics, or reporting.

The resulting MVP will demonstrate:

- A working full-stack application
- A structured budgeting workflow
- Real-time state updates in the UI
- Persistent backend storage of users’ budgets and transactions

This project plan outlines the tasks required, structured as **product stories ordered by priority**, based on a **Django backend with a React + Redux frontend and Expo**.

---

## 2. Tech Stack

### **Backend**

- **Framework:** Django
- **Database:** Django default DB (SQLite)
- **API:** Django REST Framework (optional but recommended)

### **Frontend**

- **Framework:** React
- **State Management:** Redux
- **UI Platform:** Expo (React Native)

### **Architecture**

- Backend provides REST API endpoints
- Frontend consumes endpoints and stores state in Redux
- Authentication handled via JWT (JSON Web Tokens) with refresh token support

Deployment and unit testing are not required at this stage.

---

## 3. User Stories (Ordered by Priority)

---

### **Priority 0 – Authentication & Security**

#### **US00a – Backend Authentication API** ✓

**Story:**
As a developer, I need a secure authentication system so users can register, login, and access their own data.

**Acceptance Criteria:**

- JWT-based authentication with access and refresh tokens
- User registration endpoint with email validation and password strength requirements
- Login endpoint that returns user data and tokens
- Token refresh endpoint for automatic token renewal
- Current user endpoint to retrieve authenticated user info
- Proper token storage and automatic attachment to API requests

**Endpoints:**

- POST `/auth/register/` - Create new user account
- POST `/auth/login/` - Authenticate and receive tokens
- POST `/auth/token/refresh/` - Refresh access token
- GET `/auth/me/` - Get current authenticated user

**Status: COMPLETE**

---

#### **US00b – Frontend Authentication Flow** ✓

**Story:**
As a user, I need to register and login so I can securely access my budget data.

**Acceptance Criteria:**

- Login screen with username/password validation
- Registration screen with email, password, and password confirmation
- Password visibility toggle
- Client-side form validation with helpful error messages
- Automatic token storage in AsyncStorage
- Automatic token refresh on 401 errors
- Protected routing that redirects unauthenticated users to login
- Auth state management in Redux

**Status: COMPLETE**

---

### **Priority 1 – Core Budget Data Model & API**

#### **US01 – Create Django Project** ✓

**Story:**
As a developer, I need a Django project initialized so that I have a backend environment to build the API.

**Tasks:**

- Create Django project skeleton
- Configure any basic project settings

**Status: COMPLETE**

---

#### **US02 – Data Models for Users, Accounts, Categories, Budget Assignments, Transactions** ✓

**Story:**
As a developer, I need database models that represent the core objects of budgeting so the app can store and retrieve user data.

**Acceptance Criteria:**
Models exist for:

- User (default Django user)
- Account (bank account or cash total)
- Budget Category
- Budget Allocation (money assigned to category)
- Transactions

**Status: COMPLETE**

---

#### **US03 – CRUD API for Accounts** ✓

**Story:**
As a user, I need to create and view my accounts so that I can track my available funds.

**Endpoints:**

- Create account
- List user accounts
- Retrieve account
- Update account
- Partial update account
- Delete account

**Status: COMPLETE**

---

#### **US04 – CRUD API for Budget Categories** ✓

**Story:**
As a user, I need to create and view spending categories so I can assign money into them.

**Endpoints:**

- Create category
- List categories
- Retrieve category
- Update category
- Partial update category
- Delete category

**Status: COMPLETE**

---

#### **US05 – API to Assign Dollars to Categories** ✓

**Story:**
As a user, I need to assign funds from my accounts into specific budget categories.

**Acceptance Criteria:**

- API receives amount, category, and account
- Updates remaining balance in account
- Increases allocation for the selected category

**Status: COMPLETE**

---

### **Priority 2 – Frontend Setup & Core UI Screens**

#### **US06 – Create React + Redux + Expo Project** ✓

**Story:**
As a developer, I need the frontend project created so I can start building UI screens.

**Tasks:**

- Initialize Expo app
- Install React + Redux
- Set up basic file structure

**Status: COMPLETE**

---

#### **US07 – Redux Store Setup** ✓

**Story:**
As a developer, I need application state stored in Redux so data can be shared across the app.

**Acceptance Criteria:**

- Store initialized
- Slices/modules for accounts, categories, allocations, and transactions
- Thunks for API calls

**Status: COMPLETE**

---

#### **US07a – Frontend API Service Layer** ✓

**Story:**
As a developer, I need a centralized API service layer to handle all backend communication with proper error handling and token management.

**Acceptance Criteria:**

- Axios instance configured with base URL
- Request interceptor to attach JWT tokens automatically
- Response interceptor to handle token refresh on 401 errors
- API modules for: auth, accounts, categories, allocations, transactions
- Type-safe API calls with TypeScript interfaces
- Proper error extraction and handling utilities

**Status: COMPLETE**

---

#### **US08 – Screen: View Accounts** ✓

**Story:**
As a user, I need to view all my accounts so I can see how much total money I have to budget.

**Acceptance Criteria:**

- Fetches accounts from backend on mount
- Displays list of accounts with name and balance
- Shows total available to budget at the top
- Pull-to-refresh functionality
- Loading state while fetching
- Empty state when no accounts exist
- Error handling with Snackbar notifications
- FAB button to create new accounts (for US09)

**Status: COMPLETE**

---

#### **US09 – Screen: Create Account** ✓

**Story:**
As a user, I need a form to add a new account so I can start budgeting.

**Acceptance Criteria:**

- Dialog-based form triggered by FAB on accounts screen
- Input fields for account name and initial balance
- Client-side validation (required fields, numeric balance, non-negative)
- Real-time error messages below fields
- Submits to backend via createAccount Redux action
- Updates account list immediately on success
- Closes dialog on successful creation
- Loading state during submission
- Clear error handling

**Status: COMPLETE**

---

#### **US10 – Screen: Add/Edit Budget Categories** ✓

**Story:**
As a user, I need to create categories so I can organize my spending.

**Acceptance Criteria:**

- Budget screen displays all user categories
- FAB button to create new categories
- Category dialog with name input and validation
- Edit category by clicking edit icon
- Delete category with confirmation dialog
- Categories display with allocated/spent/available balances
- Click on category card to allocate funds
- Pull-to-refresh functionality
- Loading states and empty states
- Error handling with Snackbar

**Implementation Details:**

- Created `CreateCategoryDialog` component supporting create and edit modes
- Created `CategoryListItem` component with color-coded balance display
- Full budget screen implementation at `app/(app)/budget.tsx`
- Integrated with Redux for state management
- FAB positioned at bottom-right for adding categories

**Status: COMPLETE**

---

### **Priority 3 – Budget Allocation & Real-Time Balances**

#### **US11 – Screen: Assign Funds to Budget Categories** ✓

**Story:**
As a user, I need a screen where I see my available money and assign dollars to categories.

**Acceptance Criteria:**

- Shows "available to budget" total (sum of account balances)
- Click on category to open allocation dialog
- Allocation dialog with category (pre-selected), account, and amount fields
- Modal-based pickers for selecting account
- Validation: amount required, must be > 0, cannot exceed account balance
- Shows available balance for selected account
- Posts to backend via Redux createAllocation action
- Refreshes accounts, balances, and allocations after successful allocation
- Error handling with clear messages

**Implementation Details:**

- Created `AllocateFundsDialog` component with modal-based pickers
- Pre-selects category when opened from category card click
- Category field disabled when pre-selected
- Account picker shows account balances
- Real-time validation against account balance
- Automatic data refresh after allocation

**Status: COMPLETE**

---

#### **US12 – Screen: View Category Balances** ✓

**Story:**
As a user, I need to see how much I have left in each category so I know what I can spend.

**Acceptance Criteria:**

- Categories display "allocated" amount (sum of all allocations)
- Categories display "spent" amount (sum of expense transactions)
- Categories display "available" amount (allocated - spent)
- Overspending is clearly indicated (red text for negative available balance)
- Positive balance shown in green
- Zero balance shown in gray
- Balances update in real-time after allocations and transactions

**Implementation Details:**

- Backend endpoint `GET /api/categories/balances/` calculates balances
- Uses aggregation to sum allocations and expense transactions
- `CategoryBalance` type added to frontend
- `fetchCategoryBalances` Redux thunk with separate loading state
- Color-coded display in `CategoryListItem` component
- Automatic refresh after allocations

**Status: COMPLETE**

---

### **Priority 4 – Spending & Overspending Adjustments**

#### **US13 – CRUD API for Transactions** ✓

**Story:**
As a user, I need to enter spending transactions so the app reflects my actual spending.

**Endpoints:**

- POST `/transactions/` - Create transaction (income or expense)
- GET `/transactions/` - List user's transactions
- DELETE `/transactions/{id}/` - Delete transaction

**Acceptance Criteria:**

- Transactions can be marked as 'income' or 'expense'
- Creating a transaction automatically updates account balance
- Deleting a transaction reverses the account balance change
- All transactions are user-isolated
- Includes validation for positive amounts

**Status: COMPLETE**

---

#### **US14 – Screen: Add Transaction** ✓

**Story:**  
As a user, I need to log spending or income so the system stays up to date.

**Acceptance Criteria:**

- Transaction form supports income/expense toggle, category (required for expenses), account selection, amount, and description
- Client-side validation for required fields, numeric amount > 0, and available category funds
- Pull-to-refresh and error Snackbar handling
- Creating or deleting transactions refreshes account balances and category balances
- Transactions appear immediately in history

**Implementation Details:**

- Transactions tab lists transactions with type-aware coloring/icons and deletion confirmation
- `CreateTransactionDialog` includes modal pickers, balance/available helpers, and validation aligned with backend rules
- After creation or deletion, accounts and category balances refresh to keep budget figures current

**Status: COMPLETE**

---

#### **US15 – Category Balance Calculation Logic** ✓

**Story:**
As a user, I need to see how much money is left in each category after spending so I can make informed budgeting decisions.

**Architectural Decision:**
Implemented backend endpoint approach (Option 1: Calculate on-the-fly) for single source of truth and consistency across clients.

**Implementation:**

Backend (`backend/budget/views.py`):
- Added `@action` method `balances()` to `CategoryViewSet`
- Aggregates allocations: `SUM(BudgetAllocation.amount WHERE category=X)`
- Aggregates spending: `SUM(Transaction.amount WHERE category=X AND type='expense')`
- Calculates available: `allocated - spent`
- Returns JSON array with category_id, category_name, allocated, spent, available

Frontend:
- `CategoryBalance` interface in types
- `getBalances()` method in categoriesAPI
- `fetchCategoryBalances` async thunk in Redux
- Separate `balancesLoading` state to prevent UI flicker
- Color-coded display based on available amount

**Acceptance Criteria:**

- ✓ Categories display "allocated" amount (sum of all allocations)
- ✓ Categories display "spent" amount (sum of expense transactions)
- ✓ Categories display "available" amount (allocated - spent)
- ✓ Overspending is clearly indicated (negative available balance in red)

**Status: COMPLETE**

---

### **Priority 5 – Moving Money Between Categories**

#### **US16 – API: Move Money Between Categories** ✓

**Story:**
As a user, I need to reassign money between categories when I overspend.

**Endpoint:**

- POST `/allocations/move/` - Transfer funds between categories

**Acceptance Criteria:**

- Decrease allocation in source category (creates negative allocation record)
- Increase allocation in target category (creates positive allocation record)
- Validates sufficient funds exist in source category
- Validates source and target categories are different
- Validates amount is positive
- Both operations are atomic (transaction-wrapped)
- Returns clear error messages for validation failures

**Status: COMPLETE**

---

#### **US17 – UI: Move Money Screen** ✓

**Story:**  
As a user, I need a simple UI to shift money between categories so I can “roll with the punches.”

**Acceptance Criteria:**

- UI entry point to move funds between categories
- Selection of source category, destination category, account, and amount
- Validation that source/target differ and amount does not exceed available funds
- Clear success/error feedback
- Budget balances refresh after moves

**Implementation Details:**

- Budget screen includes a Move Money CTA opening `MoveMoneyDialog`
- Dialog uses modal pickers with available-balance hints and client-side validation
- Backend move endpoint now guards against overdrawn categories (allocations - expenses) and returns descriptive errors
- Post-move refresh of category balances and allocations keeps UI in sync

**Status: COMPLETE**

---

### **Priority 6 – Nice-to-Have MVP Polish**

#### **US18 – Transaction History Screen** ✓

**Story:**  
As a user, I should be able to view past transactions for transparency.

**Acceptance Criteria:**

- List of all user transactions with type, category, account, description, and date
- Pull-to-refresh and loading states
- Empty state guidance
- Ability to delete a transaction with confirmation and state refresh
- Summary of income vs expenses

**Implementation Details:**

- Transactions tab renders history with color-coded amounts/icons and confirmation before deletes
- Summary card shows income, expense, and net totals
- Pull-to-refresh reloads transactions, accounts, categories, and balances
- Snackbar-driven error handling for API failures

**Status: COMPLETE**

---

#### **US19 – Basic Validation & Error States** ✓

**Implementation Highlights:**

- Backend transaction validation now enforces account ownership, positive amounts, required category for expenses, and prevents spending beyond category availability; move-money endpoint guards against overdrawing source categories
- Allocation validation ensures account/category belong to the authenticated user and amount is positive
- Frontend dialogs surface inline validation for missing fields, numeric amounts, and insufficient category funds, with helper text showing balances
- All screens use Snackbars for API errors and pull-to-refresh to recover from failed fetches

**Status: COMPLETE**

---

## 4. Summary

These tasks define a **minimum viable YNAB-like budgeting product**, allowing users to:

- Register and login with secure JWT authentication
- Create accounts
- Create categories
- Assign available dollars
- Track spending
- Move money between categories

The backlog is structured to allow **multiple team members to work in parallel**, separating backend, frontend, and feature verticals.

---

## 5. Current Progress

### Completed User Stories (22/22)
- ✓ US00a: Backend Authentication API
- ✓ US00b: Frontend Authentication Flow
- ✓ US01: Create Django Project
- ✓ US02: Data Models
- ✓ US03: CRUD API for Accounts
- ✓ US04: CRUD API for Categories
- ✓ US05: API to Assign Dollars to Categories
- ✓ US06: Create React + Redux + Expo Project
- ✓ US07: Redux Store Setup
- ✓ US07a: Frontend API Service Layer
- ✓ US08: Screen: View Accounts
- ✓ US09: Screen: Create Account
- ✓ US10: Screen: Add/Edit Budget Categories
- ✓ US11: Screen: Assign Funds to Budget Categories
- ✓ US12: Screen: View Category Balances
- ✓ US13: CRUD API for Transactions
- ✓ US15: Category Balance Calculation Logic
- ✓ US16: API: Move Money Between Categories
- ✓ US14: Screen: Add Transaction
- ✓ US17: UI: Move Money Screen
- ✓ US18: Transaction History Screen
- ✓ US19: Basic Validation & Error States

### Remaining User Stories (0/22)
- All MVP user stories are complete.

**Next Priority:** Polish/QA as needed; core MVP functionality is finished.
