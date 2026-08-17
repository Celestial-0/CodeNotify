import { Module, Global } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { EmailVerifiedGuard } from './guards/email-verified.guard';

@Global()
@Module({
  providers: [RolesGuard, EmailVerifiedGuard],
  exports: [RolesGuard, EmailVerifiedGuard],
})
export class CommonModule {}
