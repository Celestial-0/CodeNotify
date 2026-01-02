/**
 * Auth Module - Main Barrel Export
 * Re-exports all auth module components for easy importing
 */

// Core module
export * from './auth.module';
export * from './auth.service';
export * from './auth.controller';

// DTOs
export * from './dto';

// Services (explicitly export to avoid conflicts)
export { PasswordService } from './services/password.service';
export { TokenService } from './services/token.service';
export type { JwtPayload, TokenPair } from './services/token.service';

// Guards
export * from './guards';

// Strategies
export { JwtStrategy } from './strategies/jwt.strategy';
export { GoogleStrategy } from './strategies/google.strategy';
export type { GoogleUser } from './strategies/google.strategy';

// OTP Module
export * from './otp';
