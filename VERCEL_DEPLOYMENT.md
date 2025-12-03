# Vercel Deployment Guide

This guide will help you deploy the AI Tool Directory Platform to Vercel.

## Prerequisites

- GitHub repository pushed (✅ Done)
- Vercel account ([Sign up here](https://vercel.com))
- Neon PostgreSQL database (or any PostgreSQL database)
- Environment variables ready

## Step-by-Step Deployment

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `dskuldeep/aitoolsdirectory`
4. Vercel will automatically detect it's a Next.js project

### 2. Configure Project Settings

**Framework Preset**: Next.js (auto-detected)
**Root Directory**: `./` (default)
**Build Command**: `npm run build` (default)
**Output Directory**: `.next` (default)
**Install Command**: `npm install` (default)

### 3. Environment Variables

Add the following environment variables in Vercel dashboard:

#### Required Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
```

**Important Notes:**
- `NEXTAUTH_URL` should be your Vercel deployment URL (e.g., `https://aitoolsdirectory.vercel.app`)
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- `DATABASE_URL` should be your production Neon database connection string

#### Optional Variables (Add if needed)

```env
# OAuth (if using GitHub/Google login)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Service (Resend)
EMAIL_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Meilisearch (optional)
MEILISEARCH_HOST=https://your-meilisearch-instance.com
MEILISEARCH_MASTER_KEY=your_master_key

# Rate Limiting (Upstash Redis - optional)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Build Settings

Vercel will automatically detect Next.js, but you can verify:

- **Node.js Version**: 18.x or higher (Vercel auto-detects)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`

### 5. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

### 6. Post-Deployment Setup

#### A. Set Up Database

1. **Run Prisma migrations** (if using migrations):
   ```bash
   # In Vercel CLI or locally with production DATABASE_URL
   npx prisma migrate deploy
   ```

2. **Or push schema directly** (recommended for initial setup):
   ```bash
   npx prisma db push
   ```

3. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

#### B. Update NEXTAUTH_URL

After first deployment, update `NEXTAUTH_URL` in Vercel environment variables to match your actual Vercel domain.

#### C. Verify Deployment

1. Visit your Vercel URL
2. Test the homepage
3. Test authentication (sign in with admin credentials)
4. Test image uploads
5. Verify database connections

## Troubleshooting

### Build Fails

**Issue**: Build fails with Prisma errors
**Solution**: 
- Ensure `DATABASE_URL` is set correctly
- Check that Prisma client is generated: `npx prisma generate` runs automatically during build

**Issue**: Build fails with module not found
**Solution**: 
- Ensure all dependencies are in `package.json`
- Check `node_modules` is not committed (it's in `.gitignore`)

### Database Connection Issues

**Issue**: Cannot connect to database
**Solution**:
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Ensure SSL mode is set: `?sslmode=require`
- For Neon, use the pooled connection string for better performance

### Image Upload Not Working

**Issue**: Images not uploading
**Solution**:
- Verify database connection
- Check `/api/upload` endpoint is accessible
- Ensure `DATABASE_URL` is set correctly
- Check image size limits (max 10MB)

### Authentication Issues

**Issue**: Cannot sign in
**Solution**:
- Verify `NEXTAUTH_URL` matches your Vercel domain exactly
- Check `NEXTAUTH_SECRET` is set
- Ensure OAuth credentials are correct if using OAuth
- Check database has admin user (run seed script)

### Environment Variables Not Working

**Issue**: Environment variables not being read
**Solution**:
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- Ensure no typos in variable names

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations run
- [ ] Database seeded (optional)
- [ ] `NEXTAUTH_URL` updated to production domain
- [ ] Admin password changed from default
- [ ] OAuth credentials configured (if using)
- [ ] Email service configured (if using)
- [ ] Custom domain configured (optional)
- [ ] Analytics configured (optional)
- [ ] SSL certificate active (automatic on Vercel)

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to match custom domain

## Monitoring

- **Vercel Analytics**: Built-in analytics in Vercel dashboard
- **Logs**: View real-time logs in Vercel dashboard
- **Deployments**: Monitor deployment status and history

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure database is accessible
5. Check GitHub issues or create a new one

## Next Steps

After successful deployment:
1. Change default admin password
2. Configure custom domain (optional)
3. Set up monitoring and analytics
4. Configure backup strategy for database
5. Set up CI/CD for automatic deployments

