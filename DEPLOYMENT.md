# 🚀 Sahay - Dual Deployment Guide (Netlify + Render)

## 📋 Prerequisites
- GitHub account
- Netlify account (free)
- MongoDB Atlas account (already set up)

## 🎯 Deployment Options

You have **TWO deployment options**:

### 🎯 Option 1: Netlify Only (Frontend + Serverless Backend)
- **Frontend**: Netlify
- **Backend**: Netlify Functions (serverless)
- **Database**: MongoDB Atlas

### 🎯 Option 2: Dual Platform (Recommended)
- **Frontend**: Netlify
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## 🚀 Option 1: Netlify Only Deployment

### 1. Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Netlify deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sahay.git
git push -u origin main
```

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify UI
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Choose GitHub and select your `sahay` repository
4. Configure build settings:
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
5. Click "Deploy site"

#### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from client directory
cd client
netlify deploy --prod
```

### 3. Configure Environment Variables

In your Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add these variables:
   ```
   MONGO_URI=mongodb+srv://aditya123:aditya123@cluster0.pirxh3j.mongodb.net/sahay?retryWrites=true&w=majority
   JWT_SECRET=sahay_jwt_secret_key_2024
   NODE_ENV=production
   REACT_APP_USE_RENDER=false
   ```

---

## 🚀 Option 2: Dual Platform Deployment (Recommended)

### Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `sahay-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. **Add Environment Variables:**
   ```
   MONGO_URI=mongodb+srv://aditya123:aditya123@cluster0.pirxh3j.mongodb.net/sahay?retryWrites=true&w=majority
   JWT_SECRET=sahay_jwt_secret_key_2024
   NODE_ENV=production
   PORT=10000
   ```

6. **Click "Create Web Service"**

### Step 2: Deploy Frontend to Netlify

1. **Go to [netlify.com](https://netlify.com)** and sign up/login
2. **Click "New site from Git"**
3. **Choose GitHub and select your `sahay` repository**
4. **Configure build settings:**
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
5. **Click "Deploy site"**

6. **Add Environment Variables:**
   ```
   REACT_APP_USE_RENDER=true
   NODE_ENV=production
   ```

### Step 3: Update CORS Settings

Update the CORS origins in `server/index.js` with your actual Netlify URL:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://YOUR_NETLIFY_SITE_NAME.netlify.app',
  'https://YOUR_NETLIFY_SITE_NAME.netlify.app/'
];
```

### 4. Redeploy

After setting environment variables:
1. Go to Netlify dashboard
2. Click "Trigger deploy" → "Deploy site"

---

## 🔧 Project Structure

```
sahay/
├── client/                    # Frontend (React)
│   ├── netlify/
│   │   └── functions/
│   │       └── api.js        # Serverless backend (Option 1)
│   ├── src/
│   │   └── components/       # React components
│   ├── netlify.toml         # Netlify config
│   └── package.json
├── server/                   # Backend (Option 2)
│   ├── render.yaml          # Render config
│   └── package.json
└── DEPLOYMENT.md
```

## 🌐 Your Live Sites

### Option 1: Netlify Only
- **Frontend**: `https://YOUR_SITE_NAME.netlify.app`
- **Backend**: Serverless functions (built into Netlify)

### Option 2: Dual Platform
- **Frontend**: `https://YOUR_SITE_NAME.netlify.app`
- **Backend**: `https://sahay-backend.onrender.com`

## 🧪 Testing the Deployment

### Option 1: Netlify Only
1. **Frontend**: Visit your Netlify URL
2. **Backend**: The connectivity test will show if the serverless function is working
3. **Database**: Login and check if clinics are loading

### Option 2: Dual Platform
1. **Frontend**: Visit your Netlify URL
2. **Backend**: The connectivity test will show if the Render backend is working
3. **Database**: Login and check if clinics are loading

## 🔍 Troubleshooting

### Common Issues:

1. **Build fails**: Check if all dependencies are in `client/package.json`
2. **API not working**: Verify environment variables are set correctly
3. **CORS errors**: Update the CORS origin with your actual Netlify URL
4. **Database connection**: Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Debug Commands:
```bash
# Test local build
cd client
npm run build

# Test serverless function locally
netlify dev
```

## 📱 Features After Deployment

### Option 1: Netlify Only
✅ **Full-stack application** running on Netlify  
✅ **Serverless backend** with MongoDB Atlas  
✅ **User authentication** with JWT  
✅ **Clinic management** (add, view, delete, search)  
✅ **Responsive design** for all devices  
✅ **Real-time connectivity testing**  

### Option 2: Dual Platform
✅ **Frontend** running on Netlify  
✅ **Backend API** running on Render  
✅ **MongoDB Atlas** database  
✅ **User authentication** with JWT  
✅ **Clinic management** (add, view, delete, search)  
✅ **Responsive design** for all devices  
✅ **Real-time connectivity testing**  

## 🎯 Which Option to Choose?

- **Option 1 (Netlify Only)**: Simpler setup, everything in one place
- **Option 2 (Dual Platform)**: Better performance, more scalable, recommended for production

## 🎉 Success!

Your Sahay application is now live and ready to help communities find healthcare clinics! 