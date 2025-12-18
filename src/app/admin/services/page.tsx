'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Scissors, Plus, Edit, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { createClient } from '@/lib/supabase/client';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string | null;
  is_active: boolean;
};

export default function ServicesManagementPage() {
  const { t, isRTL } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching services:', error);
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName('');
    setDuration('30');
    setPrice('');
    setDescription('');
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDuration(service.duration_minutes.toString());
    setPrice(service.price.toString());
    setDescription(service.description || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    try {
      // Get business ID
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .single();

      if (!business) throw new Error('Business not found');

      const serviceData = {
        name,
        duration_minutes: parseInt(duration),
        price: parseFloat(price),
        description: description || null,
        business_id: business.id,
        is_active: true,
      };

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        setMessage({
          type: 'success',
          text: isRTL ? `השירות "${name}" עודכן בהצלחה` : `Service "${name}" updated successfully`,
        });
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;

        setMessage({
          type: 'success',
          text: isRTL ? `השירות "${name}" נוצר בהצלחה` : `Service "${name}" created successfully`,
        });
      }

      resetForm();
      fetchServices();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'שגיאה בשמירת השירות' : 'Error saving service'),
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(isRTL ? `האם אתה בטוח שברצונך למחוק את "${service.name}"?` : `Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', service.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: isRTL ? 'השירות נמחק בהצלחה' : 'Service deleted successfully',
      });

      fetchServices();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'שגיאה במחיקת השירות' : 'Error deleting service'),
      });
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;

      fetchServices();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'שגיאה בעדכון סטטוס' : 'Error updating status'),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isRTL ? 'ניהול שירותים' : 'Service Management'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isRTL ? 'הוסף, ערוך ומחק שירותים' : 'Add, edit, and manage services'}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} /> : <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
          {showForm ? (isRTL ? 'ביטול' : 'Cancel') : (isRTL ? 'שירות חדש' : 'New Service')}
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

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingService
                ? (isRTL ? 'ערוך שירות' : 'Edit Service')
                : (isRTL ? 'צור שירות חדש' : 'Create New Service')
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-name">{isRTL ? 'שם השירות' : 'Service Name'} *</Label>
                  <Input
                    id="service-name"
                    placeholder={isRTL ? 'לדוגמה: תספורת גברים' : 'e.g., Men\'s Haircut'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">{isRTL ? 'משך זמן (דקות)' : 'Duration (minutes)'} *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    placeholder="30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{isRTL ? 'מחיר (₪)' : 'Price (₪)'} *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{isRTL ? 'תיאור' : 'Description'} ({isRTL ? 'אופציונלי' : 'optional'})</Label>
                <Textarea
                  id="description"
                  placeholder={isRTL ? 'תיאור השירות...' : 'Service description...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={formLoading}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={formLoading}>
                  {formLoading
                    ? (isRTL ? 'שומר...' : 'Saving...')
                    : editingService
                      ? (isRTL ? 'עדכן שירות' : 'Update Service')
                      : (isRTL ? 'צור שירות' : 'Create Service')
                  }
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {isRTL ? 'ביטול' : 'Cancel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'כל השירותים' : 'All Services'}</CardTitle>
          <CardDescription>
            {isRTL ? `סך הכל ${services.length} שירותים` : `${services.length} total services`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">{t('common.loading')}</p>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <Scissors className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {isRTL ? 'אין שירותים עדיין. צור את הראשון!' : 'No services yet. Create the first one!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{service.name}</h3>
                        <Badge className={service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {service.is_active ? (isRTL ? 'פעיל' : 'Active') : (isRTL ? 'לא פעיל' : 'Inactive')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>⏱️ {service.duration_minutes} {isRTL ? 'דקות' : 'min'}</span>
                        <span>💰 ₪{service.price}</span>
                      </div>
                      {service.description && (
                        <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(service)}
                      title={service.is_active ? (isRTL ? 'השבת' : 'Deactivate') : (isRTL ? 'הפעל' : 'Activate')}
                    >
                      {service.is_active ? '👁️' : '👁️‍🗨️'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
