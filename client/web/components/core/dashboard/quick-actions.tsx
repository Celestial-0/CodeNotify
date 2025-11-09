'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, Calendar } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: 'Update Preferences',
      description: 'Manage platforms and notification settings',
      icon: Settings,
      href: '/dashboard/profile',
      color: 'text-blue-500',
    },
    {
      title: 'View Notifications',
      description: 'Check your notification history',
      icon: Bell,
      href: '/dashboard/notifications',
      color: 'text-green-500',
    },
    {
      title: 'Browse Contests',
      description: 'Find upcoming programming contests',
      icon: Calendar,
      href: '/contests',
      color: 'text-purple-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Commonly used features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.href}
                asChild
                variant="outline"
                className="h-auto py-4 px-4 justify-start"
              >
                <Link href={action.href}>
                  <div className="flex items-start gap-3 w-full">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${action.color}`} />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm mb-0.5">
                        {action.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
