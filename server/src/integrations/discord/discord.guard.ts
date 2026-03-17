import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyKey } from 'discord-interactions';
import type { Request } from 'express';

/** Extended Request type with rawBody for Discord signature verification */
type RequestWithRawBody = Request & { rawBody?: Buffer };

/**
 * Guard to verify Discord interaction webhook signatures
 * Discord requires Ed25519 signature verification for all interactions
 */
@Injectable()
export class DiscordSignatureGuard implements CanActivate {
  private readonly logger = new Logger(DiscordSignatureGuard.name);
  private readonly publicKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.publicKey = this.configService.get<string>('DISCORD_PUBLIC_KEY');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.publicKey) {
      this.logger.error(
        'DISCORD_PUBLIC_KEY not configured - cannot verify signatures',
      );
      throw new UnauthorizedException('Discord public key not configured');
    }

    const request = context.switchToHttp().getRequest<RequestWithRawBody>();

    const signature = request.headers['x-signature-ed25519'] as
      | string
      | undefined;
    const timestamp = request.headers['x-signature-timestamp'] as
      | string
      | undefined;

    if (!signature || !timestamp) {
      this.logger.warn('Missing Discord signature headers');
      throw new UnauthorizedException('Missing signature headers');
    }

    // Get raw body for signature verification
    // The raw body must be preserved before JSON parsing
    const rawBody = request.rawBody;

    if (!rawBody) {
      this.logger.error(
        'Raw body not available - ensure raw body parsing middleware is configured',
      );
      throw new UnauthorizedException('Cannot verify signature');
    }

    const isValid = await verifyKey(
      rawBody,
      signature,
      timestamp,
      this.publicKey,
    );

    if (!isValid) {
      this.logger.warn('Invalid Discord signature');
      throw new UnauthorizedException('Invalid request signature');
    }

    return true;
  }
}
