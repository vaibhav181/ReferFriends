'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

type EarningEntry = {
  id: string;
  event_type: string;
  amount_inr: number;
  note?: string;
  created_at: string;
  referral?: {
    candidate_name?: string;
    payout_status?: string;
    job?: {
      title?: string;
    };
  };
};

type Payout = {
  id: string;
  amount_inr: number;
  status: 'approved' | 'paid' | 'failed';
  created_at: string;
  provider_reference?: string;
  referral?: {
    candidate_name?: string;
    job?: {
      title?: string;
    };
  };
};

export default function EarningsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<EarningEntry[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      void fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Session expired. Please login again.');

      const [earningsRes, payoutsRes] = await Promise.all([
        fetch('/api/earnings', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/payouts', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      const earningsData = await earningsRes.json();
      const payoutsData = await payoutsRes.json();

      if (!earningsRes.ok) throw new Error(earningsData.error || 'Failed to fetch earnings');
      if (!payoutsRes.ok) throw new Error(payoutsData.error || 'Failed to fetch payouts');

      setEntries(earningsData.entries || []);
      setTotalEarned(earningsData.summary?.total_earned_inr || 0);
      setPayouts(payoutsData.payouts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-[#64748B]">Loading earnings...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Card padding="lg">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">My Earnings</h1>
          <p className="text-[#64748B] mb-4">Track referral rewards and payout progress.</p>
          <div className="inline-flex items-center rounded-xl bg-[#DBEAFE] px-4 py-2">
            <span className="text-[#0C4A6E] font-semibold">
              Total Net Earnings: INR {totalEarned.toLocaleString()}
            </span>
          </div>
          {error ? (
            <p className="text-[#991B1B] bg-[#FEE2E2] px-4 py-3 rounded-lg mt-4">{error}</p>
          ) : null}
        </Card>

        <Card padding="lg">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Earnings Ledger</h2>
          {entries.length === 0 ? (
            <p className="text-[#64748B]">No earnings activity yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="py-2 pr-4 text-sm text-[#64748B]">Candidate</th>
                    <th className="py-2 pr-4 text-sm text-[#64748B]">Job</th>
                    <th className="py-2 pr-4 text-sm text-[#64748B]">Event</th>
                    <th className="py-2 pr-4 text-sm text-[#64748B]">Amount</th>
                    <th className="py-2 text-sm text-[#64748B]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-[#F1F5F9]">
                      <td className="py-2 pr-4">{entry.referral?.candidate_name || 'N/A'}</td>
                      <td className="py-2 pr-4">{entry.referral?.job?.title || 'N/A'}</td>
                      <td className="py-2 pr-4">{entry.event_type}</td>
                      <td className={`py-2 pr-4 font-semibold ${entry.amount_inr >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'}`}>
                        INR {entry.amount_inr.toLocaleString()}
                      </td>
                      <td className="py-2">{new Date(entry.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Payout History</h2>
          {payouts.length === 0 ? (
            <p className="text-[#64748B]">No payouts yet.</p>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div key={payout.id} className="rounded-xl border-2 border-[#E2E8F0] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#0F172A]">
                        {payout.referral?.candidate_name || 'Referral payout'}
                      </p>
                      <p className="text-sm text-[#64748B]">{payout.referral?.job?.title || 'Job'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0F172A]">INR {payout.amount_inr.toLocaleString()}</p>
                      <Badge variant={payout.status === 'paid' ? 'success' : payout.status === 'failed' ? 'error' : 'warning'}>
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
