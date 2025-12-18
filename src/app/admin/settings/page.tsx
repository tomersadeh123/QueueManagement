'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
  const { t, isRTL } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        <p className="text-slate-600 mt-1">{t('admin.manageSettings')}</p>
      </div>

      {/* Add Staff Member */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <CardTitle>{isRTL ? 'הוסף חבר צוות' : 'Add Staff Member'}</CardTitle>
          </div>
          <CardDescription>
            {isRTL ? 'צור חשבון כניסה חדש עבור חבר צוות' : 'Create a new login account for a staff member'}
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
                placeholder={isRTL ? '050-1234567' : '050-1234567'}
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

            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading') : (isRTL ? 'צור משתמש' : 'Create User')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Other Settings - Coming Soon */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle>{t('admin.comingSoon')}</CardTitle>
          </div>
          <CardDescription>
            {t('admin.settingsUnderConstruction')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            {t('admin.thisPageWillAllow')}
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
            <li>{t('admin.businessInfo')}</li>
            <li>{t('admin.staffSchedules')}</li>
            <li>{t('admin.servicesPricing')}</li>
            <li>{t('admin.notificationPrefs')}</li>
            <li>{t('admin.integrationSettings')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
