# Subscription Tracker And User Management API

## Description
This project is a backend API built with **Express.js**, focusing on **user authentication**, **authorization**, and **subscription management**, with a strong emphasis on **security**. It integrates **Arcjet** for request protection, uses **JWT** for authentication, and **Mongoose** for data modeling.

---

## Features

### 🔐 User Authentication
* Sign-up with password hashing using **bcrypt**
* Sign-in with **JWT-based authentication**
* Sign-out functionality (pending full implementation)

### 👤 User Management
* Retrieve all users
* Retrieve a specific user by ID (excluding password)

### 📦 Subscription Management
* Create subscriptions
* Retrieve all subscriptions for a user
* Retrieve all subscriptions
* Retrieve a specific subscription by ID

### 🛡️ Security
* Request protection with **Arcjet** (rate limiting, bot detection, spoofed bot detection)
* **Authorization middleware** to protect routes

### ⚠️ Error Handling
* Centralized error handling middleware for consistent error responses

### 🗄️ Database
* **MongoDB** with **Mongoose** schema models

### ⚙️ Middleware
* **Cookie parser**
* Body parsing (`JSON` and `URL-encoded`)

### 🔁 Workflow
* **Upstash Workflow** for sending subscription renewal reminders

### ✉️ Email
* Reminder emails sent via `sendReminderEmail` utility

---

## 🧱 Technical Architecture

### 1. `app.js` (Entry Point)
* Sets up the Express.js server
* Connects to MongoDB
* Configures middleware:

  * `express.json()` and `express.urlencoded()` for parsing request bodies
  * `cookie-parser` for handling cookies
  * `arcjetMiddleware` for request protection
* Defines API routes:

  * `/api/v1/auth` – authentication endpoints
  * `/api/v1/users` – user management endpoints
  * `/api/v1/subscriptions` – subscription management endpoints
  * `/api/v1/workflows` – workflow endpoints
* Uses `errorMiddleware` for centralized error handling
* Starts the server on the specified port

### 2. Configuration
* `config/env.js`: Stores environment variables (PORT, JWT secret, etc.)
* `config/arcjet.js`: Configures the Arcjet client

### 3. Database
* `database/mongodb.js`: Connects to MongoDB using Mongoose

### 4. Models
* `models/user.model.js`: Mongoose schema for User (name, email, password)
* `models/subscription.model.js`: Mongoose schema for Subscription

### 5. Controllers
* `controllers/auth.controller.js`: Handles sign-up, sign-in, sign-out
* `controllers/user.controller.js`: Retrieves users and user by ID
* `controllers/subscriptions.controller.js`: Handles subscription CRUD operations

### 6. Routes
* `routes/auth.routes.js`: Routes for user authentication
* `routes/user.routes.js`: Routes for user management
* `routes/subscriptions.routes.js`: Routes for subscription management
* `routes/workflow.routes.js`: Routes for workflows

### 7. Middleware
* `middleware/error.middleware.js`: Formats and sends error responses
* `middleware/authorize.js`: Verifies JWT and attaches user to requests
* `middleware/arcjet.middleware.js`: Arcjet-based route protection

### 8. Workflows
* `workflows/subscriptions.workflow.js`: Defines Upstash Workflow for reminders

### 9. Utils
* `utils/send-email.js`: Sends reminder emails to users

---

## 📦 Dependencies
* `express`
* `mongoose`
* `bcryptjs`
* `jsonwebtoken`
* `cookie-parser`
* `@upstash/workflow`
* `dayjs`
* `@arcjet/client`
* `@arcjet/inspect`

---

## 🔒 Key Security Measures
* **Password Hashing:** Passwords are securely hashed with `bcrypt`
* **JWT Authentication:** Authenticated sessions use JSON Web Tokens
* **Authorization Middleware:** Validates JWTs and protects sensitive routes
* **Arcjet Protection:** Guards against bot traffic, spoofing, and rate abuse
* **Centralized Error Handling:** Ensures consistent error response formatting
* **Input Validation:** Mongoose schemas provide base validation
* **Least Privilege Principle:** Enforced by route-level authorization

---

## 🚀 Potential Improvements
* **Add Input Validation:** Use `Joi` or `express-validator` for advanced validation
* **Implement Refresh Tokens:** Improve security and UX for JWT sessions
* **Testing:** Add unit and integration tests with `Jest` or `Mocha`
* **API Documentation:** Generate docs using `Swagger` or `OpenAPI`
* **Logging:** Integrate `Winston` or `Morgan` for request logging
* **CORS Configuration:** Secure the API with proper origin policies
* **Rate Limiting:** Fine-tune Arcjet configurations
* **HTTPS in Production:** Enforce secure connections in live environments
* **Complete Sign-Out Functionality:** Finalize logout handling

---
