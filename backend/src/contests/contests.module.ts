import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';
import { Contest, ContestSchema } from './schemas/contest.schema';
import { PlatformsModule } from '../integrations/platforms/platforms.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ContestSchedulerService } from './contest-scheduler.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contest.name, schema: ContestSchema }]),
    PlatformsModule,
    NotificationsModule,
  ],
  providers: [ContestsService, ContestSchedulerService],
  controllers: [ContestsController],
  exports: [ContestsService],
})
export class ContestsModule {}
