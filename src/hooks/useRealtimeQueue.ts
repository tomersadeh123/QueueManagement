import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type QueueEntry = {
  id: string;
  queue_number: number;
  customer_name: string;
  customer_phone: string;
  status: string;
  created_at: string;
  services: {
    name: string;
    duration_minutes: number;
  };
};

export function useRealtimeQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    fetchQueue();

    // Subscribe to changes
    const channel = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
        },
        (payload) => {
          console.log('Queue change received:', payload);
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueue = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('queue_entries')
      .select('*, services(name, duration_minutes)')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('queue_number', { ascending: true });

    if (error) {
      console.error('Error fetching queue:', error);
    } else {
      setQueue(data as QueueEntry[]);
    }
    setLoading(false);
  };

  return { queue, loading, refetch: fetchQueue };
}
