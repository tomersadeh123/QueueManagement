'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);

    // Get auth user
    const { data: { user } } = await supabase.auth.getUser();
    setUserInfo(user);

    if (user) {
      // Get staff info
      const { data: staff, error } = await supabase
        .from('staff')
        .select('*, business:businesses(name)')
        .eq('user_id', user.id)
        .single();

      setStaffInfo(staff);
      console.log('Staff info:', staff);
      console.log('Error:', error);
    }

    setLoading(false);
  };

  const updateToSuperAdmin = async () => {
    if (!userInfo) return;

    const { data, error } = await supabase
      .from('staff')
      .update({ role: 'super_admin' })
      .eq('user_id', userInfo.id)
      .select()
      .single();

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Success! Refresh the page and check the admin menu.');
      fetchUserInfo();
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Debug Info</h1>

      {/* Auth User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Auth User</CardTitle>
        </CardHeader>
        <CardContent>
          {userInfo ? (
            <div className="space-y-2 font-mono text-sm">
              <div><strong>User ID:</strong> {userInfo.id}</div>
              <div><strong>Email:</strong> {userInfo.email}</div>
              <div><strong>Created:</strong> {new Date(userInfo.created_at).toLocaleString()}</div>
            </div>
          ) : (
            <p className="text-red-600">Not logged in</p>
          )}
        </CardContent>
      </Card>

      {/* Staff Info */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Record</CardTitle>
        </CardHeader>
        <CardContent>
          {staffInfo ? (
            <div className="space-y-2">
              <div className="font-mono text-sm space-y-2">
                <div><strong>Staff ID:</strong> {staffInfo.id}</div>
                <div><strong>Name:</strong> {staffInfo.name}</div>
                <div><strong>Phone:</strong> {staffInfo.phone || 'N/A'}</div>
                <div className="text-lg">
                  <strong>Role:</strong>
                  <span className={`ml-2 px-3 py-1 rounded ${
                    staffInfo.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                    staffInfo.role === 'business_admin' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {staffInfo.role || 'NO ROLE SET'}
                  </span>
                </div>
                <div><strong>Business:</strong> {(staffInfo.business as any)?.name || 'N/A'}</div>
                <div><strong>Active:</strong> {staffInfo.is_active ? 'Yes' : 'No'}</div>
              </div>

              {staffInfo.role !== 'super_admin' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm mb-3">
                    ⚠️ You are currently <strong>{staffInfo.role || 'staff'}</strong>.
                    To see super admin menu, you need to be a super_admin.
                  </p>
                  <Button onClick={updateToSuperAdmin} variant="default">
                    Make Me Super Admin
                  </Button>
                </div>
              )}

              {staffInfo.role === 'super_admin' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm">
                    ✅ You are a super admin! The menu should show "Businesses" and "Users" items.
                    If you don't see them, try refreshing the page or logging out and back in.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-red-600">No staff record found for this user!</p>
              <p className="text-sm text-slate-600">
                This means you have an auth account but no staff record.
                This can happen if you created the user before the system was updated.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SQL Helper */}
      <Card>
        <CardHeader>
          <CardTitle>SQL Commands (Run in Supabase SQL Editor)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">If you have NO staff record:</p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto">
{`INSERT INTO staff (business_id, user_id, name, phone, role, is_active)
VALUES (
  (SELECT id FROM businesses LIMIT 1),
  '${userInfo?.id || 'YOUR-USER-ID'}',
  'Your Name',
  '050-1234567',
  'super_admin',
  true
);`}
            </pre>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">If you have a staff record but wrong role:</p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto">
{`UPDATE staff
SET role = 'super_admin'
WHERE user_id = '${userInfo?.id || 'YOUR-USER-ID'}';`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
