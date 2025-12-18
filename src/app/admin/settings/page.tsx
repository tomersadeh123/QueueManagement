'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Building2, Clock, Bell, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { createClient } from '@/lib/supabase/client';

type Business = {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  settings: {
    business_hours?: {
      [key: string]: { open: string; close: string; closed: boolean };
    };
    notifications?: {
      email_confirmations: boolean;
      email_reminders: boolean;
      sms_notifications: boolean;
    };
  };
};

export default function SettingsPage() {
  const { t, isRTL } = useLanguage();
  const supabase = createClient();

  // Business Info State
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessLoading, setBusinessLoading] = useState(false);

  // Staff User Creation State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Business Hours State
  const [businessHours, setBusinessHours] = useState({
    sunday: { open: '09:00', close: '18:00', closed: false },
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '14:00', closed: false },
    saturday: { open: '09:00', close: '18:00', closed: true },
  });

  // Notification Settings State
  const [emailConfirmations, setEmailConfirmations] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .single();

    if (data) {
      setBusiness(data);
      setBusinessName(data.name);
      setBusinessPhone(data.phone);
      setBusinessAddress(data.address || '');

      // Load business hours
      if (data.settings?.business_hours) {
        setBusinessHours(data.settings.business_hours);
      }

      // Load notification settings
      if (data.settings?.notifications) {
        setEmailConfirmations(data.settings.notifications.email_confirmations ?? true);
        setEmailReminders(data.settings.notifications.email_reminders ?? true);
        setSmsNotifications(data.settings.notifications.sms_notifications ?? false);
      }
    }
  };

  const handleUpdateBusinessInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setBusinessLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: businessName,
          phone: businessPhone,
          address: businessAddress || null,
        })
        .eq('id', business.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: isRTL ? 'פרטי העסק עודכנו בהצלחה' : 'Business information updated successfully',
      });

      fetchBusiness();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'שגיאה בעדכון פרטי העסק' : 'Error updating business information'),
      });
    } finally {
      setBusinessLoading(false);
    }
  };

  const handleUpdateBusinessHours = async () => {
    if (!business) return;

    setMessage(null);

    try {
      const updatedSettings = {
        ...business.settings,
        business_hours: businessHours,
      };

      const { error } = await supabase
        .from('businesses')
        .update({ settings: updatedSettings })
        .eq('id', business.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: isRTL ? 'שעות פתיחה עודכנו בהצלחה' : 'Business hours updated successfully',
      });

      fetchBusiness();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'שגיאה בעדכון שעות' : 'Error updating hours'),
      });
    }
  };

  const handleUpdateNotifications = async () => {
    if (!business) return;

    setMessage(null);

    try {
      const updatedSettings = {
        ...business.settings,
        notifications: {
          email_confirmations: emailConfirmations,
          email_reminders: emailReminders,
          sms_notifications: smsNotifications,
        },
      };

      const { error } = await supabase
        .from('businesses')
        .update({ settings: updatedSettings })
        .eq('id', business.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: isRTL ? 'הגדרות התראות עודכנו בהצלחה' : 'Notification settings updated successfully',
      });

      fetchBusiness();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'שגיאה בעדכון הגדרות' : 'Error updating settings'),
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setMessage({
        type: 'success',
        text: isRTL ? `חבר צוות נוצר בהצלחה: ${name}` : `Staff member created successfully: ${name}`,
      });
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'יצירת חבר הצוות נכשלה' : 'Failed to create staff member'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t('admin.settings')}</h1>
        <p className="text-slate-600 mt-1">{isRTL ? 'נהל את הגדרות העסק שלך' : 'Manage your business settings'}</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <CardTitle>{isRTL ? 'פרטי העסק' : 'Business Information'}</CardTitle>
          </div>
          <CardDescription>
            {isRTL ? 'עדכן את פרטי העסק הבסיסיים' : 'Update your basic business details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateBusinessInfo} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="business-name">
                {isRTL ? 'שם העסק' : 'Business Name'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="business-name"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                disabled={businessLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-phone">
                {isRTL ? 'טלפון' : 'Phone'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="business-phone"
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                required
                disabled={businessLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-address">
                {isRTL ? 'כתובת' : 'Address'} {isRTL ? '(אופציונלי)' : '(optional)'}
              </Label>
              <Textarea
                id="business-address"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                disabled={businessLoading}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={businessLoading}>
              <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {businessLoading ? t('common.loading') : (isRTL ? 'שמור שינויים' : 'Save Changes')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            <CardTitle>{isRTL ? 'שעות פתיחה' : 'Business Hours'}</CardTitle>
          </div>
          <CardDescription>
            {isRTL ? 'הגדר את שעות הפעילות שלך לכל יום' : 'Set your operating hours for each day'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(businessHours).map(([day, hours]) => {
            const dayNames: { [key: string]: { en: string; he: string } } = {
              sunday: { en: 'Sunday', he: 'ראשון' },
              monday: { en: 'Monday', he: 'שני' },
              tuesday: { en: 'Tuesday', he: 'שלישי' },
              wednesday: { en: 'Wednesday', he: 'רביעי' },
              thursday: { en: 'Thursday', he: 'חמישי' },
              friday: { en: 'Friday', he: 'שישי' },
              saturday: { en: 'Saturday', he: 'שבת' },
            };

            return (
              <div key={day} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                <div className="w-28">
                  <Label className="font-semibold">
                    {isRTL ? dayNames[day].he : dayNames[day].en}
                  </Label>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  {!hours.closed ? (
                    <>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, open: e.target.value },
                          })
                        }
                        className="w-32"
                      />
                      <span className="text-slate-500">-</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, close: e.target.value },
                          })
                        }
                        className="w-32"
                      />
                    </>
                  ) : (
                    <span className="text-slate-500 italic">
                      {isRTL ? 'סגור' : 'Closed'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor={`${day}-closed`} className="text-sm text-slate-600">
                    {isRTL ? 'סגור' : 'Closed'}
                  </Label>
                  <Switch
                    id={`${day}-closed`}
                    checked={hours.closed}
                    onCheckedChange={(checked) =>
                      setBusinessHours({
                        ...businessHours,
                        [day]: { ...hours, closed: checked },
                      })
                    }
                  />
                </div>
              </div>
            );
          })}

          <Button onClick={handleUpdateBusinessHours} className="mt-4">
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'שמור שעות' : 'Save Hours'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <CardTitle>{isRTL ? 'הגדרות התראות' : 'Notification Settings'}</CardTitle>
          </div>
          <CardDescription>
            {isRTL ? 'נהל את הגדרות ההתראות והתזכורות' : 'Manage notification and reminder preferences'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-confirmations" className="text-base">
                  {isRTL ? 'אישורי אימייל' : 'Email Confirmations'}
                </Label>
                <p className="text-sm text-slate-500">
                  {isRTL ? 'שלח אישור למייל כאשר תור נקבע' : 'Send email confirmation when appointment is booked'}
                </p>
              </div>
              <Switch
                id="email-confirmations"
                checked={emailConfirmations}
                onCheckedChange={setEmailConfirmations}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-reminders" className="text-base">
                  {isRTL ? 'תזכורות אימייל' : 'Email Reminders'}
                </Label>
                <p className="text-sm text-slate-500">
                  {isRTL ? 'שלח תזכורת למייל יום לפני התור' : 'Send email reminder one day before appointment'}
                </p>
              </div>
              <Switch
                id="email-reminders"
                checked={emailReminders}
                onCheckedChange={setEmailReminders}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications" className="text-base">
                  {isRTL ? 'הודעות SMS' : 'SMS Notifications'}
                </Label>
                <p className="text-sm text-slate-500">
                  {isRTL ? 'שלח הודעות SMS ללקוחות (דורש הגדרה)' : 'Send SMS messages to customers (requires setup)'}
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>
          </div>

          <Button onClick={handleUpdateNotifications}>
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'שמור הגדרות' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Create Staff Login */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-600" />
            <CardTitle>{isRTL ? 'צור חשבון צוות' : 'Create Staff Account'}</CardTitle>
          </div>
          <CardDescription>
            {isRTL ? 'צור חשבון כניסה חדש עבור חבר צוות (לגישה למערכת הניהול)' : 'Create a new login account for a staff member (for admin system access)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="staff-name">{isRTL ? 'שם מלא' : 'Full Name'}</Label>
              <Input
                id="staff-name"
                type="text"
                placeholder={isRTL ? 'שם חבר הצוות' : 'Staff member name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-phone">{isRTL ? 'טלפון' : 'Phone'} {isRTL ? '(אופציונלי)' : '(optional)'}</Label>
              <Input
                id="staff-phone"
                type="tel"
                placeholder="050-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">{t('admin.email')}</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('admin.password')}</Label>
              <Input
                id="new-password"
                type="password"
                placeholder={isRTL ? 'לפחות 6 תווים' : 'At least 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading}>
              <UserPlus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {loading ? t('common.loading') : (isRTL ? 'צור חשבון' : 'Create Account')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
