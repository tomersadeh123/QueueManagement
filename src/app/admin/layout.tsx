'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Calendar, Settings, Home, LogOut, Building2, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('staff');
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/admin/login');
    } else {
      // Fetch user's role from staff table
      const { data: staffData } = await supabase
        .from('staff')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (staffData) {
        setUserRole(staffData.role || 'staff');
      }
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  // Don't show layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-xl font-bold text-slate-900">
                {t('admin.dashboard')}
              </Link>
              <nav className="hidden md:flex gap-1">
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    {t('admin.overview')}
                  </div>
                </Link>
                <Link
                  href="/admin/queue"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('admin.queue')}
                  </div>
                </Link>
                <Link
                  href="/admin/appointments"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('admin.appointments')}
                  </div>
                </Link>
                <Link
                  href="/admin/settings"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('admin.settings')}
                  </div>
                </Link>
                {/* Super Admin Menu Items */}
                {userRole === 'super_admin' && (
                  <>
                    <Link
                      href="/admin/super-admin/businesses"
                      className="px-4 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50 hover:text-purple-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {isRTL ? 'עסקים' : 'Businesses'}
                      </div>
                    </Link>
                    <Link
                      href="/admin/super-admin/users"
                      className="px-4 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50 hover:text-purple-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {isRTL ? 'משתמשים' : 'Users'}
                      </div>
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/"
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                {t('common.home')}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('admin.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
