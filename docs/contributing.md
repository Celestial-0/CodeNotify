# Contributing to CodeNotify

Thank you for your interest in contributing to CodeNotify! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- MongoDB >= 6.x
- Git

### Setup Development Environment

1. **Fork the repository**

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/codenotify.git
cd codenotify
```

2. **Install dependencies**

```bash
cd server
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**

```bash
npm run start:dev
```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

Examples:
- `feature/add-telegram-notifications`
- `fix/contest-sync-error`
- `docs/update-api-guide`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples**:
```
feat(contests): add telegram notification support
fix(auth): resolve refresh token expiration issue
docs(api): update authentication guide
refactor(users): simplify profile update logic
test(contests): add unit tests for sync service
```

### Pull Request Process

1. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation

3. **Test your changes**

```bash
# Run tests
npm run test

# Run linter
npm run lint

# Check formatting
npm run format
```

4. **Commit your changes**

```bash
git add .
git commit -m "feat(module): add new feature"
```

5. **Push to your fork**

```bash
git push origin feature/your-feature-name
```

6. **Create Pull Request**

- Go to GitHub and create a PR
- Fill out the PR template
- Link related issues
- Request review

## Code Style

### TypeScript

```typescript
// ✅ Good
export class ContestsService {
  constructor(
    @InjectModel(Contest.name) private contestModel: Model<ContestDocument>,
  ) {}

  async findById(id: string): Promise<Contest> {
    return this.contestModel.findById(id);
  }
}

// ❌ Bad
export class ContestsService {
  constructor(@InjectModel(Contest.name) private contestModel) {}
  async findById(id) {
    return this.contestModel.findById(id)
  }
}
```

### Naming Conventions

- **Classes**: PascalCase (`ContestsService`)
- **Functions**: camelCase (`findById`)
- **Constants**: UPPER_SNAKE_CASE (`JWT_SECRET`)
- **Interfaces**: PascalCase with `I` prefix (`IPlatformAdapter`)
- **Types**: PascalCase (`ContestData`)

### File Structure

```
src/
├── module-name/
│   ├── dto/
│   │   └── module.dto.ts
│   ├── schemas/
│   │   └── module.schema.ts
│   ├── module.controller.ts
│   ├── module.service.ts
│   ├── module.module.ts
│   └── module.controller.spec.ts
```

## Testing

### Unit Tests

```typescript
describe('ContestsService', () => {
  let service: ContestsService;
  let model: Model<ContestDocument>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ContestsService,
        {
          provide: getModelToken(Contest.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ContestsService>(ContestsService);
  });

  it('should find contest by id', async () => {
    const result = await service.findById('123');
    expect(result).toBeDefined();
  });
});
```

### E2E Tests

```typescript
describe('Contests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/contests (GET)', () => {
    return request(app.getHttpServer())
      .get('/contests')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
      });
  });
});
```

## Documentation

### API Documentation

Update relevant files in `docs/api/`:

```markdown
# Endpoint Name

Brief description.

## Endpoint

\`\`\`http
GET /resource
\`\`\`

## Authentication

Required/Not required

## Response

\`\`\`json
{
  "example": "response"
}
\`\`\`
```

### Code Comments

```typescript
/**
 * Syncs contests from a specific platform
 * @param platform - Platform name (codeforces, leetcode, etc.)
 * @returns Sync result with counts
 * @throws NotFoundException if platform not found
 */
async syncPlatform(platform: string): Promise<SyncResult> {
  // Implementation
}
```

## Adding New Features

### Adding a New Platform

1. **Create adapter**

```typescript
// src/integrations/platforms/newplatform/newplatform.adapter.ts
export class NewPlatformAdapter extends BasePlatformAdapter {
  platformName = 'newplatform';
  enabled = true;

  async fetchContests(): Promise<ContestData[]> {
    // Implementation
  }
}
```

2. **Register adapter**

```typescript
// src/integrations/platforms/platforms.module.ts
{
  provide: PLATFORM_ADAPTERS,
  useFactory: () => [
    // ... existing adapters
    new NewPlatformAdapter(),
  ],
}
```

3. **Update schema**

```typescript
// src/contests/schemas/contest.schema.ts
export enum ContestPlatform {
  // ... existing platforms
  NEWPLATFORM = 'newplatform',
}
```

4. **Add documentation**

```markdown
<!-- docs/server/adapters/newplatform.md -->
# NewPlatform Adapter

Implementation details...
```

5. **Add tests**

```typescript
// src/integrations/platforms/newplatform/newplatform.adapter.spec.ts
describe('NewPlatformAdapter', () => {
  // Tests
});
```

## Reporting Issues

### Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, etc.)
- Screenshots (if applicable)

### Feature Requests

Include:
- Clear description
- Use case
- Expected behavior
- Mockups (if applicable)

## Review Process

### What We Look For

- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation updates
- ✅ No breaking changes (or documented)
- ✅ Performance impact
- ✅ Security considerations

### Review Timeline

- Initial review: 1-3 days
- Follow-up reviews: 1-2 days
- Merge: After approval from maintainer

## Community

### Communication Channels

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - General questions
- Pull Requests - Code contributions

### Getting Help

- Check existing documentation
- Search closed issues
- Ask in GitHub Discussions
- Tag maintainers if urgent

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to CodeNotify! 🎉
