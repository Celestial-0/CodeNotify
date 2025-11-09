import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '../common/dto/auth.dto';
import { UpdateUserDto } from '../common/dto/user.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Type for Mongoose query chain
interface MockQuery<T> {
  exec: jest.Mock<Promise<T>, []>;
  select?: jest.Mock<MockQuery<T>, []>;
  skip?: jest.Mock<MockQuery<T>, [number]>;
  limit?: jest.Mock<MockQuery<T>, [number]>;
  sort?: jest.Mock<MockQuery<T>, [Record<string, number>]>;
}

// Helper function to create properly typed mock query
function createMockQuery<T>(value: T): MockQuery<T> {
  return {
    exec: jest.fn<Promise<T>, []>().mockResolvedValue(value),
  };
}

// Helper function to create mock query with chaining for complex queries
function createMockQueryWithSelect<T>(value: T): MockQuery<T> {
  const mockQuery: MockQuery<T> = {
    exec: jest.fn<Promise<T>, []>().mockResolvedValue(value),
  };
  mockQuery.select = jest.fn<MockQuery<T>, []>().mockReturnValue(mockQuery);
  mockQuery.skip = jest.fn<MockQuery<T>, [number]>().mockReturnValue(mockQuery);
  mockQuery.limit = jest
    .fn<MockQuery<T>, [number]>()
    .mockReturnValue(mockQuery);
  mockQuery.sort = jest
    .fn<MockQuery<T>, [Record<string, number>]>()
    .mockReturnValue(mockQuery);
  return mockQuery;
}

// Type for mock Mongoose model
interface MockUserModel {
  new (dto: CreateUserDto): {
    save: jest.Mock<Promise<UserDocument>>;
  };
  find: jest.Mock<MockQuery<UserDocument[]>>;
  findOne: jest.Mock<MockQuery<UserDocument | null>>;
  findById: jest.Mock<MockQuery<UserDocument | null>>;
  findByIdAndUpdate: jest.Mock<MockQuery<UserDocument | null>>;
  findByIdAndDelete: jest.Mock<MockQuery<UserDocument | null>>;
  countDocuments: jest.Mock<MockQuery<number>>;
  create: jest.Mock<Promise<UserDocument>>;
  mockImplementationOnce: jest.MockedFunction<
    (
      implementation: (dto: CreateUserDto) => { save: jest.Mock },
    ) => MockUserModel
  >;
}

describe('UsersService', () => {
  let service: UsersService;
  let userModel: MockUserModel;

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
    const mockUserModelConstructor = jest
      .fn()
      .mockImplementation((dto: CreateUserDto) => ({
        ...dto,
        save: jest.fn<Promise<UserDocument>, []>().mockResolvedValue({
          ...mockUser,
          ...dto,
        } as unknown as UserDocument),
      })) as unknown as MockUserModel;

    // Add static methods to the mock constructor with proper types
    mockUserModelConstructor.find = jest.fn<
      MockQuery<UserDocument[]>,
      Parameters<MockUserModel['find']>
    >();
    mockUserModelConstructor.findOne = jest.fn<
      MockQuery<UserDocument | null>,
      Parameters<MockUserModel['findOne']>
    >();
    mockUserModelConstructor.findById = jest.fn<
      MockQuery<UserDocument | null>,
      Parameters<MockUserModel['findById']>
    >();
    mockUserModelConstructor.findByIdAndUpdate = jest.fn<
      MockQuery<UserDocument | null>,
      Parameters<MockUserModel['findByIdAndUpdate']>
    >();
    mockUserModelConstructor.findByIdAndDelete = jest.fn<
      MockQuery<UserDocument | null>,
      Parameters<MockUserModel['findByIdAndDelete']>
    >();
    mockUserModelConstructor.countDocuments = jest.fn<
      MockQuery<number>,
      Parameters<MockUserModel['countDocuments']>
    >();
    mockUserModelConstructor.create = jest.fn<
      Promise<UserDocument>,
      Parameters<MockUserModel['create']>
    >();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModelConstructor,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<MockUserModel>(getModelToken(User.name));
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
      userModel.findById.mockReturnValue(
        createMockQuery<UserDocument | null>(
          mockUser as unknown as UserDocument,
        ),
      );

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

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
      const mockQueryWithSelect = createMockQueryWithSelect<UserDocument[]>(
        users as unknown as UserDocument[],
      );
      userModel.find.mockReturnValue(mockQueryWithSelect);

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
      } as MockQuery<UserDocument | null>);

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
      } as MockQuery<UserDocument | null>);

      // Act & Assert
      await expect(service.deleteUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUsersWithPagination', () => {
    it('should return paginated users with total count', async () => {
      // Arrange
      const limit = 10;
      const offset = 0;
      const users = [mockUser, { ...mockUser, id: 'another-id' }];
      const total = 2;

      userModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(users),
              }),
            }),
          }),
        }),
      } as MockQuery<UserDocument[]>);

      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(total),
      } as MockQuery<number>);

      // Act
      const result = await service.getAllUsersWithPagination(limit, offset);

      // Assert
      expect(userModel.find).toHaveBeenCalled();
      expect(userModel.countDocuments).toHaveBeenCalled();
      expect(result).toEqual({ users, total });
    });

    it('should handle pagination with offset', async () => {
      // Arrange
      const limit = 5;
      const offset = 10;
      const users = [mockUser];
      const total = 15;

      userModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(users),
              }),
            }),
          }),
        }),
      } as MockQuery<UserDocument[]>);

      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(total),
      } as MockQuery<number>);

      // Act
      const result = await service.getAllUsersWithPagination(limit, offset);

      // Assert
      expect(result.users).toEqual(users);
      expect(result.total).toBe(total);
    });

    it('should return empty array when no users found', async () => {
      // Arrange
      const limit = 10;
      const offset = 0;

      userModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      } as MockQuery<UserDocument[]>);

      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      } as MockQuery<number>);

      // Act
      const result = await service.getAllUsersWithPagination(limit, offset);

      // Assert
      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('updateUserRole', () => {
    it('should successfully update user role to admin', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      const role = 'admin' as const;
      const updatedUser = { ...mockUser, role };

      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedUser),
        }),
      } as MockQuery<UserDocument | null>);

      // Act
      const result = await service.updateUserRole(userId, role);

      // Assert
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { role },
        { new: true },
      );
      expect(result.role).toBe(role);
    });

    it('should successfully update user role to user', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      const role = 'user' as const;
      const updatedUser = { ...mockUser, role };

      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedUser),
        }),
      } as MockQuery<UserDocument | null>);

      // Act
      const result = await service.updateUserRole(userId, role);

      // Assert
      expect(result.role).toBe(role);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      const role = 'admin' as const;

      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as MockQuery<UserDocument | null>);

      // Act & Assert
      await expect(service.updateUserRole(userId, role)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteUserById', () => {
    it('should successfully delete a user by id', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as MockQuery<UserDocument | null>);

      // Act
      await service.deleteUserById(userId);

      // Assert
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as MockQuery<UserDocument | null>);

      // Act & Assert
      await expect(service.deleteUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return formatted user profile with all fields', () => {
      // Arrange
      const user = mockUser as unknown as UserDocument;

      // Act
      const result = service.getProfile(user);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phoneNumber: mockUser.phoneNumber,
        preferences: mockUser.preferences,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        lastLogin: mockUser.lastLogin,
      });
    });

    it('should handle user without optional fields', () => {
      // Arrange
      const userWithoutOptionals = {
        id: '64f8a1b2c3d4e5f6a7b8c9d0',
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          platforms: ['codeforces' as const],
          alertFrequency: 'immediate' as const,
          contestTypes: [],
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as UserDocument;

      // Act
      const result = service.getProfile(userWithoutOptionals);

      // Assert
      expect(result.phoneNumber).toBeUndefined();
      expect(result.lastLogin).toBeUndefined();
    });
  });

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      // Arrange
      const user = mockUser as unknown as UserDocument;
      const updatedUser = { ...mockUser, ...mockUpdateUserDto };

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      } as MockQuery<UserDocument | null>);

      // Act
      const result = await service.updateProfile(user, mockUpdateUserDto);

      // Assert
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
        preferences: updatedUser.preferences,
      });
    });

    it('should handle partial profile updates', async () => {
      // Arrange
      const user = mockUser as unknown as UserDocument;
      const partialUpdate: UpdateUserDto = { name: 'New Name' };
      const updatedUser = { ...mockUser, name: 'New Name' };

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      } as MockQuery<UserDocument | null>);

      // Act
      const result = await service.updateProfile(user, partialUpdate);

      // Assert
      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException if user not found during update', async () => {
      // Arrange
      const user = mockUser as unknown as UserDocument;

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as MockQuery<UserDocument | null>);

      // Act & Assert
      await expect(
        service.updateProfile(user, mockUpdateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserByIdWithFormatting', () => {
    it('should return formatted user by id', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as MockQuery<UserDocument | null>);

      // Act
      const result = await service.getUserByIdWithFormatting(userId);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phoneNumber: mockUser.phoneNumber,
        preferences: mockUser.preferences,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as MockQuery<UserDocument | null>);

      // Act & Assert
      await expect(service.getUserByIdWithFormatting(userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle user without optional fields', async () => {
      // Arrange
      const userId = '64f8a1b2c3d4e5f6a7b8c9d0';
      const userWithoutOptionals = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          platforms: ['codeforces' as const],
          alertFrequency: 'immediate' as const,
          contestTypes: [],
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithoutOptionals),
      } as MockQuery<UserDocument | null>);

      // Act
      const result = await service.getUserByIdWithFormatting(userId);

      // Assert
      expect(result.phoneNumber).toBeUndefined();
    });
  });

  describe('deactivateAccount', () => {
    it('should successfully deactivate user account', async () => {
      // Arrange
      const user = mockUser as unknown as UserDocument;
      const deactivatedUser = { ...mockUser, isActive: false };

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deactivatedUser),
      } as MockQuery<UserDocument | null>);

      // Act
      const result = await service.deactivateAccount(user);

      // Assert
      expect(result).toEqual({ message: 'Account deactivated successfully' });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        user.id,
        { isActive: false },
        { new: true },
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const user = mockUser as unknown as UserDocument;

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as MockQuery<UserDocument | null>);

      // Act & Assert
      await expect(service.deactivateAccount(user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateAccount', () => {
    it('should successfully activate user account', async () => {
      // Arrange
      const user = { ...mockUser, isActive: false } as unknown as UserDocument;
      const activatedUser = { ...mockUser, isActive: true };

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(activatedUser),
      } as MockQuery<UserDocument | null>);

      // Act
      const result = await service.activateAccount(user);

      // Assert
      expect(result).toEqual({ message: 'Account activated successfully' });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        user.id,
        { isActive: true },
        { new: true },
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const user = mockUser as unknown as UserDocument;

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as MockQuery<UserDocument | null>);

      // Act & Assert
      await expect(service.activateAccount(user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
