-- ✅ REFERRALS TABLE
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  referrer_id UUID REFERENCES auth.users(id) NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_linkedin TEXT,
  referrer_message TEXT,
  status TEXT DEFAULT 'applied',
  points_earned INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, candidate_email)
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see all referrals (for recruiters to see who referred)
CREATE POLICY "referrals_select" ON referrals FOR SELECT USING (true);

-- RLS Policy: Users can create referrals
CREATE POLICY "referrals_insert" ON referrals FOR INSERT 
  WITH CHECK (referrer_id = auth.uid());

-- RLS Policy: Recruiters can update referral status
CREATE POLICY "referrals_update_recruiter" ON referrals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = referrals.job_id 
      AND jobs.created_by = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX referrals_job_id_idx ON referrals(job_id);
CREATE INDEX referrals_referrer_id_idx ON referrals(referrer_id);
CREATE INDEX referrals_candidate_email_idx ON referrals(candidate_email);

-- ✅ APPLICATIONS TABLE
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
