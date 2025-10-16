import { Module } from '@nestjs/common';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';

@Module({
  providers: [ContestsService],
  controllers: [ContestsController],
})
export class ContestsModule {}
