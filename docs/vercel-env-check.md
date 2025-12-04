# Vercel Environment Variables Checklist

If admin panel access isn't working on Vercel, verify these environment variables are set:

## Required Variables

1. **NEXTAUTH_URL**
   - Should be: `https://your-app.vercel.app` (your actual Vercel deployment URL)
   - NOT: `http://localhost:3000` or `https://localhost:3000`
   - Check in Vercel Dashboard → Settings → Environment Variables

2. **NEXTAUTH_SECRET**
   - Must be set (generate with: `openssl rand -base64 32`)
   - Should be the same across all environments if you want sessions to persist

3. **DATABASE_URL**
   - Should be your Neon PostgreSQL connection string
   - For serverless, use the pooled connection string (contains `pooler.neon.tech`)

## How to Check

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify all variables are set for "Production" environment
5. After adding/changing variables, redeploy the project

## Common Issues

- **NEXTAUTH_URL mismatch**: If set to localhost, cookies won't work in production
- **Missing NEXTAUTH_SECRET**: Sessions won't persist
- **Wrong DATABASE_URL**: Connection errors will occur

## After Fixing

1. Sign out completely (clear cookies)
2. Sign back in
3. Try accessing `/admin` again

