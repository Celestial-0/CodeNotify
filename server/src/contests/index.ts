/**
 * Contests Module - Barrel Export
 * Re-exports all contest module components for easy importing
 */

// Core module
export * from './contests.module';
export * from './contests.service';
export * from './contests.controller';

// Scheduler
export * from './contest-scheduler.service';

// Schemas
export * from './schemas/contest.schema';

// DTOs
export * from './dto/contest.dto';
