import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { user: null, error: 'Missing auth token', status: 401 };

  const token = authHeader.replace('Bearer ', '');
  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const {
    data: { user },
    error,
  } = await supabaseUser.auth.getUser();

  if (error || !user) {
    return { user: null, error: 'Invalid or expired user session', status: 401 };
  }

  return { user, error: null, status: 200 };
}

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error }, { status });

    const isAdmin = user.user_metadata?.role === 'admin';

    let payoutsQuery = supabaseAdmin
      .from('payouts')
      .select(`
        *,
        referral:referral_id (
          id,
          candidate_name,
          status,
          payout_status,
          job:job_id (title)
        )
      `)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      payoutsQuery = payoutsQuery.eq('user_id', user.id);
    }

    const { data: payouts, error: payoutsError } = await payoutsQuery;
    if (payoutsError) throw payoutsError;

    if (!isAdmin) {
      return NextResponse.json({ payouts: payouts || [] });
    }

    const { data: pendingReferrals, error: pendingError } = await supabaseAdmin
      .from('referrals')
      .select(`
        id,
        candidate_name,
        referrer_id,
        payout_status,
        reward_amount_inr,
        status,
        created_at,
        job:job_id (id, title, reward_amount_inr)
      `)
      .eq('status', 'hired')
      .eq('payout_status', 'pending')
      .order('updated_at', { ascending: false });

    if (pendingError) throw pendingError;

    return NextResponse.json({
      payouts: payouts || [],
      pendingReferrals: pendingReferrals || [],
    });
  } catch (err: any) {
    console.error('Error fetching payouts:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error }, { status });

    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can trigger payouts' }, { status: 403 });
    }

    const body = await request.json();
    const { referral_id } = body as { referral_id?: string };

    if (!referral_id) {
      return NextResponse.json({ error: 'Missing referral_id' }, { status: 400 });
    }

    const { data: referral, error: referralError } = await supabaseAdmin
      .from('referrals')
      .select('id, referrer_id, job_id, status, payout_status, reward_amount_inr')
      .eq('id', referral_id)
      .single();

    if (referralError || !referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    if (referral.status !== 'hired') {
      return NextResponse.json({ error: 'Only hired referrals are eligible for payout' }, { status: 400 });
    }

    if (referral.payout_status === 'paid') {
      return NextResponse.json({ error: 'Payout already completed for this referral' }, { status: 409 });
    }

    const amountInr = Number(referral.reward_amount_inr || 0);
    if (amountInr <= 0) {
      return NextResponse.json({ error: 'Reward amount is not configured for this referral' }, { status: 400 });
    }

    const { data: payout, error: payoutError } = await supabaseAdmin
      .from('payouts')
      .insert([
        {
          referral_id: referral.id,
          user_id: referral.referrer_id,
          amount_inr: amountInr,
          status: 'approved',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (payoutError) {
      if (payoutError.code === '23505') {
        return NextResponse.json({ error: 'Payout already exists for this referral' }, { status: 409 });
      }
      throw payoutError;
    }

    const { error: referralUpdateError } = await supabaseAdmin
      .from('referrals')
      .update({
        payout_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', referral.id);

    if (referralUpdateError) throw referralUpdateError;

    return NextResponse.json({ payout }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating payout:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create payout' },
      { status: 500 }
    );
  }
}
