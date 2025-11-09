'use client';

import { ReactNode } from 'react';
import { AdminLayout } from '@/components/core/admin/admin-layout';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
