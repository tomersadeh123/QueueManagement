'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Plus, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { createClient } from '@/lib/supabase/client';

type Business = {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
};

export default function BusinessesManagementPage() {
  const { t, isRTL } = useLanguage();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Auto-generate slug from name
  const generateSlug = (businessName: string) => {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      setSlug(generateSlug(value));
    }
  };

  const supabase = createClient();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching businesses:', error);
    } else {
      setBusinesses(data || []);
    }
    setLoading(false);
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name,
          slug,
          phone,
          address: address || null,
        })
        .select()
        .single();

      if (error) throw error;

      setMessage({
        type: 'success',
        text: isRTL ? `עסק נוצר בהצלחה: ${name}` : `Business created successfully: ${name}`,
      });

      // Reset form
      setName('');
      setSlug('');
      setPhone('');
      setAddress('');
      setShowForm(false);

      // Refresh list
      fetchBusinesses();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'יצירת העסק נכשלה' : 'Failed to create business'),
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isRTL ? 'ניהול עסקים' : 'Business Management'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isRTL ? 'צור וניהל עסקים במערכת' : 'Create and manage businesses in the system'}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'עסק חדש' : 'New Business'}
        </Button>
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

      {/* Create Business Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'צור עסק חדש' : 'Create New Business'}</CardTitle>
            <CardDescription>
              {isRTL ? 'הזן פרטי העסק החדש' : 'Enter the new business details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBusiness} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="business-name">{isRTL ? 'שם העסק' : 'Business Name'}</Label>
                <Input
                  id="business-name"
                  type="text"
                  placeholder={isRTL ? 'לדוגמה: סלון יופי דנה' : 'e.g., Dana Beauty Salon'}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-slug">{isRTL ? 'כתובת URL ייחודית' : 'Unique URL'}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">yourdomain.com/</span>
                  <Input
                    id="business-slug"
                    type="text"
                    placeholder="dana-salon"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    required
                    disabled={formLoading}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {isRTL ? 'כתובת ייחודית לעסק (רק אותיות באנגלית, מספרים ומקפים)' : 'Unique URL for this business (lowercase, numbers, and hyphens only)'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-phone">{isRTL ? 'טלפון' : 'Phone'}</Label>
                <Input
                  id="business-phone"
                  type="tel"
                  placeholder="03-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-address">
                  {isRTL ? 'כתובת' : 'Address'} {isRTL ? '(אופציונלי)' : '(optional)'}
                </Label>
                <Input
                  id="business-address"
                  type="text"
                  placeholder={isRTL ? 'רחוב הרצל 123, תל אביב' : '123 Herzl St, Tel Aviv'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={formLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? t('common.loading') : (isRTL ? 'צור עסק' : 'Create Business')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {isRTL ? 'ביטול' : 'Cancel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Businesses List */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'עסקים קיימים' : 'Existing Businesses'}</CardTitle>
          <CardDescription>
            {isRTL ? `סך הכל ${businesses.length} עסקים` : `${businesses.length} total businesses`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">{t('common.loading')}</p>
          ) : businesses.length === 0 ? (
            <p className="text-slate-500">
              {isRTL ? 'אין עסקים במערכת. צור את הראשון!' : 'No businesses yet. Create the first one!'}
            </p>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{business.name}</h3>
                      <p className="text-sm text-slate-600">{business.phone}</p>
                      {business.address && (
                        <p className="text-sm text-slate-500">{business.address}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
