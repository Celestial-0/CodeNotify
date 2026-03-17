import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../common/decorators';
import type { UserDocument } from './schemas/user.schema';
import { UserLinkingService } from './user-linking.service';
import { LinkTelegramDto, DiscordOAuthCallbackDto } from './dto/linking.dto';
import type {
  LinkingStatusResponse,
  TelegramLinkTokenResponse,
  DiscordOAuthUrlResponse,
} from './dto/linking.dto';

@Controller('users/integrations')
export class UserLinkingController {
  constructor(
    private readonly linkingService: UserLinkingService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get linking status for current user
   * GET /users/integrations/status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getLinkingStatus(@CurrentUser() user: UserDocument): LinkingStatusResponse {
    return this.linkingService.getLinkingStatus(user);
  }

  // ==================== TELEGRAM ====================

  /**
   * Generate a Telegram linking token
   * POST /users/integrations/telegram/link
   */
  @Post('telegram/link')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  generateTelegramLinkToken(
    @CurrentUser() user: UserDocument,
  ): TelegramLinkTokenResponse {
    return this.linkingService.generateTelegramLinkToken(user);
  }

  /**
   * Webhook callback from Telegram bot to complete linking
   * This endpoint is called by the Telegram service when user clicks the deep link
   * POST /users/integrations/telegram/callback
   */
  @Post('telegram/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  async linkTelegramCallback(
    @Body() dto: LinkTelegramDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.linkingService.linkTelegram(
      dto.token,
      dto.chatId,
      dto.username,
    );
  }

  /**
   * Unlink Telegram account
   * DELETE /users/integrations/telegram
   */
  @Delete('telegram')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unlinkTelegram(
    @CurrentUser() user: UserDocument,
  ): Promise<{ success: boolean; message: string }> {
    return this.linkingService.unlinkTelegram(user);
  }

  // ==================== DISCORD ====================

  /**
   * Get Discord OAuth URL
   * GET /users/integrations/discord/link
   */
  @Get('discord/link')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getDiscordOAuthUrl(
    @CurrentUser() user: UserDocument,
  ): DiscordOAuthUrlResponse {
    return this.linkingService.getDiscordOAuthUrl(user);
  }

  /**
   * Discord OAuth callback
   * GET /users/integrations/discord/callback
   * Redirects to frontend with success/error status
   */
  @Get('discord/callback')
  @Public()
  async discordCallback(
    @Query() query: DiscordOAuthCallbackDto,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    try {
      await this.linkingService.handleDiscordCallback(
        query.code,
        query.state ?? '',
      );

      // Redirect to frontend with success
      res.redirect(
        `${frontendUrl}/dashboard/profile?tab=integrations&discord=success`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to link Discord';

      // Redirect to frontend with error
      res.redirect(
        `${frontendUrl}/dashboard/profile?tab=integrations&discord=error&message=${encodeURIComponent(message)}`,
      );
    }
  }

  /**
   * Unlink Discord account
   * DELETE /users/integrations/discord
   */
  @Delete('discord')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unlinkDiscord(
    @CurrentUser() user: UserDocument,
  ): Promise<{ success: boolean; message: string }> {
    return this.linkingService.unlinkDiscord(user);
  }
}
