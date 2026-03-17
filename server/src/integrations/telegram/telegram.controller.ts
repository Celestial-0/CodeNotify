import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { Public } from '../../common/decorators';
import type { Update } from 'grammy/types';

@Controller('webhooks/telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Telegram webhook endpoint
   * URL: POST /webhooks/telegram/:token
   * The token in the URL acts as a secret to verify the request is from Telegram
   */
  @Post(':token')
  @Public()
  @HttpCode(200)
  async handleWebhook(
    @Param('token') token: string,
    @Body() update: Update,
  ): Promise<{ ok: boolean }> {
    const secret = this.configService.get<string>('TELEGRAM_WEBHOOK_SECRET');

    // Verify the webhook token
    if (token !== secret) {
      this.logger.warn('Unauthorized webhook attempt with invalid token');
      throw new UnauthorizedException('Invalid webhook token');
    }

    // Process the update
    await this.telegramService.handleUpdate(update);

    return { ok: true };
  }
}
