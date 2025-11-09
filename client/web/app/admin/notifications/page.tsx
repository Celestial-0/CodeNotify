'use client';

import { EmailComposer } from '@/components/core/admin';
import {
  useSendCustomEmail,
  useSendBulkEmail,
  useSendAnnouncement,
} from '@/lib/hooks/use-admin';
import type {
  SendCustomEmailDto,
  SendBulkEmailDto,
  SendAnnouncementDto,
} from '@/lib/types/admin.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Activity } from 'lucide-react';
import { useServiceStatus } from '@/lib/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminNotificationsPage() {
  const sendCustomEmailMutation = useSendCustomEmail();
  const sendBulkEmailMutation = useSendBulkEmail();
  const sendAnnouncementMutation = useSendAnnouncement();
  const { data: serviceStatus, isLoading } = useServiceStatus();

  const handleSendCustomEmail = async (data: SendCustomEmailDto) => {
    await sendCustomEmailMutation.mutateAsync(data);
  };

  const handleSendBulkEmail = async (data: SendBulkEmailDto) => {
    await sendBulkEmailMutation.mutateAsync(data);
  };

  const handleSendAnnouncement = async (data: SendAnnouncementDto) => {
    await sendAnnouncementMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Notification Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Send custom emails, bulk messages, and announcements
        </p>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Service Status
          </CardTitle>
          <CardDescription>
            Current status of notification delivery services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : serviceStatus ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Email</span>
                  <Badge
                    variant={serviceStatus.email.available ? 'default' : 'destructive'}
                    className={
                      serviceStatus.email.available
                        ? 'bg-green-500 hover:bg-green-600'
                        : ''
                    }
                  >
                    {serviceStatus.email.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Provider: {serviceStatus.email.provider || 'Nodemailer'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {serviceStatus.email.configured ? 'Configured' : 'Not Configured'}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">WhatsApp</span>
                  <Badge
                    variant={serviceStatus.whatsapp.available ? 'default' : 'destructive'}
                    className={
                      serviceStatus.whatsapp.available
                        ? 'bg-green-500 hover:bg-green-600'
                        : ''
                    }
                  >
                    {serviceStatus.whatsapp.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Provider: {serviceStatus.whatsapp.provider || 'Twilio'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {serviceStatus.whatsapp.configured ? 'Configured' : 'Not Configured'}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Push</span>
                  <Badge
                    variant={serviceStatus.push.available ? 'default' : 'destructive'}
                    className={
                      serviceStatus.push.available
                        ? 'bg-green-500 hover:bg-green-600'
                        : ''
                    }
                  >
                    {serviceStatus.push.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Provider: {serviceStatus.push.provider || 'Firebase'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {serviceStatus.push.configured ? 'Configured' : 'Not Configured'}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Email Composer */}
      <EmailComposer
        onSendCustomEmail={handleSendCustomEmail}
        onSendBulkEmail={handleSendBulkEmail}
        onSendAnnouncement={handleSendAnnouncement}
      />
    </div>
  );
}
