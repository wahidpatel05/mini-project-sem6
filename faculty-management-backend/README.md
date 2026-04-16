# Faculty Management System - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create .env File
Copy `.env.example` to `.env` and update with your MongoDB connection string:
```bash
cp .env.example .env
```

Update `.env`:
```
MONGODB_URI=mongodb://localhost:27017/faculty-management
PORT=5000
```

### 3. MongoDB Setup
Make sure MongoDB is installed and running locally, or use MongoDB Atlas:
```bash
# For local MongoDB (if installed)
mongod
```

For MongoDB Atlas:
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string
- Update `MONGODB_URI` in `.env` with your Atlas connection string

### 4. Run Backend
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/employee-login` - Employee login

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `POST /api/employees/:employeeId/tasks` - Add task to employee

## Sample Request Bodies

### Employee Login
```json
{
  "email": "e@e.com",
  "password": "123"
}
```

### Create Employee
```json
{
  "firstName": "John",
  "email": "john@example.com",
  "password": "123"
}
```

### Add Task
```json
{
  "active": true,
  "newTask": true,
  "completed": false,
  "failed": false,
  "taskTitle": "Update website",
  "taskDescription": "Revamp the homepage design",
  "taskDate": "2024-10-12",
  "category": "Design"
}
```
