'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Calendar, Mail, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10">
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
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
