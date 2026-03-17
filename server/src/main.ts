import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'nestjs-zod';
import { json } from 'express';
import type { Request } from 'express';

async function bootstrap() {
  // Disable default body parser - we need custom handling for Discord webhooks
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://code-notify.vercel.app',
    ],
    credentials: true,
  });

  // JSON body parser with rawBody capture for Discord webhook signature verification
  app.use(
    json({
      verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
        // Only store rawBody for Discord webhooks (signature verification)
        if (req.originalUrl?.startsWith('/webhooks/discord')) {
          req.rawBody = buf;
        }
      },
    }),
  );

  // Apply global Zod validation pipe
  app.useGlobalPipes(new ZodValidationPipe());

  // Apply JWT guard globally to all routes
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  await app.listen(process.env.PORT ?? 8000);

  console.log(`Application is running on port ${process.env.PORT}`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
