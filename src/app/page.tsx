'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Monitor, Bell } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Queue Manager</h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/admin">
              <Button variant="outline">{t('admin.dashboard')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-slate-900 mb-6">
          {t('landing.title')}
          <br />
          <span className="text-blue-600">{t('landing.subtitle')}</span>
        </h2>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          {t('landing.description')}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/customer">
            <Button size="lg" className="text-lg px-8">
              {t('landing.bookAppointment')}
            </Button>
          </Link>
          <Link href="/customer/queue">
            <Button size="lg" variant="outline" className="text-lg px-8">
              {t('landing.joinQueue')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">
          {t('landing.features')}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Calendar className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>{t('landing.onlineBooking')}</CardTitle>
              <CardDescription>
                {t('landing.onlineBookingDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                {t('landing.onlineBookingDetail')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-green-600 mb-2" />
              <CardTitle>{t('landing.walkInQueue')}</CardTitle>
              <CardDescription>
                {t('landing.walkInQueueDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                {t('landing.walkInQueueDetail')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Monitor className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle>{t('landing.liveDisplay')}</CardTitle>
              <CardDescription>
                {t('landing.liveDisplayDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                {t('landing.liveDisplayDetail')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="w-10 h-10 text-orange-600 mb-2" />
              <CardTitle>{t('landing.notifications')}</CardTitle>
              <CardDescription>
                {t('landing.notificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                {t('landing.notificationsDetail')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Access</CardTitle>
            <CardDescription className="text-slate-300">
              Choose your destination
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/customer">
              <Button variant="secondary" size="lg">
                Customer Booking
              </Button>
            </Link>
            <Link href="/queue-display">
              <Button variant="secondary" size="lg">
                Queue Display
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="secondary" size="lg">
                Staff Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>Built with Next.js, Supabase & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
