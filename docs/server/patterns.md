# Design Patterns

Design patterns and architectural principles used in CodeNotify Server.

## Overview

CodeNotify follows industry-standard design patterns to ensure maintainability, scalability, and testability.

## Core Patterns

### 1. Adapter Pattern

**Purpose**: Abstract platform-specific implementations

**Location**: `src/integrations/platforms/`

**Implementation**:

```typescript
// Interface
interface PlatformAdapter {
  platformName: string;
  enabled: boolean;
  fetchContests(): Promise<ContestData[]>;
  healthCheck(): Promise<boolean>;
}

// Base class
abstract class BasePlatformAdapter implements PlatformAdapter {
  abstract platformName: string;
  abstract enabled: boolean;
  
  protected async makeRequest(url: string): Promise<any> {
    // Common HTTP logic with retry
  }
  
  protected abstract transformToInternalFormat(data: any): ContestData[];
}

// Concrete implementation
class CodeforcesAdapter extends BasePlatformAdapter {
  platformName = 'codeforces';
  enabled = true;
  
  async fetchContests(): Promise<ContestData[]> {
    const data = await this.makeRequest('https://codeforces.com/api/contest.list');
    return this.transformToInternalFormat(data.result);
  }
  
  protected transformToInternalFormat(contests: any[]): ContestData[] {
    return contests.map(c => ({
      platformId: c.id.toString(),
      name: c.name,
      platform: 'codeforces',
      // ... transform fields
    }));
  }
}
```

**Benefits**:
- Easy to add new platforms
- Consistent interface
- Platform-specific logic isolated
- Testable in isolation

### 2. Dependency Injection

**Purpose**: Loose coupling and testability

**Implementation**:

```typescript
// Service with injected dependencies
@Injectable()
export class ContestsService {
  constructor(
    @InjectModel(Contest.name) private contestModel: Model<ContestDocument>,
    @Inject(PLATFORM_ADAPTERS) private adapters: PlatformAdapter[],
    private notificationsService: NotificationsService,
  ) {}
  
  async syncPlatform(platform: string): Promise<void> {
    const adapter = this.adapters.find(a => a.platformName === platform);
    const contests = await adapter.fetchContests();
    await this.upsertContests(contests);
  }
}

// Module configuration
@Module({
  providers: [
    ContestsService,
    {
      provide: PLATFORM_ADAPTERS,
      useFactory: () => [
        new CodeforcesAdapter(),
        new LeetCodeAdapter(),
        new CodeChefAdapter(),
        new AtCoderAdapter(),
      ],
    },
  ],
})
export class ContestsModule {}
```

**Benefits**:
- Testable with mocks
- Flexible configuration
- Clear dependencies
- Easier refactoring

### 3. Repository Pattern

**Purpose**: Abstract data access layer

**Implementation**:

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  
  // Repository methods
  async findById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }
  
  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }
  
  async create(userData: CreateUserDto): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }
  
  async update(id: string, updates: Partial<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true });
  }
}
```

**Benefits**:
- Database agnostic
- Centralized queries
- Easy to test
- Consistent API

### 4. Guard Pattern

**Purpose**: Declarative route protection

**Implementation**:

```typescript
// JWT Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return requiredRoles.some(role => user.role === role);
  }
}

// Usage
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  // Only admins can access
}
```

**Benefits**:
- Declarative security
- Reusable guards
- Clear authorization
- Easy to test

### 5. Strategy Pattern

**Purpose**: Interchangeable algorithms

**Implementation**:

```typescript
// Passport JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

**Benefits**:
- Pluggable authentication
- Multiple strategies possible
- Clean separation
- Framework integration

### 6. Factory Pattern

**Purpose**: Object creation logic

**Implementation**:

```typescript
// Platform adapter factory
export const PLATFORM_ADAPTERS = 'PLATFORM_ADAPTERS';

@Module({
  providers: [
    {
      provide: PLATFORM_ADAPTERS,
      useFactory: (config: ConfigService) => {
        const adapters = [];
        
        if (config.get('CODEFORCES_ENABLED')) {
          adapters.push(new CodeforcesAdapter());
        }
        if (config.get('LEETCODE_ENABLED')) {
          adapters.push(new LeetCodeAdapter());
        }
        
        return adapters;
      },
      inject: [ConfigService],
    },
  ],
})
export class PlatformsModule {}
```

**Benefits**:
- Conditional creation
- Configuration-driven
- Centralized logic
- Easy to extend

### 7. Decorator Pattern

**Purpose**: Add behavior without modifying code

**Implementation**:

```typescript
// Custom decorators
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const Public = () => SetMetadata('isPublic', true);

// Usage
@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}

@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: UserDocument) {
  return user;
}
```

**Benefits**:
- Clean syntax
- Reusable metadata
- Framework integration
- Type-safe

## Architectural Principles

### SOLID Principles

#### Single Responsibility

Each class has one reason to change:

```typescript
// ✅ Good - Single responsibility
class ContestsService {
  // Only handles contest business logic
}

class ContestSchedulerService {
  // Only handles scheduled jobs
}

class NotificationsService {
  // Only handles notifications
}
```

#### Open/Closed

Open for extension, closed for modification:

```typescript
// ✅ Good - Extend via new adapter
class NewPlatformAdapter extends BasePlatformAdapter {
  // Add new platform without modifying existing code
}
```

#### Liskov Substitution

Subtypes must be substitutable:

```typescript
// ✅ Good - All adapters work the same way
function syncPlatform(adapter: PlatformAdapter) {
  const contests = await adapter.fetchContests();
  // Works with any adapter
}
```

#### Interface Segregation

Clients shouldn't depend on unused interfaces:

```typescript
// ✅ Good - Specific interfaces
interface ContestReader {
  findById(id: string): Promise<Contest>;
  findAll(): Promise<Contest[]>;
}

interface ContestWriter {
  create(data: CreateContestDto): Promise<Contest>;
  update(id: string, data: UpdateContestDto): Promise<Contest>;
}
```

#### Dependency Inversion

Depend on abstractions, not concretions:

```typescript
// ✅ Good - Depend on interface
class ContestsService {
  constructor(
    @Inject(PLATFORM_ADAPTERS) private adapters: PlatformAdapter[], // Interface
  ) {}
}
```

### DRY (Don't Repeat Yourself)

```typescript
// ❌ Bad - Repeated logic
class CodeforcesAdapter {
  async fetchContests() {
    try {
      const response = await axios.get(url, { timeout: 15000 });
      return response.data;
    } catch (error) {
      // Retry logic...
    }
  }
}

// ✅ Good - Shared in base class
abstract class BasePlatformAdapter {
  protected async makeRequest(url: string) {
    // Common HTTP logic with retry
  }
}
```

### Separation of Concerns

```typescript
// ✅ Good - Separated layers
@Controller('contests')  // HTTP layer
export class ContestsController {
  constructor(private service: ContestsService) {}
  
  @Get()
  async getAll() {
    return this.service.findAll();  // Delegate to service
  }
}

@Injectable()  // Business logic layer
export class ContestsService {
  constructor(private contestModel: Model<Contest>) {}
  
  async findAll() {
    return this.contestModel.find();  // Delegate to data layer
  }
}
```

## Best Practices

### ✅ Do

1. **Use interfaces** for contracts
2. **Inject dependencies** via constructor
3. **Keep classes focused** (SRP)
4. **Favor composition** over inheritance
5. **Write testable code**
6. **Use TypeScript** features
7. **Follow naming conventions**

### ❌ Don't

1. **Don't use global state**
2. **Don't tightly couple** modules
3. **Don't skip error handling**
4. **Don't ignore types**
5. **Don't mix concerns**
6. **Don't hardcode** values
7. **Don't skip tests**

## Related Documentation

- [Architecture Overview](/guide/architecture)
- [Module Structure](/server/modules)
- [Platform Adapters](/server/adapters)
