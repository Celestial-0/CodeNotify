import { Module } from '@nestjs/common';
import { CodeChefAdapter } from './codechef.adapter';

@Module({
  providers: [CodeChefAdapter],
  exports: [CodeChefAdapter],
})
export class CodechefModule {}
