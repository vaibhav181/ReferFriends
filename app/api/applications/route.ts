import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🚀 CREATE APPLICATION
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

    const formData = await request.formData();
    const job_id = formData.get('job_id') as string;
    const cover_letter = formData.get('cover_letter') as string;
    const resumeFile = formData.get('resume') as File | null;

    // Validation
    if (!job_id) {
      return NextResponse.json(
        { error: 'Missing job_id' },
        { status: 400 }
      );
    }

    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(resumeFile.type)) {
      return NextResponse.json(
        { error: 'Only PDF, DOC, and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Resume file must be less than 5MB' },
        { status: 400 }
      );
    }

    // Check if job exists
    const { data: jobExists, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('id', job_id)
      .eq('status', 'active')
      .single();

    if (jobError || !jobExists) {
      return NextResponse.json(
        { error: 'Job not found or is no longer active' },
        { status: 404 }
      );
    }

    // Convert file to base64 or upload to storage
    const bytes = await resumeFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const fileName = `resumes/${user.id}/${job_id}-${Date.now()}-${resumeFile.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(fileName, Buffer.from(bytes), {
        contentType: resumeFile.type,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Continue without resume URL if upload fails
    }

    // Get public URL for resume
    let resume_url = null;
    if (uploadData) {
      const { data: publicUrl } = supabaseAdmin.storage
        .from('resumes')
        .getPublicUrl(fileName);
      resume_url = publicUrl.publicUrl;
    }

    // Create application
    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .insert([
        {
          job_id,
          user_id: user.id,
          resume_url: resume_url || null,
          cover_letter: cover_letter || null,
          status: 'applied',
        },
      ])
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate application
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You have already applied to this job' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        application,
        message: 'Application submitted successfully! 🎉',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// 📦 GET USER'S APPLICATIONS
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

    // Get user's applications with job details
    const { data: applications, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        job:job_id (title, company_name, location)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ applications: applications || [] });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
