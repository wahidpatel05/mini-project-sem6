# Faculty Management System (EMS) 🚀
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Node](https://img.shields.io/badge/node->=20.0.0-brightgreen.svg) ![React](https://img.shields.io/badge/react-18.x-cyan.svg) ![Python](https://img.shields.io/badge/python-3.8+-yellow.svg)

A comprehensive, full-stack **Faculty/Employee Management System** designed to streamline administrative tasks, manage employee workflows, and intelligently recommend tasks using Machine Learning.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features (A to Z)](#-key-features-a-to-z)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Installation & Setup](#-installation--setup)
6. [Machine Learning Integration](#-machine-learning-integration)
7. [API Endpoints Reference](#-api-endpoints-reference)
8. [Authors & Acknowledgments](#-authors--acknowledgments)

---

## 📖 Project Overview

The Faculty Management System is a robust web application built to help administrators manage staff/faculty, assign tasks, track performance metrics, and automate workflows. 

Unique to this system is an integrated **Machine Learning Task Recommendation Engine** that calculates an intelligent "Suitability Score" for each employee for a given task, based on their historical performance and task categories.

## ✨ Key Features (A to Z)

### Administrator Dashboard
- **A**dmin Task View: Centralized view of all tasks assigned across the organization.
- **C**reate Employees: Seamlessly onboard new faculty/staff with automated credentials.
- **C**reate Tasks: Assign detailed tasks with categories (e.g., Development, Design, Review) and deadlines.
- **D**elete Employees: Securely remove employee records.
- **E**dit Employees: Update employee profiles and information dynamically.
- **R**eports & Analytics: Visual dashboard displaying organizational metrics, completion rates, and performance statistics.
- **T**ask Recommendation (ML/Rule-based): Recommends the best-fit employee for a specific task using a hybrid Rule-based and Random Forest ML model.

### Employee/Faculty Dashboard
- **A**ccept Tasks: Employees can explicitly mark tasks as accepted/active.
- **C**omplete Tasks: Mark tasks as successfully finished to improve performance metrics.
- **F**ail Tasks: Report unsuccessful tasks (feeds back into the ML model for future routing).
- **M**y Tasks View: Employees have a personalized Kanban-style view of New, Active, Completed, and Failed tasks.
- **N**otifications: Live updates and notifications for newly assigned tasks.
- **P**rofile Management: Employees can view their stats and update passwords.

### System & Security
- **A**uthentication: Secure JWT-based login for both Admins and Employees.
- **A**uthorization: Role-based access control (RBAC) ensuring employees cannot access admin routes.
- **E**mail Service: Automated email notifications for account creation, task assignments, and password resets.
- **F**ile Uploads: Support for attachments using Multer (e.g., profile pictures, task documents).

---

## 🛠 Tech Stack

**Frontend (Client)**
* React.js (Vite)
* Context API (State Management)
* Tailwind CSS (Styling)

**Backend (Server)**
* Node.js & Express.js
* MongoDB & Mongoose (Database)
* JSON Web Tokens (JWT Authentication)
* Nodemailer (Email Service)
* Multer (File Uploads)

**Machine Learning Engine**
* Python 3
* Scikit-Learn (Random Forest Classifier)
* Pandas & NumPy (Data Processing)
* Joblib (Model Serialization)

---

## 📁 Project Structure

The repository is organized into three distinct micro-environments:

```text
├── faculty-management-backend/    # Node.js/Express Server & API
│   ├── config/                    # Database configuration
│   ├── controllers/               # Route logic (Auth, Employees)
│   ├── middleware/                # JWT Auth, File Uploads
│   ├── models/                    # Mongoose Data Models
│   ├── routes/                    # API Route Definitions
│   └── utils/                     # ML Helpers, Email Services, Analytics
│
├── faculty-management-frontend/   # React/Vite Client Application
│   ├── src/
│   │   ├── components/            # React UI Components (Dashboards, Auth)
│   │   ├── context/               # Global Auth Provider
│   │   └── utils/                 # API connection services
│
└── task-recommendation-model/     # Python ML Engine
    ├── 1_generate_dataset.py      # Synthetic data generator
    ├── 2_train_model.py           # Random Forest training script
    ├── predict_single.py          # Prediction script called by Node.js
    └── model/                     # Serialized .pkl files
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v20+ recommended)
- Python 3.8+
- MongoDB (Running locally or MongoDB Atlas)

### 1. Backend Setup
```bash
cd faculty-management-backend
npm install

# Create environment variable file
cp .env.example .env
# Edit .env and supply values: MONGODB_URI, PORT=5000, JWT_SECRET, etc.

# Start the server (runs on port 5000)
npm run dev
```

### 2. Machine Learning Setup
```bash
cd task-recommendation-model
# Create and activate a virtual environment (recommended)
python -m venv .env
call .env/Scripts/activate # Windows
# source .env/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Train the initial machine learning model
python 2_train_model.py
```

### 3. Frontend Setup
```bash
cd faculty-management-frontend
npm install

# Create environment variable file
cp .env.example .env
# Edit .env and supply: VITE_API_URL=http://localhost:5000/api

# Start the client (runs on port 5173)
npm run dev
```

---

## 🧠 Machine Learning Integration

The system implements an intelligent task routing system. When an Admin creates a new task, the application evaluates all employees to recommend the physical best fit.

**How it works:**
1. **Node.js Initialization**: The backend calculates live metrics (completion rates, task load) for all employees.
2. **Python Bridge**: Node triggers `child_process.spawn` to execute `predict_single.py`.
3. **Model Inference**: The Random Forest model evaluates the data against the trained `.pkl` binary.
4. **Fallback Mechanism**: If the python process times out or fails, the backend seamlessly falls back to a deterministic **Rule-Based Algorithm** to ensure zero downtime.
5. **Return**: The UI highlights the topmost suitable employees.

---

## 🔌 API Endpoints Reference

### Authentication
- `POST /api/auth/admin-login` - Admin authentication
- `POST /api/auth/employee-login` - Employee authentication

### Employee Management
- `GET /api/employees` - Retrieve all employees (Admin)
- `POST /api/employees` - Create new employee account (Admin)
- `PUT /api/employees/:id` - Update details (Admin)
- `DELETE /api/employees/:id` - Remove employee (Admin)

### Task Management
- `POST /api/employees/:employeeId/tasks` - Assign a specific task
- `PUT /api/employees/tasks/:taskId/status` - Update task status (Active, Completed, Failed)
- `GET /api/employees/recommendations/task` - Get ML task suitability scores for all physical employees based on task parameters.

---
*Created for Semester 6 Mini Project*