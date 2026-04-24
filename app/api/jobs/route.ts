import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🔐 Admin client (for DB insert)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 📦 GET all jobs
export async function GET(request: NextRequest) {
  try {
    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// 🚀 CREATE job (FIXED with real auth)
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

    // 🔥 Create user client with token
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

    // 👤 Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    console.log("USER:", user);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired user session' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      location,
      job_type,
      salary_min,
      salary_max,
      company_name,
    } = body;

    // ✅ Validation
    if (!title || !description || !location || !job_type || !company_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 💾 Insert job with REAL user ID
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .insert([
        {
          created_by: user.id, // 🔥 FIXED
          title,
          description,
          location,
          job_type: job_type.toLowerCase(),
          salary_min: salary_min || null,
          salary_max: salary_max || null,
          company_name,
          status: 'active',
        },
      ])
      .select()
      .single();

    console.log("INSERT DATA:", job);
    console.log("INSERT ERROR:", error);

    if (error) throw error;

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}