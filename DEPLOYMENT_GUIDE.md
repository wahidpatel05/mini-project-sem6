# Comprehensive Deployment Guide 🚀 (Monorepo Setup)

Yes, keeping all three folders (aculty-management-frontend, aculty-management-backend, and 	ask-recommendation-model) in **one single GitHub repository** is perfectly fine! This is called a **monorepo**. 

Both Render and Vercel support this natively. You just need to tell them which **"Root Directory"** to look at when deploying.

---

## 🟢 Step 1: Deploying the Machine Learning Microservice (Render)
1. Create a free account on [Render](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your single GitHub repository.
4. **Configuration Details**:
    - **Name**: aculty-ml-service (or similar)
    - **Root Directory**: 	ask-recommendation-model  ← *(Crucial! This tells Render to only run the Python code)*
    - **Environment**: Python 3
    - **Build Command**: pip install -r requirements.txt
    - **Start Command**: gunicorn app:app
    - **Instance Type**: Free
5. Click **Create Web Service**. Wait for it to build.
6. **Copy the public URL** Render gives you (e.g., https://faculty-ml-service.onrender.com). You will need it for Step 2.

---

## 🔵 Step 2: Deploying the Node.js Backend (Render)
1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service** again.
3. Connect the **exact same** GitHub repository.
4. **Configuration Details**:
    - **Name**: aculty-backend-service (or similar)
    - **Root Directory**: aculty-management-backend  ← *(Crucial! This tells Render to only run the Node.js code)*
    - **Environment**: Node
    - **Build Command**: 
pm install
    - **Start Command**: 
ode server.js
    - **Instance Type**: Free
5. Navigate down to **Environment Variables** and add the following:
    - PORT = 5000
    - MONGO_URI = mongodb+srv://<username>:<password>@cluster.mongodb.net/your_db *(Your valid Atlas URI)*
    - JWT_SECRET = <some_super_secret_string_here>
    - EMAIL_USER & EMAIL_PASS *(If using Nodemailer)*
    - **ML_API_URL** = https://faculty-ml-service.onrender.com *(The URL you copied from Step 1!)*
    - FRONTEND_URL = *(Leave blank for now, you will fill this in after Step 3)*
6. Click **Create Web Service**. Wait for the build.
7. **Copy this Backend URL**. You will need it for Step 3.

---

## 🟡 Step 3: Deploying the React Frontend (Vercel)
Vercel is the fastest way to deploy a React (Vite) application.

1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import the **exact same** GitHub repository.
3. During setup, look for **Root Directory**. Click **Edit** and select aculty-management-frontend.
4. **Configuration Details**:
    - **Framework Preset**: Auto-detected as Vite.
5. Under **Environment Variables**, add:
    - VITE_API_URL = https://faculty-backend-service.onrender.com *(The Backend URL you copied from Step 2!)*
6. Click **Deploy**.
7. Vercel will give you a public domain (e.g., https://faculty-system-ui.vercel.app).
8. **Final Linkup**: Go back to your Backend on Render, and set FRONTEND_URL = https://faculty-system-ui.vercel.app in the backend environment variables to ensure CORS policies allow the connection.
