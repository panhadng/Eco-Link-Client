'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
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
      <div className="messages-container min-h-screen bg-gray-50 text-gray-900 transition-colors overflow-hidden md:overflow-auto overflow-x-hidden">
      <Navbar />
      <div className="mx-auto max-w-7xl px-0 md:px-4 py-0 md:py-6 h-[calc(100vh-4rem)] md:h-auto overflow-hidden md:overflow-visible overflow-x-hidden max-w-full">
        {children}
      </div>
    </div>
  );
}

