# Fly.io Deployment Guide for AGI Tracker

This guide will help you deploy AGI Tracker to Fly.io.

## Prerequisites

- [Fly.io account](https://fly.io/app/sign-up) (free tier available)
- `flyctl` CLI installed and authenticated
- PostgreSQL database (Neon recommended)

## Step 1: Set Up Database

### Option A: Use Neon PostgreSQL (Recommended)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project: `agitracker`
3. Copy the connection string (it will look like: `postgresql://user:password@host/dbname?sslmode=require`)

See `docs/neon-setup.md` for detailed instructions.

### Option B: Use Fly.io Postgres

```bash
# Create a Postgres cluster
flyctl postgres create --name aitoolsdirectory-db --region iad

# Attach it to your app
flyctl postgres attach aitoolsdirectory-db -a aitoolsdirectory
```

## Step 2: Set Environment Variables (Secrets)

```bash
# Required secrets
flyctl secrets set DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require" -a aitoolsdirectory

flyctl secrets set NEXTAUTH_URL="https://aitoolsdirectory.fly.dev" -a aitoolsdirectory

# Generate a random secret
flyctl secrets set NEXTAUTH_SECRET="$(openssl rand -base64 32)" -a aitoolsdirectory

# Email configuration
flyctl secrets set EMAIL_FROM="noreply@agitracker.io" -a aitoolsdirectory
flyctl secrets set ADMIN_EMAIL="admin@agitracker.io" -a aitoolsdirectory

# Optional: Resend API for emails
flyctl secrets set RESEND_API_KEY="your-resend-api-key" -a aitoolsdirectory
```

## Step 3: Deploy

```bash
# Deploy from the repository
flyctl deploy -a aitoolsdirectory
```

The deployment will:
1. Build a Docker image
2. Run Prisma migrations (`npx prisma migrate deploy`)
3. Start the Next.js server
4. Be available at: https://aitoolsdirectory.fly.dev

## Step 4: Run Database Seed (Optional)

To create initial admin users:

```bash
# SSH into the machine
flyctl ssh console -a aitoolsdirectory

# Run seed
npm run db:seed

# Exit
exit
```

## Step 5: Configure Custom Domain (Optional)

```bash
# Add your custom domain
flyctl certs create agitracker.io -a aitoolsdirectory

# Follow the DNS instructions to point your domain to Fly.io
```

Then update the `NEXTAUTH_URL` secret:

```bash
flyctl secrets set NEXTAUTH_URL="https://agitracker.io" -a aitoolsdirectory
```

## Troubleshooting

### Check Logs

```bash
flyctl logs -a aitoolsdirectory
```

### SSH into Machine

```bash
flyctl ssh console -a aitoolsdirectory
```

### Check Health

```bash
curl https://aitoolsdirectory.fly.dev/api/health
```

### Release Command Failed

If the release command (Prisma migrate) fails:

1. Check if `DATABASE_URL` is set:
   ```bash
   flyctl secrets list -a aitoolsdirectory
   ```

2. Test database connection:
   ```bash
   flyctl ssh console -a aitoolsdirectory
   npx prisma db push
   exit
   ```

3. View release command logs:
   ```bash
   flyctl logs -a aitoolsdirectory
   ```

### Build Issues

If the build fails:

1. Make sure `fly.toml`, `Dockerfile`, and `.dockerignore` are committed
2. Check that `output: 'standalone'` is in `next.config.js`
3. Ensure all dependencies are in `package.json`

## Useful Commands

```bash
# View app status
flyctl status -a aitoolsdirectory

# Scale machines
flyctl scale count 2 -a aitoolsdirectory

# Update secrets
flyctl secrets set KEY=value -a aitoolsdirectory

# View secrets (names only)
flyctl secrets list -a aitoolsdirectory

# Restart app
flyctl apps restart aitoolsdirectory

# Open app in browser
flyctl open -a aitoolsdirectory
```

## Monitoring

View your app's monitoring dashboard:
https://fly.io/apps/aitoolsdirectory/monitoring

## Cost

Fly.io free tier includes:
- Up to 3 shared-cpu-1x machines
- 256MB RAM per machine
- 3GB persistent storage
- 160GB outbound data transfer

The current configuration uses:
- 1 machine with 512MB RAM (within free tier)
- Auto-stop/start enabled (saves resources)

## Next Steps

1. Set up your database (Neon recommended)
2. Configure all environment secrets
3. Deploy: `flyctl deploy -a aitoolsdirectory`
4. Test: Visit https://aitoolsdirectory.fly.dev
5. (Optional) Configure custom domain

Your AGI Tracker should now be live on Fly.io!

