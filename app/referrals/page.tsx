'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

type ReferralStatus =
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'offered'
  | 'hired'
  | 'rejected';

type ReferralRow = {
  id: string;
  candidate_name: string;
  status: ReferralStatus;
  created_at: string;
  job?: {
    title?: string | null;
  } | null;
};

const statusVariant: Record<
  ReferralStatus,
  'default' | 'success' | 'warning' | 'info' | 'error'
> = {
  applied: 'info',
  screening: 'warning',
  interviewing: 'warning',
  offered: 'success',
  hired: 'success',
  rejected: 'error',
};

export default function ReferralsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      void fetchReferrals();
    }
  }, [user]);

  const fetchReferrals = async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('You must be signed in');
      }

      const response = await fetch('/api/referrals', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load referrals');
      }

      setRows(data.referrals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-[#64748B]">Loading referrals...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card padding="lg">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">My Referrals</h1>
          <p className="text-[#64748B] mb-6">
            {rows.length} {rows.length === 1 ? 'referral' : 'referrals'}
          </p>

          {error ? (
            <p className="text-[#991B1B] bg-[#FEE2E2] px-4 py-3 rounded-lg mb-4">
              {error}
            </p>
          ) : null}

          {!error && rows.length === 0 ? (
            <p className="text-[#64748B]">No referrals found yet.</p>
          ) : null}

          {!error && rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="py-3 pr-4 text-sm font-semibold text-[#64748B]">
                      Candidate Name
                    </th>
                    <th className="py-3 pr-4 text-sm font-semibold text-[#64748B]">
                      Job Title
                    </th>
                    <th className="py-3 pr-4 text-sm font-semibold text-[#64748B]">
                      Status
                    </th>
                    <th className="py-3 text-sm font-semibold text-[#64748B]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((referral) => (
                    <tr key={referral.id} className="border-b border-[#F1F5F9]">
                      <td className="py-3 pr-4 text-[#0F172A] font-medium">
                        {referral.candidate_name}
                      </td>
                      <td className="py-3 pr-4 text-[#0F172A]">
                        {referral.job?.title || 'N/A'}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant[referral.status]}>
                          {referral.status.charAt(0).toUpperCase() +
                            referral.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 text-[#0F172A]">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
