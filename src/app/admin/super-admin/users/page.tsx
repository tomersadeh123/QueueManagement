'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users as UsersIcon, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

type Business = {
  id: string;
  name: string;
};

type Staff = {
  id: string;
  name: string;
  phone: string;
  role: string;
  is_active: boolean;
  user_id: string;
  business: {
    name: string;
  };
  auth_user: {
    email: string;
  };
};

export default function UsersManagementPage() {
  const { t, isRTL } = useLanguage();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedRole, setSelectedRole] = useState('staff');

  const supabase = createClient();

  useEffect(() => {
    fetchBusinesses();
    fetchStaff();
  }, []);

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching businesses:', error);
    } else {
      setBusinesses(data || []);
      if (data && data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staff')
      .select(`
        id,
        name,
        phone,
        role,
        is_active,
        user_id,
        business:businesses(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching staff:', error);
    } else {
      // Fetch email for each staff member
      const staffWithEmail = await Promise.all(
        (data || []).map(async (s) => {
          if (s.user_id) {
            const { data: userData } = await supabase.auth.admin.getUserById(s.user_id);
            return {
              ...s,
              auth_user: { email: userData?.user?.email || 'N/A' },
            };
          }
          return { ...s, auth_user: { email: 'N/A' } };
        })
      );
      setStaff(staffWithEmail as any);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          business_id: selectedBusinessId,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setMessage({
        type: 'success',
        text: isRTL ? `משתמש נוצר בהצלחה: ${name}` : `User created successfully: ${name}`,
      });

      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setSelectedRole('staff');

      // Refresh list
      fetchStaff();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'יצירת המשתמש נכשלה' : 'Failed to create user'),
      });
    } finally {
      setFormLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'business_admin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return isRTL ? 'מנהל על' : 'Super Admin';
      case 'business_admin':
        return isRTL ? 'מנהל עסק' : 'Business Admin';
      default:
        return isRTL ? 'עובד' : 'Staff';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {isRTL ? 'ניהול משתמשים' : 'User Management'}
        </h1>
        <p className="text-slate-600 mt-1">
          {isRTL ? 'צור וניהל משתמשים עבור כל העסקים' : 'Create and manage users for all businesses'}
        </p>
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

      {/* Create User Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <CardTitle>{isRTL ? 'צור משתמש חדש' : 'Create New User'}</CardTitle>
          </div>
          <CardDescription>
            {isRTL ? 'הוסף משתמש חדש והקצה אותו לעסק' : 'Add a new user and assign to a business'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="user-name">{isRTL ? 'שם מלא' : 'Full Name'}</Label>
              <Input
                id="user-name"
                type="text"
                placeholder={isRTL ? 'שם המשתמש' : 'User name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-phone">
                {isRTL ? 'טלפון' : 'Phone'} {isRTL ? '(אופציונלי)' : '(optional)'}
              </Label>
              <Input
                id="user-phone"
                type="tel"
                placeholder="050-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">{t('admin.email')}</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">{t('admin.password')}</Label>
              <Input
                id="user-password"
                type="password"
                placeholder={isRTL ? 'לפחות 6 תווים' : 'At least 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-business">{isRTL ? 'עסק' : 'Business'}</Label>
              <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId} disabled={formLoading}>
                <SelectTrigger id="user-business">
                  <SelectValue placeholder={isRTL ? 'בחר עסק' : 'Select business'} />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">{isRTL ? 'תפקיד' : 'Role'}</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={formLoading}>
                <SelectTrigger id="user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">{isRTL ? 'עובד' : 'Staff'}</SelectItem>
                  <SelectItem value="business_admin">{isRTL ? 'מנהל עסק' : 'Business Admin'}</SelectItem>
                  <SelectItem value="super_admin">{isRTL ? 'מנהל על' : 'Super Admin'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? t('common.loading') : (isRTL ? 'צור משתמש' : 'Create User')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'כל המשתמשים' : 'All Users'}</CardTitle>
          <CardDescription>
            {isRTL ? `סך הכל ${staff.length} משתמשים` : `${staff.length} total users`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">{t('common.loading')}</p>
          ) : staff.length === 0 ? (
            <p className="text-slate-500">
              {isRTL ? 'אין משתמשים במערכת' : 'No users in the system'}
            </p>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{member.name}</h3>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{member.auth_user?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-500">
                          {(member.business as any)?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    {member.is_active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {isRTL ? 'פעיל' : 'Active'}
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        {isRTL ? 'לא פעיל' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
