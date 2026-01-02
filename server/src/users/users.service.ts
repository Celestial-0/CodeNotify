import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

import { CreateUserDto } from '../auth/dto/auth.dto';
import { UpdateUserDto, UserPreferences } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    // Store refresh token as-is (JWT tokens are already cryptographically secure)
    // No need to hash them - they should be verified by signature, not compared
    await this.userModel
      .findByIdAndUpdate(id, { refreshToken: refreshToken })
      .exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { lastLogin: new Date() })
      .exec();
  }

  async updateEmailVerification(
    id: string,
    isVerified: boolean,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { isEmailVerified: isVerified })
      .exec();
  }

  async deactivateUser(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async activateUser(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return this.userModel
      .find({ isActive: true })
      .select('-password -refreshToken')
      .exec();
  }

  async getAllUsersWithPagination(
    limit: number,
    offset: number,
  ): Promise<{ users: UserDocument[]; total: number }> {
    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select('-password -refreshToken')
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return { users, total };
  }

  async updateUserRole(
    userId: string,
    role: 'user' | 'admin',
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .select('-password -refreshToken')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUserById(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(userId).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  // Controller logic methods
  getProfile(user: UserDocument): {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: 'user' | 'admin';
    preferences: UserPreferences;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
  } {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      preferences: user.preferences,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    };
  }

  async updateProfile(
    user: UserDocument,
    updateUserDto: UpdateUserDto,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    preferences: UserPreferences;
  }> {
    const updatedUser = await this.updateUser(user.id, updateUserDto);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phoneNumber: updatedUser.phoneNumber,
      preferences: updatedUser.preferences,
    };
  }

  async getUserByIdWithFormatting(id: string): Promise<{
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    preferences: UserPreferences;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      preferences: user.preferences,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async deactivateAccount(user: UserDocument): Promise<{ message: string }> {
    await this.deactivateUser(user.id);
    return { message: 'Account deactivated successfully' };
  }

  async activateAccount(user: UserDocument): Promise<{ message: string }> {
    await this.activateUser(user.id);
    return { message: 'Account activated successfully' };
  }
}
