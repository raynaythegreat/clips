# 🚀 Deployment Guide - GitHub Repository

Your viral clips generator is now set up for automatic deployment from GitHub! Choose one of the deployment options below:

## 🎯 **Option 1: Vercel (Recommended - Free & Easy)**

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "New Project"

### Step 2: Import Repository
1. Select "Import Git Repository"
2. Choose `raynaythegreat/clips`
3. Click "Import"

### Step 3: Configure Project
- **Framework Preset:** Next.js
- **Root Directory:** `./` (default)
- **Build Command:** `npx prisma generate && npm run build`
- **Output Directory:** `.next` (default)

### Step 4: Add Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=production
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be live at: `https://your-app-name.vercel.app`

---

## 🚂 **Option 2: Railway (Alternative)**

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"

### Step 2: Deploy from GitHub
1. Select "Deploy from GitHub repo"
2. Choose `raynaythegreat/clips`
3. Click "Deploy"

### Step 3: Add Database
1. Click "New" → "Database" → "PostgreSQL"
2. Copy the connection string

### Step 4: Add Environment Variables
In Railway dashboard, add:
```
DATABASE_URL=<postgresql-connection-string>
NEXTAUTH_URL=https://your-app-name.railway.app
NEXTAUTH_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=production
```

---

## 🌐 **Option 3: Netlify**

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"

### Step 2: Connect Repository
1. Choose GitHub
2. Select `raynaythegreat/clips`
3. Configure build settings:
   - **Build command:** `npx prisma generate && npm run build`
   - **Publish directory:** `.next`

### Step 3: Add Environment Variables
In Netlify dashboard, go to Site settings → Environment variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-app-name.netlify.app
NEXTAUTH_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=production
```

---

## 🔄 **Automatic Deployment**

Once set up, your app will automatically deploy whenever you:
- Push changes to the `main` branch
- Merge pull requests
- Make any commits to the repository

## 📱 **Access Your App**

After deployment, your app will be available at:
- **Vercel:** `https://your-app-name.vercel.app`
- **Railway:** `https://your-app-name.railway.app`
- **Netlify:** `https://your-app-name.netlify.app`

## 🎉 **Features Available**

✅ **Progressive Web App** - Install on phone home screen
✅ **AI-Powered Clip Generation** - OpenAI integration
✅ **Social Media Automation** - Headless browser posting
✅ **User Authentication** - Secure login system
✅ **Video Management** - YouTube URL processing
✅ **Scheduling** - Plan uploads in advance

## 🆘 **Need Help?**

1. **Check deployment logs** in your hosting platform
2. **Verify environment variables** are set correctly
3. **Ensure database is connected** and migrated
4. **Check GitHub Actions** for build errors

Your viral clips generator is ready to go viral! 🚀
