'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, XCircle, Clock, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

type Appointment = {
  id: string;
  customer_name: string;
  customer_phone: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  services: {
    name: string;
    duration_minutes: number;
  };
  staff: {
    name: string;
  };
};

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAppointments = async (daysAhead = 7) => {
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (
    id: string,
    status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  ) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (!error) {
      fetchAppointments();
    }
  };

  const groupByDate = (appointments: Appointment[]) => {
    const groups: Record<string, Appointment[]> = {};
    appointments.forEach((apt) => {
      const date = new Date(apt.appointment_time).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(apt);
    });
    return groups;
  };

  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_time);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_time);
    const today = new Date();
    return aptDate.toDateString() !== today.toDateString();
  });

  const groupedUpcoming = groupByDate(upcomingAppointments);

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t('admin.appointments')}</h1>
        <p className="text-slate-600 mt-1">{t('customer.bookDesc')}</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.today')}</CardDescription>
            <CardTitle className="text-3xl">{todayAppointments.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {todayAppointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length} {t('admin.upcoming')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.thisWeek')}</CardDescription>
            <CardTitle className="text-3xl">{appointments.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{t('admin.totalScheduled')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.confirmed')}</CardDescription>
            <CardTitle className="text-3xl">
              {appointments.filter((a) => a.status === 'confirmed').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{t('admin.readyToServe')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('admin.completed')}</CardDescription>
            <CardTitle className="text-3xl">
              {appointments.filter((a) => a.status === 'completed').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{t('admin.thisWeek')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">{t('admin.today')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('admin.upcoming')}</TabsTrigger>
          <TabsTrigger value="all">{t('admin.all')}</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.todayAppointments')}</CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">{t('admin.noAppointments')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      onUpdateStatus={updateStatus}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {Object.keys(groupedUpcoming).length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">{t('admin.noAppointments')}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedUpcoming).map(([date, apts]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</CardTitle>
                  <CardDescription>{apts.length} {t('admin.appointmentsCount')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apts.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onUpdateStatus={updateStatus}
                        t={t}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.all')} {t('admin.appointments')}</CardTitle>
              <CardDescription>{t('admin.next7Days')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onUpdateStatus={updateStatus}
                    t={t}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AppointmentCard({
  appointment,
  onUpdateStatus,
  t,
}: {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: any) => void;
  t: (key: string) => string;
}) {
  const time = new Date(appointment.appointment_time);
  const isPast = time < new Date();

  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-sm font-semibold text-slate-900">
              {format(time, 'HH:mm')}
            </div>
            <div className="text-xs text-slate-500">
              {format(time, 'MMM d')}
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{appointment.customer_name}</p>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
              <span>{appointment.services.name}</span>
              <span>•</span>
              <span>{appointment.staff.name}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {appointment.services.duration_minutes} {t('common.min')}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
              <Phone className="w-3 h-3" />
              {appointment.customer_phone}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              appointment.status === 'confirmed' ? 'default' :
              appointment.status === 'completed' ? 'outline' :
              appointment.status === 'cancelled' || appointment.status === 'no_show' ? 'secondary' :
              'secondary'
            }
          >
            {appointment.status === 'confirmed' ? t('admin.confirmed') :
             appointment.status === 'pending' ? t('admin.pending') :
             appointment.status === 'in_progress' ? t('admin.inProgress') :
             appointment.status === 'completed' ? t('admin.completed') :
             appointment.status === 'cancelled' ? t('admin.cancelled') :
             appointment.status === 'no_show' ? t('admin.noShow') :
             appointment.status}
          </Badge>
          {!isPast && appointment.status === 'pending' && (
            <Button
              onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
              variant="outline"
              size="sm"
            >
              {t('admin.confirm')}
            </Button>
          )}
          {!isPast && (appointment.status === 'confirmed' || appointment.status === 'pending') && (
            <>
              <Button
                onClick={() => onUpdateStatus(appointment.id, 'in_progress')}
                variant="default"
                size="sm"
              >
                {t('admin.start')}
              </Button>
              <Button
                onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                variant="ghost"
                size="sm"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          {appointment.status === 'in_progress' && (
            <Button
              onClick={() => onUpdateStatus(appointment.id, 'completed')}
              variant="default"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('admin.complete')}
            </Button>
          )}
        </div>
      </div>
      {appointment.notes && (
        <div className="mt-2 pt-2 border-t text-sm text-slate-600">
          <strong>{t('admin.notes')}:</strong> {appointment.notes}
        </div>
      )}
    </div>
  );
}
