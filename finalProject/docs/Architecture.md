# App Architecture Overview

Concise map of the stack, navigation, and data model for the budgeting app.

## Frontend (Expo + React Native + Expo Router)
- Stack: Expo Router, React Native Paper UI kit, Redux Toolkit for global state, Axios for API calls stored in `frontend/services/api.ts`.
- Navigation: 
  - `(landing)` stack for the marketing page.
  - `(auth)` stack for `login` and `register` screens.
  - `(app)` tab navigator for authenticated features: dashboard (`index`), accounts, budget, and transactions.
- State: `frontend/store` holds slices for `auth`, `accounts`, `categories`, `allocations`, and `transactions`; thunk actions hit the REST API and cache JWTs in `AsyncStorage`.
- Theming/Layout: Global theme in `frontend/theme`, shared UI pieces in `frontend/components` (e.g., landing hero/feature sections, budget dashboard cards).

### Key Screens
- Landing: `frontend/app/(landing)/index.tsx` shows hero, feature list, how-it-works, and CTA to register/login.
- Auth: `frontend/app/(auth)/(login|register).tsx` collect credentials, handle validation, and store tokens.
- Dashboard: `frontend/app/(app)/index.tsx` renders `BudgetHealthDashboard` with category health cards and logout FAB.
- Accounts: `frontend/app/(app)/accounts.tsx` lists accounts, supports create/update/delete via `accountsAPI`.
- Budget: `frontend/app/(app)/budget.tsx` shows allocations per category and supports allocating/moving money via `allocationsAPI`.
- Transactions: `frontend/app/(app)/transactions.tsx` lists and creates income/expense entries and allows deletion.

## Backend (Django + DRF + JWT)
- Stack: Django REST Framework app `budget`, JWT auth via `rest_framework_simplejwt`.
- Routing: `backend/budget/urls.py` exposes `/api/*` resources: `accounts`, `categories`, `allocations`, `transactions`, plus auth endpoints (`/auth/register/`, `/auth/login/`, `/auth/token/refresh/`, `/auth/me/`).
- Auth flow: Register/Login issue refresh+access tokens; `api.ts` interceptor refreshes tokens on 401 and attaches `Authorization: Bearer <access>` to requests.
- Permissions: All resource viewsets require authentication and scope queries to `request.user`; create/update/delete guarded by serializer validation to prevent cross-user access.
- Business rules (in `serializers.py` and `views.py`):
  - Allocations validate available-to-budget (sum of account balances – allocated + spent) and block negatives.
  - Transactions require valid account ownership; expenses require a category; balances update the linked account on create/delete.
  - Category balances endpoint aggregates allocated/spent/available for dashboard charts.
  - Move money action shifts allocation between categories with atomic checks and dual allocations (+/-).

## Data Model (PostgreSQL/SQLite via Django ORM)
Located in `backend/budget/models.py`.

| Table | Key Fields | Notes |
| --- | --- | --- |
| `Account` | `user(FK)`, `name`, `balance`, timestamps | Balance updated when transactions are created/deleted. |
| `Category` | `user(FK)`, `name`, `created_at` | User-scoped budget categories. |
| `BudgetAllocation` | `category(FK)`, `account(FK)`, `amount`, `allocated_at` | Positive/negative amounts track allocations and moves. |
| `Transaction` | `user(FK)`, `category(FK, nullable for income)`, `account(FK)`, `transaction_type` (`income`/`expense`), `amount`, `description`, `date` | Adjusts account balance; used for spend calculations. |
| `User` | Django auth user | Linked to all other tables. |

### Derived Views & Calculations
- Category balances: allocated = sum of allocations; spent = sum of expense transactions; available = allocated – spent.
- Available to budget: total account balances – total allocated + total spent; used to gate new allocations.

## Data Flow (end-to-end)
- UI actions dispatch Redux thunks → Axios calls to `/api/...`.
- DRF authenticates JWT, enforces per-user querysets, runs validators, and returns serialized JSON.
- Redux slices store entities and errors; screens render lists/cards and modals using the shared theme.

This outline stays under two pages and should give new contributors enough context to navigate both stacks quickly.
