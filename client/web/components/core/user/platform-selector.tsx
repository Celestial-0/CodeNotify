'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Platform,
  PLATFORM_NAMES,
  PLATFORM_COLORS,
} from '@/lib/types/user.types';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onChange: (platforms: Platform[]) => void;
  disabled?: boolean;
}

const ALL_PLATFORMS: Platform[] = [
  'codeforces',
  'leetcode',
  'codechef',
  'atcoder',
];

export function PlatformSelector({
  selectedPlatforms,
  onChange,
  disabled = false,
}: PlatformSelectorProps) {
  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      onChange(selectedPlatforms.filter((p) => p !== platform));
    } else {
      onChange([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Select Platforms</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ALL_PLATFORMS.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform);
          return (
            <Card
              key={platform}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && togglePlatform(platform)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={platform}
                  checked={isSelected}
                  onCheckedChange={() => !disabled && togglePlatform(platform)}
                  disabled={disabled}
                  className="data-[state=checked]:bg-primary"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={platform}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                    />
                    <span className="font-medium">{PLATFORM_NAMES[platform]}</span>
                  </Label>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {selectedPlatforms.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Select at least one platform to receive notifications
        </p>
      )}
    </div>
  );
}
