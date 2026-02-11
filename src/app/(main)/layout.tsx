'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { AmbientBackground } from '@/components/layout/AmbientBackground';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isProfileRoute = pathname?.startsWith('/profile');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors overflow-x-hidden pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
      <AmbientBackground />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-3 pb-3 md:py-6 overflow-x-hidden relative">
        {/* Mobile: light overlay only in content area so gradient still shows at edges */}
        <div className="md:hidden fixed inset-0 top-14 bottom-[calc(60px+env(safe-area-inset-bottom))] bg-[rgba(251,251,251,0.4)] -z-10 pointer-events-none" />
        <div className="grid grid-cols-1 gap-3 md:gap-6 lg:grid-cols-12 overflow-x-hidden">
          {!isProfileRoute && (
            <div className="hidden lg:col-span-3 lg:block">
              <Sidebar />
            </div>
          )}
          <div className={`min-w-0 ${isProfileRoute ? 'lg:col-span-9' : 'lg:col-span-6'}`}>{children}</div>
          <div className="hidden lg:col-span-3 lg:block">
            <RightSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}

