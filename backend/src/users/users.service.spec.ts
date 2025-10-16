import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '../common/dto/auth.dto';
import { UpdateUserDto } from '../common/dto/user.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let userModel: jest.Mocked<any>;

  const mockUser = {
    _id: '64f8a1b2c3d4e5f6a7b8c9d0',
    id: '64f8a1b2c3d4e5f6a7b8c9d0',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    phoneNumber: '+1234567890',
    isActive: true,
    preferences: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
    },
    refreshToken: null,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    phoneNumber: '+1234567890',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    name: 'Updated Name',
    phoneNumber: '+0987654321',
    preferences: {
      platforms: ['leetcode'],
      alertFrequency: 'daily',
      contestTypes: ['div2'],
    },
  };

  beforeEach(async () => {
    const mockUserModel = jest.fn().mockImplementation((dto: any) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...mockUser, ...dto }),
    }));

    // Add static methods to the mock constructor
    (mockUserModel as any).find = jest.fn();
    (mockUserModel as any).findOne = jest.fn();
    (mockUserModel as any).findById = jest.fn();
    (mockUserModel as any).findByIdAndUpdate = jest.fn();
    (mockUserModel as any).findByIdAndDelete = jest.fn();
    (mockUserModel as any).create = jest.fn();
    (mockUserModel as any).exec = jest.fn();
    (mockUserModel as any).select = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should successfully create a new user', async () => {
      // Arrange
      const newUser = { ...mockUser, ...mockCreateUserDto };
      mockUser.save.mockResolvedValue(newUser);

      // Act
      const result = await service.createUser(mockCreateUserDto);

      // Assert
      expect(userModel).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(newUser);
    });

    it('should handle creation errors', async () => {
      // Arrange
      const error = new Error('Database error');
      const mockUserInstance = {
        ...mockCreateUserDto,
        save: jest.fn().mockRejectedValue(error),
      };
      userModel.mockImplementationOnce(() => mockUserInstance);

      // Act & Assert
      await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      // Arrange
      const email = 'test@example.com';
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      const updatedUser = { ...mockUser, ...mockUpdateUserDto };
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      } as any);

      // Act
      const result = await service.updateUser(userId, mockUpdateUserDto);

      // Assert
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        mockUpdateUserDto,
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act & Assert
      await expect(
        service.updateUser(userId, mockUpdateUserDto),
      ).rejects.toThrow(NotFoundException);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        mockUpdateUserDto,
        { new: true },
      );
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token with hashed value', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      const refreshToken = 'refresh-token';
      const hashedToken = 'hashed-refresh-token';
      mockedBcrypt.hash.mockResolvedValue(hashedToken as never);
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      // Act
      await service.updateRefreshToken(userId, refreshToken);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(refreshToken, 12);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        refreshToken: hashedToken,
      });
    });

    it('should update refresh token to null when token is null', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      // Act
      await service.updateRefreshToken(userId, null);

      // Assert
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        refreshToken: null,
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      // Act
      await service.updateLastLogin(userId);

      // Assert
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        lastLogin: expect.any(Date),
      });
    });
  });

  describe('deactivateUser', () => {
    it('should successfully deactivate a user', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      const deactivatedUser = { ...mockUser, isActive: false };
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deactivatedUser),
      } as any);

      // Act
      const result = await service.deactivateUser(userId);

      // Assert
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { isActive: false },
        { new: true },
      );
      expect(result).toEqual(deactivatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act & Assert
      await expect(service.deactivateUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateUser', () => {
    it('should successfully activate a user', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      const activatedUser = { ...mockUser, isActive: true };
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(activatedUser),
      } as any);

      // Act
      const result = await service.activateUser(userId);

      // Assert
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { isActive: true },
        { new: true },
      );
      expect(result).toEqual(activatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act & Assert
      await expect(service.activateUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all active users without sensitive data', async () => {
      // Arrange
      const users = [mockUser, { ...mockUser, id: 'another-id' }];
      userModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(users),
        }),
      } as any);

      // Act
      const result = await service.getAllUsers();

      // Assert
      expect(userModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(users);
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      // Act
      await service.deleteUser(userId);

      // Assert
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      // Act & Assert
      await expect(service.deleteUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
