import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

// Notification status enum
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

// Notification channel enum
export enum NotificationChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}

// Notification type enum
export enum NotificationType {
  CONTEST_REMINDER = 'CONTEST_REMINDER',
  CONTEST_STARTING = 'CONTEST_STARTING',
  CONTEST_ENDING = 'CONTEST_ENDING',
  DAILY_DIGEST = 'DAILY_DIGEST',
  WEEKLY_DIGEST = 'WEEKLY_DIGEST',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

// Channel delivery status interface
interface ChannelDeliveryStatus {
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt?: Date;
  failedAt?: Date;
  error?: string;
  retryCount: number;
  lastRetryAt?: Date;
}

@Schema({ timestamps: true })
export class Notification {
  // User reference
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  // Contest reference (optional, for contest-related notifications)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Contest', index: true })
  contestId?: MongooseSchema.Types.ObjectId;

  // Notification metadata
  @Prop({ required: true, enum: NotificationType, index: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  // Notification payload (flexible for different notification types)
  @Prop({ type: Object })
  payload?: Record<string, any>;

  // Delivery information
  @Prop({ type: [String], enum: NotificationChannel, required: true })
  channels: NotificationChannel[];

  @Prop({ type: Array, default: [] })
  deliveryStatus: ChannelDeliveryStatus[];

  // Overall notification status
  @Prop({
    required: true,
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
    index: true,
  })
  status: NotificationStatus;

  // Timing information
  @Prop({ index: true })
  scheduledAt?: Date;

  @Prop({ index: true })
  sentAt?: Date;

  @Prop()
  failedAt?: Date;

  // Retry logic
  @Prop({ default: 0 })
  retryCount: number;

  @Prop({ default: 3 })
  maxRetries: number;

  @Prop()
  lastRetryAt?: Date;

  @Prop()
  nextRetryAt?: Date;

  // Error tracking
  @Prop()
  error?: string;

  @Prop({ type: Array, default: [] })
  errorHistory?: Array<{
    timestamp: Date;
    error: string;
    channel?: NotificationChannel;
  }>;

  // Metadata
  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop({ default: true, index: true })
  isActive: boolean;

  // Expiration (for cleanup)
  @Prop()
  expiresAt?: Date;

  // Virtual fields
  get isDelivered(): boolean {
    return this.status === NotificationStatus.SENT;
  }

  get isFailed(): boolean {
    return this.status === NotificationStatus.FAILED;
  }

  get isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  get canRetry(): boolean {
    return (
      this.retryCount < this.maxRetries &&
      (this.status === NotificationStatus.FAILED ||
        this.status === NotificationStatus.RETRYING)
    );
  }

  get successfulChannels(): NotificationChannel[] {
    return this.deliveryStatus
      .filter((d) => d.status === NotificationStatus.SENT)
      .map((d) => d.channel);
  }

  get failedChannels(): NotificationChannel[] {
    return this.deliveryStatus
      .filter((d) => d.status === NotificationStatus.FAILED)
      .map((d) => d.channel);
  }
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Create compound indexes for better query performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index(
  { userId: 1, contestId: 1 },
  { unique: true, sparse: true },
);
NotificationSchema.index({ contestId: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, scheduledAt: 1 });
NotificationSchema.index({ status: 1, nextRetryAt: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

// Virtual fields setup
NotificationSchema.virtual('isDelivered').get(function () {
  return this.status === NotificationStatus.SENT;
});

NotificationSchema.virtual('isFailed').get(function () {
  return this.status === NotificationStatus.FAILED;
});

NotificationSchema.virtual('isPending').get(function () {
  return this.status === NotificationStatus.PENDING;
});

NotificationSchema.virtual('canRetry').get(function () {
  return (
    this.retryCount < this.maxRetries &&
    (this.status === NotificationStatus.FAILED ||
      this.status === NotificationStatus.RETRYING)
  );
});

NotificationSchema.virtual('successfulChannels').get(function () {
  return this.deliveryStatus
    .filter((d) => d.status === NotificationStatus.SENT)
    .map((d) => d.channel);
});

NotificationSchema.virtual('failedChannels').get(function () {
  return this.deliveryStatus
    .filter((d) => d.status === NotificationStatus.FAILED)
    .map((d) => d.channel);
});

// Ensure virtuals are included in JSON output
NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });

// Pre-save middleware to set default expiration (90 days)
NotificationSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    this.expiresAt = ninetyDaysFromNow;
  }
  next();
});
