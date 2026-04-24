# ReferFriends - Quick Start Guide

Welcome! This is your ReferFriends job posting platform. Here's how to get started:

## ⚡ 5-Minute Setup

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Sign Up" and create an account
3. Create a new project (name: `ReferFriends`, region: closest to you)
4. Wait 5-10 minutes for the project to be ready

### Step 2: Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the SQL from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) (the large SQL block)
4. Click **"Run"**

### Step 3: Get Your Credentials
1. Go to **Project Settings** → **API**
2. Copy these three values:
   - `Project URL` 
   - `anon public` (api key)
   - `service_role secret` (service role key)

3. Create `.env.local` in your project root (copy `.env.example` if it exists):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 4: Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Test It
1. Click "Sign Up"
2. Create an account with any email/password
3. Go to "Post a Job"
4. Fill out the form and submit
5. See your job appear on the jobs listing page!

## 🚀 Next Steps (After Testing)

### Deploy to GitHub
```bash
git add .
git commit -m "Initial ReferFriends setup"
git push origin main
```

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables (same as `.env.local`)
5. Click "Deploy"

Your site will be live at `https://[project-name].vercel.app`

### Connect Custom Domain (Later)
1. Buy domain (GoDaddy, Namecheap, etc.)
2. In Vercel: Settings → Domains
3. Add your domain and follow DNS instructions

## 📁 Project Structure

```
app/
├── auth/               # Login/signup pages
├── jobs/               # Job listing, create, detail pages
├── api/jobs/          # Backend API routes
└── page.tsx           # Home page

lib/
├── supabase.ts        # Supabase client setup
├── auth-context.tsx   # Authentication state management
└── types.ts           # TypeScript definitions

SUPABASE_SETUP.md      # Detailed Supabase setup guide
README.md              # Full documentation
```

## ⚙️ Common Issues & Solutions

**"Invalid API key" error**
- Check that you copied the correct keys from Supabase
- Make sure `.env.local` is in the project root
- Restart dev server after updating env vars: `npm run dev`

**"Connection refused" error**
- Supabase project might still be setting up (wait 10 minutes)
- Check that Project URL is correct
- Verify you're in the right Supabase project

**Jobs not appearing**
- Check that database tables were created (SQL ran successfully)
- Look at browser console for errors (F12)
- Verify you're signed in

**Email verification not working**
- For development, Supabase provides test accounts
- For production, configure real email provider

## 💡 Development Tips

**Hot Reload**
- The dev server auto-reloads on file changes
- Edit any file and see changes immediately

**Tailwind CSS**
- All styling uses Tailwind classes
- Check [tailwindcss.com](https://tailwindcss.com) for class references
- Mobile-first: classes apply to mobile by default

**Database Queries**
- API routes use Supabase SDK to query database
- Update `app/api/jobs/route.ts` to change job listing logic

**TypeScript**
- Use types defined in `lib/types.ts`
- Hover over variables for type hints

## 📚 Documentation Links

- [README.md](./README.md) - Full project documentation
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Detailed Supabase setup
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

## 🤔 Still Stuck?

1. Check the console for error messages (F12 in browser)
2. Read [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for troubleshooting
3. Look at the [README.md](./README.md) for more details

## ✅ Verification Checklist

- [ ] Supabase account created
- [ ] Database tables created via SQL
- [ ] Credentials added to `.env.local`
- [ ] Dev server runs: `npm run dev`
- [ ] Can sign up at http://localhost:3000/auth/signup
- [ ] Can post a job
- [ ] Job appears on listing page
- [ ] Can view job details
- [ ] Deployed to Vercel

Happy coding! 🚀
