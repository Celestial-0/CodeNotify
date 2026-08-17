import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for sending custom admin emails
 */
export const SendCustomEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
  replyTo: z.string().email().optional(),
});

export class SendCustomEmailDto extends createZodDto(SendCustomEmailSchema) {}

/**
 * DTO for sending bulk emails to users
 */
export const SendBulkEmailSchema = z.object({
  userIds: z.array(z.string()).min(1).max(1000),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
});

export class SendBulkEmailDto extends createZodDto(SendBulkEmailSchema) {}

/**
 * DTO for sending announcement emails
 */
export const SendAnnouncementSchema = z.object({
  subject: z.string().min(1).max(200),
  title: z.string().min(1).max(100),
  message: z.string().min(1),
  actionUrl: z.string().url().optional(),
  actionText: z.string().optional(),
  filters: z
    .object({
      platforms: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })
    .optional(),
});

export class SendAnnouncementDto extends createZodDto(SendAnnouncementSchema) {}

/**
 * DTO for sending contest reminder to specific users
 */
export const SendContestReminderSchema = z.object({
  contestId: z.string().min(1, 'Contest ID is required'),
  userIds: z.array(z.string()).min(1).max(1000),
  customMessage: z.string().optional(),
});

export class SendContestReminderDto extends createZodDto(
  SendContestReminderSchema,
) {}
