'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
};

type QueueEntry = {
  queue_number: number;
  status: string;
};

export default function JoinQueuePage() {
  const { t, isRTL } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [queueInfo, setQueueInfo] = useState<QueueEntry | null>(null);
  const [businessId, setBusinessId] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchServices();
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .single();
    if (data) {
      setBusinessId(data.id);
    }
  };

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (data) {
      setServices(data);
    }
  };

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !customerName || !customerPhone || !businessId) return;

    setLoading(true);

    try {
      // Get next queue number
      const { data: maxQueueData } = await supabase
        .from('queue_entries')
        .select('queue_number')
        .eq('business_id', businessId)
        .gte('created_at', new Date().toISOString().split('T')[0])
        .order('queue_number', { ascending: false })
        .limit(1);

      const nextNumber = maxQueueData && maxQueueData.length > 0
        ? maxQueueData[0].queue_number + 1
        : 1;

      // Insert into queue
      const { data, error } = await supabase
        .from('queue_entries')
        .insert({
          business_id: businessId,
          customer_name: customerName,
          customer_phone: customerPhone,
          service_id: selectedService,
          queue_number: nextNumber,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;

      setQueueInfo(data);
      setJoined(true);
    } catch (error) {
      console.error('Error joining queue:', error);
      alert('Failed to join queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (joined && queueInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/customer" className="text-xl font-bold text-slate-900">
              Queue Manager
            </Link>
            <LanguageSwitcher />
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {t('customer.youreInQueue')}
            </h1>

            <Card className="text-left mt-8">
              <CardHeader>
                <CardTitle className="text-center text-6xl font-bold text-blue-600">
                  #{queueInfo.queue_number}
                </CardTitle>
                <CardDescription className="text-center text-lg">
                  {t('customer.yourNumber')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">{t('customer.customerInfo')}</p>
                  <p className="font-medium text-slate-900">{customerName}</p>
                  <p className="text-sm text-slate-600">{customerPhone}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{t('customer.status')}</span>
                  <Badge variant="secondary" className="text-sm">
                    {t('customer.waiting')}
                  </Badge>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-slate-600 mb-3">{t('customer.whatHappensNext')}</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <span>{t('customer.step1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <span>{t('customer.step2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <span>{t('customer.step3')}</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link href="/queue-display" className="flex-1">
                    <Button variant="outline" className="w-full">
                      {t('customer.viewQueueDisplay')}
                    </Button>
                  </Link>
                  <Link href="/customer" className="flex-1">
                    <Button variant="default" className="w-full">
                      {t('common.done')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/customer">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">{t('customer.queueTitle')}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {t('customer.queueTitle')}
            </h2>
            <p className="text-slate-600">
              {t('customer.enterDetails')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('customer.customerInfo')}</CardTitle>
              <CardDescription>
                {t('customer.wellNotify')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinQueue} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('customer.name')}</Label>
                  <Input
                    id="name"
                    placeholder={t('customer.name')}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('customer.phone')}</Label>
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
                  <Label htmlFor="service">{t('customer.service')}</Label>
                  <Select value={selectedService} onValueChange={setSelectedService} required>
                    <SelectTrigger>
                      <SelectValue placeholder={t('customer.chooseService')} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center justify-between gap-4">
                            <span>{service.name}</span>
                            <span className="text-xs text-slate-500">
                              {service.duration_minutes} {t('common.min')} • ₪{service.price}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">{t('customer.estimatedWait')}</p>
                      <p className="text-blue-700">
                        {t('customer.wellNotify')}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? t('customer.joiningQueue') : t('customer.joinQueue')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
