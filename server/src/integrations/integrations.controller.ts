import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';
import { TelegramService } from './telegram/telegram.service';
import { Public } from '../common/decorators';
import { PlatformAdapter } from './platforms/base/platform.interface';
import { PLATFORM_ADAPTERS } from './platforms/platforms.module';

type IntegrationHealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface IntegrationsHealthResponse {
  timestamp: string;
  status: IntegrationHealthStatus;
  channels: {
    discord: boolean;
    telegram: boolean;
  };
  platforms: Record<string, boolean>;
  summary: {
    platformHealthy: number;
    platformTotal: number;
    channelHealthy: number;
    channelTotal: number;
  };
}

@Controller('integrations')
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(
    @Inject(PLATFORM_ADAPTERS)
    private readonly platformAdapters: PlatformAdapter[],
    private readonly discordService: DiscordService,
    private readonly telegramService: TelegramService,
  ) {}

  @Get('health')
  @Public()
  async healthCheck(): Promise<IntegrationsHealthResponse> {
    const [discord, telegram, platformChecks] = await Promise.all([
      this.discordService.healthCheck(),
      this.telegramService.healthCheck(),
      Promise.all(
        this.platformAdapters.map(async (adapter) => {
          try {
            const healthy = await adapter.healthCheck();
            return [adapter.platformName, healthy] as const;
          } catch (error) {
            this.logger.error(
              `Platform health check failed for ${adapter.platformName}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            return [adapter.platformName, false] as const;
          }
        }),
      ),
    ]);

    const platforms = Object.fromEntries(platformChecks);
    const platformTotal = Object.keys(platforms).length;
    const platformHealthy = Object.values(platforms).filter(Boolean).length;
    const channelTotal = 2;
    const channelHealthy = Number(discord) + Number(telegram);

    const status = this.computeStatus(
      platformHealthy,
      platformTotal,
      channelHealthy,
      channelTotal,
    );

    return {
      timestamp: new Date().toISOString(),
      status,
      channels: {
        discord,
        telegram,
      },
      platforms,
      summary: {
        platformHealthy,
        platformTotal,
        channelHealthy,
        channelTotal,
      },
    };
  }

  private computeStatus(
    platformHealthy: number,
    platformTotal: number,
    channelHealthy: number,
    channelTotal: number,
  ): IntegrationHealthStatus {
    const totalChecks = platformTotal + channelTotal;
    const healthyChecks = platformHealthy + channelHealthy;

    if (healthyChecks === totalChecks) {
      return 'healthy';
    }

    if (healthyChecks > 0) {
      return 'degraded';
    }

    return 'unhealthy';
  }
}
