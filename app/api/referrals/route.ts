import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 🚀 CREATE REFERRAL
export async function POST(request: NextRequest) {
  try {
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
    const {
      job_id,
      candidate_name,
      candidate_email,
      candidate_linkedin,
      referrer_message,
    } = body;

    // Validation
    if (!job_id || !candidate_name || !candidate_email) {
      return NextResponse.json(
        { error: 'Missing required fields: job_id, candidate_name, candidate_email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidate_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if job exists
    const { data: jobExists, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, title, company_name')
      .eq('id', job_id)
      .eq('status', 'active')
      .single();

    if (jobError || !jobExists) {
      return NextResponse.json(
        { error: 'Job not found or is no longer active' },
        { status: 404 }
      );
    }

    // Create referral
    const { data: referral, error } = await supabaseAdmin
      .from('referrals')
      .insert([
        {
          job_id,
          referrer_id: user.id,
          candidate_name,
          candidate_email,
          candidate_linkedin: candidate_linkedin || null,
          referrer_message: referrer_message || null,
          status: 'applied',
          points_earned: 50,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This candidate has already been referred for this job' },
          { status: 409 }
        );
      }
      throw error;
    }

    // ✅ SEND EMAIL (NEW)
    try {
      await resend.emails.send({
        from: "ReferFriends <onboarding@resend.dev>",
        to: candidate_email,
        subject: `🎉 You've been referred for ${jobExists.title}`,
        html: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>🎉 You've been referred!</h2>

            <p><strong>${candidate_name}</strong>,</p>

            <p>You’ve been referred for a role at <strong>${jobExists.company_name}</strong>.</p>

            <p><strong>Role:</strong> ${jobExists.title}</p>

            ${
              referrer_message
                ? `<p><strong>Message from referrer:</strong><br/>${referrer_message}</p>`
                : ""
            }

            <br/>
            <p>👉 Visit ReferFriends to apply</p>
          </div>
        `,
      });

      console.log("Email sent successfully ✅");

    } catch (emailError) {
      console.error("Email failed ❌", emailError);
      // ❗ Do NOT fail API if email fails
    }

    return NextResponse.json(
      { 
        referral,
        message: 'Referral created successfully! 🎉 You earned 50 points.'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create referral' },
      { status: 500 }
    );
  }
}

// 📦 GET USER'S REFERRALS
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing auth token' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

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

    const { data: referrals, error } = await supabaseAdmin
      .from('referrals')
      .select(`
        *,
        job:job_id (title, company_name, location)
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ referrals: referrals || [] });
  } catch (error: any) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}