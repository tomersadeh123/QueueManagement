'use client';

import { useEffect, useState } from 'react';
import { useRealtimeQueue } from '@/hooks/useRealtimeQueue';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function QueueDisplayPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { queue } = useRealtimeQueue();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nowServing = queue.find((q) => q.status === 'in_progress');
  const upcoming = queue.filter((q) => q.status === 'waiting' || q.status === 'called');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Style & Cut Salon</h1>
            <p className="text-blue-200">{t('common.queueManagementSystem')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-4xl font-bold">
                {format(currentTime, 'HH:mm')}
              </div>
              <div className="text-sm text-blue-200">
                {format(currentTime, 'EEEE, MMMM d')}
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-12">
        {/* Now Serving - Large Display */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold">{t('queue.nowServing')}</h2>
          </div>

          {nowServing ? (
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-12 shadow-2xl border border-blue-400">
              <div className="text-center">
                <div className="text-9xl font-bold mb-4 tracking-wider">
                  #{nowServing.queue_number}
                </div>
                <div className="text-3xl font-semibold opacity-90">
                  {nowServing.customer_name}
                </div>
                <div className="text-xl text-blue-100 mt-2">
                  {nowServing.services.name}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-3xl p-12 border border-slate-700">
              <div className="text-center text-slate-400">
                <div className="text-6xl mb-4">—</div>
                <div className="text-2xl">{t('queue.noServing')}</div>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Queue */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-7 h-7 text-blue-400" />
              <h2 className="text-2xl font-bold">{t('queue.upcoming')}</h2>
            </div>
            <Badge className="text-lg px-4 py-2 bg-blue-600">
              {upcoming.length} {t('queue.inQueue')}
            </Badge>
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 text-center">
              <p className="text-xl text-slate-400">{t('queue.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.slice(0, 9).map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-xl p-6 border-2 transition-all ${
                    entry.status === 'called'
                      ? 'bg-green-600/20 border-green-500 animate-pulse'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-5xl font-bold">
                      #{entry.queue_number}
                    </div>
                    {entry.status === 'called' && (
                      <Badge className="bg-green-500 text-white text-sm">
                        {t('customer.called')}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xl font-semibold mb-1">
                    {entry.customer_name}
                  </div>
                  <div className="text-sm text-blue-200">
                    {entry.services.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold text-blue-300 mb-2">{t('common.businessHours')}</h3>
            <p className="text-sm text-slate-300">
              {isRTL ? 'א\'-ה\': 9:00 - 19:00' : 'Sun-Thu: 9:00 AM - 7:00 PM'}<br />
              {isRTL ? 'ו\': 9:00 - 15:00' : 'Fri: 9:00 AM - 3:00 PM'}<br />
              {isRTL ? 'שבת: סגור' : 'Sat: Closed'}
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold text-blue-300 mb-2">
              {t('common.walkInsWelcome')}
            </h3>
            <p className="text-sm text-slate-300">
              {t('common.joinQueueText')}
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold text-blue-300 mb-2">
              {t('common.needHelp')}
            </h3>
            <p className="text-sm text-slate-300">
              {t('common.speakToStaff')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
