import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const allowedStatuses = ['applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected'] as const;
type ReferralStatus = (typeof allowedStatuses)[number];

const allowedTransitions: Record<ReferralStatus, ReferralStatus[]> = {
  applied: ['screening', 'interviewing', 'offered', 'hired', 'rejected'],
  screening: ['interviewing', 'offered', 'hired', 'rejected'],
  interviewing: ['offered', 'hired', 'rejected'],
  offered: ['hired', 'rejected'],
  hired: [],
  rejected: [],
};

// 📝 UPDATE REFERRAL STATUS (recruiters only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing auth token' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create user client with token
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired user session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body as { status?: ReferralStatus };

    if (!status) {
      return NextResponse.json(
        { error: 'Missing status field' },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Get referral and verify job ownership
    const { data: referral, error: fetchError } = await supabaseAdmin
      .from('referrals')
      .select(`
        *,
        job:job_id (created_by, reward_amount_inr)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    const isAdmin = user.user_metadata?.role === 'admin';
    const isOwner = referral.job.created_by === user.id;

    // Verify recruiter is the job creator or admin
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized: Only owner recruiter or admin can update referral status' },
        { status: 403 }
      );
    }

    const currentStatus = referral.status as ReferralStatus;
    if (currentStatus !== status && !allowedTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Calculate bonus points based on status
    let bonusPoints = 0;
    if (status === 'interviewing' && referral.status === 'applied') {
      bonusPoints = 25;
    } else if (status === 'offered' && referral.status !== 'offered') {
      bonusPoints = 50;
    } else if (status === 'hired' && referral.status !== 'hired') {
      bonusPoints = 200;
    }

    const nextBonusPoints = (referral.bonus_points || 0) + bonusPoints;

    const updatePayload: Record<string, unknown> = {
      status,
      bonus_points: nextBonusPoints,
      updated_at: new Date().toISOString(),
    };

    if (status === 'hired') {
      updatePayload.payout_status = referral.payout_status === 'paid' ? 'paid' : 'pending';
    }

    // Update referral
    const { data: updated, error } = await supabaseAdmin
      .from('referrals')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (status === 'hired' && currentStatus !== 'hired') {
      const rewardAmountInr =
        Number(referral.reward_amount_inr || 0) || Number(referral.job?.reward_amount_inr || 0) || 0;

      if (rewardAmountInr > 0) {
        const { error: earningsError } = await supabaseAdmin
          .from('earnings_ledger')
          .insert([
            {
              referral_id: referral.id,
              user_id: referral.referrer_id,
              job_id: referral.job_id,
              event_type: 'hired_reward',
              amount_inr: rewardAmountInr,
              note: 'Reward unlocked after referral marked hired',
            },
          ]);

        if (earningsError && earningsError.code !== '23505') {
          throw earningsError;
        }
      }
    }

    return NextResponse.json({
      referral: updated,
      bonusPointsEarned: bonusPoints,
      message: `Referral status updated to ${status}. ${bonusPoints > 0 ? `+${bonusPoints} bonus points!` : ''}`,
    });
  } catch (error: any) {
    console.error('Error updating referral:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update referral' },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE REFERRAL
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing auth token' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create user client with token
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired user session' },
        { status: 401 }
      );
    }

    // Get referral
    const { data: referral, error: fetchError } = await supabaseAdmin
      .from('referrals')
      .select('referrer_id')
      .eq('id', id)
      .single();

    if (fetchError || !referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Verify it's the referrer or an admin
    if (referral.referrer_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own referrals' },
        { status: 403 }
      );
    }

    // Delete referral
    const { error } = await supabaseAdmin
      .from('referrals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Referral deleted' });
  } catch (error: any) {
    console.error('Error deleting referral:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete referral' },
      { status: 500 }
    );
  }
}
