# 🚀 Deploy AGC Global Express to Railway (FREE)

Railway gives you a live URL like: https://agc-global-express.up.railway.app

---

## OPTION A — Deploy via GitHub (Recommended, takes 5 minutes)

### Step 1: Create a GitHub account
Go to https://github.com and sign up (free).

### Step 2: Create a new repository
1. Click the **+** button → **New repository**
2. Name it: `agc-global-express`
3. Set to **Public**
4. Click **Create repository**

### Step 3: Upload your files
On the repository page, click **uploading an existing file**
- Drag and drop ALL files from the extracted ZIP folder
- Make sure to upload ALL files including: server.js, package.json, Procfile, public/ folder, data/ folder
- Click **Commit changes**

### Step 4: Deploy on Railway
1. Go to https://railway.app
2. Click **Start a New Project**
3. Click **Deploy from GitHub repo**
4. Sign in with your GitHub account
5. Select your `agc-global-express` repository
6. Railway auto-detects Node.js and deploys!
7. Click **Generate Domain** to get your free URL

✅ Your site is now live!

---

## OPTION B — Deploy via Railway CLI (Advanced)

### Install Railway CLI:
```
npm install -g @railway/cli
```

### Login & Deploy:
```
cd agc-global-express
railway login
railway init
railway up
railway domain
```

---

## OPTION C — Deploy to Render (Alternative FREE host)

1. Go to https://render.com → Sign up free
2. Click **New** → **Web Service**
3. Connect your GitHub repo (same as above)
4. Settings:
   - **Build Command:** (leave empty)
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Click **Create Web Service**

✅ Free URL: https://agc-global-express.onrender.com

---

## After Deployment

Your live URLs will be:
- 🌐 Website: https://your-app-name.up.railway.app
- 🔧 Admin: https://your-app-name.up.railway.app/admin
- 🔑 Login: admin / Admin@123

**Important:** Change the admin password immediately after first login!

---

## Custom Domain (Optional)

Once deployed on Railway:
1. Go to your project → Settings → Domains
2. Click **Custom Domain**
3. Enter: www.agcglobalexpress.com
4. Add the CNAME record to your domain's DNS:
   - Type: CNAME
   - Name: www
   - Value: your-app.up.railway.app

---

## Data Persistence Note

Railway's free tier resets the filesystem on redeploy.
For permanent data storage, upgrade to Railway's $5/month plan,
or use the provided JSON files as a starting point and back them up regularly.

For production, consider migrating data/ to MongoDB Atlas (free tier):
https://www.mongodb.com/atlas/database

---

## Support
If you need help with deployment, contact your developer.
