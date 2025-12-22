# Deployment Options for AGI Tracker

## ⚠️ Important: Cloudflare Pages Compatibility Issue

**This application uses Prisma (PostgreSQL) and NextAuth**, which require **Node.js runtime**. Unfortunately, Cloudflare Pages only supports Edge Runtime for Next.js applications, which is incompatible with:
- Node.js built-in modules (`crypto`, `fs`, etc.)
- Prisma Client (database connections)
- NextAuth (authentication)
- Most npm packages that rely on Node.js APIs

## Recommended Deployment Platforms

### 1. Vercel (Recommended) ⭐

**Why Vercel:**
- Native Next.js support (created by Next.js team)
- Supports Prisma and NextAuth out of the box
- Easy deployment from GitHub
- Generous free tier
- Excellent performance

**Deployment Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository: `dskuldeep/aitoolsdirectory`
4. Configure environment variables (see below)
5. Deploy

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

### 2. Railway

**Why Railway:**
- Full Node.js support
- Built-in PostgreSQL database
- Simple deployment
- Good free tier

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add PostgreSQL service
4. Set environment variables
5. Deploy

### 3. Render

**Why Render:**
- Free tier with PostgreSQL
- Full Node.js support
- Easy GitHub integration

**Steps:**
1. Go to [render.com](https://render.com)
2. Create new Web Service from GitHub
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

### 4. AWS Amplify

**Why AWS Amplify:**
- Full Next.js support including SSR
- AWS ecosystem integration
- Good performance

## Required Environment Variables

All platforms need these environment variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
EMAIL_FROM=noreply@your-domain.com
ADMIN_EMAIL=admin@your-domain.com
```

Optional email provider variables (for Resend):
```env
RESEND_API_KEY=your-resend-api-key
```

## If You Must Use Cloudflare

To deploy on Cloudflare Pages, you would need to:

1. **Replace Prisma** with Cloudflare D1 (SQLite):
   - Migrate all database code from PostgreSQL to D1
   - Rewrite Prisma queries to D1 syntax
   - Use Cloudflare Workers instead of API routes

2. **Replace NextAuth** with:
   - Cloudflare Workers-compatible auth
   - Custom JWT implementation using Web Crypto API
   - Or use a third-party service like Clerk or Auth0

3. **Refactor Node.js dependencies**:
   - Remove all packages that use Node.js built-ins
   - Use Edge-compatible alternatives
   - Significant code rewrite required

This would be a major refactoring effort (multiple weeks of work).

## Database Options

### Neon PostgreSQL (Recommended)
- Serverless PostgreSQL
- Excellent for serverless deployments
- See `docs/neon-setup.md`

### Supabase
- PostgreSQL with built-in auth and storage
- Good free tier

### PlanetScale
- MySQL-compatible
- Would require schema changes from PostgreSQL

## Next Steps

1. Choose a deployment platform (recommend Vercel)
2. Set up your PostgreSQL database (recommend Neon)
3. Configure environment variables
4. Deploy!
5. Run database migrations: `npm run db:push`
6. Seed initial data (optional): `npm run db:seed`

For Vercel deployment, see: `VERCEL_DEPLOYMENT.md`
For Neon database setup, see: `docs/neon-setup.md`

