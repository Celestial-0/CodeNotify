'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { useProfile } from '@/lib/hooks/use-user';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const { data: profile } = useProfile();
  const { data, isError } = useNotifications(
    { userId: profile?.id, page: 1, limit: 100 },
    { enabled: !!profile?.id }
  );
  
  // Count unread notifications (handle potential undefined/null safely)
  const unreadCount = data?.notifications?.filter(n => n && !n.isRead).length || 0;

  // Don't show badge on error
  if (isError) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative h-9 w-9 rounded-full hover:bg-accent", className)}
        asChild
      >
        <Link href="/dashboard/notifications">
          <Bell className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative h-9 w-9 rounded-full hover:bg-accent", className)}
      asChild
    >
      <Link href="/dashboard/notifications">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
