'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Phone, ArrowRight, Calendar, Users, Plus } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from '@/lib/supabase/client';

type Business = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
};

export default function Home() {
  const { t, isRTL } = useLanguage();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching businesses:', error);
    } else {
      setBusinesses(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isRTL ? 'מערכת ניהול תורים' : 'Queue Manager'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/admin">
              <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                {t('admin.dashboard')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {isRTL ? '✨ פתרון ניהול תורים מודרני' : '✨ Modern Appointment Management'}
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            {isRTL ? (
              <>
                ברוכים הבאים!
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  בחר את העסק שלך
                </span>
              </>
            ) : (
              <>
                Welcome!
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Choose Your Business
                </span>
              </>
            )}
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            {isRTL
              ? 'קבע תור בקלות, הצטרף לתור, או נהל את התורים שלך - הכל במקום אחד'
              : 'Book appointments easily, join the queue, or manage your bookings - all in one place'}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">
                {isRTL ? 'קביעת תורים מקוונת' : 'Online Booking'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">
                {isRTL ? 'ניהול תור בזמן אמת' : 'Real-time Queue'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">
                {isRTL ? 'מיקומים מרובים' : 'Multiple Locations'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Businesses List */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            {isRTL ? 'בחר עסק' : 'Select a Business'}
          </h3>
          <p className="text-slate-600">
            {isRTL ? `${businesses.length} עסקים זמינים` : `${businesses.length} businesses available`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-slate-600">{t('common.loading')}</p>
            </div>
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                {isRTL ? 'אין עסקים זמינים' : 'No Businesses Available'}
              </h3>
              <p className="text-slate-600 mb-6">
                {isRTL ? 'אין עסקים רשומים במערכת כרגע' : 'There are no businesses registered in the system yet'}
              </p>
              <Link href="/admin/super-admin/businesses">
                <Button size="lg" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {isRTL ? 'צור עסק חדש' : 'Create New Business'}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {businesses.map((business, index) => {
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-green-500 to-green-600',
                'from-orange-500 to-orange-600',
                'from-pink-500 to-pink-600',
                'from-indigo-500 to-indigo-600',
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <Link key={business.id} href={`/${business.slug}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full border-2 border-transparent hover:border-blue-200 bg-white overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors">
                        {business.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {business.phone && (
                          <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Phone className="w-4 h-4" />
                            </div>
                            <span className="text-sm">{business.phone}</span>
                          </div>
                        )}
                        {business.address && (
                          <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="text-sm line-clamp-2">{business.address}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-2">
                        <Button className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 shadow-lg group-hover:shadow-xl transition-all`} size="lg">
                          {isRTL ? 'כניסה לעסק' : 'Visit Business'}
                          <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'} group-hover:translate-x-1 transition-transform`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
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
