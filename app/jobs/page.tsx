'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Job } from '@/lib/types';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { JobCard } from '@/components/JobCard';

export default function JobsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || job.job_type === filterType;

    return matchesSearch && matchesType;
  });

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="inline-block p-3 bg-[#2563EB] rounded-full mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-[#64748B] font-medium">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="bg-white border-b-2 border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-1">
                Browse Open Positions
              </h1>
              <p className="text-[#64748B]">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
              </p>
            </div>
            <Link href="/jobs/create">
              <Button variant="primary" size="lg">
                ➕ Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <Input
            placeholder="Search jobs, companies, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />

          <div className="flex gap-4 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-[#E2E8F0] bg-white text-[#0F172A] font-medium
                focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]
                transition-all duration-200"
            >
              <option value="all">📌 All Job Types</option>
              <option value="full-time">💼 Full-time</option>
              <option value="part-time">🕐 Part-time</option>
              <option value="contract">📋 Contract</option>
              <option value="temporary">⏰ Temporary</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-semibold text-[#0F172A] mb-2">
              {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your search'}
            </p>
            <p className="text-[#64748B] mb-6">
              {jobs.length === 0 
                ? 'Be the first to post an opportunity!' 
                : 'Try adjusting your filters or search terms'}
            </p>
            <Link href="/jobs/create">
              <Button variant="primary" size="lg">
                ➕ Post a Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
