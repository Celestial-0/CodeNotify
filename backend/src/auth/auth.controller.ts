import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type {
  CreateUserDto,
  SigninDto,
  AuthResponse,
} from '../common/dto/auth.dto';
import { CreateUserSchema, SigninSchema } from '../common/dto/auth.dto';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto,
  ): Promise<AuthResponse> {
    return await this.authService.signup(createUserDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body(new ZodValidationPipe(SigninSchema)) signinDto: SigninDto,
  ): Promise<AuthResponse> {
    return await this.authService.signin(signinDto);
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async signout(
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    return await this.authService.signout(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Body() body: { refreshToken: string; userId: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}
