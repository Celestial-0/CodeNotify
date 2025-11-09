'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Send, Mail, Users, Megaphone } from 'lucide-react';

const customEmailSchema = z.object({
  to: z.email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  html: z.string().min(1, 'Message is required'),
  text: z.string().optional(),
});

const bulkEmailSchema = z.object({
  userIds: z.string().min(1, 'User IDs are required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  html: z.string().min(1, 'Message is required'),
  text: z.string().optional(),
});

const announcementSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  title: z.string().min(1, 'Title is required').max(100),
  message: z.string().min(1, 'Message is required'),
  actionUrl: z.string().url().optional().or(z.literal('')),
  actionText: z.string().optional(),
});

type CustomEmailFormData = z.infer<typeof customEmailSchema>;
type BulkEmailFormData = z.infer<typeof bulkEmailSchema>;
type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface EmailComposerProps {
  onSendCustomEmail: (data: CustomEmailFormData) => Promise<void>;
  onSendBulkEmail: (data: { userIds: string[]; subject: string; html: string; text?: string }) => Promise<void>;
  onSendAnnouncement: (data: AnnouncementFormData) => Promise<void>;
}

export function EmailComposer({
  onSendCustomEmail,
  onSendBulkEmail,
  onSendAnnouncement,
}: EmailComposerProps) {
  const [sending, setSending] = useState(false);

  const customForm = useForm<CustomEmailFormData>({
    resolver: zodResolver(customEmailSchema),
  });

  const bulkForm = useForm<BulkEmailFormData>({
    resolver: zodResolver(bulkEmailSchema),
  });

  const announcementForm = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
  });

  const handleCustomEmail = async (data: CustomEmailFormData) => {
    setSending(true);
    try {
      await onSendCustomEmail(data);
      toast.success('Email sent successfully');
      customForm.reset();
    } catch {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleBulkEmail = async (data: BulkEmailFormData) => {
    setSending(true);
    try {
      const userIds = data.userIds.split(',').map((id) => id.trim()).filter(Boolean);
      await onSendBulkEmail({ ...data, userIds });
      toast.success('Bulk email sent successfully');
      bulkForm.reset();
    } catch {
      toast.error('Failed to send bulk email');
    } finally {
      setSending(false);
    }
  };

  const handleAnnouncement = async (data: AnnouncementFormData) => {
    setSending(true);
    try {
      await onSendAnnouncement(data);
      toast.success('Announcement sent successfully');
      announcementForm.reset();
    } catch {
      toast.error('Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Composer
        </CardTitle>
        <CardDescription>
          Send custom emails, bulk messages, or announcements to users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="custom">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="custom">
              <Mail className="h-4 w-4 mr-2" />
              Custom Email
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <Users className="h-4 w-4 mr-2" />
              Bulk Email
            </TabsTrigger>
            <TabsTrigger value="announcement">
              <Megaphone className="h-4 w-4 mr-2" />
              Announcement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4">
            <form onSubmit={customForm.handleSubmit(handleCustomEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-to">To (Email Address)</Label>
                <Input
                  id="custom-to"
                  type="email"
                  placeholder="user@example.com"
                  {...customForm.register('to')}
                />
                {customForm.formState.errors.to && (
                  <p className="text-sm text-destructive">
                    {customForm.formState.errors.to.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-subject">Subject</Label>
                <Input
                  id="custom-subject"
                  placeholder="Email subject"
                  {...customForm.register('subject')}
                />
                {customForm.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {customForm.formState.errors.subject.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-html">Message (HTML)</Label>
                <Textarea
                  id="custom-html"
                  placeholder="<p>Your HTML message here...</p>"
                  rows={10}
                  {...customForm.register('html')}
                />
                {customForm.formState.errors.html && (
                  <p className="text-sm text-destructive">
                    {customForm.formState.errors.html.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={sending}>
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <form onSubmit={bulkForm.handleSubmit(handleBulkEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-userIds">User IDs (comma-separated)</Label>
                <Textarea
                  id="bulk-userIds"
                  placeholder="user-id-1, user-id-2, user-id-3"
                  rows={3}
                  {...bulkForm.register('userIds')}
                />
                {bulkForm.formState.errors.userIds && (
                  <p className="text-sm text-destructive">
                    {bulkForm.formState.errors.userIds.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-subject">Subject</Label>
                <Input
                  id="bulk-subject"
                  placeholder="Email subject"
                  {...bulkForm.register('subject')}
                />
                {bulkForm.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {bulkForm.formState.errors.subject.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-html">Message (HTML)</Label>
                <Textarea
                  id="bulk-html"
                  placeholder="<p>Your HTML message here...</p>"
                  rows={10}
                  {...bulkForm.register('html')}
                />
                {bulkForm.formState.errors.html && (
                  <p className="text-sm text-destructive">
                    {bulkForm.formState.errors.html.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={sending}>
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to All Users
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="announcement" className="space-y-4">
            <form
              onSubmit={announcementForm.handleSubmit(handleAnnouncement)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="ann-subject">Email Subject</Label>
                <Input
                  id="ann-subject"
                  placeholder="Important Announcement"
                  {...announcementForm.register('subject')}
                />
                {announcementForm.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {announcementForm.formState.errors.subject.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ann-title">Announcement Title</Label>
                <Input
                  id="ann-title"
                  placeholder="New Features Released!"
                  {...announcementForm.register('title')}
                />
                {announcementForm.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {announcementForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ann-message">Message</Label>
                <Textarea
                  id="ann-message"
                  placeholder="Your announcement message..."
                  rows={6}
                  {...announcementForm.register('message')}
                />
                {announcementForm.formState.errors.message && (
                  <p className="text-sm text-destructive">
                    {announcementForm.formState.errors.message.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ann-actionUrl">Action URL (optional)</Label>
                  <Input
                    id="ann-actionUrl"
                    type="url"
                    placeholder="https://example.com"
                    {...announcementForm.register('actionUrl')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ann-actionText">Action Button Text</Label>
                  <Input
                    id="ann-actionText"
                    placeholder="Learn More"
                    {...announcementForm.register('actionText')}
                  />
                </div>
              </div>

              <Button type="submit" disabled={sending}>
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Megaphone className="h-4 w-4 mr-2" />
                    Send Announcement
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
