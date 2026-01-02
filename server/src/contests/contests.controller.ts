import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Logger,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContestsService } from './contests.service';
import {
  ContestPlatform,
  DifficultyLevel,
  ContestType,
} from './schemas/contest.schema';
import {
  CreateContestDto,
  UpdateContestDto,
  ContestQueryDto,
  BulkCreateContestDto,
  SyncRequestDto,
  type ContestResponseDto,
  type PaginatedContestResponseDto,
  type ContestStatsDto,
  type PlatformStatsDto,
} from './dto/contest.dto';
import { EnumValidationPipe } from '../common/pipes/enum-validation.pipe';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';

@Controller('contests')
export class ContestsController {
  private readonly logger = new Logger(ContestsController.name);

  constructor(private readonly contestsService: ContestsService) {}

  // Health check endpoint (must be first to avoid conflicts)
  @Public()
  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  // Analytics endpoints (before :id route)
  @Public()
  @Get('stats')
  async getContestStats(): Promise<ContestStatsDto> {
    this.logger.log('Getting contest statistics');
    return this.contestsService.getContestStats();
  }

  @Public()
  @Get('stats/:platform')
  async getPlatformStats(
    @Param('platform', new EnumValidationPipe(ContestPlatform, 'platform'))
    platform: ContestPlatform,
  ): Promise<PlatformStatsDto> {
    this.logger.log(`Getting platform statistics for: ${platform}`);
    return this.contestsService.getPlatformStats(platform);
  }

  // Status endpoints (before :id route)
  @Public()
  @Get('upcoming')
  async getUpcomingContests(
    @Query('platform') platform?: ContestPlatform,
  ): Promise<ContestResponseDto[]> {
    this.logger.log(
      `Finding upcoming contests for platform: ${platform || 'all'}`,
    );
    return this.contestsService.findUpcoming(platform);
  }

  @Public()
  @Get('running')
  async getRunningContests(
    @Query('platform') platform?: ContestPlatform,
  ): Promise<ContestResponseDto[]> {
    this.logger.log(
      `Finding running contests for platform: ${platform || 'all'}`,
    );
    return this.contestsService.findRunning(platform);
  }

  @Public()
  @Get('finished')
  async getFinishedContests(
    @Query('platform') platform?: ContestPlatform,
  ): Promise<ContestResponseDto[]> {
    this.logger.log(
      `Finding finished contests for platform: ${platform || 'all'}`,
    );
    return this.contestsService.findFinished(platform);
  }

  // Search and filtering endpoints (before :id route)
  @Public()
  @Get('search')
  async searchContests(
    @Query('q') query: string,
  ): Promise<ContestResponseDto[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query parameter "q" is required');
    }
    this.logger.log(`Searching contests with query: ${query}`);
    return this.contestsService.searchContests(query);
  }

  @Public()
  @Get('difficulty/:level')
  async filterByDifficulty(
    @Param('level', new EnumValidationPipe(DifficultyLevel, 'difficulty level'))
    level: DifficultyLevel,
  ): Promise<ContestResponseDto[]> {
    this.logger.log(`Filtering contests by difficulty: ${level}`);
    return this.contestsService.filterByDifficulty(level);
  }

  @Public()
  @Get('type/:type')
  async filterByType(
    @Param('type', new EnumValidationPipe(ContestType, 'contest type'))
    type: ContestType,
  ): Promise<ContestResponseDto[]> {
    this.logger.log(`Filtering contests by type: ${type}`);
    return this.contestsService.filterByType(type);
  }

  // Platform-specific endpoints (before :id route)
  @Public()
  @Get('platform/:platform')
  async findByPlatform(
    @Param('platform', new EnumValidationPipe(ContestPlatform, 'platform'))
    platform: ContestPlatform,
    @Query() query: ContestQueryDto,
  ): Promise<ContestResponseDto[]> {
    this.logger.log(`Finding contests for platform: ${platform}`);
    return this.contestsService.findByPlatform(platform, query);
  }

  // Synchronization endpoints (POST routes)
  @Throttle({ long: { limit: 100, ttl: 3600000 } }) // 100 requests per hour
  @Post('sync/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async syncAllPlatforms(): Promise<{
    message: string;
    results: Record<
      string,
      { synced: number; updated: number; failed: number }
    >;
  }> {
    this.logger.log('Syncing all platforms');
    const results = await this.contestsService.syncAllPlatforms();
    return {
      message: 'Sync completed for all platforms',
      results,
    };
  }

  @Throttle({ long: { limit: 100, ttl: 3600000 } }) // 100 requests per hour
  @Post('sync/:platform')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async syncPlatform(
    @Param('platform', new EnumValidationPipe(ContestPlatform, 'platform'))
    platform: ContestPlatform,
    @Body() syncRequest: SyncRequestDto,
  ): Promise<{
    message: string;
    platform: ContestPlatform;
    synced: number;
    updated: number;
    failed: number;
  }> {
    this.logger.log(
      `Syncing platform: ${platform} (force: ${syncRequest.forceSync})`,
    );
    const result = await this.contestsService.syncPlatform(platform);
    return {
      message: `Sync completed for ${platform}`,
      platform,
      ...result,
    };
  }

  @Throttle({ long: { limit: 50, ttl: 3600000 } }) // 50 requests per hour
  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(
    @Body() bulkCreateDto: BulkCreateContestDto,
  ): Promise<ContestResponseDto[]> {
    this.logger.log(`Bulk creating ${bulkCreateDto.contests.length} contests`);
    return this.contestsService.bulkCreate(bulkCreateDto);
  }

  // Basic CRUD Operations
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createContestDto: CreateContestDto,
  ): Promise<ContestResponseDto> {
    this.logger.log(`Creating contest: ${createContestDto.name}`);
    return this.contestsService.create(createContestDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: ContestQueryDto,
  ): Promise<PaginatedContestResponseDto> {
    this.logger.log(`Finding contests with query: ${JSON.stringify(query)}`);
    return this.contestsService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ContestResponseDto> {
    this.logger.log(`Finding contest by ID: ${id}`);
    return this.contestsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateContestDto: UpdateContestDto,
  ): Promise<ContestResponseDto> {
    this.logger.log(`Updating contest: ${id}`);
    return this.contestsService.update(id, updateContestDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting contest: ${id}`);
    return this.contestsService.delete(id);
  }
}
