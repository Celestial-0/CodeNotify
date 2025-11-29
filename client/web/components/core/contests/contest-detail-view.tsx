'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarPlus,
  ExternalLink,
  Users,
  FileText,
  MapPin,
  Clock,
  Link as LinkIcon,
  User,
  Calendar,
} from 'lucide-react';
import { ContestResponseDto, PHASE_CONFIG } from '@/lib/types/contest.types';
import { PlatformBadge } from './platform-badge';
import { DifficultyBadge } from './difficulty-badge';
import { ContestCountdown } from './contest-countdown';
import { format, isValid } from 'date-fns';
import { cn, parseDescription } from '@/lib/utils';

// Helper function to safely format dates
const formatDate = (date: Date | string | undefined, formatStr: string, fallback = 'TBD'): string => {
  if (!date) return fallback;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr) : fallback;
};

// Default phase config for unknown phases
const DEFAULT_PHASE_CONFIG = { color: 'bg-gray-500', label: 'Unknown' };

interface ContestDetailViewProps {
  contest: ContestResponseDto;
  onAddToCalendar?: (contest: ContestResponseDto) => void;
  onBack?: () => void;
  className?: string;
}

export function ContestDetailView({
  contest,
  onAddToCalendar,
  onBack,
  className,
}: ContestDetailViewProps) {
  const phaseConfig = PHASE_CONFIG[contest.phase] ?? DEFAULT_PHASE_CONFIG;
  const startDate = new Date(contest.startTime);
  const endDate = new Date(contest.endTime);

  const handleAddToCalendar = () => {
    onAddToCalendar?.(contest);
  };

  const handleOpenWebsite = () => {
    if (contest.websiteUrl) {
      window.open(contest.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenRegistration = () => {
    if (contest.registrationUrl) {
      window.open(contest.registrationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <PlatformBadge platform={contest.platform} size="lg" />
                <Badge variant="outline" className={cn('text-sm', phaseConfig.color)}>
                  {phaseConfig.label}
                </Badge>
                {contest.difficulty && (
                  <DifficultyBadge difficulty={contest.difficulty} size="md" />
                )}
                <Badge variant="secondary">{contest.type}</Badge>
              </div>

              <CardTitle className="text-3xl">{contest.name}</CardTitle>

              {parseDescription(contest.description) && (
                <CardDescription className="text-base">
                  {parseDescription(contest.description)}
                </CardDescription>
              )}
            </div>

            <div className="flex gap-2">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Countdown */}
          <ContestCountdown
            startTime={contest.startTime}
            endTime={contest.endTime}
            className="w-full justify-center"
          />

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleAddToCalendar} className="flex-1">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
            {contest.websiteUrl && (
              <Button variant="outline" onClick={handleOpenWebsite}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Website
              </Button>
            )}
            {contest.registrationUrl && (
              <Button variant="outline" onClick={handleOpenRegistration}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Register
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contest Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contest Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                <p className="text-base font-semibold">
                  {formatDate(startDate, 'PPP')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(startDate, 'HH:mm:ss')} (Local Time)
                </p>
              </div>
            </div>

            {/* End Time */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">End Time</p>
                <p className="text-base font-semibold">
                  {formatDate(endDate, 'PPP')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(endDate, 'HH:mm:ss')} (Local Time)
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-base font-semibold">
                  {contest.durationMinutes >= 60
                    ? `${Math.floor(contest.durationMinutes / 60)} hours ${contest.durationMinutes % 60} minutes`
                    : `${contest.durationMinutes} minutes`}
                </p>
              </div>
            </div>



            {/* Prepared By */}
            {contest.preparedBy && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Prepared By
                  </p>
                  <p className="text-base font-semibold">{contest.preparedBy}</p>
                </div>
              </div>
            )}

            {/* Location */}
            {(contest.country || contest.city) && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-base font-semibold">
                    {contest.city && contest.country
                      ? `${contest.city}, ${contest.country}`
                      : contest.city || contest.country}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform-Specific Metadata */}
      {contest.platformMetadata && Object.keys(contest.platformMetadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(contest.platformMetadata).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-semibold">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {(contest.websiteUrl || contest.registrationUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>External Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contest.websiteUrl && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleOpenWebsite}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Contest Website
              </Button>
            )}
            {contest.registrationUrl && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleOpenRegistration}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Registration Page
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Platform ID:</span>
            <span className="font-mono">{contest.platformId}</span>
          </div>
          <div className="flex justify-between">
            <span>Contest ID:</span>
            <span className="font-mono">{contest.id}</span>
          </div>
          {contest.lastSyncedAt && (
            <div className="flex justify-between">
              <span>Last Synced:</span>
              <span>{formatDate(contest.lastSyncedAt, 'PPp')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={contest.isActive ? 'default' : 'secondary'} className="text-xs">
              {contest.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
