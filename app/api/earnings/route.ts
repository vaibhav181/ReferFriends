import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid or expired user session' }, { status: 401 });
    }

    const { data: entries, error } = await supabaseAdmin
      .from('earnings_ledger')
      .select(`
        id,
        event_type,
        amount_inr,
        note,
        created_at,
        referral:referral_id (
          id,
          candidate_name,
          payout_status,
          job:job_id (title)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const totalEarned = (entries || []).reduce((sum, entry) => sum + Number(entry.amount_inr || 0), 0);

    return NextResponse.json({
      summary: {
        total_earned_inr: totalEarned,
        total_entries: (entries || []).length,
      },
      entries: entries || [],
    });
  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
