'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, CheckCircle, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { format, setHours, setMinutes } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type Business = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
};

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string | null;
};

type Staff = {
  id: string;
  name: string;
};

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const businessSlug = params.businessSlug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchBusiness();
  }, [businessSlug]);

  useEffect(() => {
    if (business) {
      fetchServices();
      fetchStaff();
    }
  }, [business]);

  // Update available time slots when date or staff changes
  useEffect(() => {
    if (selectedDate && selectedStaff) {
      generateTimeSlots().then(slots => setAvailableTimeSlots(slots));
    }
  }, [selectedDate, selectedStaff]);

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

  const fetchServices = async () => {
    if (!business) return;

    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('name');
    if (data) setServices(data);
  };

  const fetchStaff = async () => {
    if (!business) return;

    const { data } = await supabase
      .from('staff')
      .select('id, name')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('name');
    if (data) setStaff(data);
  };

  const generateTimeSlots = async () => {
    const slots = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break; // Stop at 18:30
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }

    // Filter out already booked slots for selected date and staff
    if (selectedDate && selectedStaff) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('staff_id', selectedStaff.id)
        .gte('appointment_time', `${dateStr}T00:00:00`)
        .lte('appointment_time', `${dateStr}T23:59:59`)
        .in('status', ['confirmed', 'pending', 'in_progress']);

      if (existingAppointments && existingAppointments.length > 0) {
        const bookedTimes = existingAppointments.map(apt => {
          const date = new Date(apt.appointment_time);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        });
        return slots.filter(slot => !bookedTimes.includes(slot));
      }
    }

    return slots;
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime || !customerName || !customerPhone || !customerEmail || !business) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentTime = setMinutes(setHours(selectedDate, hours), minutes);

      const { data: appointmentData, error } = await supabase
        .from('appointments')
        .insert({
          business_id: business.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          service_id: selectedService.id,
          staff_id: selectedStaff.id,
          appointment_time: appointmentTime.toISOString(),
          status: 'confirmed',
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email
      if (appointmentData) {
        try {
          await fetch('/api/send-appointment-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId: appointmentData.id,
              type: 'confirmation',
            }),
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the booking if email fails
        }
      }

      setBooked(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href={`/${businessSlug}`} className="text-xl font-bold text-slate-900">
              {business.name}
            </Link>
            <LanguageSwitcher />
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {t('booking.confirmed')}
            </h1>

            <Card className="text-left mt-8">
              <CardHeader>
                <CardTitle>{t('booking.appointmentDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-slate-600">{t('booking.at')} {selectedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-900">{selectedStaff?.name}</p>
                      <p className="text-sm text-slate-600">{selectedService?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('booking.customer')}</span>
                    <span className="font-medium text-slate-900">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('booking.phone')}</span>
                    <span className="font-medium text-slate-900">{customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{isRTL ? 'אימייל' : 'Email'}</span>
                    <span className="font-medium text-slate-900">{customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('booking.duration')}</span>
                    <span className="font-medium text-slate-900">
                      {selectedService?.duration_minutes} {t('booking.minutes')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('booking.price')}</span>
                    <span className="font-medium text-slate-900">₪{selectedService?.price}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-slate-600 mb-2">{t('booking.whatNext')}</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <span>{t('booking.receiveConfirmation')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <span>{t('booking.receiveReminder')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <span>{t('booking.arriveEarly')}</span>
                    </li>
                  </ul>
                </div>

                <Link href={`/${businessSlug}`}>
                  <Button className="w-full" size="lg">
                    {t('common.done')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${businessSlug}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">{t('customer.bookTitle')}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 h-1 ${
                      s < step ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Service */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('booking.selectService')}</CardTitle>
                <CardDescription>{t('booking.chooseService')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setStep(2);
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-500 ${
                        selectedService?.id === service.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200'
                      }`}
                    >
                      <h3 className="font-semibold text-slate-900 mb-2">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">
                          <Clock className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {service.duration_minutes} {t('common.min')}
                        </Badge>
                        <Badge variant="outline">₪{service.price}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select Staff */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('booking.selectStaff')}</CardTitle>
                <CardDescription>
                  {t('booking.selected')}: {selectedService?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedStaff(member)}
                      className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all hover:border-blue-500 ${
                        selectedStaff?.id === member.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-3" />
                      <p className="font-semibold text-slate-900">{member.name}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    {t('booking.back')}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep(3)}
                    disabled={!selectedStaff}
                  >
                    {t('booking.continue')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('booking.selectDateTime')}</CardTitle>
                <CardDescription>
                  {selectedService?.name} {t('booking.with')} {selectedStaff?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-2 block">{t('booking.selectDate')}</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date < new Date() || date.getDay() === 6 // Disable past dates and Saturdays
                    }
                    className="rounded-md border"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">{t('booking.selectTime')}</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    {t('booking.back')}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep(4)}
                    disabled={!selectedDate || !selectedTime}
                  >
                    {t('booking.continue')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Your Details */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('booking.yourDetails')}</CardTitle>
                <CardDescription>
                  {selectedDate && format(selectedDate, 'EEE, MMM d')} {t('booking.at')} {selectedTime}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleBooking(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('customer.name')}</Label>
                    <Input
                      id="name"
                      placeholder={t('booking.enterName')}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('booking.phoneNumber')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+972-50-1234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {isRTL ? 'אימייל' : 'Email'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={isRTL ? 'example@email.com' : 'example@email.com'}
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      {isRTL ? 'נשלח אליך אישור ותזכורת למייל' : 'We\'ll send you confirmation and reminder emails'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('booking.specialRequests')}</Label>
                    <Input
                      id="notes"
                      placeholder={t('booking.anyRequests')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('booking.service')}</span>
                      <span className="font-medium">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('booking.stylist')}</span>
                      <span className="font-medium">{selectedStaff?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('booking.duration')}</span>
                      <span className="font-medium">{selectedService?.duration_minutes} {t('common.min')}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-2 border-t">
                      <span>{t('booking.total')}</span>
                      <span>₪{selectedService?.price}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>
                      {t('booking.back')}
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? t('booking.booking') : t('booking.confirmBooking')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
