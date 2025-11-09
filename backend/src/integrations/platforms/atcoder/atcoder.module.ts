import { Module } from '@nestjs/common';
import { AtCoderAdapter } from './atcoder.adapter';

@Module({
  providers: [AtCoderAdapter],
  exports: [AtCoderAdapter],
})
export class AtcoderModule {}
