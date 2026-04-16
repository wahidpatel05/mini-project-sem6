# Comprehensive Deployment Guide 🚀

Deploying this Faculty Management System requires three isolated steps because we are essentially deploying three separate services:
1. **The Machine Learning API (Python)**
2. **The Backend Web Service (Node.js)**
3. **The Frontend User Interface (React.js)**

We will use **Render** for the heavy backend/ML services, and **Vercel** for the high-speed frontend. All of them provide a liberal free tier perfectly suitable for a 6th Semester Mini Project.

---

## 🟢 Step 1: Deploying the Machine Learning Microservice (Render)

Because standard hosting environments (like Vercel) prohibit mixed Node.js and heavy Python integrations, you must isolate the ML logic. We've written a Flask wrapper inside `task-recommendation-model/app.py` for this exact purpose.

1. Create a free account on [Render](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository containing this exact project.
4. **Configuration Details**:
    - **Name**: `faculty-ml-service` (or similar)
    - **Root Directory**: `task-recommendation-model`  ← *(Crucial! Render needs to look inside this specific folder)*
    - **Environment**: `Python 3`
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `gunicorn app:app` (This starts the new `app.py` we built for you).
    - **Instance Type**: `Free`
5. Click **Create Web Service**. Wait 5-10 minutes.
6. Once deployed, Render will give you a public URL (e.g., `https://faculty-ml-service.onrender.com`).
7. **Copy this URL**. You will need it for the Node.js Backend.

---

## 🔵 Step 2: Deploying the Node.js Backend (Render)

We can also deploy the backend to Render because it handles persistent WebSocket (Socket.io) connections flawlessly.

1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect the same GitHub repository.
4. **Configuration Details**:
    - **Name**: `faculty-backend-service` (or similar)
    - **Root Directory**: `faculty-management-backend`  ← *(Crucial!)*
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
    - **Instance Type**: `Free`
5. Navigate down to **Environment Variables** and add the following:
    - `PORT` = `5000`
    - `MONGO_URI` = `mongodb+srv://<username>:<password>@cluster.mongodb.net/your_db` *(Your valid Atlas URI)*
    - `JWT_SECRET` = `some_super_secret_string_here`
    - `FRONTEND_URL` = *(We will add this in Step 3, leave blank or put `*` for now)*
    - `EMAIL_USER` & `EMAIL_PASS` (If using Nodemailer)
    - **`ML_API_URL`** = `https://faculty-ml-service.onrender.com` *(The URL you got from Step 1!)*
6. Click **Create Web Service**.
7. Test it by visiting: `https://faculty-backend-service.onrender.com/api/test_path`. You should get a valid JSON response.
8. **Copy this Backend URL**. You will need it for the Frontend.

---

## 🟡 Step 3: Deploying the React Frontend (Vercel)

Vercel is the easiest and fastest way to deploy a Vite + React application.

1. Create a free account on [Vercel](https://vercel.com).
2. Click **Add New Project**.
3. Import your GitHub repository.
4. **Configuration Details**:
    - **Project Name**: `faculty-system-ui` (or similar).
    - **Framework Preset**: `Vite` (Vercel usually autodetects this).
    - **Root Directory**: Click "Edit" and choose `faculty-management-frontend`.
5. Under **Environment Variables**, add:
    - `VITE_API_URL` = `https://faculty-backend-service.onrender.com` *(The URL you got from Step 2!)*
6. Click **Deploy**.
7. Vercel will process your build and give you a public domain (e.g., `https://faculty-system-ui.vercel.app`).
8. **Final Linkup**: Take this Vercel URL, go back to your Backend on Render, and set `FRONTEND_URL = https://faculty-system-ui.vercel.app` in the backend environment variables to ensure CORS policies allow the connection.

---

### 🔥 Important Fix Before You Start This Guide

Before deploying Step 2, you **must configure** `mlRecommendationHelper.js` in the backend to stop calling `child_process.spawn("python")` and instead make an HTTP request to your new ML microservice using Axios or Fetch.

*If you want me to update `mlRecommendationHelper.js` to do this for you right now, just say **"Yes, configure the backend to use the ML API."*** 