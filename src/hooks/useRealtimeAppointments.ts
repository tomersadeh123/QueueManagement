import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Appointment = {
  id: string;
  customer_name: string;
  customer_phone: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  services: {
    name: string;
    duration_minutes: number;
  };
  staff: {
    name: string;
  };
};

export function useRealtimeAppointments(daysAhead = 7) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    fetchAppointments();

    // Subscribe to changes
    const channel = supabase
      .channel('appointment_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('Appointment change received:', payload);
          fetchAppointments();
        }
      )
      .subscribe();

    // Check for overdue appointments every minute
    const interval = setInterval(checkOverdueAppointments, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [daysAhead]);

  const fetchAppointments = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const future = new Date(today);
    future.setDate(future.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('appointments')
      .select('*, services(name, duration_minutes), staff(name)')
      .gte('appointment_time', today.toISOString())
      .lt('appointment_time', future.toISOString())
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  };

  const checkOverdueAppointments = async () => {
    const now = new Date();

    // Find appointments that are overdue (past their time + duration)
    const { data: overdueAppts } = await supabase
      .from('appointments')
      .select('*, services(duration_minutes)')
      .in('status', ['confirmed', 'in_progress'])
      .lt('appointment_time', now.toISOString());

    if (overdueAppts && overdueAppts.length > 0) {
      for (const apt of overdueAppts) {
        const aptTime = new Date(apt.appointment_time);
        const endTime = new Date(aptTime.getTime() + apt.services.duration_minutes * 60000);

        // If appointment end time has passed, mark as completed
        if (endTime < now && apt.status === 'in_progress') {
          await supabase
            .from('appointments')
            .update({ status: 'completed' })
            .eq('id', apt.id);
        }
      }
      fetchAppointments();
    }
  };

  return { appointments, loading, refetch: fetchAppointments };
}
