'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useProfile, useUpdatePreferences } from '@/lib/hooks/use-user';
import { PlatformSelector } from './platform-selector';
import { ChannelToggles } from './channel-toggles';
import { TimingSlider } from './timing-slider';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import type {
  Platform,
  AlertFrequency,
  NotificationChannels,
} from '@/lib/types/user.types';

export function PreferencesForm() {
  const { data: profile, isLoading } = useProfile();
  const updatePreferences = useUpdatePreferences();

  const [platforms, setPlatforms] = useState<Platform[]>(
    profile?.preferences?.platforms || []
  );
  const [alertFrequency, setAlertFrequency] = useState<AlertFrequency>(
    profile?.preferences?.alertFrequency || 'immediate'
  );
  const [channels, setChannels] = useState<NotificationChannels>(
    profile?.preferences?.notificationChannels || {
      email: true,
      whatsapp: true,
      push: false,
    }
  );
  const [notifyBefore, setNotifyBefore] = useState<number>(
    profile?.preferences?.notifyBefore || 24
  );

  // Update local state when profile data loads
  useState(() => {
    if (profile?.preferences) {
      setPlatforms(profile.preferences.platforms);
      setAlertFrequency(profile.preferences.alertFrequency);
      setChannels(profile.preferences.notificationChannels);
      setNotifyBefore(profile.preferences.notifyBefore);
    }
  });

  const handleSave = async () => {
    if (platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    if (!channels.email && !channels.whatsapp && !channels.push) {
      toast.error('Please enable at least one notification channel');
      return;
    }

    try {
      await updatePreferences.mutateAsync({
        platforms,
        alertFrequency,
        notificationChannels: channels,
        notifyBefore,
      });
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update preferences'
      );
    }
  };

  const handleReset = () => {
    if (profile?.preferences) {
      setPlatforms(profile.preferences.platforms);
      setAlertFrequency(profile.preferences.alertFrequency);
      setChannels(profile.preferences.notificationChannels);
      setNotifyBefore(profile.preferences.notifyBefore);
      toast.info('Preferences reset');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const alertFrequencyLabels: Record<AlertFrequency, string> = {
    immediate: 'Immediate',
    daily: 'Daily Digest',
    weekly: 'Weekly Digest',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Platforms</CardTitle>
          <CardDescription>
            Choose which competitive programming platforms you want to track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformSelector
            selectedPlatforms={platforms}
            onChange={setPlatforms}
            disabled={updatePreferences.isPending}
          />
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <CardDescription>
            Select how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChannelToggles
            channels={channels}
            onChange={setChannels}
            disabled={updatePreferences.isPending}
          />
        </CardContent>
      </Card>

      {/* Notification Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Timing</CardTitle>
          <CardDescription>
            Set when you want to be notified before contests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimingSlider
            value={notifyBefore}
            onChange={setNotifyBefore}
            disabled={updatePreferences.isPending}
          />
        </CardContent>
      </Card>

      {/* Alert Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Frequency</CardTitle>
          <CardDescription>
            Choose how often you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={alertFrequency}
            onValueChange={(value) => setAlertFrequency(value as AlertFrequency)}
            disabled={updatePreferences.isPending}
          >
            {(Object.keys(alertFrequencyLabels) as AlertFrequency[]).map(
              (frequency) => (
                <div key={frequency} className="flex items-center space-x-2">
                  <RadioGroupItem value={frequency} id={frequency} />
                  <Label htmlFor={frequency} className="cursor-pointer">
                    <div>
                      <div className="font-medium">{alertFrequencyLabels[frequency]}</div>
                      <div className="text-sm text-muted-foreground">
                        {frequency === 'immediate' &&
                          'Get notified as soon as a matching contest is found'}
                        {frequency === 'daily' &&
                          'Receive a daily summary of upcoming contests'}
                        {frequency === 'weekly' &&
                          'Receive a weekly digest of all upcoming contests'}
                      </div>
                    </div>
                  </Label>
                </div>
              )
            )}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={handleSave}
          disabled={updatePreferences.isPending}
          className="flex-1 sm:flex-none"
        >
          {updatePreferences.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={updatePreferences.isPending}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
