import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreateUserDto,
  SigninDto,
  type AuthResponse,
} from '../common/dto/auth.dto';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ short: { limit: 50, ttl: 60000 } }) // 50 requests per minute
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    return await this.authService.signup(createUserDto);
  }

  @Public()
  @Throttle({ short: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinDto: SigninDto): Promise<AuthResponse> {
    return await this.authService.signin(signinDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    return await this.authService.signout(user.id);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(
    @Body() body: { refreshToken: string; userId: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.refreshAccessToken(
      body.userId,
      body.refreshToken,
    );
  }
}
