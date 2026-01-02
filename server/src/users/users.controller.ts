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
  Query,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  UpdateUserDto,
  GetUserByIdDto,
  type UserPreferences,
  GetAllUsersDto,
  UpdateUserRoleDto,
  UpdateUserRoleBodyDto,
  DeleteUserDto,
} from './dto/user.dto';
import type { UserDocument } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() query: GetAllUsersDto): Promise<{
    users: Array<{
      id: string;
      email: string;
      name: string;
      phoneNumber?: string;
      role: string;
      preferences: UserPreferences;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    const { users, total } = await this.usersService.getAllUsersWithPagination(
      query.limit,
      query.offset,
    );

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        preferences: user.preferences,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser() user: UserDocument): {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: 'user' | 'admin';
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
    @Body() updateUserDto: UpdateUserDto,
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
  async getUserById(@Param() params: GetUserByIdDto): Promise<{
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

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param() params: UpdateUserRoleDto,
    @Body() body: UpdateUserRoleBodyDto,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    message: string;
  }> {
    const user = await this.usersService.updateUserRole(params.id, body.role);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      message: `User role updated to ${body.role} successfully`,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param() params: DeleteUserDto,
  ): Promise<{ message: string }> {
    await this.usersService.deleteUserById(params.id);
    return { message: 'User deleted successfully' };
  }
}
