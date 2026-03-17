import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailNotificationService } from './services/email-notification.service';
import { WhatsAppNotificationService } from './services/whatsapp-notification.service';
import { PushNotificationService } from './services/push-notification.service';
import { TelegramNotificationService } from './services/telegram-notification.service';
import { DiscordNotificationService } from './services/discord-notification.service';
import { AdminEmailService } from './services/admin-email.service';
import { NotificationRetryService } from './notification-retry.service';
import { TelegramModule } from '../integrations/telegram/telegram.module';
import { DiscordModule } from '../integrations/discord/discord.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Contest, ContestSchema } from '../contests/schemas/contest.schema';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Contest.name, schema: ContestSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    TelegramModule,
    DiscordModule,
  ],
  providers: [
    NotificationsService,
    EmailNotificationService,
    WhatsAppNotificationService,
    PushNotificationService,
    TelegramNotificationService,
    DiscordNotificationService,
    AdminEmailService,
    NotificationRetryService,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService, EmailNotificationService],
})
export class NotificationsModule {}
