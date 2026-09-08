# 🚀 Deployment Guide

**Architecture:** Frontend on Netlify · Backend on Render · Database on MongoDB Atlas.

## Prerequisites

- GitHub repository
- Netlify account
- Render account
- MongoDB Atlas cluster

---

## 1. MongoDB Atlas

1. In **Database Access**, create (or reuse) a database user and note the password.
2. In **Network Access**, add `0.0.0.0/0` so Render can connect.
3. Copy the connection string:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/sahay?retryWrites=true&w=majority`

> Never commit this string. It goes only into environment variables.

---

## 2. Backend → Render

1. **New +** → **Web Service** → connect the GitHub repo.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
3. **Environment variables:**

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `ALLOWED_ORIGINS` | your Netlify URL, e.g. `https://your-site.netlify.app` |

   (`PORT` is provided by Render automatically.)
4. **Create Web Service.** Note the URL, e.g. `https://sahay-backend.onrender.com`.

`server/render.yaml` is included so you can also use Render Blueprints.

---

## 3. Frontend → Netlify

1. **Add new site** → **Import from Git** → select the repo.
2. Build settings (also in `client/netlify.toml`):
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/build`
3. **Environment variables:**

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | your Render backend URL |
4. **Deploy.**

---

## 4. Connect the two

After the Netlify URL is known, make sure it is in Render's `ALLOWED_ORIGINS`
(add multiple comma-separated if you have preview domains), then redeploy the
backend.

---

## Verify

1. Open the Netlify site.
2. Register a user, then log in.
3. The **System Connectivity Test** on the dashboard should show both
   *Backend Server* and *Database* as connected.
4. Add a clinic and confirm it appears in the list.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Backend won't start | `MONGO_URI` or `JWT_SECRET` missing — check Render env vars |
| CORS error in browser console | Netlify URL not in `ALLOWED_ORIGINS`; redeploy backend after adding |
| Login works but adding a clinic returns 401 | `JWT_SECRET` differs between deploys, or token expired (1h) — log in again |
| Atlas connection timeout | Network Access missing `0.0.0.0/0` |
| First request after idle is slow | Render free tier cold start (~30s) |
