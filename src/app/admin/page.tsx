'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

type QueueEntry = {
  id: string;
  queue_number: number;
  customer_name: string;
  status: string;
  services?: { name: string };
};

type Appointment = {
  id: string;
  customer_name: string;
  appointment_time: string;
  status: string;
  services?: { name: string };
  staff?: { name: string };
};

type Business = {
  name: string;
};

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's queue entries
    const { data: queueData } = await supabase
      .from('queue_entries')
      .select('*, services(name)')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('queue_number', { ascending: true });

    // Fetch today's appointments
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('*, services(name), staff(name)')
      .gte('appointment_time', today.toISOString())
      .lt('appointment_time', tomorrow.toISOString())
      .order('appointment_time', { ascending: true });

    // Fetch business info
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .single();

    if (queueData) setQueueEntries(queueData);
    if (appointmentsData) setAppointments(appointmentsData);
    if (businessData) setBusiness(businessData);
    setLoading(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate stats
  const activeQueue = queueEntries?.filter((q) =>
    q.status === 'waiting' || q.status === 'in_progress'
  ) || [];

  const completedToday = queueEntries?.filter((q) => q.status === 'completed').length || 0;

  const upcomingAppointments = appointments?.filter((a) =>
    a.status === 'confirmed' || a.status === 'pending'
  ) || [];

  const currentlyServing = queueEntries?.find((q) => q.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {business?.name || 'Dashboard'}
        </h1>
        <p className="text-slate-600 mt-1">
          {today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.inQueue')}</CardDescription>
            <CardTitle className="text-3xl">{activeQueue.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="w-4 h-4" />
              {currentlyServing ? `${t('admin.nowServing')} #${currentlyServing.queue_number}` : t('admin.queueEmpty')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.today')}</CardDescription>
            <CardTitle className="text-3xl">{appointments?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              {upcomingAppointments.length} {t('admin.upcoming')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.completed')}</CardDescription>
            <CardTitle className="text-3xl">{completedToday}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingUp className="w-4 h-4" />
              {t('admin.queueCustomers')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.avgWait')}</CardDescription>
            <CardTitle className="text-3xl">
              {activeQueue.length > 0 ? '~30' : '0'}
              <span className="text-lg text-slate-500 ml-1">{t('common.min')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              {t('admin.estimated')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('admin.currentQueue')}</CardTitle>
              <Link href="/admin/queue">
                <Button variant="outline" size="sm">{t('admin.viewAll')}</Button>
              </Link>
            </div>
            <CardDescription>
              {activeQueue.length} {activeQueue.length === 1 ? t('admin.customer') : t('admin.customersWaiting')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeQueue.length === 0 ? (
              <p className="text-center text-slate-500 py-8">{t('admin.noCustomers')}</p>
            ) : (
              <div className="space-y-3">
                {activeQueue.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-slate-900">
                        #{entry.queue_number}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{entry.customer_name}</p>
                        <p className="text-sm text-slate-600">
                          {entry.services?.name}
                        </p>
                      </div>
                    </div>
                    <Badge variant={entry.status === 'in_progress' ? 'default' : 'secondary'}>
                      {entry.status === 'in_progress' ? t('customer.serving') : t('customer.waiting')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('admin.todayAppointments')}</CardTitle>
              <Link href="/admin/appointments">
                <Button variant="outline" size="sm">{t('admin.viewAll')}</Button>
              </Link>
            </div>
            <CardDescription>
              {upcomingAppointments.length} {t('admin.upcoming')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments?.length === 0 ? (
              <p className="text-center text-slate-500 py-8">{t('admin.noAppointments')}</p>
            ) : (
              <div className="space-y-3">
                {appointments?.slice(0, 5).map((apt) => {
                  const time = new Date(apt.appointment_time);
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-slate-900">
                          {time.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{apt.customer_name}</p>
                          <p className="text-sm text-slate-600">
                            {apt.services?.name} • {apt.staff?.name}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          apt.status === 'confirmed' ? 'default' :
                          apt.status === 'pending' ? 'secondary' :
                          apt.status === 'completed' ? 'outline' : 'secondary'
                        }
                      >
                        {apt.status === 'confirmed' ? t('admin.confirmed') :
                         apt.status === 'pending' ? t('admin.pending') :
                         apt.status === 'completed' ? t('admin.completed') :
                         apt.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
