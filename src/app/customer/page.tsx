'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function CustomerHome() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Queue Manager
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/">
              <Button variant="ghost">{t('common.home')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t('customer.welcome')}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('customer.welcomeDesc')}
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Book Appointment */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/customer/book">
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
            <Link href="/customer/queue">
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
        </div>

        {/* Info */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600" />
                <CardTitle>{t('common.businessHours')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{t('customer.sundayThursday')}</p>
                  <p className="text-slate-600">9:00 AM - 7:00 PM</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{t('customer.friday')}</p>
                  <p className="text-slate-600">9:00 AM - 3:00 PM</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{t('customer.saturday')}</p>
                  <p className="text-slate-600">{t('customer.closed')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
