import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { PlatformsModule } from './platforms/platforms.module';
import { TelegramModule } from './telegram/telegram.module';
import { DiscordModule } from './discord/discord.module';

@Module({
  providers: [WhatsappService],
  imports: [PlatformsModule, TelegramModule, DiscordModule],
  exports: [PlatformsModule, TelegramModule, DiscordModule],
})
export class IntegrationsModule {}
