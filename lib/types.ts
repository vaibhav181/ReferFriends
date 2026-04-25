export type Job = {
  id: string;
  created_by: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  salary_min?: number;
  salary_max?: number;
  reward_amount_inr?: number;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  company_name: string;
  created_at: string;
};

export type Referral = {
  id: string;
  job_id: string;
  referrer_id: string;
  candidate_email: string;
  candidate_name: string;
  candidate_linkedin?: string;
  referrer_message?: string;
  status: 'applied' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  points_earned: number;
  bonus_points: number;
  reward_amount_inr?: number;
  payout_status?: 'pending' | 'approved' | 'paid' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  user_id: string;
  resume_url?: string;
  cover_letter?: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'accepted';
  created_at: string;
  updated_at: string;
};

export type EarningsLedgerEntry = {
  id: string;
  referral_id: string;
  user_id: string;
  job_id: string;
  event_type: 'referral_created' | 'hired_reward' | 'payout_paid' | 'manual_adjustment';
  amount_inr: number;
  note?: string;
  created_at: string;
};

export type Payout = {
  id: string;
  referral_id: string;
  user_id: string;
  amount_inr: number;
  status: 'approved' | 'paid' | 'failed';
  provider_reference?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
};
