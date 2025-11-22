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
- Authentication handled via Django session or token-based auth

Deployment and unit testing are not required at this stage.

---

## 3. User Stories (Ordered by Priority)

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

#### **US06 – Create React + Redux + Expo Project**

**Story:**  
As a developer, I need the frontend project created so I can start building UI screens.

**Tasks:**

- Initialize Expo app
- Install React + Redux
- Set up basic file structure

---

#### **US07 – Redux Store Setup**

**Story:**  
As a developer, I need application state stored in Redux so data can be shared across the app.

**Acceptance Criteria:**

- Store initialized
- Slices/modules for accounts, categories, and transactions
- Thunks for API calls

---

#### **US08 – Screen: View Accounts**

**Story:**  
As a user, I need to view all my accounts so I can see how much total money I have to budget.

**Features:**

- Fetch accounts from backend
- Display balances

---

#### **US09 – Screen: Create Account**

**Story:**  
As a user, I need a form to add a new account so I can start budgeting.

---

#### **US10 – Screen: Add/Edit Budget Categories**

**Story:**  
As a user, I need to create categories so I can organize my spending.

---

### **Priority 3 – Budget Allocation & Real-Time Balances**

#### **US11 – Screen: Assign Funds to Budget Categories**

**Story:**  
As a user, I need a screen where I see my available money and assign dollars to categories.

**Acceptance Criteria:**

- Shows “available to budget” total
- Lets user allocate funds
- Posts to backend via Redux

---

#### **US12 – Screen: View Category Balances**

**Story:**  
As a user, I need to see how much I have left in each category so I know what I can spend.

---

### **Priority 4 – Spending & Overspending Adjustments**

#### **US13 – CRUD API for Transactions**

**Story:**  
As a user, I need to enter spending transactions so the app reflects my actual spending.

**Endpoints:**

- Add transaction
- List transactions
- Delete transaction

---

#### **US14 – Screen: Add Transaction**

**Story:**  
As a user, I need to log spending or income so the system stays up to date.

---

#### **US15 – Automatic Updating of Category Balances**

**Story:**  
As a user, when I add a transaction, the category balance should decrease automatically so spending is tracked properly.

---

### **Priority 5 – Moving Money Between Categories**

#### **US16 – API: Move Money Between Categories**

**Story:**  
As a user, I need to reassign money between categories when I overspend.

**Acceptance Criteria:**

- Decrease allocation in source category
- Increase allocation in target category
- Store change in backend

---

#### **US17 – UI: Move Money Screen**

**Story:**  
As a user, I need a simple UI to shift money between categories so I can “roll with the punches.”

---

### **Priority 6 – Nice-to-Have MVP Polish**

#### **US18 – Transaction History Screen**

**Story:**  
As a user, I should be able to view past transactions for transparency.

---

#### **US19 – Basic Validation & Error States**

Examples:

- No negative balances unless reassigned
- Categories required
- Account required

---

## 4. Summary

These tasks define a **minimum viable YNAB-like budgeting product**, allowing users to:

- Create accounts
- Create categories
- Assign available dollars
- Track spending
- Move money between categories

The backlog is structured to allow **multiple team members to work in parallel**, separating backend, frontend, and feature verticals.
