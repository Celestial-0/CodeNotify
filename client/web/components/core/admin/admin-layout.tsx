'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Users, Calendar, Mail, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useProfile } from '@/lib/hooks/use-user';
import { useEffect } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Overview', href: '/admin', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Contests', href: '/admin/contests', icon: Calendar },
  { name: 'Notifications', href: '/admin/notifications', icon: Mail },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();

  // Redirect non-admins (only when we have profile data and user is NOT admin)
  useEffect(() => {
    if (!isLoading && profile && profile.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show access denied for confirmed non-admins
  if (profile.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-muted/10">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Shield className="h-6 w-6" />
          <span className="font-semibold text-lg">Admin Panel</span>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'justify-start',
                  isActive && 'bg-secondary'
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <div className="px-6 py-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
