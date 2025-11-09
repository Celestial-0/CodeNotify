# Password Hashing with Bcrypt

Secure password storage using bcrypt hashing algorithm in CodeNotify.

## Overview

CodeNotify uses bcrypt for password hashing, providing a secure one-way encryption that protects user passwords even if the database is compromised.

## Why Bcrypt?

### Advantages

1. **Adaptive**: Configurable work factor (salt rounds)
2. **Slow by Design**: Resistant to brute-force attacks
3. **Built-in Salt**: Automatic salt generation
4. **Industry Standard**: Widely tested and trusted
5. **Future-Proof**: Can increase difficulty as hardware improves

### Security Features

- **One-way hashing**: Cannot be reversed
- **Unique salts**: Each password gets a unique salt
- **Constant-time comparison**: Prevents timing attacks
- **Configurable cost**: Adjustable computational complexity

## Configuration

### Salt Rounds

```typescript
// auth/auth.constants.ts
export const BCRYPT_SALT_ROUNDS = 12;
```

**Salt Rounds Explained**:
- Each increment doubles the computation time
- 10 rounds = ~100ms
- 12 rounds = ~400ms (recommended)
- 14 rounds = ~1.6s

**Choosing Salt Rounds**:
- **Development**: 10 rounds (faster)
- **Production**: 12 rounds (balanced)
- **High Security**: 14+ rounds (slower but more secure)

## Implementation

### Installation

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

### Password Hashing

```typescript
import * as bcrypt from 'bcrypt';

export class AuthService {
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
}
```

### Password Verification

```typescript
async verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
```

### Complete Example

```typescript
// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  async signup(email: string, password: string) {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });
    
    return user;
  }

  async signin(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return user;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await this.usersService.findById(userId);
    
    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password
    );
    
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      this.saltRounds
    );
    
    await this.usersService.updatePassword(userId, hashedNewPassword);
  }
}
```

## Hash Format

### Structure

```
$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
\__/\/ \____________________/\_____________________________/
 |  |          Salt                      Hash
 |  |
 |  Cost Factor (12 rounds)
 |
 Algorithm (2b = bcrypt)
```

### Example

```typescript
const password = 'mySecurePassword123';
const hash = await bcrypt.hash(password, 12);

console.log(hash);
// $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYj5rHlC6
```

## Performance Considerations

### Benchmarks

| Salt Rounds | Time per Hash | Hashes/Second |
|-------------|---------------|---------------|
| 10          | ~100ms        | 10            |
| 11          | ~200ms        | 5             |
| 12          | ~400ms        | 2.5           |
| 13          | ~800ms        | 1.25          |
| 14          | ~1.6s         | 0.625         |

### Optimization Tips

1. **Use Async Operations**: Never block the event loop
2. **Rate Limiting**: Limit login attempts
3. **Caching**: Don't re-hash on every request
4. **Background Processing**: Hash passwords in worker threads for bulk operations

### Example: Async Hashing

```typescript
// ✅ Good - Non-blocking
async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, this.saltRounds);
}

// ❌ Bad - Blocks event loop
hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, this.saltRounds);
}
```

## Security Best Practices

### ✅ Do

1. **Use High Salt Rounds**: Minimum 12 in production
2. **Hash Asynchronously**: Use `bcrypt.hash()`, not `bcrypt.hashSync()`
3. **Validate Input**: Check password strength before hashing
4. **Use Constant-Time Comparison**: `bcrypt.compare()` prevents timing attacks
5. **Store Only Hashes**: Never store plain passwords
6. **Implement Rate Limiting**: Prevent brute-force attacks
7. **Use HTTPS**: Protect passwords in transit

### ❌ Don't

1. **Don't Use Low Salt Rounds**: Below 10 is insecure
2. **Don't Hash Client-Side**: Hash on server only
3. **Don't Reuse Salts**: Bcrypt generates unique salts automatically
4. **Don't Log Passwords**: Never log plain or hashed passwords
5. **Don't Compare Manually**: Use `bcrypt.compare()` for security
6. **Don't Store Salts Separately**: Bcrypt includes salt in hash
7. **Don't Use MD5/SHA1**: These are not suitable for passwords

## Password Policies

### Minimum Requirements

```typescript
import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
```

### Validation Example

```typescript
async validatePassword(password: string): Promise<void> {
  try {
    passwordSchema.parse(password);
  } catch (error) {
    throw new BadRequestException('Password does not meet requirements');
  }
}
```

## Common Patterns

### Password Reset

```typescript
async resetPassword(token: string, newPassword: string) {
  // Verify reset token
  const user = await this.verifyResetToken(token);
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
  
  // Update password
  await this.usersService.updatePassword(user.id, hashedPassword);
  
  // Invalidate reset token
  await this.invalidateResetToken(token);
}
```

### Password History

```typescript
async checkPasswordHistory(
  userId: string,
  newPassword: string
): Promise<boolean> {
  const passwordHistory = await this.getPasswordHistory(userId);
  
  // Check if new password matches any of the last 5 passwords
  for (const oldHash of passwordHistory.slice(0, 5)) {
    const isMatch = await bcrypt.compare(newPassword, oldHash);
    if (isMatch) {
      throw new BadRequestException(
        'Password was used recently. Please choose a different password.'
      );
    }
  }
  
  return true;
}
```

## Testing

### Unit Tests

```typescript
describe('Password Hashing', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should hash password', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('should verify correct password', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    
    const isValid = await authService.verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    
    const isValid = await authService.verifyPassword('wrongPassword', hash);
    expect(isValid).toBe(false);
  });

  it('should generate unique hashes for same password', async () => {
    const password = 'testPassword123';
    const hash1 = await authService.hashPassword(password);
    const hash2 = await authService.hashPassword(password);
    
    expect(hash1).not.toBe(hash2);
  });
});
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Slow performance | High salt rounds | Reduce to 10-12 |
| Blocking event loop | Using `hashSync()` | Use async `hash()` |
| Invalid hash format | Wrong bcrypt version | Use bcrypt 2b format |
| Comparison fails | Manual comparison | Use `bcrypt.compare()` |

### Error Handling

```typescript
async hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, this.saltRounds);
  } catch (error) {
    this.logger.error('Password hashing failed', error);
    throw new InternalServerErrorException('Failed to process password');
  }
}
```

## Migration from Other Algorithms

### From Plain Text

```typescript
async migrateFromPlainText(userId: string, plainPassword: string) {
  const hashedPassword = await bcrypt.hash(plainPassword, this.saltRounds);
  await this.usersService.updatePassword(userId, hashedPassword);
}
```

### From MD5/SHA

```typescript
async migrateFromMD5(userId: string, md5Hash: string) {
  // User must reset password
  await this.sendPasswordResetEmail(userId);
  await this.usersService.markPasswordExpired(userId);
}
```

## Related Documentation

- [JWT Authentication](/server/security/jwt)
- [Auth Module](/server/modules/auth)
- [Security Guards](/server/security/guards)
- [Authentication API](/api/authentication)
