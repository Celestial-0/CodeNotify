import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContestDocument = Contest & Document;

// Enums for better type safety and validation
export enum ContestPlatform {
  CODEFORCES = 'codeforces',
  LEETCODE = 'leetcode',
  CODECHEF = 'codechef',
  ATCODER = 'atcoder',
}

export enum ContestPhase {
  BEFORE = 'BEFORE',
  CODING = 'CODING',
  PENDING_SYSTEM_TEST = 'PENDING_SYSTEM_TEST',
  SYSTEM_TEST = 'SYSTEM_TEST',
  FINISHED = 'FINISHED',
  // LeetCode specific
  UPCOMING = 'UPCOMING',
  RUNNING = 'RUNNING',
  ENDED = 'ENDED',
  // CodeChef specific
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
}

export enum ContestType {
  // Codeforces
  CF = 'CF',
  IOI = 'IOI',
  ICPC = 'ICPC',
  // LeetCode
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  // CodeChef
  LONG = 'LONG',
  COOK_OFF = 'COOK_OFF',
  LUNCH_TIME = 'LUNCH_TIME',
  STARTERS = 'STARTERS',
  // AtCoder
  ABC = 'ABC',
  ARC = 'ARC',
  AGC = 'AGC',
  AHC = 'AHC',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

// Platform-specific metadata interface
interface PlatformMetadata {
  // Codeforces specific
  frozen?: boolean;
  relativeTimeSeconds?: number;
  icpcRegion?: string;
  season?: string;

  // LeetCode specific
  titleSlug?: string;
  premiumOnly?: boolean;

  // CodeChef specific
  division?: string;
  rated?: boolean;

  // AtCoder specific
  ratedRange?: string;
  penalty?: number;
}

@Schema({ timestamps: true })
export class Contest {
  // Universal contest identifier (platform-specific)
  @Prop({ required: true, index: true })
  platformId: string;

  // Contest basic information
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, enum: ContestPlatform, index: true })
  platform: ContestPlatform;

  @Prop({ required: true, enum: ContestPhase, index: true })
  phase: ContestPhase;

  @Prop({ required: true, enum: ContestType })
  type: ContestType;

  // Timing information
  @Prop({ required: true, index: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  durationMinutes: number;

  // Contest details
  @Prop()
  description?: string;

  @Prop()
  websiteUrl?: string;

  @Prop()
  registrationUrl?: string;

  @Prop()
  preparedBy?: string;

  @Prop({ enum: DifficultyLevel })
  difficulty?: DifficultyLevel;

  // Participation details
  @Prop({ default: 0 })
  participantCount?: number;

  @Prop({ default: 0 })
  problemCount?: number;

  // Geographic information
  @Prop()
  country?: string;

  @Prop()
  city?: string;

  // Platform-specific metadata stored as flexible object
  @Prop({ type: Object, default: {} })
  platformMetadata: PlatformMetadata;

  // System fields
  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: false })
  isNotified: boolean;

  @Prop()
  lastSyncedAt?: Date;

  // Virtual fields for computed properties
  get isUpcoming(): boolean {
    return this.startTime > new Date();
  }

  get isRunning(): boolean {
    const now = new Date();
    return this.startTime <= now && this.endTime >= now;
  }

  get isFinished(): boolean {
    return this.endTime < new Date();
  }

  get timeUntilStart(): number {
    return Math.max(0, this.startTime.getTime() - Date.now());
  }

  get timeUntilEnd(): number {
    return Math.max(0, this.endTime.getTime() - Date.now());
  }
}

export const ContestSchema = SchemaFactory.createForClass(Contest);

// Create compound indexes for better query performance
ContestSchema.index({ platform: 1, startTime: 1 });
ContestSchema.index({ platform: 1, phase: 1 });
ContestSchema.index({ startTime: 1, isActive: 1 });
ContestSchema.index({ phase: 1, isActive: 1 });
ContestSchema.index({ platformId: 1, platform: 1 }, { unique: true });
ContestSchema.index({ name: 'text', description: 'text' });
ContestSchema.index({ isNotified: 1, startTime: 1 });
ContestSchema.index({ lastSyncedAt: 1 });

// Virtual fields setup
ContestSchema.virtual('isUpcoming').get(function () {
  if (!this.startTime) return false;
  return this.startTime > new Date();
});

ContestSchema.virtual('isRunning').get(function () {
  if (!this.startTime || !this.endTime) return false;
  const now = new Date();
  return this.startTime <= now && this.endTime >= now;
});

ContestSchema.virtual('isFinished').get(function () {
  if (!this.endTime) return false;
  return this.endTime < new Date();
});

ContestSchema.virtual('timeUntilStart').get(function () {
  if (!this.startTime) return 0;
  return Math.max(0, this.startTime.getTime() - Date.now());
});

ContestSchema.virtual('timeUntilEnd').get(function () {
  if (!this.endTime) return 0;
  return Math.max(0, this.endTime.getTime() - Date.now());
});

// Ensure virtuals are included in JSON output
ContestSchema.set('toJSON', { virtuals: true });
ContestSchema.set('toObject', { virtuals: true });
