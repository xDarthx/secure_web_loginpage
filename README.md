# Secure Login App with MFA
## About This Project

This application was developed as a cybersecurity project to demonstrate secure authentication. The goal was to build a full-stack application with a robust sign-up and log-in system. Security was the top priority: all personal information is encrypted, and passwords are secured using hashing and salting.

### Tech Stack
* **Frontend:** React & JavaScript
* **Backend:** Node.js with Express API
* **Database:** MySQL (managed via phpMyAdmin)

### Key Features
The application delivers a fluid and secure user experience, featuring **Multi-Factor Authentication (MFA)** via Google Authenticator for password resets.

> **Note:** AI assistance (Google Gemini) was utilized for CSS styling and as a coding partner for the Node.js server implementation.
## Prerequisites

Before running this project, ensure you have the following installed:
* **Node.js** (v18 or higher)
* **MySQL Server**

## Project Structure

* `frontEnd/`: React application (Vite)
* `backEnd/`: Node.js/Express API

---

## Setup Instructions

### 1. Database Setup

You must create the local database before running the backend.

1.  Open your MySQL terminal or Workbench.
2.  Run the following SQL commands to create the database and table:

```sql
CREATE DATABASE IF NOT EXISTS crud;
USE crud;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Ensure the root user has access (Adjust if your root user has a password)
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

### 2. Backend Setup

1.  Open a terminal and navigate to the backend folder:
    ```bash
    cd backEnd
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node server.js
    ```
    *You should see: `Server running on http://localhost:8081` and `Connected to MySQL database`.*

### 3. Frontend Setup

1.  Open a **new** terminal window and navigate to the frontend folder:
    ```bash
    cd frontEnd
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React app:
    ```bash
    npm run dev
    ```
4.  Open the link provided (usually `http://localhost:5173`) in your browser.

---

## Features

* **Sign Up:** Create a new account (hashes password with bcrypt).
* **Log In:** Secure login validation.
* **Forgot Password:**
    1.  Enter Email.
    2.  Receive a unique QR Code (generated via external MFA API).
    3.  Scan with **Google Authenticator**.
    4.  Enter the 6-digit code to verify identity.
    5.  Reset password securely.
