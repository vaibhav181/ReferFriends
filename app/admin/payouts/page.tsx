'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

type PendingReferral = {
  id: string;
  candidate_name: string;
  reward_amount_inr: number;
  payout_status: string;
  job?: {
    title?: string;
    reward_amount_inr?: number;
  };
};

type Payout = {
  id: string;
  amount_inr: number;
  status: 'approved' | 'paid' | 'failed';
  referral_id: string;
  referral?: {
    candidate_name?: string;
    job?: { title?: string };
  };
};

export default function AdminPayoutsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pendingReferrals, setPendingReferrals] = useState<PendingReferral[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (!authLoading && user && !isAdmin) {
      router.push('/jobs');
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      void fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Session expired. Please login again.');

      const response = await fetch('/api/payouts', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load payout data');

      setPendingReferrals(data.pendingReferrals || []);
      setPayouts(data.payouts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin payout data');
    } finally {
      setLoading(false);
    }
  };

  const createPayout = async (referralId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expired. Please login again.');

      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ referral_id: referralId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create payout');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create payout');
    }
  };

  const markAsPaid = async (payoutId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expired. Please login again.');

      const response = await fetch(`/api/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: 'paid' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to mark payout as paid');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark payout as paid');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-[#64748B]">Loading admin payouts...</p>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Card padding="lg">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Admin Payout Operations</h1>
          <p className="text-[#64748B]">Approve and settle cash rewards for hired referrals.</p>
          {error ? <p className="text-[#991B1B] mt-4">{error}</p> : null}
        </Card>

        <Card padding="lg">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Pending Referrals</h2>
          {pendingReferrals.length === 0 ? (
            <p className="text-[#64748B]">No pending referrals for payout.</p>
          ) : (
            <div className="space-y-3">
              {pendingReferrals.map((referral) => (
                <div key={referral.id} className="rounded-xl border-2 border-[#E2E8F0] p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#0F172A]">{referral.candidate_name}</p>
                    <p className="text-sm text-[#64748B]">{referral.job?.title || 'Job'}</p>
                    <p className="text-sm text-[#64748B]">
                      Reward: INR {(referral.reward_amount_inr || referral.job?.reward_amount_inr || 0).toLocaleString()}
                    </p>
                  </div>
                  <Button onClick={() => createPayout(referral.id)}>Approve Payout</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Payouts</h2>
          {payouts.length === 0 ? (
            <p className="text-[#64748B]">No payouts yet.</p>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div key={payout.id} className="rounded-xl border-2 border-[#E2E8F0] p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#0F172A]">{payout.referral?.candidate_name || 'Referral payout'}</p>
                    <p className="text-sm text-[#64748B]">{payout.referral?.job?.title || 'Job'}</p>
                    <p className="text-sm text-[#64748B]">INR {payout.amount_inr.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={payout.status === 'paid' ? 'success' : payout.status === 'failed' ? 'error' : 'warning'}>
                      {payout.status}
                    </Badge>
                    {payout.status !== 'paid' ? (
                      <Button variant="success" onClick={() => markAsPaid(payout.id)}>
                        Mark Paid
                      </Button>
                    ) : null}
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
