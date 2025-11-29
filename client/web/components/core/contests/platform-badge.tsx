import { Badge } from '@/components/ui/badge';
import { ContestPlatform, PLATFORM_CONFIG } from '@/lib/types/contest.types';
import { cn } from '@/lib/utils';

// Default config for unknown platforms
const DEFAULT_PLATFORM_CONFIG = {
  name: 'Unknown',
  color: 'bg-gray-500',
  textColor: 'text-gray-500',
  icon: '?',
};

interface PlatformBadgeProps {
  platform: ContestPlatform;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PlatformBadge({
  platform,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className,
}: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform] ?? DEFAULT_PLATFORM_CONFIG;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        'font-medium',
        variant === 'default' && config.color,
        variant === 'outline' && `border-2 ${config.textColor}`,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <span className="mr-1 font-bold">{config.icon}</span>
      )}
      {config.name}
    </Badge>
  );
}
