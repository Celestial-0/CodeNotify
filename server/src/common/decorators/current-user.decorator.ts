import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/schemas/user.schema';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    return ctx.switchToHttp().getRequest<{ user: User }>().user;
  },
);
