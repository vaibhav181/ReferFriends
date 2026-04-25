'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Job } from '@/lib/types';
import ReferCandidateModal from '@/components/ReferCandidateModal';
import ApplicationModal from '@/components/ApplicationModal';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params?.id) {
      fetchJob();
    }
  }, [user, params?.id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${params?.id}`);
      if (!response.ok) throw new Error('Job not found');
      const data = await response.json();
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await fetch(`/api/jobs/${params?.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete job');
      router.push('/jobs');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Card padding="lg" className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-semibold text-[#0F172A] mb-4">{error || 'Job not found'}</p>
          <p className="text-[#64748B] mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/jobs">
            <Button variant="primary" fullWidth>
              ← Back to Jobs
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === job.created_by;

  const jobTypeVariant = {
    'full-time': 'success' as const,
    'part-time': 'info' as const,
    'contract': 'warning' as const,
    'temporary': 'error' as const,
  }[job.job_type] || 'default' as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/jobs" className="inline-flex items-center gap-2 text-[#2563EB] hover:text-[#4F46E5] transition mb-6 font-semibold">
          ← Back to Jobs
        </Link>

        {/* Job Header Card */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#0F172A] mb-2">
                {job.title}
              </h1>
              <p className="text-xl text-[#64748B] mb-4">{job.company_name}</p>
            </div>
            <Badge variant={jobTypeVariant} size="md">
              {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)}
            </Badge>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm font-semibold text-[#64748B] mb-1">📍 Location</p>
              <p className="text-lg font-bold text-[#0F172A]">{job.location}</p>
            </div>
            {job.salary_min && job.salary_max && (
              <div>
                <p className="text-sm font-semibold text-[#64748B] mb-1">💰 Salary</p>
                <p className="text-lg font-bold text-[#0F172A]">
                  ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-[#64748B] mb-1">📅 Posted</p>
              <p className="text-lg font-bold text-[#0F172A]">
                {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {isOwner && (
            <div className="flex gap-3 flex-wrap">
              <Link href={`/jobs/${job.id}/edit`} className="flex-1 min-w-[160px]">
                <Button variant="secondary" fullWidth>
                  ✏️ Edit Job
                </Button>
              </Link>
              <button onClick={handleDelete} className="flex-1 min-w-[160px]">
                <Button variant="danger" fullWidth>
                  🗑️ Delete Job
                </Button>
              </button>
            </div>
          )}

          {!isOwner && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setIsApplicationModalOpen(true)}
                className="flex-1 min-w-[160px]"
              >
                <Button variant="primary" fullWidth>
                  💼 Apply Now
                </Button>
              </button>
              <button
                onClick={() => setIsReferModalOpen(true)}
                className="flex-1 min-w-[160px]"
              >
                <Button variant="success" fullWidth>
                  👥 Refer Someone
                </Button>
              </button>
            </div>
          )}
        </Card>

        {/* Job Description Card */}
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-6">📋 Job Description</h2>
          <div className="text-[#0F172A] whitespace-pre-wrap leading-relaxed text-base">
            {job.description}
          </div>
        </Card>
      </div>

      {/* Refer Modal */}
      <ReferCandidateModal
        jobId={job.id}
        jobTitle={job.title}
        isOpen={isReferModalOpen}
        onClose={() => setIsReferModalOpen(false)}
        onSuccess={() => {
          console.log('Referral sent successfully!');
        }}
      />

      {/* Application Modal */}
      <ApplicationModal
        jobId={job.id}
        jobTitle={job.title}
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onSuccess={() => {
          console.log('Application submitted successfully!');
        }}
      />
    </div>
  );
}
