'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, FileText, ArrowRight, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';

type Business = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
};

export default function BusinessLandingPage() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const businessSlug = params.businessSlug as string;
  const supabase = createClient();

  useEffect(() => {
    fetchBusiness();
  }, [businessSlug]);

  const fetchBusiness = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            {isRTL ? `ברוכים הבאים ל${business.name}` : `Welcome to ${business.name}`}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            {isRTL ? 'בחר את הדרך המועדפת עליך לקבוע תור' : 'Choose your preferred way to book'}
          </p>

          {/* Business Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600">
            {business.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{business.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Book Appointment */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href={`/${businessSlug}/book`}>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">{t('customer.bookTitle')}</CardTitle>
                <CardDescription className="text-base">
                  {t('customer.bookDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    {t('customer.chooseTimeSlot')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    {t('customer.selectStylist')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    {t('customer.getConfirmation')}
                  </li>
                </ul>
                <Button className="w-full" size="lg">
                  {t('customer.bookNow')}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Join Queue */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href={`/${businessSlug}/queue`}>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl">{t('customer.queueTitle')}</CardTitle>
                <CardDescription className="text-base">
                  {t('customer.queueDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    {t('customer.noAppointment')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    {t('customer.trackPosition')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    {t('customer.getNotifiedTurn')}
                  </li>
                </ul>
                <Button className="w-full" size="lg" variant="outline">
                  {t('customer.joinQueue')}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* My Appointments */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href={`/${businessSlug}/my-appointments`}>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">{isRTL ? 'התורים שלי' : 'My Appointments'}</CardTitle>
                <CardDescription className="text-base">
                  {isRTL ? 'צפה וניהל את התורים שלך' : 'View and manage your bookings'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    {isRTL ? 'צפה בתורים שלך' : 'View your appointments'}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    {isRTL ? 'בטל תור' : 'Cancel if needed'}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    {isRTL ? 'קבל תזכורות' : 'Get reminders'}
                  </li>
                </ul>
                <Button className="w-full" size="lg" variant="outline">
                  {isRTL ? 'התורים שלי' : 'View Appointments'}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
