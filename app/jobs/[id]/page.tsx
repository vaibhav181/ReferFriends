'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Job } from '@/lib/types';
import ReferCandidateModal from '@/components/ReferCandidateModal';
import ApplicationModal from '@/components/ApplicationModal';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ReferFriends
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Job not found'}</p>
          <Link href="/jobs" className="text-blue-600 hover:underline">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === job.created_by;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ReferFriends
            </Link>
            <Link href="/jobs" className="text-gray-600 hover:text-blue-600">
              ← Back to Jobs
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {job.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4">{job.company_name}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-semibold text-gray-800">
                  📍 {job.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Job Type</p>
                <p className="text-lg font-semibold text-gray-800">
                  💼 {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)}
                </p>
              </div>
              {job.salary_min && job.salary_max && (
                <div>
                  <p className="text-sm text-gray-600">Salary</p>
                  <p className="text-lg font-semibold text-gray-800">
                    💰 ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Posted</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-2 mb-6">
                <Link
                  href={`/jobs/${job.id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}

            {!isOwner && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setIsApplicationModalOpen(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition"
                >
                  💼 Apply Now
                </button>
                <button
                  onClick={() => setIsReferModalOpen(true)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg transition"
                >
                  👥 Refer Someone
                </button>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Description</h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </div>
        </div>
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
