# AI Tool Directory Platform

A beautiful, modern, SEO-first web platform for AI tool builders to submit and manage tool listings, and for the team to publish news and blog posts.

## Features

- 🎨 **Modern UI**: Clean, spacious design with dark mode support
- 🔍 **Search & Filter**: Advanced search with faceted filtering
- 📝 **Content Management**: Full CRUD for tools and articles
- 📧 **Submission Workflow**: Public submission form with moderation queue
- 🔐 **Authentication**: Email/password + OAuth (GitHub, Google)
- 🖼️ **Image Storage**: Images stored in PostgreSQL database
- 📱 **Responsive**: Mobile-first design
- ♿ **Accessible**: WCAG AA compliant
- 🚀 **SEO Optimized**: Dynamic meta tags, sitemap, RSS feed, JSON-LD

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Auth**: NextAuth.js
- **Storage**: PostgreSQL (for images)
- **Search**: Meilisearch (optional)
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (recommended: [Neon](https://neon.tech))
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dskuldeep/aitoolsdirectory.git
cd aitoolsdirectory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_URL`: Your app URL (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- Add OAuth credentials if using GitHub/Google login
- Add email service API key (Resend recommended)

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/dskuldeep/aitoolsdirectory.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard:
   - Add all variables from `.env.example`
   - Set `NEXTAUTH_URL` to your Vercel domain (e.g., `https://your-app.vercel.app`)
   - Set `DATABASE_URL` to your production database connection string

5. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (default)
   - **Install Command**: `npm install` (default)
   - **Root Directory**: `./` (default)

6. Add build environment variable:
   - `PRISMA_GENERATE_DATAPROXY`: `true` (optional, for Prisma Data Proxy)

7. Click "Deploy"

### Post-Deployment Steps

1. **Run database migrations** (if using migrations instead of `db:push`):
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed production database** (optional):
   ```bash
   npm run db:seed
   ```

3. **Verify deployment**:
   - Check that all pages load correctly
   - Test authentication
   - Test image uploads
   - Verify database connections

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Secret key for NextAuth (generate with `openssl rand -base64 32`)

### Optional Variables

- OAuth providers (GitHub, Google)
- Email service (Resend)
- Meilisearch (for search)
- Upstash Redis (for rate limiting)
- Analytics (Google Analytics)

## Project Structure

```
agent-directory/
├── app/                    # Next.js app directory
│   ├── (public)/          # Public pages
│   ├── admin/            # Admin dashboard
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── ui/                # UI components
│   └── ...
├── lib/                   # Utility functions
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
└── public/                # Static assets
```

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema to database
- `npm run db:migrate`: Run migrations
- `npm run db:seed`: Seed database
- `npm run db:studio`: Open Prisma Studio

## Admin Access

Default admin credentials (change after first login):
- Email: `admin@example.com`
- Password: `admin123`

**Important**: Change the admin password immediately after deployment!

## Features in Detail

### Public Site
- Homepage with featured tools
- Tools directory with search and filters
- Individual tool pages with rich metadata
- Blog listing and article pages
- Public submission form

### Admin Dashboard
- Tools management (CRUD)
- Articles management (CRUD)
- Moderation queue for submissions
- User management
- Analytics dashboard

### SEO Features
- Dynamic meta tags
- Open Graph and Twitter Card tags
- JSON-LD structured data
- Sitemap.xml
- RSS feed
- robots.txt

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Ensure SSL mode is set correctly

### Image Upload Issues
- Verify database connection
- Check image size limits (max 10MB)
- Ensure `/api/upload` endpoint is accessible

### Authentication Issues
- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Verify OAuth credentials if using OAuth

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
