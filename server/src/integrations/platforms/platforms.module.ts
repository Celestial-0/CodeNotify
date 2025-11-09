import { Module } from '@nestjs/common';
import { CodeforcesModule } from './codeforces/codeforces.module';
import { LeetcodeModule } from './leetcode/leetcode.module';
import { CodechefModule } from './codechef/codechef.module';
import { AtcoderModule } from './atcoder/atcoder.module';
import { CodeforcesAdapter } from './codeforces/codeforces.adapter';
import { LeetCodeAdapter } from './leetcode/leetcode.adapter';
import { CodeChefAdapter } from './codechef/codechef.adapter';
import { AtCoderAdapter } from './atcoder/atcoder.adapter';
import { PlatformAdapter } from './base/platform.interface';
import { PLATFORM_ADAPTERS_TOKEN } from '../../common/common.constants';

/**
 * Factory provider for platform adapters registry
 * This allows ContestsService to inject all platform adapters dynamically
 */
export const PLATFORM_ADAPTERS = PLATFORM_ADAPTERS_TOKEN;

@Module({
  imports: [CodeforcesModule, LeetcodeModule, CodechefModule, AtcoderModule],
  providers: [
    {
      provide: PLATFORM_ADAPTERS_TOKEN,
      useFactory: (
        codeforces: CodeforcesAdapter,
        leetcode: LeetCodeAdapter,
        codechef: CodeChefAdapter,
        atcoder: AtCoderAdapter,
      ): PlatformAdapter[] => {
        // Only return enabled adapters
        return [codeforces, leetcode, codechef, atcoder].filter(
          (adapter) => adapter.config.enabled,
        );
      },
      inject: [
        CodeforcesAdapter,
        LeetCodeAdapter,
        CodeChefAdapter,
        AtCoderAdapter,
      ],
    },
  ],
  exports: [
    PLATFORM_ADAPTERS,
    CodeforcesModule,
    LeetcodeModule,
    CodechefModule,
    AtcoderModule,
  ],
})
export class PlatformsModule {}
