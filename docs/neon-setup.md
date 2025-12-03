# Neon Database Setup Guide

This project uses [Neon](https://neon.tech) as the PostgreSQL database provider. Neon is a serverless PostgreSQL platform that offers automatic scaling, branching, and a generous free tier.

## Getting Started with Neon

### 1. Create a Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account (GitHub/Google OAuth available)
3. Verify your email if required

### 2. Create a New Project

1. Click "Create Project" in the Neon dashboard
2. Choose a project name (e.g., "ai-tool-directory")
3. Select a region closest to your deployment
4. Choose PostgreSQL version (15+ recommended)
5. Click "Create Project"

### 3. Get Your Connection String

1. In your Neon project dashboard, you'll see a connection string
2. It will look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
3. Copy this connection string

### 4. Configure Your Environment

Add the connection string to your `.env` file:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

### 5. Set Up the Database Schema

Run Prisma migrations to create the database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to Neon (for development)
npx prisma db push

# Or create a migration (recommended for production)
npx prisma migrate dev --name init
```

### 6. Seed the Database

Populate your database with sample data:

```bash
npm run db:seed
```

## Connection Pooling

Neon provides automatic connection pooling. For serverless environments (like Vercel, Netlify), you may want to use Neon's connection pooler:

1. In the Neon dashboard, go to your project settings
2. Find the "Connection pooling" section
3. Copy the pooled connection string (it will include `pooler.neon.tech`)
4. Use this connection string in your `.env` file for production

The pooled connection string format:
```
postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
```

## Neon Features

### Branching

Neon supports database branching, allowing you to:
- Create branches for feature development
- Test migrations on branches
- Merge branches when ready

### Auto-scaling

Neon automatically scales your database based on usage, so you don't need to worry about capacity planning.

### Free Tier

Neon's free tier includes:
- 0.5 GB storage
- Unlimited projects
- Database branching
- Automatic backups

## Troubleshooting

### Connection Issues

If you're having connection issues:

1. **Check SSL mode**: Ensure `sslmode=require` is in your connection string
2. **Verify credentials**: Make sure your username and password are correct
3. **Check IP restrictions**: Neon allows connections from anywhere by default, but verify if you've set IP restrictions

### Migration Issues

If migrations fail:

1. Check your connection string is correct
2. Ensure you have the latest Prisma schema
3. Try resetting the database: `npx prisma migrate reset` (⚠️ This will delete all data)

### Performance

For better performance in production:

1. Use connection pooling for serverless deployments
2. Enable Neon's query caching if available
3. Monitor your database usage in the Neon dashboard

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Discord](https://discord.gg/neondatabase)
- [Prisma with Neon](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-neon)

