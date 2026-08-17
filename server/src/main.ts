import './bun-compat';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters';
import { ZodValidationPipe } from 'nestjs-zod';
import { json } from 'express';
import type { Request } from 'express';

async function bootstrap() {
  const { AppModule } = await import('./app.module');
  // Disable default body parser - we need custom handling for Discord webhooks
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT', '3999');
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );

  // Security HTTP Headers
  app.use(helmet());

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Dynamic CORS configuration
  const customOrigins = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = customOrigins
    ? customOrigins.split(',').map((o) => o.trim())
    : [
        'http://localhost:3001',
        'http://localhost:3000',
        'https://code-notify.vercel.app',
        frontendUrl,
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // JSON body parser with rawBody capture for Discord webhook signature verification and size limit
  app.use(
    json({
      limit: '1mb',
      verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
        // Only store rawBody for Discord webhooks (signature verification)
        if (req.originalUrl?.startsWith('/webhooks/discord')) {
          req.rawBody = buf;
        }
      },
    }),
  );

  // Apply global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Apply global Zod validation pipe
  app.useGlobalPipes(new ZodValidationPipe());

  // Apply JWT guard globally to all routes
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  await app.listen(port);

  console.log(`Application is running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
