import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { PlatformsModule } from './platforms/platforms.module';

@Module({
  providers: [WhatsappService],
  imports: [PlatformsModule],
  exports: [PlatformsModule],
})
export class IntegrationsModule {}
