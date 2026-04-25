-- Monetization and payouts (additive, safe for existing installs)

-- Add INR reward amount per job
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS reward_amount_inr INTEGER DEFAULT 0;

-- Add payout tracking fields to referrals
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reward_amount_inr INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_points INTEGER DEFAULT 0;

-- Earnings ledger for immutable accounting events
CREATE TABLE IF NOT EXISTS earnings_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- referral_created, hired_reward, payout_paid, manual_adjustment
  amount_inr INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referral_id, event_type)
);

ALTER TABLE earnings_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "earnings_select_own" ON earnings_ledger
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "earnings_insert_service_only" ON earnings_ledger
FOR INSERT WITH CHECK (false);

CREATE INDEX IF NOT EXISTS earnings_user_id_idx ON earnings_ledger(user_id);
CREATE INDEX IF NOT EXISTS earnings_referral_id_idx ON earnings_ledger(referral_id);

-- Payout records
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount_inr INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved', -- approved, paid, failed
  provider_reference TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payouts_select_own" ON payouts
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "payouts_write_service_only" ON payouts
FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS payouts_user_id_idx ON payouts(user_id);
CREATE INDEX IF NOT EXISTS payouts_status_idx ON payouts(status);
