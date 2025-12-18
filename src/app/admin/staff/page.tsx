'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Plus, Edit, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { createClient } from '@/lib/supabase/client';

type Staff = {
  id: string;
  name: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

export default function StaffManagementPage() {
  const { t, isRTL } = useLanguage();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data: businessData } = await supabase
      .from('businesses')
      .select('id')
      .single();

    if (!businessData) {
      console.error('No business found');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', businessData.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching staff:', error);
      setMessage({
        type: 'error',
        text: isRTL ? 'שגיאה בטעינת צוות' : 'Error loading staff',
      });
    } else {
      setStaff(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    try {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .single();

      if (!businessData) {
        throw new Error('No business found');
      }

      const staffData = {
        name,
        phone: phone || null,
        business_id: businessData.id,
        is_active: true,
      };

      if (editingStaff) {
        // Update existing staff
        const { error } = await supabase
          .from('staff')
          .update(staffData)
          .eq('id', editingStaff.id);

        if (error) throw error;

        setMessage({
          type: 'success',
          text: isRTL ? `צוות עודכן בהצלחה: ${name}` : `Staff updated successfully: ${name}`,
        });
      } else {
        // Create new staff
        const { error } = await supabase
          .from('staff')
          .insert(staffData);

        if (error) throw error;

        setMessage({
          type: 'success',
          text: isRTL ? `צוות נוצר בהצלחה: ${name}` : `Staff created successfully: ${name}`,
        });
      }

      // Reset form
      setName('');
      setPhone('');
      setEditingStaff(null);
      setShowForm(false);

      // Refresh list
      fetchStaff();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'שגיאה בשמירת צוות' : 'Error saving staff'),
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setName(staffMember.name);
    setPhone(staffMember.phone || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (staffMember: Staff) => {
    if (!confirm(isRTL ? `האם אתה בטוח שברצונך למחוק את ${staffMember.name}?` : `Are you sure you want to delete "${staffMember.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffMember.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: isRTL ? 'צוות נמחק בהצלחה' : 'Staff deleted successfully',
      });

      fetchStaff();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'שגיאה במחיקת צוות' : 'Error deleting staff'),
      });
    }
  };

  const handleToggleActive = async (staffMember: Staff) => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_active: !staffMember.is_active })
        .eq('id', staffMember.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: isRTL
          ? `צוות ${staffMember.is_active ? 'הושבת' : 'הופעל'} בהצלחה`
          : `Staff ${staffMember.is_active ? 'deactivated' : 'activated'} successfully`,
      });

      fetchStaff();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || (isRTL ? 'שגיאה בשינוי סטטוס' : 'Error toggling status'),
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingStaff(null);
    setName('');
    setPhone('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isRTL ? 'ניהול צוות' : 'Staff Management'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isRTL ? 'צור וניהל את חברי הצוות שלך' : 'Create and manage your team members'}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'צוות חדש' : 'New Staff'}
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {editingStaff
                    ? (isRTL ? 'ערוך צוות' : 'Edit Staff Member')
                    : (isRTL ? 'צור צוות חדש' : 'Create New Staff Member')
                  }
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'הזן את פרטי חבר הצוות' : 'Enter the staff member details'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {isRTL ? 'שם' : 'Name'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={isRTL ? 'לדוגמה: יוסי כהן' : 'e.g., John Smith'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {isRTL ? 'טלפון' : 'Phone'} {isRTL ? '(אופציונלי)' : '(optional)'}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="050-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={formLoading}>
                  {formLoading
                    ? t('common.loading')
                    : editingStaff
                      ? (isRTL ? 'עדכן צוות' : 'Update Staff')
                      : (isRTL ? 'צור צוות' : 'Create Staff')
                  }
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  {isRTL ? 'ביטול' : 'Cancel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'חברי צוות' : 'Team Members'}</CardTitle>
          <CardDescription>
            {isRTL ? `סך הכל ${staff.length} חברי צוות` : `${staff.length} total team members`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">{t('common.loading')}</p>
          ) : staff.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {isRTL ? 'אין חברי צוות עדיין. צור את הראשון!' : 'No staff members yet. Create the first one!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      member.is_active ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <User className={`w-5 h-5 ${member.is_active ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{member.name}</h3>
                        <Badge variant={member.is_active ? 'default' : 'secondary'}>
                          {member.is_active
                            ? (isRTL ? 'פעיל' : 'Active')
                            : (isRTL ? 'לא פעיל' : 'Inactive')
                          }
                        </Badge>
                      </div>
                      {member.phone && (
                        <p className="text-sm text-slate-600">{member.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(member)}
                      title={member.is_active
                        ? (isRTL ? 'השבת' : 'Deactivate')
                        : (isRTL ? 'הפעל' : 'Activate')
                      }
                    >
                      <CheckCircle className={`w-4 h-4 ${member.is_active ? 'text-green-600' : 'text-slate-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(member)}
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
