import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type {
  UpdateUserDto,
  GetUserByIdDto,
  UserPreferences,
} from '../common/dto/user.dto';
import { UpdateUserSchema, GetUserByIdSchema } from '../common/dto/user.dto';
import type { UserDocument } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser() user: UserDocument): {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    preferences: UserPreferences;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
  } {
    return this.usersService.getProfile(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: UserDocument,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    preferences: UserPreferences;
  }> {
    return this.usersService.updateProfile(user, updateUserDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Param(new ZodValidationPipe(GetUserByIdSchema)) params: GetUserByIdDto,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    preferences: UserPreferences;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.usersService.getUserByIdWithFormatting(params.id);
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    return await this.usersService.deactivateAccount(user);
  }

  @Put('activate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async activateAccount(
    @CurrentUser() user: UserDocument,
  ): Promise<{ message: string }> {
    return this.usersService.activateAccount(user);
  }
}
