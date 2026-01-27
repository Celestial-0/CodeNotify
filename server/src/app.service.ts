import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  gethome(): string {
    return `<h1>Welcome to CodeNotify Server!</h1><p>The server is up and running.</p>`;
  }

  health() {
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'unknown';
    const apiVersion =
      this.configService.get<string>('API_VERSION') ?? '0.1.0-beta';

    return {
      status: 'ok',
      apiVersion: apiVersion,
      nodeEnv: nodeEnv,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
