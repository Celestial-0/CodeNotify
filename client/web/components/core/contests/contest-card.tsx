'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, ExternalLink, MapPin, Clock } from 'lucide-react';
import { ContestResponseDto, PHASE_CONFIG } from '@/lib/types/contest.types';
import { PlatformBadge } from './platform-badge';
import { DifficultyBadge } from './difficulty-badge';
import { ContestCountdown } from './contest-countdown';
import { format, isValid } from 'date-fns';
import { cn, parseDescription } from '@/lib/utils';

// Default phase config for unknown phases
const DEFAULT_PHASE_CONFIG = { color: 'bg-gray-500', label: 'Unknown' };

// Helper function to safely format dates
const formatDate = (date: Date | string | undefined, formatStr: string, fallback = 'TBD'): string => {
  if (!date) return fallback;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr) : fallback;
};

interface ContestCardProps {
  contest: ContestResponseDto;
  onAddToCalendar?: (contest: ContestResponseDto) => void;
  onViewDetails?: (contest: ContestResponseDto) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
  flexType?: 'flex-row' | 'flex-col' | 'flex-row-reverse';
}

export function ContestCard({
  contest,
  onAddToCalendar,
  onViewDetails,
  showActions = true,
  variant = 'default',
  className,
  flexType = 'flex-row',
}: ContestCardProps) {
  const phaseConfig = PHASE_CONFIG[contest.phase] ?? DEFAULT_PHASE_CONFIG;
  const startDate = new Date(contest.startTime);

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCalendar?.(contest);
  };

  const handleViewDetails = () => {
    onViewDetails?.(contest);
  };

  const handleOpenWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contest.websiteUrl) {
      window.open(contest.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md hover:bg-accent/50',
          className
        )}
        onClick={handleViewDetails}
      >
        <div className="flex items-center gap-3 sm:gap-4 p-4">
          {/* Left: Platform & Phase */}
          <div className={`flex items-center ${flexType} gap-2 shrink-0 flex-wrap`}>
            <PlatformBadge platform={contest.platform} size="sm" />
            <Badge
              variant="outline"
              className={cn('text-xs', phaseConfig.color)}
            >
              {phaseConfig.label}
            </Badge>
            {contest.difficulty && (
              <DifficultyBadge difficulty={contest.difficulty} size="sm" />
            )}
          </div>

          {/* Center: Contest Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1 mb-1">
              {contest.name}
            </CardTitle>
            <div className="flex items-center gap-2 sm:gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <CalendarPlus className="h-3.5 w-3.5" />
                <span>{formatDate(startDate, 'MMM dd, HH:mm')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {contest.durationMinutes >= 60
                    ? `${Math.floor(contest.durationMinutes / 60)}h ${contest.durationMinutes % 60}m`
                    : `${contest.durationMinutes}m`}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {contest.type}
              </Badge>
            </div>
          </div>

          {/* Right: Countdown & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:block">
              <ContestCountdown
                startTime={contest.startTime}
                endTime={contest.endTime}
                compact
              />
            </div>
            {showActions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCalendar}
                  className="h-8"
                >
                  <CalendarPlus className="h-4 w-4" />
                </Button>
                {contest.websiteUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenWebsite}
                    className="h-8"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden p-4 sm:p-6',
        className
      )}
      onClick={handleViewDetails}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <PlatformBadge platform={contest.platform} />
              <Badge variant="outline" className={phaseConfig.color}>
                {phaseConfig.label}
              </Badge>
              {contest.difficulty && (
                <DifficultyBadge difficulty={contest.difficulty} size="sm" />
              )}
            </div>
            <CardTitle className="text-lg sm:text-xl line-clamp-2 mb-2">
              {contest.name}
            </CardTitle>
            {parseDescription(contest.description) && (
              <CardDescription className="line-clamp-2">
                {parseDescription(contest.description)}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Countdown */}
        <ContestCountdown startTime={contest.startTime} endTime={contest.endTime} />

        {/* Contest Info Grid */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <CalendarPlus className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-medium block">Start Time</span>
              <span className="block">{formatDate(startDate, 'MMM dd, yyyy')}</span>
              <span className="block text-xs">{formatDate(startDate, 'HH:mm')}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium block">Duration</span>
              <span className="block">
                {contest.durationMinutes >= 60
                  ? `${Math.floor(contest.durationMinutes / 60)}h ${contest.durationMinutes % 60}m`
                  : `${contest.durationMinutes}m`}
              </span>
            </div>
          </div>
        </div>

        {/* Location */}
        {(contest.country || contest.city) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {contest.city && contest.country
                ? `${contest.city}, ${contest.country}`
                : contest.city || contest.country}
            </span>
          </div>
        )}

        {/* Type and Prepared By */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Badge variant="secondary" className="text-xs shrink-0">
            {contest.type}
          </Badge>
          {contest.preparedBy && (
            <span className="text-xs text-muted-foreground truncate">
              by {contest.preparedBy}
            </span>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 sm:gap-3">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleAddToCalendar}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Add to Calendar
          </Button>
          {contest.websiteUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenWebsite}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
