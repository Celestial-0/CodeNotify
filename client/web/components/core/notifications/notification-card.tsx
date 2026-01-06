'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, RefreshCw, Eye } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Notification,
  NotificationStatus,
  NOTIFICATION_STATUS_LABELS,
  NOTIFICATION_STATUS_COLORS,
  NOTIFICATION_CHANNEL_LABELS,
} from '@/lib/types/notification.types';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onRetry?: (id: string) => void;
  showActions?: boolean;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onRetry,
  showActions = true,
}: NotificationCardProps) {
  // Handle both id and _id from MongoDB
  const notificationId = notification.id || notification._id || '';

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case NotificationStatus.SENT:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case NotificationStatus.FAILED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case NotificationStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card className={`p-4 sm:p-6 ${notification.isRead ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Status Icon */}
        <div className="shrink-0 mt-1">{getStatusIcon(notification.status)}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
            <h3 className="text-sm font-semibold">{notification.title}</h3>
            <Badge
              variant="secondary"
              className={`${NOTIFICATION_STATUS_COLORS[notification.status]} text-white text-xs shrink-0`}
            >
              {NOTIFICATION_STATUS_LABELS[notification.status]}
            </Badge>
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>

          {/* Contest Info */}
          {notification.payload?.contestName && (
            <div className="text-sm mb-3 p-2 bg-muted rounded">
              <p className="font-medium">{notification.payload.contestName}</p>
              {notification.payload.platform && (
                <p className="text-xs text-muted-foreground capitalize">
                  {notification.payload.platform}
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
            <span>
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>
            {notification.sentAt && (
              <>
                <span>•</span>
                <span>Sent: {format(new Date(notification.sentAt), 'PPp')}</span>
              </>
            )}
            {notification.channels.length > 0 && (
              <>
                <span>•</span>
                <div className="flex gap-1">
                  {notification.channels.map((channel) => (
                    <Badge key={channel} variant="outline" className="text-xs">
                      {NOTIFICATION_CHANNEL_LABELS[channel]}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {notification.error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded mb-3">
              <span className="font-semibold">Error:</span> {notification.error}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-2">
              {!notification.isRead && onMarkAsRead && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkAsRead(notificationId)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Mark as Read
                </Button>
              )}
              {notification.status === NotificationStatus.FAILED &&
                notification.canRetry &&
                onRetry && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetry(notificationId)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
