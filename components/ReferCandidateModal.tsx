'use client';

import { useState } from 'react';

interface ReferCandidateModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReferCandidateModal({
  jobId,
  jobTitle,
  isOpen,
  onClose,
  onSuccess,
}: ReferCandidateModalProps) {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateLinkedin, setCandidateLinkedin] = useState('');
  const [referrerMessage, setReferrerMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get auth token
      const { supabase } = await import('@/lib/supabase');
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call API
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          job_id: jobId,
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          candidate_linkedin: candidateLinkedin,
          referrer_message: referrerMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create referral');
      }

      setSuccess(true);
      setTimeout(() => {
        setCandidateName('');
        setCandidateEmail('');
        setCandidateLinkedin('');
        setReferrerMessage('');
        setSuccess(false);
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Refer a Candidate</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-green-600 font-semibold">Referral sent!</p>
                <p className="text-gray-600 text-sm mt-2">
                  You've earned 50 points. Earn 250 more if they get hired!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Job Title (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Position
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Candidate Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Candidate Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Candidate Email *
                  </label>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile (optional)
                  </label>
                  <input
                    type="url"
                    value={candidateLinkedin}
                    onChange={(e) => setCandidateLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message (optional)
                  </label>
                  <textarea
                    value={referrerMessage}
                    onChange={(e) => setReferrerMessage(e.target.value)}
                    placeholder="Why do you think they'd be great for this role?"
                    maxLength={200}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {referrerMessage.length}/200 characters
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Points Info */}
                <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-xs text-blue-700">
                  💰 <strong>Earn rewards:</strong> 50 pts now + 250 pts if hired
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !candidateName || !candidateEmail}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Sending...' : '✓ Send Referral'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
