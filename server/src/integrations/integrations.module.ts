import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { PlatformsModule } from './platforms/platforms.module';
import { TelegramModule } from './telegram/telegram.module';
import { DiscordModule } from './discord/discord.module';
import { IntegrationsController } from './integrations.controller';

@Module({
  providers: [WhatsappService],
  imports: [PlatformsModule, TelegramModule, DiscordModule],
  controllers: [IntegrationsController],
  exports: [PlatformsModule, TelegramModule, DiscordModule],
})
export class IntegrationsModule {}
