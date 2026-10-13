# Velum Production Deployment Guide

This guide walks you through deploying **Velum (Real-Time Collaborative Document Studio)** to production using:
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free Tier M0)
- **Backend & WebSockets**: [Render](https://render.com) (Free Tier Web Service)
- **Frontend SPA**: [Vercel](https://vercel.com) (Free Tier Vite Hosting)

---

## Architecture Overview

```mermaid
flowchart LR
    Browser["Collaborator Browsers"] -->|HTTPS / REST| Vercel["Vercel (Client SPA)"]
    Browser -->|WSS (WebSockets)| Render["Render (Node.js + ws)"]
    Browser -->|REST (JWT Auth / Docs)| Render
    Render -->|Mongoose Driver| Mongo[("MongoDB Atlas (M0 Cluster)")]
```

---

## Step 1: Set Up MongoDB Atlas (Free Cloud Database)

1. **Sign Up / Log In**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. **Create a Cluster**:
   - Click **Create Deployment** or **Build a Database**.
   - Select the **M0 Free (Shared)** tier.
   - Choose a cloud provider and region closest to you (e.g., AWS / Frankfurt or N. Virginia).
   - Name your cluster (e.g., `Cluster0`) and click **Create Deployment**.
3. **Set Up Security & Credentials**:
   - **Database User**: Create a username (e.g., `velum_admin`) and a secure password. **Copy this password down.**
   - **Network Access**: Click **Network Access** in the left sidebar -> **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`).
     > *Why `0.0.0.0/0`?* Render allocates dynamic outbound IP addresses, so Atlas needs to allow incoming traffic from any IP.
4. **Copy the Connection String**:
   - Under **Database Deployments**, click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the URI, which looks like:
     ```text
     mongodb+srv://velum_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your real password, and append `/velum` before the `?` query:
     ```text
     mongodb+srv://velum_admin:YourRealPassword123@cluster0.xxxxx.mongodb.net/velum?retryWrites=true&w=majority
     ```

---

## Step 2: Deploy Backend to Render

Velum runs an in-memory Yjs CRDT room manager over persistent WebSockets (`ws`), which requires a long-running Node.js process (provided by Render).

### Option A: Using the Blueprint (Fastest)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "chore: configure render deployment and health checks"
   git push origin main
   ```
2. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Blueprint**.
3. Select your repository: `dharshanprogrammer/velum-collaborative-editor`.
4. Render will detect [render.yaml](file:///d:/Projects/Full%20Stack%20Lab%20Project/render.yaml).
5. When prompted for environment variables:
   - `MONGODB_URI`: Paste your MongoDB Atlas connection string from Step 1.
   - `CLIENT_URL`: Enter a placeholder like `https://localhost:5173` (you will update this in Step 4 once Vercel gives you your frontend URL).
   - `JWT_SECRET`: Leave as auto-generated or paste a 32+ character random string.
6. Click **Apply**.

### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `velum-server`
   - **Region**: Same region as your MongoDB cluster
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb+srv://...` (from Step 1) |
   | `JWT_SECRET` | A strong 32-character secret |
   | `CLIENT_URL` | `https://your-app.vercel.app` (or temporary URL) |
5. Click **Create Web Service**.
6. Once deployed and healthy, copy your Render service URL:
   `https://velum-server-xxxx.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and log in with GitHub.
2. Select and import `dharshanprogrammer/velum-collaborative-editor`.
3. In the **Configure Project** screen:
   - **Project Name**: `velum` (or custom name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `client` *(⚠️ Crucial: do not leave this as root!)*
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://velum-server-xxxx.onrender.com` |
   | `VITE_WS_URL` | `wss://velum-server-xxxx.onrender.com` |
5. Click **Deploy**.
6. In ~60 seconds, your frontend will be live on Vercel at:
   `https://velum-xxxx.vercel.app`

---

## Step 4: Link Frontend & Backend

1. Copy your live Vercel URL (e.g. `https://velum-xxxx.vercel.app`).
2. Go back to your [Render Dashboard](https://dashboard.render.com).
3. Open your `velum-server` service -> **Environment**.
4. Update `CLIENT_URL` to match your Vercel URL:
   ```text
   CLIENT_URL=https://velum-xxxx.vercel.app
   ```
5. Click **Save Changes** (Render will automatically trigger a redeploy).

---

## Step 5: Verification Checklist

- [ ] Visit `https://velum-server-xxxx.onrender.com/health` in your browser. You should see `{"status":"ok","service":"velum-server",...}`.
- [ ] Open your live Vercel app. Register a new user account.
- [ ] Create a document in the dashboard and open it in the editor.
- [ ] Open the same document URL in a second private/incognito window.
- [ ] Verify that real-time typing, remote cursors, status pill ("Saved"), comments, and presence indicators synchronize across tabs instantly.
