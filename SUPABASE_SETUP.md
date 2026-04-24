# Supabase Setup Guide for ReferFriends

This guide will walk you through setting up Supabase for the ReferFriends application.

## Step 1: Create a Supabase Project

1. Go to https://supabase.com
2. Sign in or create an account
3. Click "New Project" and enter:
   - **Name**: ReferFriends
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to you
4. Click "Create new project" and wait for it to be set up (5-10 minutes)

## Step 2: Get Your Credentials

1. In the Supabase dashboard, go to **Project Settings** → **API**
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

3. Update your `.env.local` file with these values

## Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"** and paste this SQL to create the `jobs` table:

```sql
-- Create jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'temporary')),
  salary_min INTEGER,
  salary_max INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_by for faster queries
CREATE INDEX jobs_created_by_idx ON jobs(created_by);
CREATE INDEX jobs_status_idx ON jobs(status);
CREATE INDEX jobs_created_at_idx ON jobs(created_at DESC);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all active jobs
CREATE POLICY "View active jobs" ON jobs
  FOR SELECT
  USING (status = 'active' OR auth.uid() = created_by);

-- Allow users to insert jobs
CREATE POLICY "Users can insert jobs" ON jobs
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own jobs
CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow users to delete their own jobs
CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE
  USING (auth.uid() = created_by);
```

3. Click **"Run"** to execute the SQL

## Step 4: Enable Authentication

1. In Supabase, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Go to **Authentication** → **Email Templates**
4. Verify the confirmation email template is set up (default is fine for testing)

## Step 5: Configure Email (Optional but Recommended)

For production, you should configure real email sending:

1. Go to **Authentication** → **Email** in Supabase dashboard
2. Configure SMTP settings or use a service like SendGrid/Resend
3. For testing/development, Supabase provides test email accounts

## Step 6: Update Environment Variables

Add these to your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 7: Test the Setup

1. Run the development server: `npm run dev`
2. Open http://localhost:3000
3. Sign up with a test email
4. Try creating a job posting
5. Verify it appears on the jobs listing page

## Troubleshooting

### "Invalid API key" error
- Make sure you copied the correct keys from Supabase
- Check that `.env.local` is in the root directory (not app folder)
- Restart the development server after updating env vars

### Email confirmation not working
- Check that Email provider is enabled in Authentication
- For development, Supabase provides test emails without external SMTP
- In production, configure real email service

### Jobs not appearing
- Verify the `jobs` table was created successfully in SQL Editor
- Check that RLS policies are set correctly
- Look at the browser console for error messages

### Row Level Security issues
- Make sure policies are created correctly
- Test with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not service role key for client)

## Database Diagram

```
users (from Supabase auth)
  - id (UUID)
  - email (string)
  - user_metadata (JSON) - stores company_name

jobs
  - id (UUID) - primary key
  - created_by (UUID) - references auth.users.id
  - title (string)
  - description (text)
  - company_name (string)
  - location (string)
  - job_type (enum: full-time, part-time, contract, temporary)
  - salary_min (integer, nullable)
  - salary_max (integer, nullable)
  - status (enum: active, closed)
  - created_at (timestamp)
  - updated_at (timestamp)
```

## Next Steps

1. Deploy to Vercel
2. Add custom domain
3. Set up email notifications (optional V1.1 feature)
4. Start building the mobile app
