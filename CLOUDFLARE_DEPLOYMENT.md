# Cloudflare Pages Deployment Guide

This guide will help you deploy the AGI Tracker Platform to Cloudflare Pages.

## Prerequisites

- GitHub repository pushed
- Cloudflare account ([Sign up here](https://dash.cloudflare.com))
- Neon PostgreSQL database (or any PostgreSQL database)
- Environment variables ready

## Step-by-Step Deployment

### 1. Connect Repository to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create a project** → **Connect to Git**
4. Select your GitHub repository
5. Click **Begin setup**

### 2. Configure Build Settings

In the **Build configuration** section:

- **Framework preset**: Select **Next.js (Static HTML Export)** or **None**
- **Build command**: `npm run build`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `/` (leave empty or use `/`)

**IMPORTANT**: In the **Environment variables** section, you need to set:

```env
NPM_CONFIG_LEGACY_PEER_DEPS=true
```

This ensures npm uses `--legacy-peer-deps` during installation, which is required for `@cloudflare/next-on-pages` compatibility with Next.js 14.2.x.

Alternatively, if Cloudflare Pages allows custom install commands, you can:
- **Install command**: `npm install --legacy-peer-deps`

### 3. Environment Variables

Add the following environment variables in Cloudflare Pages settings:

#### Required Variables

**Note**: For build to succeed, you can either:
- Set `DATABASE_URL` (recommended if your database is accessible during build)
- Or leave it unset - the build will complete but routes that need database will return empty data

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NEXTAUTH_URL=https://agitracker.io
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
NPM_CONFIG_LEGACY_PEER_DEPS=true
```

#### Optional Variables

```env
# OAuth (if using GitHub/Google login)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Service (Resend)
EMAIL_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@agitracker.io

# Meilisearch (optional)
MEILISEARCH_HOST=https://your-meilisearch-instance.com
MEILISEARCH_MASTER_KEY=your_master_key

# Rate Limiting (Upstash Redis - optional)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Deploy

1. Click **Save and Deploy**
2. Wait for the build to complete (usually 3-5 minutes)
3. Your app will be live at `https://your-project.pages.dev`

### 5. Custom Domain (Optional)

1. Go to **Custom domains** in your Pages project
2. Add your domain (e.g., `agitracker.io`)
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to match your custom domain

## Troubleshooting

### Build Fails with Peer Dependency Errors

**Issue**: `ERESOLVE could not resolve` error for `@cloudflare/next-on-pages`

**Solution**: 
- Ensure `NPM_CONFIG_LEGACY_PEER_DEPS=true` is set as an environment variable
- Or configure the install command to use `npm install --legacy-peer-deps`

### Build Fails with Prisma Errors

**Issue**: Prisma client not generated

**Solution**: 
- Prisma generation runs automatically in the `postinstall` script
- Ensure `DATABASE_URL` is set (even if Prisma can't connect during build, it will generate the client)

### Deploy Command Error

**Issue**: `npx wrangler deploy` fails with "Missing entry-point"

**Solution**: 
- Remove any custom deploy command
- Cloudflare Pages will automatically deploy the output directory after build

### Database Connection Issues

**Issue**: Cannot connect to database at runtime

**Solution**:
- Verify `DATABASE_URL` is set correctly in Cloudflare Pages environment variables
- Check database allows connections from Cloudflare IPs
- Ensure SSL mode is set: `?sslmode=require`
- For Neon, use the pooled connection string for better performance

## Important Notes

1. **Package Lock File**: Make sure `package-lock.json` is committed to your repository. This ensures consistent dependency resolution.

2. **Build Output**: The build outputs to `.vercel/output/static` directory. This is configured in `wrangler.toml`.

3. **Environment Variables**: All environment variables must be set in Cloudflare Pages dashboard. They are not read from `.env` files during build.

4. **Post-Deployment**: After deployment, you may need to:
   - Run database migrations: `npx prisma migrate deploy`
   - Seed the database: `npm run db:seed` (run locally with production DATABASE_URL)

## Next Steps

After successful deployment:
1. Change default admin password
2. Configure custom domain
3. Set up monitoring and analytics
4. Configure backup strategy for database
5. Test all functionality on production

