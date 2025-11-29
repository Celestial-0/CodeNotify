'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { useProfile } from '@/lib/hooks/use-user';
import { ArrowRight, Bell, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  NotificationStatus,
  NOTIFICATION_STATUS_LABELS,
  NOTIFICATION_STATUS_COLORS,
} from '@/lib/types/notification.types';

export function RecentNotifications() {
  const { data: profile } = useProfile();
  const { data, isLoading, isError } = useNotifications(
    {
      userId: profile?.id,
      page: 1,
      limit: 10,
    },
    { enabled: !!profile?.id }
  );

  const notifications = data?.notifications || [];

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case NotificationStatus.SENT:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case NotificationStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case NotificationStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your notification history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your notification history</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            No notifications yet
          </p>
          <p className="text-xs text-muted-foreground">
            You&apos;ll see your notification history here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border bg-card/80 shadow-sm backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Recent Notifications
          </CardTitle>
          <CardDescription>Your latest {notifications.length} notifications</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
          <Link href="/dashboard/notifications">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="group flex items-start gap-3 p-3 rounded-lg border border-border bg-background/50 transition-all hover:scale-[1.01] hover:border-primary/30 hover:shadow-md"
            >
              <div className="shrink-0 mt-1">
                {getStatusIcon(notification.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {notification.title}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`${
                      NOTIFICATION_STATUS_COLORS[notification.status]
                    } text-white text-xs shrink-0`}
                  >
                    {NOTIFICATION_STATUS_LABELS[notification.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {notification.channels.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{notification.channels.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
