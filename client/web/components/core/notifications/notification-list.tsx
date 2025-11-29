'use client';

import { NotificationCard } from './notification-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell } from 'lucide-react';
import type { Notification } from '@/lib/types/notification.types';

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onRetry?: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showActions?: boolean;
}

function NotificationSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start gap-4">
        <Skeleton className="h-6 w-6 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function NotificationList({
  notifications,
  isLoading,
  onMarkAsRead,
  onRetry,
  onLoadMore,
  hasMore,
  showActions = true,
}: NotificationListProps) {
  if (isLoading && notifications.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No notifications</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          You don&apos;t have any notifications yet. When contests are scheduled, you&apos;ll
          receive notifications based on your preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id || notification._id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onRetry={onRetry}
          showActions={showActions}
        />
      ))}

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
