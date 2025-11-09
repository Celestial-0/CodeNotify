'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import {
  NotificationStatus,
  NotificationType,
  NOTIFICATION_STATUS_LABELS,
  NOTIFICATION_TYPE_LABELS,
} from '@/lib/types/notification.types';

interface NotificationFiltersProps {
  status?: NotificationStatus;
  type?: NotificationType;
  onStatusChange: (status?: NotificationStatus) => void;
  onTypeChange: (type?: NotificationType) => void;
  onReset: () => void;
}

export function NotificationFilters({
  status,
  type,
  onStatusChange,
  onTypeChange,
  onReset,
}: NotificationFiltersProps) {
  const hasActiveFilters = status || type;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Filters</Label>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-sm">
            Status
          </Label>
          <Select
            value={status || 'all'}
            onValueChange={(value) =>
              onStatusChange(value === 'all' ? undefined : (value as NotificationStatus))
            }
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.values(NotificationStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {NOTIFICATION_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type-filter" className="text-sm">
            Type
          </Label>
          <Select
            value={type || 'all'}
            onValueChange={(value) =>
              onTypeChange(value === 'all' ? undefined : (value as NotificationType))
            }
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.values(NotificationType).map((t) => (
                <SelectItem key={t} value={t}>
                  {NOTIFICATION_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
