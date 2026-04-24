# ReferFriends - Post Jobs for Free

A mobile-responsive job posting platform where companies can post open positions for free. Built with Next.js, TypeScript, and Tailwind CSS.

## 🎯 Features (MVP)

- ✅ User authentication (sign up, sign in, sign out)
- ✅ Post job openings
- ✅ Browse all active job postings
- ✅ Search and filter jobs (by title, company, location, job type)
- ✅ View detailed job information
- ✅ Edit and delete your own job postings
- ✅ Mobile-responsive design
- ✅ Row-level security with Supabase

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth (Email-based)
- **Hosting**: Vercel (auto-deploy from GitHub)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier available)
- GitHub account (for version control)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ReferFriends
npm install
```

### 2. Set Up Supabase

Follow the complete setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Create database tables
- Get API credentials
- Enable authentication

### 3. Configure Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
app/
├── auth/
│   ├── signup/         # Sign up page
│   └── signin/         # Sign in page
├── jobs/
│   ├── create/         # Create job posting
│   ├── [id]/           # Job detail page
│   └── page.tsx        # Jobs listing page
├── api/
│   └── jobs/           # Job API routes
├── layout.tsx          # Root layout with auth provider
└── page.tsx            # Home page

components/            # Reusable React components
lib/
├── supabase.ts         # Supabase client setup
├── auth-context.tsx    # Auth context provider
└── types.ts            # TypeScript type definitions

public/                 # Static assets
```

## 🔐 Authentication Flow

1. User signs up with email and password
2. Supabase Auth sends confirmation email
3. User clicks link to confirm email
4. User can now sign in
5. Session is maintained with AuthContext

## 💼 Job Management

- **Post Jobs**: Authenticated users can post job openings
- **View Jobs**: All users can browse active jobs (even if not signed in)
- **Edit/Delete**: Only job owners can modify or delete their postings
- **Search & Filter**: Filter by job type, search by title/company/location

## 🌐 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial ReferFriends setup"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Click "Deploy"

The app will be live at `<your-project>.vercel.app`

### 3. Connect Custom Domain (Later)

1. Purchase domain from GoDaddy/Namecheap/etc.
2. In Vercel dashboard: Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

## 📱 Future: Mobile App

The backend API is REST-compatible and ready for mobile development:
- React Native / Flutter can use the same API endpoints
- Use `/api/jobs` for job listing
- Use `/api/jobs/[id]` for job details
- Authentication can be handled with the same Supabase backend

## 🚧 Roadmap

### V1.0 (Current MVP)
- [x] Job posting
- [x] Job listing with search/filter
- [x] User authentication
- [x] Mobile responsive design

### V1.1 (Post-Launch)
- [ ] Email notifications for job viewers
- [ ] Favorite jobs / saved jobs
- [ ] User dashboard with job statistics
- [ ] Job categories/tags

### V2.0 (Future)
- [ ] Job applications tracking
- [ ] Referral tracking system
- [ ] Mobile app (React Native/Flutter)
- [ ] Premium features (featured listings, analytics)
- [ ] Admin dashboard
- [ ] Company profiles

## 🔒 Security

- Row Level Security (RLS) policies enforce that users can only manage their own jobs
- Email authentication for account creation
- Service role key used only for server-side operations
- Anon key used for client-side operations with RLS policies

## 📞 Support & Troubleshooting

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed troubleshooting.

Common issues:
- **"Invalid API key"**: Check `.env.local` and restart dev server
- **Email not sending**: Configure email provider in Supabase
- **Jobs not appearing**: Verify RLS policies and database tables

## 📄 License

MIT License - feel free to use for your project!

## 🤝 Contributing

1. Create a branch for your feature
2. Make your changes
3. Test locally
4. Push and create a pull request

## 📧 Questions?

Check the documentation or Supabase support:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
