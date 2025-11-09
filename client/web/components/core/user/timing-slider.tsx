'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { NOTIFY_BEFORE_PRESETS } from '@/lib/types/user.types';

interface TimingSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function TimingSlider({
  value,
  onChange,
  disabled = false,
}: TimingSliderProps) {
  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">
          Notification Timing
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          How long before a contest should you be notified?
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Notify me</span>
          <span className="text-lg font-bold text-primary">
            {formatDuration(value)}
          </span>
        </div>

        <Slider
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={1}
          max={168}
          step={1}
          disabled={disabled}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 hour</span>
          <span>7 days</span>
        </div>
      </div>

      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">
          Quick Presets
        </Label>
        <div className="flex flex-wrap gap-2">
          {NOTIFY_BEFORE_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={value === preset ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(preset)}
              disabled={disabled}
              className="h-8"
            >
              {formatDuration(preset)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
