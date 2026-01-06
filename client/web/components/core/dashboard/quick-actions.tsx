'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, Calendar } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: 'Update Preferences',
      description: 'Manage platforms and notification',
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
    <Card className="relative overflow-hidden border-border bg-card/80 shadow-sm backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
      
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
                className="group h-auto py-4 px-4 justify-start border-border bg-background/50 transition-all hover:scale-[1.02] hover:border-primary/30 hover:shadow-md"
              >
                <Link href={action.href}>
                  <div className="flex items-start gap-3 w-full">
                    <div className="rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                      <Icon className={`h-4 w-4 shrink-0 ${action.color}`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm mb-0.5 text-foreground">
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
