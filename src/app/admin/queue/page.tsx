'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type QueueEntry = {
  id: string;
  customer_name: string;
  customer_phone: string;
  queue_number: number;
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled';
  estimated_wait_minutes: number | null;
  created_at: string;
  services: {
    name: string;
    duration_minutes: number;
  };
};

export default function QueueManagement() {
  const { t } = useLanguage();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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

  useEffect(() => {
    fetchQueue();
  }, []);

  const callNext = async () => {
    const nextWaiting = queue.find((q) => q.status === 'waiting');
    if (!nextWaiting) return;

    const { error } = await supabase
      .from('queue_entries')
      .update({ status: 'called' })
      .eq('id', nextWaiting.id);

    if (!error) {
      fetchQueue();
    }
  };

  const startService = async (id: string) => {
    // Set any current "in_progress" back to "called"
    const current = queue.find((q) => q.status === 'in_progress');
    if (current) {
      await supabase
        .from('queue_entries')
        .update({ status: 'called' })
        .eq('id', current.id);
    }

    const { error } = await supabase
      .from('queue_entries')
      .update({ status: 'in_progress' })
      .eq('id', id);

    if (!error) {
      fetchQueue();
    }
  };

  const completeService = async (id: string) => {
    const { error } = await supabase
      .from('queue_entries')
      .update({ status: 'completed' })
      .eq('id', id);

    if (!error) {
      fetchQueue();
    }
  };

  const cancelEntry = async (id: string) => {
    const { error } = await supabase
      .from('queue_entries')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (!error) {
      fetchQueue();
    }
  };

  const activeQueue = queue.filter((q) =>
    q.status === 'waiting' || q.status === 'called' || q.status === 'in_progress'
  );

  const currentlyServing = queue.find((q) => q.status === 'in_progress');
  const nextInQueue = queue.find((q) => q.status === 'waiting');

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t('admin.queue')} {t('admin.dashboard')}</h1>
        <p className="text-slate-600 mt-1">{t('customer.queueDesc')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.currentlyServing')}</CardDescription>
            <CardTitle className="text-3xl">
              {currentlyServing ? `#${currentlyServing.queue_number}` : '-'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {currentlyServing ? currentlyServing.customer_name : t('admin.noOneServed')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.inQueue')}</CardDescription>
            <CardTitle className="text-3xl">{activeQueue.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {activeQueue.length === 0 ? t('admin.queueEmpty') : `${activeQueue.length} ${activeQueue.length === 1 ? t('admin.customer') : t('admin.customersWaiting')}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.nextCustomer')}</CardDescription>
            <CardTitle className="text-3xl">
              {nextInQueue ? `#${nextInQueue.queue_number}` : '-'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={callNext}
              disabled={!nextInQueue}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              {t('admin.callNext')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Queue */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.activeQueue')}</CardTitle>
          <CardDescription>
            {t('admin.waitingOrServed')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeQueue.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">{t('admin.noCustomers')}</p>
              <p className="text-slate-400 text-sm mt-2">
                {t('admin.newWalkIns')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeQueue.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    entry.status === 'in_progress'
                      ? 'border-blue-500 bg-blue-50'
                      : entry.status === 'called'
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-slate-900">
                        #{entry.queue_number}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-lg">
                          {entry.customer_name}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-slate-600">
                            {entry.services.name} ({entry.services.duration_minutes} min)
                          </p>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Phone className="w-3 h-3" />
                            {entry.customer_phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          entry.status === 'in_progress' ? 'default' :
                          entry.status === 'called' ? 'outline' : 'secondary'
                        }
                        className="text-sm px-3 py-1"
                      >
                        {entry.status === 'in_progress' ? t('customer.serving') :
                         entry.status === 'called' ? t('customer.called') : t('customer.waiting')}
                      </Badge>
                      {entry.status === 'waiting' && (
                        <Button
                          onClick={() => startService(entry.id)}
                          variant="outline"
                          size="sm"
                        >
                          {t('admin.start')}
                        </Button>
                      )}
                      {entry.status === 'called' && (
                        <Button
                          onClick={() => startService(entry.id)}
                          variant="default"
                          size="sm"
                        >
                          {t('admin.startService')}
                        </Button>
                      )}
                      {entry.status === 'in_progress' && (
                        <Button
                          onClick={() => completeService(entry.id)}
                          variant="default"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t('admin.complete')}
                        </Button>
                      )}
                      <Button
                        onClick={() => cancelEntry(entry.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed/Cancelled Today */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.completedToday')}</CardTitle>
          <CardDescription>
            {queue.filter((q) => q.status === 'completed').length} {t('admin.served')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {queue
              .filter((q) => q.status === 'completed' || q.status === 'cancelled')
              .slice(0, 5)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-semibold text-slate-500">
                      #{entry.queue_number}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{entry.customer_name}</p>
                      <p className="text-sm text-slate-500">{entry.services.name}</p>
                    </div>
                  </div>
                  <Badge variant={entry.status === 'completed' ? 'outline' : 'secondary'}>
                    {entry.status === 'completed' ? t('admin.completed') : t('admin.cancelled')}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
