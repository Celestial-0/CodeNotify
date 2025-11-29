import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://code-notify.vercel.app',
    ],
    credentials: true,
  });

  // Apply global Zod validation pipe
  app.useGlobalPipes(new ZodValidationPipe());

  // Apply JWT guard globally to all routes
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  await app.listen(process.env.PORT ?? 8000);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
