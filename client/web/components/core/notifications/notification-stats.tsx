'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import type { NotificationStats } from '@/lib/types/notification.types';
import {
  NotificationChannel,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_TYPE_LABELS,
} from '@/lib/types/notification.types';

interface NotificationStatsDisplayProps {
  stats: NotificationStats | undefined;
  isLoading: boolean;
}

export function NotificationStatsDisplay({
  stats,
  isLoading,
}: NotificationStatsDisplayProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.sent / stats.total) * 100)}% of total`
                : '0% of total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.failed / stats.total) * 100)}% of total`
                : '0% of total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
          <CardDescription>Overall delivery performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Delivery Success</span>
            <span className="font-bold">{stats.successRate.toFixed(1)}%</span>
          </div>
          <Progress value={stats.successRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Channel Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Breakdown</CardTitle>
          <CardDescription>Notifications by delivery channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.byChannel && Object.entries(stats.byChannel).map(([channel, count]) => {
              const total = Object.values(stats.byChannel).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={channel} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">
                      {NOTIFICATION_CHANNEL_LABELS[channel as NotificationChannel] || channel}
                    </span>
                    <Badge variant="outline">
                      {count} notifications
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              );
            })}
            {(!stats.byChannel || Object.keys(stats.byChannel).length === 0) && (
              <p className="text-sm text-muted-foreground">No channel data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Type Distribution</CardTitle>
          <CardDescription>Notifications by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.byType && Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm">
                  {NOTIFICATION_TYPE_LABELS[type as keyof typeof NOTIFICATION_TYPE_LABELS] || type}
                </span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
            {(!stats.byType || Object.keys(stats.byType).length === 0) && (
              <p className="text-sm text-muted-foreground">No type data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
