import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto, GetUserByIdDto } from '../common/dto/user.dto';
import { UserDocument } from './schemas/user.schema';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: Partial<UserDocument> = {
    id: '64f8a1b2c3d4e5f6a7b8c9d0',
    email: 'test@example.com',
    name: 'Test User',
    phoneNumber: '+1234567890',
    isActive: true,
    preferences: {
      platforms: ['codeforces', 'leetcode'],
      alertFrequency: 'immediate',
      contestTypes: [],
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    lastLogin: new Date('2023-01-03'),
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
  });
});
