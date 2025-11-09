'use client';

import { ContestSyncPanel } from '@/components/core/admin';
import { useSyncPlatform, useSyncAllPlatforms } from '@/lib/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function AdminContestsPage() {
  const syncPlatformMutation = useSyncPlatform();
  const syncAllMutation = useSyncAllPlatforms();

  const handleSyncPlatform = async (platform: string, forceSync?: boolean) => {
    const result = await syncPlatformMutation.mutateAsync({ platform, forceSync });
    return result;
  };

  const handleSyncAll = async () => {
    const result = await syncAllMutation.mutateAsync();
    return result;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Contest Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Synchronize and manage contests from all platforms
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Contest Synchronization</CardTitle>
          <CardDescription>
            Contest data is automatically synced from the following platforms:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Codeforces:</strong> Fetches upcoming and recent contests via API
            </li>
            <li>
              <strong>LeetCode:</strong> Retrieves weekly and biweekly contest schedules
            </li>
            <li>
              <strong>CodeChef:</strong> Syncs rated and unrated contests
            </li>
            <li>
              <strong>AtCoder:</strong> Gets Beginner, Regular, and Grand contests
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            You can manually trigger synchronization for individual platforms or all
            platforms at once. The system also runs automatic synchronization every 6 hours.
          </p>
        </CardContent>
      </Card>

      <ContestSyncPanel
        onSyncPlatform={handleSyncPlatform}
        onSyncAll={handleSyncAll}
      />
    </div>
  );
}
