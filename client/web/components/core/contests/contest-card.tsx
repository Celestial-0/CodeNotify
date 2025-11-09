'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, ExternalLink, Users, FileText, MapPin } from 'lucide-react';
import { ContestResponseDto, PHASE_CONFIG } from '@/lib/types/contest.types';
import { PlatformBadge } from './platform-badge';
import { DifficultyBadge } from './difficulty-badge';
import { ContestCountdown } from './contest-countdown';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContestCardProps {
  contest: ContestResponseDto;
  onAddToCalendar?: (contest: ContestResponseDto) => void;
  onViewDetails?: (contest: ContestResponseDto) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ContestCard({
  contest,
  onAddToCalendar,
  onViewDetails,
  showActions = true,
  variant = 'default',
  className,
}: ContestCardProps) {
  const phaseConfig = PHASE_CONFIG[contest.phase];
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
          'cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]',
          className
        )}
        onClick={handleViewDetails}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <PlatformBadge platform={contest.platform} size="sm" />
                <Badge
                  variant="outline"
                  className={cn('text-xs', phaseConfig.color)}
                >
                  {phaseConfig.label}
                </Badge>
              </div>
              <CardTitle className="text-base line-clamp-1">
                {contest.name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-sm text-muted-foreground">
            {format(startDate, 'MMM dd, yyyy • HH:mm')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]',
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
            <CardTitle className="text-xl line-clamp-2 mb-2">
              {contest.name}
            </CardTitle>
            {contest.description && (
              <CardDescription className="line-clamp-2">
                {contest.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Countdown */}
        <ContestCountdown startTime={contest.startTime} endTime={contest.endTime} />

        {/* Contest Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarPlus className="h-4 w-4" />
            <span className="font-medium">Start:</span>
            <span>{format(startDate, 'MMM dd, HH:mm')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Duration:</span>
            <span>
              {contest.durationMinutes >= 60
                ? `${Math.floor(contest.durationMinutes / 60)}h ${contest.durationMinutes % 60}m`
                : `${contest.durationMinutes}m`}
            </span>
          </div>
          {contest.participantCount && contest.participantCount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="font-medium">Participants:</span>
              <span>{contest.participantCount.toLocaleString()}</span>
            </div>
          )}
          {contest.problemCount && contest.problemCount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Problems:</span>
              <span>{contest.problemCount}</span>
            </div>
          )}
        </div>

        {/* Location */}
        {(contest.country || contest.city) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {contest.city && contest.country
                ? `${contest.city}, ${contest.country}`
                : contest.city || contest.country}
            </span>
          </div>
        )}

        {/* Type and Prepared By */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {contest.type}
          </Badge>
          {contest.preparedBy && (
            <span className="text-xs text-muted-foreground">
              by {contest.preparedBy}
            </span>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2">
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

// Missing Clock import - add it
import { Clock } from 'lucide-react';
