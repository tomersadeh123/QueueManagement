import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { getReminderEmailHtml } from '@/lib/email-templates-html';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculate time window (24 hours from now, +/- 1 hour for cron flexibility)
    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
    const reminderWindowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now

    // Fetch appointments that need reminders
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, duration_minutes),
        staff:staff(name),
        business:businesses(name, phone, address)
      `)
      .eq('status', 'confirmed')
      .gte('appointment_time', reminderWindowStart.toISOString())
      .lte('appointment_time', reminderWindowEnd.toISOString());

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json(
        { message: 'No appointments need reminders', count: 0 },
        { status: 200 }
      );
    }

    // Send reminder emails
    const results = await Promise.allSettled(
      appointments.map(async (appointment) => {
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

        // Get customer email
        const customerEmail = appointment.customer_email;

        if (!customerEmail) {
          console.log(`Skipping appointment ${appointment.id} - no email address`);
          return { skipped: true, appointmentId: appointment.id };
        }

        // Generate reminder email HTML
        const emailHtml = getReminderEmailHtml({
          customerName: appointment.customer_name,
          businessName: (appointment.business as any).name,
          serviceName: (appointment.service as any).name,
          appointmentTime: formattedTime,
          appointmentDate: formattedDate,
          businessPhone: (appointment.business as any).phone,
          businessAddress: (appointment.business as any).address,
        });

        // Send reminder email
        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Salon Queue <onboarding@resend.dev>',
          to: [customerEmail],
          subject: `Reminder: Your appointment tomorrow at ${(appointment.business as any).name}`,
          html: emailHtml,
        });

        if (error) {
          console.error(`Failed to send reminder for appointment ${appointment.id}:`, error);
          throw error;
        }

        return { appointmentId: appointment.id, emailId: data?.id };
      })
    );

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      message: 'Reminder emails processed',
      total: appointments.length,
      successful,
      failed,
      results,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process reminders' },
      { status: 500 }
    );
  }
}
