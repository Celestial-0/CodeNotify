'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, SlidersHorizontal, X } from 'lucide-react';
import { format } from 'date-fns';
import {
  ContestPlatform,
  ContestPhase,
  DifficultyLevel,
  ContestQueryDto,
  PLATFORM_CONFIG,
  DIFFICULTY_CONFIG,
} from '@/lib/types/contest.types';
import { cn } from '@/lib/utils';

interface ContestFiltersProps {
  filters: ContestQueryDto;
  onFilterChange: (filters: Partial<ContestQueryDto>) => void;
  onReset: () => void;
  className?: string;
}

const PHASE_OPTIONS = [
  { value: ContestPhase.BEFORE, label: 'Upcoming' },
  { value: ContestPhase.CODING, label: 'Running' },
  { value: ContestPhase.FINISHED, label: 'Finished' },
];

const SORT_OPTIONS = [
  { value: 'startTime', label: 'Start Time' },
  { value: 'endTime', label: 'End Time' },
  { value: 'name', label: 'Name' },
] as const;

export function ContestFilters({
  filters,
  onFilterChange,
  onReset,
  className,
}: ContestFiltersProps) {
  const handlePlatformToggle = (platform: ContestPlatform) => {
    onFilterChange({
      platform: filters.platform === platform ? undefined : platform,
    });
  };

  const handlePhaseChange = (phase: ContestPhase) => {
    onFilterChange({
      phase: filters.phase === phase ? undefined : phase,
    });
  };

  const handleDifficultyToggle = (difficulty: DifficultyLevel) => {
    onFilterChange({
      difficulty: filters.difficulty === difficulty ? undefined : difficulty,
    });
  };

  const handleSortChange = (
    sortBy: 'startTime' | 'endTime' | 'name'
  ) => {
    onFilterChange({ sortBy });
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFilterChange({ sortOrder });
  };

  const hasActiveFilters =
    filters.platform ||
    filters.phase ||
    filters.difficulty ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className={cn('space-y-6 rounded-lg border bg-card p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <Separator />

      {/* Platform Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Platform</Label>
        <div className="space-y-2">
          {Object.values(ContestPlatform).map((platform) => (
            <div key={platform} className="flex items-center space-x-2">
              <Checkbox
                id={`platform-${platform}`}
                checked={filters.platform === platform}
                onCheckedChange={() => handlePlatformToggle(platform)}
              />
              <label
                htmlFor={`platform-${platform}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                <span className={cn('font-bold', PLATFORM_CONFIG[platform].textColor)}>
                  {PLATFORM_CONFIG[platform].icon}
                </span>
                {PLATFORM_CONFIG[platform].name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Status/Phase Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Status</Label>
        <RadioGroup
          value={filters.phase || ''}
          onValueChange={(value) => handlePhaseChange(value as ContestPhase)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="phase-all" />
            <Label htmlFor="phase-all" className="cursor-pointer">
              All Contests
            </Label>
          </div>
          {PHASE_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`phase-${option.value}`} />
              <Label htmlFor={`phase-${option.value}`} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Difficulty Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Difficulty</Label>
        <div className="space-y-2">
          {Object.values(DifficultyLevel).map((difficulty) => (
            <div key={difficulty} className="flex items-center space-x-2">
              <Checkbox
                id={`difficulty-${difficulty}`}
                checked={filters.difficulty === difficulty}
                onCheckedChange={() => handleDifficultyToggle(difficulty)}
              />
              <label
                htmlFor={`difficulty-${difficulty}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {DIFFICULTY_CONFIG[difficulty].label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Date Range Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Date Range</Label>
        <div className="space-y-2">
          <div>
            <Label htmlFor="start-date" className="text-sm">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    format(new Date(filters.startDate), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate ? new Date(filters.startDate) : undefined}
                  onSelect={(date) => onFilterChange({ startDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="end-date" className="text-sm">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    format(new Date(filters.endDate), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate ? new Date(filters.endDate) : undefined}
                  onSelect={(date) => onFilterChange({ endDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sort Options */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Sort By</Label>
        <RadioGroup
          value={filters.sortBy || 'startTime'}
          onValueChange={(value) =>
            handleSortChange(
              value as 'startTime' | 'endTime' | 'name'
            )
          }
        >
          {SORT_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
              <Label htmlFor={`sort-${option.value}`} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold">Order</Label>
        <RadioGroup
          value={filters.sortOrder || 'asc'}
          onValueChange={(value) => handleSortOrderChange(value as 'asc' | 'desc')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="asc" id="order-asc" />
            <Label htmlFor="order-asc" className="cursor-pointer">
              Ascending
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="desc" id="order-desc" />
            <Label htmlFor="order-desc" className="cursor-pointer">
              Descending
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
