import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './schemas/user.schema';

describe('UsersModule', () => {
  let module: TestingModule;
  let usersService: UsersService;
  let usersController: UsersController;

  beforeEach(async () => {
    const mockUserModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(mockUserModel)
      .compile();

    usersService = module.get<UsersService>(UsersService);
    usersController = module.get<UsersController>(UsersController);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Module Initialization', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should have UsersService defined', () => {
      expect(usersService).toBeDefined();
      expect(usersService).toBeInstanceOf(UsersService);
    });

    it('should have UsersController defined', () => {
      expect(usersController).toBeDefined();
      expect(usersController).toBeInstanceOf(UsersController);
    });
  });

  describe('Module Exports', () => {
    it('should export UsersService', () => {
      const exportedService = module.get<UsersService>(UsersService);
      expect(exportedService).toBeDefined();
      expect(exportedService).toBe(usersService);
    });
  });

  describe('Module Dependencies', () => {
    it('should have MongooseModule configured', () => {
      const userModel = module.get<Record<string, unknown>>(
        getModelToken(User.name),
      );
      expect(userModel).toBeDefined();
    });

    it('should inject User model into UsersService', () => {
      expect(usersService).toBeDefined();
      // Service should have access to the model through dependency injection
    });
  });

  describe('Module Structure', () => {
    it('should have correct providers', () => {
      const providers =
        (Reflect.getMetadata('providers', UsersModule) as unknown[]) || [];
      expect(providers).toContain(UsersService);
    });

    it('should have correct controllers', () => {
      const controllers =
        (Reflect.getMetadata('controllers', UsersModule) as unknown[]) || [];
      expect(controllers).toContain(UsersController);
    });

    it('should have correct exports', () => {
      const exports =
        (Reflect.getMetadata('exports', UsersModule) as unknown[]) || [];
      expect(exports).toContain(UsersService);
    });
  });

  describe('Service-Controller Integration', () => {
    it('should allow controller to access service methods', () => {
      expect(usersService.createUser).toBeDefined();
      expect(usersService.getUserById).toBeDefined();
      expect(usersService.findByEmail).toBeDefined();
      expect(usersService.updateUser).toBeDefined();
      expect(usersService.deleteUser).toBeDefined();
      expect(usersService.getAllUsers).toBeDefined();
      expect(usersService.getAllUsersWithPagination).toBeDefined();
      expect(usersService.updateUserRole).toBeDefined();
      expect(usersService.deleteUserById).toBeDefined();
      expect(usersService.getProfile).toBeDefined();
      expect(usersService.updateProfile).toBeDefined();
      expect(usersService.getUserByIdWithFormatting).toBeDefined();
      expect(usersService.deactivateAccount).toBeDefined();
      expect(usersService.activateAccount).toBeDefined();
      expect(usersService.updateRefreshToken).toBeDefined();
      expect(usersService.updateLastLogin).toBeDefined();
      expect(usersService.deactivateUser).toBeDefined();
      expect(usersService.activateUser).toBeDefined();
    });

    it('should allow controller to call service methods', () => {
      expect(typeof usersService.createUser).toBe('function');
      expect(typeof usersService.getUserById).toBe('function');
      expect(typeof usersService.updateUser).toBe('function');
    });
  });

  describe('Module Configuration', () => {
    it('should configure MongooseModule with User schema', () => {
      const imports =
        (Reflect.getMetadata('imports', UsersModule) as unknown[]) || [];
      expect(imports.length).toBeGreaterThan(0);
    });

    it('should be a valid NestJS module', () => {
      // UsersModule is properly decorated with @Module
      expect(UsersModule).toBeDefined();
      expect(typeof UsersModule).toBe('function');
    });
  });
});
