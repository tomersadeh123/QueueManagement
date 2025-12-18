import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { getConfirmationEmailHtml } from '@/lib/email-templates-html';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, type } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch appointment details with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, duration_minutes),
        staff:staff(name),
        business:businesses(name, phone, address)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Format date and time
    const appointmentDate = new Date(appointment.appointment_time);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Get customer email from appointment
    const customerEmail = appointment.customer_email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No email address found for this appointment' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const emailHtml = getConfirmationEmailHtml({
      customerName: appointment.customer_name,
      businessName: (appointment.business as any).name,
      serviceName: (appointment.service as any).name,
      appointmentTime: formattedTime,
      appointmentDate: formattedDate,
      businessPhone: (appointment.business as any).phone,
      businessAddress: (appointment.business as any).address,
    });

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Salon Queue <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Appointment Confirmed - ${(appointment.business as any).name}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Email error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailError },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, emailId: emailData?.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
