import { Module } from '@nestjs/common';
import { LeetCodeAdapter } from './leetcode.adapter';

@Module({
  providers: [LeetCodeAdapter],
  exports: [LeetCodeAdapter],
})
export class LeetcodeModule {}
