import { Badge } from '@/components/ui/badge';
import { DifficultyLevel, DIFFICULTY_CONFIG } from '@/lib/types/contest.types';
import { cn } from '@/lib/utils';

// Default config for unknown difficulty levels
const DEFAULT_DIFFICULTY_CONFIG = {
  color: 'bg-gray-500',
  textColor: 'text-gray-500',
  label: 'Unknown',
};

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DifficultyBadge({
  difficulty,
  variant = 'default',
  size = 'md',
  className,
}: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty] ?? DEFAULT_DIFFICULTY_CONFIG;

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
      {config.label}
    </Badge>
  );
}
