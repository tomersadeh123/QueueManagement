import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, business_id, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Determine business ID
    let targetBusinessId = business_id;

    // If no business_id provided, get the first business (backward compatibility)
    if (!targetBusinessId) {
      const { data: business, error: businessError } = await supabaseAdmin
        .from('businesses')
        .select('id')
        .single();

      if (businessError || !business) {
        return NextResponse.json(
          { error: 'Business not found' },
          { status: 400 }
        );
      }
      targetBusinessId = business.id;
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create the staff record
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from('staff')
      .insert({
        business_id: targetBusinessId,
        user_id: authData.user.id,
        name,
        phone: phone || null,
        role: role || 'staff',
        is_active: true,
      })
      .select()
      .single();

    if (staffError) {
      // Rollback: delete the auth user if staff creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create staff record: ' + staffError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, user: authData.user, staff: staffData },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
