'use client';

import { useEffect, useState } from 'react';
import { Clock, PlayCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContestCountdownProps {
  startTime: Date | string;
  endTime: Date | string;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: 'upcoming' | 'running' | 'finished';
}

function calculateTimeRemaining(
  startTime: Date | string,
  endTime: Date | string
): TimeRemaining {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  // Handle invalid dates
  if (isNaN(start) || isNaN(end)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'finished' };
  }

  let status: 'upcoming' | 'running' | 'finished';
  let targetTime: number;

  if (now < start) {
    status = 'upcoming';
    targetTime = start;
  } else if (now >= start && now < end) {
    status = 'running';
    targetTime = end;
  } else {
    status = 'finished';
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status };
  }

  const diff = targetTime - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, status };
}

export function ContestCountdown({
  startTime,
  endTime,
  className,
  showIcon = true,
  compact = false,
}: ContestCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(startTime, endTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(startTime, endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const { days, hours, minutes, seconds, status } = timeRemaining;

  const statusConfig = {
    upcoming: {
      icon: Clock,
      text: 'Starts in',
      shortText: 'Starts',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    running: {
      icon: PlayCircle,
      text: 'Ends in',
      shortText: 'Ends',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    finished: {
      icon: CheckCircle,
      text: 'Finished',
      shortText: 'Done',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (status === 'finished') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg',
          compact ? 'px-2 py-1' : 'px-3 py-2',
          config.bgColor,
          className
        )}
      >
        {showIcon && <Icon className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', config.color)} />}
        <span className={cn(compact ? 'text-xs' : 'text-sm', 'font-medium', config.color)}>
          {compact ? config.shortText : config.text}
        </span>
      </div>
    );
  }

  const timeString = compact
    ? `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`
    : `${days > 0 ? `${days}d ` : ''}${days > 0 || hours > 0 ? `${hours}h ` : ''}${days > 0 || hours > 0 || minutes > 0 ? `${minutes}m ` : ''}${days === 0 ? `${seconds}s` : ''}`;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg',
        compact ? 'px-2 py-1' : 'px-3 py-2',
        config.bgColor,
        className
      )}
    >
      {showIcon && <Icon className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', config.color)} />}
      <div className="flex items-center gap-1">
        {!compact && (
          <span className={cn('text-sm font-medium', config.color)}>
            {config.text}:
          </span>
        )}
        <span className={cn('font-mono font-bold', compact ? 'text-xs' : 'text-sm', config.color)}>
          {timeString}
        </span>
      </div>
    </div>
  );
}
