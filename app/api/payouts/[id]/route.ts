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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error, status } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error }, { status });

    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can update payout status' }, { status: 403 });
    }

    const body = await request.json();
    const { status: nextStatus, provider_reference } = body as {
      status?: 'approved' | 'paid' | 'failed';
      provider_reference?: string;
    };

    if (!nextStatus || !['approved', 'paid', 'failed'].includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid payout status' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('payouts')
      .select('id, referral_id, user_id, amount_inr, status')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    const { data: payout, error: updateError } = await supabaseAdmin
      .from('payouts')
      .update({
        status: nextStatus,
        provider_reference: provider_reference || null,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    if (nextStatus === 'paid') {
      const { data: referral, error: referralLookupError } = await supabaseAdmin
        .from('referrals')
        .select('id, job_id')
        .eq('id', existing.referral_id)
        .single();

      if (referralLookupError || !referral) {
        return NextResponse.json({ error: 'Referral linked to payout not found' }, { status: 404 });
      }

      const { error: referralError } = await supabaseAdmin
        .from('referrals')
        .update({
          payout_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.referral_id);

      if (referralError) throw referralError;

      const { error: ledgerError } = await supabaseAdmin
        .from('earnings_ledger')
        .insert([
          {
            referral_id: existing.referral_id,
            user_id: existing.user_id,
            job_id: referral.job_id,
            event_type: 'payout_paid',
            amount_inr: -Math.abs(Number(existing.amount_inr || 0)),
            note: 'Payout marked as paid by admin',
          },
        ]);

      if (ledgerError && ledgerError.code !== '23505') {
        throw ledgerError;
      }
    }

    return NextResponse.json({ payout });
  } catch (err: any) {
    console.error('Error updating payout:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update payout' },
      { status: 500 }
    );
  }
}
