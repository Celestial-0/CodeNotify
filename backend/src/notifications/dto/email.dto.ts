import { z } from 'zod';

/**
 * DTO for sending custom admin emails
 */
export const SendCustomEmailSchema = z.object({
  to: z.union([z.email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
  replyTo: z.email().optional(),
});

export type SendCustomEmailDto = z.infer<typeof SendCustomEmailSchema>;

/**
 * DTO for sending bulk emails to users
 */
export const SendBulkEmailSchema = z.object({
  userIds: z.array(z.string()).min(1).max(1000),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
});

export type SendBulkEmailDto = z.infer<typeof SendBulkEmailSchema>;

/**
 * DTO for sending announcement emails
 */
export const SendAnnouncementSchema = z.object({
  subject: z.string().min(1).max(200),
  title: z.string().min(1).max(100),
  message: z.string().min(1),
  actionUrl: z.url().optional(),
  actionText: z.string().optional(),
  filters: z
    .object({
      platforms: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })
    .optional(),
});

export type SendAnnouncementDto = z.infer<typeof SendAnnouncementSchema>;

/**
 * DTO for sending contest reminder to specific users
 */
export const SendContestReminderSchema = z.object({
  contestId: z.string(),
  userIds: z.array(z.string()).min(1).max(1000),
  customMessage: z.string().optional(),
});

export type SendContestReminderDto = z.infer<typeof SendContestReminderSchema>;
