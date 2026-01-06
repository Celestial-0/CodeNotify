'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/lib/hooks/use-user';
import { useContestStats } from '@/lib/hooks/use-contests';
import { useNotificationStats } from '@/lib/hooks/use-notifications';
import { useServiceStatus } from '@/lib/hooks/use-admin';
import { Users, Calendar, Bell, Activity, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminOverviewPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: contestStats, isLoading: contestLoading } = useContestStats();
  const { data: notificationStats, isLoading: notifLoading } = useNotificationStats();
  const { data: serviceStatus, isLoading: serviceLoading } = useServiceStatus();

  // Wait for profile to load
  if (profileLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Check admin role
  if (profile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of system metrics and status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contestLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">—</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Contests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contestLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {contestStats?.totalContests || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {contestStats?.upcomingContests || 0} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {notificationStats?.sent || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {notificationStats?.successRate.toFixed(0) || 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <Badge
                variant="default"
                className="bg-green-500 hover:bg-green-600"
              >
                Healthy
              </Badge>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              All services operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>
            Current status of notification services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serviceLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : serviceStatus ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Email Service</p>
                  <p className="text-sm text-muted-foreground">
                    {serviceStatus.email.provider || 'Nodemailer'}
                  </p>
                </div>
                {serviceStatus.email.available ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">WhatsApp Service</p>
                  <p className="text-sm text-muted-foreground">
                    {serviceStatus.whatsapp.provider || 'Twilio'}
                  </p>
                </div>
                {serviceStatus.whatsapp.available ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {serviceStatus.push.provider || 'Firebase'}
                  </p>
                </div>
                {serviceStatus.push.available ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/users"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <Users className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-muted-foreground">
                View and manage user accounts
              </p>
            </a>

            <a
              href="/admin/contests"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <Calendar className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">Sync Contests</h3>
              <p className="text-sm text-muted-foreground">
                Synchronize contest data
              </p>
            </a>

            <a
              href="/admin/notifications"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <Mail className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">Send Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Send custom emails and announcements
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
