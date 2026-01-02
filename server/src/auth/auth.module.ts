import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { UsersModule } from '../users/users.module';
import { AUTH } from '../common/constants';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    OtpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', AUTH.JWT_SECRET),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    JwtStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, PasswordService, TokenService],
})
export class AuthModule {}
