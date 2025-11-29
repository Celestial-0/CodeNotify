'use client';

import { useState } from 'react';
import { NotificationList } from '@/components/core/notifications/notification-list';
import { NotificationFilters } from '@/components/core/notifications/notification-filters';
import { NotificationStatsDisplay } from '@/components/core/notifications/notification-stats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useNotifications,
  useNotificationStats,
  useMarkAsRead,
  useMarkAllAsRead,
  useRetryNotification,
} from '@/lib/hooks/use-notifications';
import { useProfile } from '@/lib/hooks/use-user';
import {
  NotificationStatus,
  NotificationType,
} from '@/lib/types/notification.types';
import { CheckCheck, List, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<NotificationStatus | undefined>();
  const [type, setType] = useState<NotificationType | undefined>();

  // Get user profile to fetch their notifications
  const { data: profile } = useProfile();

  const {
    data: notificationsData,
    isLoading,
  } = useNotifications(
    {
      userId: profile?.id,
      page,
      limit: 10,
      status,
      type,
    },
    { enabled: !!profile?.id }
  );

  const { data: stats, isLoading: statsLoading } = useNotificationStats(
    { userId: profile?.id },
    { enabled: !!profile?.id }
  );
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const retryMutation = useRetryNotification();

  const notifications = notificationsData?.notifications || [];
  const hasMore = notificationsData?.pagination
    ? notificationsData.pagination.page < notificationsData.pagination.totalPages
    : false;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      if (unreadNotifications.length === 0) {
        toast.info('No unread notifications');
        return;
      }
      // Mark each unread notification as read
      await Promise.all(
        unreadNotifications.map((n) => markAsReadMutation.mutateAsync(n.id))
      );
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await retryMutation.mutateAsync(id);
      toast.success('Notification retry initiated');
    } catch {
      toast.error('Failed to retry notification');
    }
  };

  const handleResetFilters = () => {
    setStatus(undefined);
    setType(undefined);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            View and manage your notification history
          </p>
        </div>
        <Button
          onClick={handleMarkAllAsRead}
          disabled={markAllAsReadMutation.isPending || notifications.length === 0}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            List
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <NotificationFilters
                status={status}
                type={type}
                onStatusChange={setStatus}
                onTypeChange={setType}
                onReset={handleResetFilters}
              />
            </div>

            {/* Notifications List */}
            <div className="lg:col-span-3">
              <NotificationList
                notifications={notifications}
                isLoading={isLoading}
                onMarkAsRead={handleMarkAsRead}
                onRetry={handleRetry}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <NotificationStatsDisplay stats={stats} isLoading={statsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
