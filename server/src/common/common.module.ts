import { Module, Global } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { LoggerService } from './logger/logger.service';

@Global()
@Module({
  providers: [RolesGuard, EmailVerifiedGuard, LoggerService],
  exports: [RolesGuard, EmailVerifiedGuard, LoggerService],
})
export class CommonModule {}
