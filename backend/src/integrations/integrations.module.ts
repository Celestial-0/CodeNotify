import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { NotificationsService } from './notifications/notifications.service';

@Module({
  providers: [WhatsappService, NotificationsService],
})
export class IntegrationsModule {}
