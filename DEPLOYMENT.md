# Deployment Guide

## Vercel Deployment (Recommended)

### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import repository: `https://github.com/raynaythegreat/clips.git`
5. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: **./** (default)
   - Build Command: **npx prisma generate && npm run build**
   - Output Directory: **.next** (default)

### Step 2: Environment Variables
Add these in Vercel dashboard:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=production
```

### Step 3: Database Setup
1. In Vercel dashboard, go to "Storage" tab
2. Create a new PostgreSQL database
3. Copy the connection string to `DATABASE_URL`
4. The database will be automatically migrated on first deployment

### Step 4: Deploy
1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Your app will be live at: `https://your-app-name.vercel.app`

## Alternative: Railway Deployment

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository: `raynaythegreat/clips`

### Step 2: Add Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Copy the connection string

### Step 3: Environment Variables
Add in Railway dashboard:
```
DATABASE_URL=<postgresql-connection-string>
NEXTAUTH_URL=https://your-app-name.railway.app
NEXTAUTH_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=production
```

## Local Development (After installing Node.js)

```bash
# Install Node.js first from nodejs.org
# Then run these commands:

cd /Users/ray/viral-clips-generator
cp env.example .env.local
# Edit .env.local with your API key
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Access Your App

- **Local:** http://localhost:3000
- **Vercel:** https://your-app-name.vercel.app
- **Railway:** https://your-app-name.railway.app
