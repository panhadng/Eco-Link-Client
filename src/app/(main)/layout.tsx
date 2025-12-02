'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    <div className="min-h-screen bg-background text-foreground transition-colors overflow-x-hidden">
      <Navbar />
      <div className="mx-auto max-w-7xl px-2 md:px-4 py-2 md:py-6 overflow-x-hidden">
        <div className="flex items-start gap-2 md:gap-6 overflow-x-hidden">
          <Sidebar />
          <main className="flex-1 min-w-0 w-full overflow-x-hidden max-w-full">{children}</main>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

