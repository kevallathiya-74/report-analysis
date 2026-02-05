# Clinical Report Analyzer - Deployment Guide

## 🚀 Deploy to Render (Recommended - FREE)

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Initialize git in your project folder:

```bash
cd "d:\c-user-patani sezan\Desktop\New folder"
git init
git add .
git commit -m "Initial commit - Clinical Report Analyzer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clinical-analyzer.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `clinical-report-analyzer`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: `Free`
5. Click **"Create Web Service"**
6. Wait 2-3 minutes for deployment
7. Your app will be live at: `https://clinical-report-analyzer.onrender.com`

---

## 🐍 Deploy to PythonAnywhere (Alternative)

1. Go to [pythonanywhere.com](https://www.pythonanywhere.com) and sign up
2. Go to **"Web"** tab → **"Add a new web app"**
3. Choose **"Flask"** and **Python 3.10**
4. Upload your files to `/home/yourusername/mysite/`
5. Install requirements in bash console:
   ```bash
   pip install --user -r requirements.txt
   ```
6. Configure WSGI file to point to your `app.py`
7. Reload the web app
8. Your app will be live at: `https://yourusername.pythonanywhere.com`

---

## 🚂 Deploy to Railway (Alternative)

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects Flask and deploys
5. Your app will be live with a generated URL

---

## 📦 Files Added for Deployment

- ✅ `Procfile` - Tells hosting platform how to run the app
- ✅ `runtime.txt` - Specifies Python version
- ✅ `requirements.txt` - Updated with gunicorn (production server)
- ✅ `app.py` - Modified to use PORT environment variable

---

## 🔒 Important Notes

- Free tier on Render sleeps after 15 min of inactivity (wakes up on first request)
- PythonAnywhere has daily quota limits on free tier
- Railway gives $5 credit/month on free tier

---

## ✅ Your app is now deployment-ready!

Choose your preferred platform and follow the steps above.
