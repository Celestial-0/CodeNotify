import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UserLinkingService } from './user-linking.service';
import { UsersController } from './users.controller';
import { UserLinkingController } from './user-linking.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, UserLinkingService],
  controllers: [UsersController, UserLinkingController],
  exports: [UsersService, UserLinkingService],
})
export class UsersModule {}
