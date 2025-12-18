'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, X, Search, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type Business = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
};

type Appointment = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  appointment_time: string;
  status: string;
  notes: string;
  service: {
    name: string;
    duration_minutes: number;
    price: number;
  };
  staff: {
    name: string;
  };
};

export default function MyAppointmentsPage() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const businessSlug = params.businessSlug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [searchMethod, setSearchMethod] = useState<'phone' | 'email'>('phone');
  const [searchValue, setSearchValue] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchBusiness();
  }, [businessSlug]);

  const fetchBusiness = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', businessSlug)
      .single();

    if (error || !data) {
      console.error('Business not found:', error);
      router.push('/');
      return;
    }

    setBusiness(data);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setLoading(true);
    setSearched(true);

    try {
      const now = new Date().toISOString();

      let query = supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, duration_minutes, price),
          staff:staff(name)
        `)
        .eq('business_id', business.id)
        .gte('appointment_time', now)
        .in('status', ['confirmed', 'pending'])
        .order('appointment_time', { ascending: true });

      if (searchMethod === 'phone') {
        query = query.eq('customer_phone', searchValue);
      } else {
        query = query.eq('customer_email', searchValue);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert(isRTL ? 'שגיאה בחיפוש תורים' : 'Error searching appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm(isRTL ? 'האם אתה בטוח שברצונך לבטל את התור?' : 'Are you sure you want to cancel this appointment?')) {
      return;
    }

    setCancellingId(appointmentId);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      // Remove from list
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));

      alert(isRTL ? 'התור בוטל בהצלחה' : 'Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert(isRTL ? 'שגיאה בביטול התור' : 'Error cancelling appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    const statusLabels = {
      confirmed: isRTL ? 'מאושר' : 'Confirmed',
      pending: isRTL ? 'ממתין' : 'Pending',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100'}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${businessSlug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'חזרה' : 'Back'}
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            {isRTL ? 'התורים שלי' : 'My Appointments'}
          </h1>
          <p className="text-slate-600 mt-2">
            {isRTL ? `הצג וניהל את התורים שלך ב${business.name}` : `View and manage your appointments at ${business.name}`}
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {isRTL ? 'חפש את התורים שלך' : 'Find Your Appointments'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'הזן את הטלפון או האימייל שבו השתמשת בעת ההזמנה' : 'Enter the phone or email you used when booking'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Method Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={searchMethod === 'phone' ? 'default' : 'outline'}
                  onClick={() => setSearchMethod('phone')}
                  className="flex-1"
                >
                  {isRTL ? 'טלפון' : 'Phone'}
                </Button>
                <Button
                  type="button"
                  variant={searchMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setSearchMethod('email')}
                  className="flex-1"
                >
                  {isRTL ? 'אימייל' : 'Email'}
                </Button>
              </div>

              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="search">
                  {searchMethod === 'phone'
                    ? (isRTL ? 'מספר טלפון' : 'Phone Number')
                    : (isRTL ? 'כתובת אימייל' : 'Email Address')
                  }
                </Label>
                <Input
                  id="search"
                  type={searchMethod === 'phone' ? 'tel' : 'email'}
                  placeholder={searchMethod === 'phone' ? '050-1234567' : 'example@email.com'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (isRTL ? 'מחפש...' : 'Searching...') : (isRTL ? 'חפש תורים' : 'Search Appointments')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && (
          <div>
            {appointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {isRTL ? 'לא נמצאו תורים' : 'No Appointments Found'}
                  </h3>
                  <p className="text-slate-600">
                    {isRTL
                      ? 'לא נמצאו תורים עתידיים עבור פרטי התקשורת שהזנת'
                      : 'No upcoming appointments found for the contact details you entered'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  {isRTL ? `נמצאו ${appointments.length} תורים` : `${appointments.length} Appointment${appointments.length > 1 ? 's' : ''} Found`}
                </h2>

                {appointments.map((appointment) => {
                  const date = new Date(appointment.appointment_time);
                  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
                  const formattedTime = format(date, 'h:mm a');

                  return (
                    <Card key={appointment.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                              {business.name}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(appointment.id)}
                            disabled={cancellingId === appointment.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {isRTL ? 'בטל' : 'Cancel'}
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-slate-700">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{formattedTime}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span>{(appointment.service as any).name} - {(appointment.service as any).duration_minutes} {isRTL ? 'דקות' : 'minutes'}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">
                              <strong>{isRTL ? 'הערות:' : 'Notes:'}</strong> {appointment.notes}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-sm text-slate-600">
                            📞 {business.phone}
                          </p>
                          {business.address && (
                            <p className="text-sm text-slate-600">
                              📍 {business.address}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
