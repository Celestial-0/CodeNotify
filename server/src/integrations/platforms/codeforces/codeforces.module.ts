import { Module } from '@nestjs/common';
import { CodeforcesAdapter } from './codeforces.adapter';

@Module({
  providers: [CodeforcesAdapter],
  exports: [CodeforcesAdapter],
})
export class CodeforcesModule {}
