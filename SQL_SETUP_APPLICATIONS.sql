-- ✅ APPLICATIONS TABLE (NEW - Run this only)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'applied', -- applied, reviewing, interview, offer, rejected, accepted
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see all applications (for recruiters to see applicants)
CREATE POLICY "applications_select" ON applications FOR SELECT USING (true);

-- RLS Policy: Users can create applications
CREATE POLICY "applications_insert" ON applications FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Recruiters can update application status
CREATE POLICY "applications_update_recruiter" ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.created_by = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX applications_job_id_idx ON applications(job_id);
CREATE INDEX applications_user_id_idx ON applications(user_id);
