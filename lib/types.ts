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
