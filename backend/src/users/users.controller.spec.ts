import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  UpdateUserDto,
  GetUserByIdDto,
  GetAllUsersDto,
  UpdateUserRoleDto,
  UpdateUserRoleBodyDto,
  DeleteUserDto,
} from '../common/dto/user.dto';
import { UserDocument } from './schemas/user.schema';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: Partial<UserDocument> = {
    id: '64f8a1b2c3d4e5f6a7b8c9d0',
    email: 'test@example.com',
    name: 'Test User',
    phoneNumber: '+1234567890',
    role: 'user',
    isActive: true,
    preferences: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
      notificationChannels: {
        whatsapp: true,
        email: true,
        push: false,
      },
      notifyBefore: 24,
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    lastLogin: new Date('2023-01-03'),
  };

  const mockAdminUser: Partial<UserDocument> = {
    ...mockUser,
    id: '64f8a1b2c3d4e5f6a7b8c9d1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
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

  const mockGetUserByIdDto: GetUserByIdDto = {
    id: '64f8a1b2c3d4e5f6a7b8c9d0',
  };

  beforeEach(async () => {
    const mockUsersService = {
      getProfile: jest.fn().mockImplementation((user: UserDocument) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        preferences: user.preferences,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      })),
      updateProfile: jest.fn().mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        name: 'Updated Name',
        phoneNumber: '+0987654321',
        preferences: {
          platforms: ['leetcode'],
          alertFrequency: 'daily',
          contestTypes: ['div2'],
        },
      }),
      getUserByIdWithFormatting: jest.fn().mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phoneNumber: mockUser.phoneNumber,
        preferences: mockUser.preferences,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      }),
      deactivateAccount: jest
        .fn()
        .mockResolvedValue({ message: 'Account deactivated successfully' }),
      activateAccount: jest
        .fn()
        .mockResolvedValue({ message: 'Account activated successfully' }),
      getAllUsersWithPagination: jest.fn().mockResolvedValue({
        users: [mockUser, mockAdminUser],
        total: 2,
      }),
      updateUserRole: jest.fn().mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: 'admin',
      }),
      deleteUserById: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile with all fields', () => {
      // Arrange
      const expectedProfile = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phoneNumber: mockUser.phoneNumber,
        preferences: mockUser.preferences,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        lastLogin: mockUser.lastLogin,
      };

      // Act
      const result = controller.getProfile(mockUser as UserDocument);

      // Assert
      expect(result).toEqual(expectedProfile);
    });

    it('should handle user without optional fields', () => {
      // Arrange
      const userWithoutOptionals = {
        id: '64f8a1b2c3d4e5f6a7b8c9d0',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
        preferences: {
          platforms: ['codeforces'],
          alertFrequency: 'immediate',
          contestTypes: [],
        },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const expectedProfile = {
        id: userWithoutOptionals.id,
        email: userWithoutOptionals.email,
        name: userWithoutOptionals.name,
        phoneNumber: undefined,
        preferences: userWithoutOptionals.preferences,
        isActive: userWithoutOptionals.isActive,
        createdAt: userWithoutOptionals.createdAt,
        updatedAt: userWithoutOptionals.updatedAt,
        lastLogin: undefined,
      };

      // Act
      const result = controller.getProfile(
        userWithoutOptionals as unknown as UserDocument,
      );

      // Assert
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      // Arrange
      const expectedResponse = {
        id: mockUser.id,
        email: mockUser.email,
        name: 'Updated Name',
        phoneNumber: '+0987654321',
        preferences: {
          platforms: ['leetcode'],
          alertFrequency: 'daily',
          contestTypes: ['div2'],
        },
      };

      // Act
      const result = await controller.updateProfile(
        mockUser as UserDocument,
        mockUpdateUserDto,
      );

      // Assert
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockUser,
        mockUpdateUserDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialUpdate: UpdateUserDto = { name: 'New Name Only' };
      const expectedResponse = {
        id: mockUser.id!,
        email: mockUser.email!,
        name: 'New Name Only',
        phoneNumber: mockUser.phoneNumber,
        preferences: mockUser.preferences!,
      };

      usersService.updateProfile.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.updateProfile(
        mockUser as UserDocument,
        partialUpdate,
      );

      // Assert
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockUser,
        partialUpdate,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      // Arrange
      const expectedResponse = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phoneNumber: mockUser.phoneNumber,
        preferences: mockUser.preferences,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      // Act
      const result = await controller.getUserById(mockGetUserByIdDto);

      // Assert
      expect(usersService.getUserByIdWithFormatting).toHaveBeenCalledWith(
        mockGetUserByIdDto.id,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle user without optional fields', async () => {
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
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      usersService.getUserByIdWithFormatting.mockResolvedValue(
        userWithoutOptionals,
      );

      // Act
      const result = await controller.getUserById(mockGetUserByIdDto);

      // Assert
      expect(usersService.getUserByIdWithFormatting).toHaveBeenCalledWith(
        mockGetUserByIdDto.id,
      );
      expect(result).toEqual(userWithoutOptionals);
    });
  });

  describe('deactivateAccount', () => {
    it('should successfully deactivate user account', async () => {
      // Arrange
      const expectedResponse = { message: 'Account deactivated successfully' };

      // Act
      const result = await controller.deactivateAccount(
        mockUser as UserDocument,
      );

      // Assert
      expect(usersService.deactivateAccount).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('activateAccount', () => {
    it('should successfully activate user account', async () => {
      // Arrange
      const expectedResponse = { message: 'Account activated successfully' };

      // Act
      const result = await controller.activateAccount(mockUser as UserDocument);

      // Assert
      expect(usersService.activateAccount).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated list of all users', async () => {
      // Arrange
      const query: GetAllUsersDto = { limit: 20, offset: 0 };

      // Act
      const result = await controller.getAllUsers(query);

      // Assert
      expect(usersService.getAllUsersWithPagination).toHaveBeenCalledWith(
        20,
        0,
      );
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('should handle custom pagination parameters', async () => {
      // Arrange
      const query: GetAllUsersDto = { limit: 5, offset: 10 };
      usersService.getAllUsersWithPagination.mockResolvedValue({
        users: [mockUser as UserDocument],
        total: 15,
      });

      // Act
      const result = await controller.getAllUsers(query);

      // Assert
      expect(usersService.getAllUsersWithPagination).toHaveBeenCalledWith(
        5,
        10,
      );
      expect(result.limit).toBe(5);
      expect(result.offset).toBe(10);
      expect(result.total).toBe(15);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      const query: GetAllUsersDto = { limit: 20, offset: 0 };
      usersService.getAllUsersWithPagination.mockResolvedValue({
        users: [],
        total: 0,
      });

      // Act
      const result = await controller.getAllUsers(query);

      // Assert
      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('updateUserRole', () => {
    it('should successfully update user role to admin', async () => {
      // Arrange
      const params: UpdateUserRoleDto = { id: '64f8a1b2c3d4e5f6a7b8c9d0' };
      const body: UpdateUserRoleBodyDto = { role: 'admin' };
      const updatedUser = {
        id: mockUser.id!,
        email: mockUser.email!,
        name: mockUser.name!,
        role: 'admin',
      };
      usersService.updateUserRole.mockResolvedValue(
        updatedUser as UserDocument,
      );

      // Act
      const result = await controller.updateUserRole(params, body);

      // Assert
      expect(usersService.updateUserRole).toHaveBeenCalledWith(
        params.id,
        'admin',
      );
      expect(result.role).toBe('admin');
      expect(result.message).toBe('User role updated to admin successfully');
    });

    it('should successfully update user role to user', async () => {
      // Arrange
      const params: UpdateUserRoleDto = { id: '64f8a1b2c3d4e5f6a7b8c9d1' };
      const body: UpdateUserRoleBodyDto = { role: 'user' };
      const updatedUser = {
        id: mockAdminUser.id!,
        email: mockAdminUser.email!,
        name: mockAdminUser.name!,
        role: 'user',
      };
      usersService.updateUserRole.mockResolvedValue(
        updatedUser as UserDocument,
      );

      // Act
      const result = await controller.updateUserRole(params, body);

      // Assert
      expect(usersService.updateUserRole).toHaveBeenCalledWith(
        params.id,
        'user',
      );
      expect(result.role).toBe('user');
      expect(result.message).toBe('User role updated to user successfully');
    });

    it('should return user details with updated role', async () => {
      // Arrange
      const params: UpdateUserRoleDto = { id: '64f8a1b2c3d4e5f6a7b8c9d0' };
      const body: UpdateUserRoleBodyDto = { role: 'admin' };
      const updatedUser = {
        id: mockUser.id!,
        email: mockUser.email!,
        name: mockUser.name!,
        role: 'admin',
      };
      usersService.updateUserRole.mockResolvedValue(
        updatedUser as UserDocument,
      );

      // Act
      const result = await controller.updateUserRole(params, body);

      // Assert
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: 'admin',
        message: 'User role updated to admin successfully',
      });
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      // Arrange
      const params: DeleteUserDto = { id: '64f8a1b2c3d4e5f6a7b8c9d0' };

      // Act
      const result = await controller.deleteUser(params);

      // Assert
      expect(usersService.deleteUserById).toHaveBeenCalledWith(params.id);
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should call deleteUserById with correct id', async () => {
      // Arrange
      const params: DeleteUserDto = { id: 'test-user-id-123' };

      // Act
      await controller.deleteUser(params);

      // Assert
      expect(usersService.deleteUserById).toHaveBeenCalledWith(
        'test-user-id-123',
      );
      expect(usersService.deleteUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle user with minimal data in getProfile', () => {
      // Arrange
      const minimalUser = {
        id: '64f8a1b2c3d4e5f6a7b8c9d0',
        email: 'minimal@example.com',
        name: 'Minimal User',
        isActive: true,
        preferences: {
          platforms: [],
          alertFrequency: 'immediate',
          contestTypes: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = controller.getProfile(
        minimalUser as unknown as UserDocument,
      );

      // Assert
      expect(result.phoneNumber).toBeUndefined();
      expect(result.lastLogin).toBeUndefined();
      expect(result.preferences).toEqual(minimalUser.preferences);
    });

    it('should handle empty update DTO', async () => {
      // Arrange
      const emptyUpdateDto: UpdateUserDto = {};
      const expectedResponse = {
        id: mockUser.id!,
        email: mockUser.email!,
        name: mockUser.name!,
        phoneNumber: mockUser.phoneNumber,
        preferences: mockUser.preferences!,
      };

      usersService.updateProfile.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.updateProfile(
        mockUser as UserDocument,
        emptyUpdateDto,
      );

      // Assert
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockUser,
        emptyUpdateDto,
      );
      expect(result).toBeDefined();
    });

    it('should handle user with notification preferences', () => {
      // Arrange
      const userWithNotifications = {
        ...mockUser,
        preferences: {
          ...mockUser.preferences!,
          notificationChannels: {
            whatsapp: true,
            email: false,
            push: true,
          },
          notifyBefore: 48,
        },
      };

      // Act
      const result = controller.getProfile(
        userWithNotifications as unknown as UserDocument,
      );

      // Assert
      expect(result.preferences.notificationChannels).toEqual({
        whatsapp: true,
        email: false,
        push: true,
      });
      expect(result.preferences.notifyBefore).toBe(48);
    });
  });
});
