'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/lib/hooks/use-user';
import { useSyncPlatform, useSyncAllPlatforms } from '@/lib/hooks/use-admin';
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'CODEFORCES', name: 'Codeforces', color: 'bg-blue-500' },
  { id: 'LEETCODE', name: 'LeetCode', color: 'bg-yellow-500' },
  { id: 'CODECHEF', name: 'CodeChef', color: 'bg-amber-700' },
  { id: 'ATCODER', name: 'AtCoder', color: 'bg-gray-700' },
] as const;

export default function AdminContestsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const syncPlatform = useSyncPlatform();
  const syncAllPlatforms = useSyncAllPlatforms();

  // Wait for profile to load
  if (profileLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Admin role check
  if (profile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSyncPlatform = async (platformId: string) => {
    setSyncingPlatform(platformId);
    try {
      const result = await syncPlatform.mutateAsync({
        platform: platformId,
        forceSync: false
      });
      toast.success(`${platformId} synced successfully`, {
        description: `Synced: ${result.synced}, Updated: ${result.updated}, Failed: ${result.failed}`,
      });
    } catch (error) {
      toast.error(`Failed to sync ${platformId}`, {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const results = await syncAllPlatforms.mutateAsync();
      const totalSynced = Object.values(results).reduce((sum, r) => sum + (r?.synced || 0), 0);
      const totalUpdated = Object.values(results).reduce((sum, r) => sum + (r?.updated || 0), 0);

      toast.success('All platforms synced successfully', {
        description: `Total synced: ${totalSynced}, Updated: ${totalUpdated}`,
      });
    } catch (error) {
      toast.error('Failed to sync all platforms', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contest Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Synchronize contest data from all platforms
        </p>
      </div>

      {/* Sync All Button */}
      <Card>
        <CardHeader>
          <CardTitle>Sync All Platforms</CardTitle>
          <CardDescription>
            Synchronize contests from all platforms at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSyncAll}
            disabled={syncingAll || syncingPlatform !== null}
            className="w-full sm:w-auto"
            size="lg"
          >
            {syncingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing All Platforms...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All Platforms
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Platform Sync Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {PLATFORMS.map((platform) => {
          const isSyncing = syncingPlatform === platform.id;
          const isDisabled = syncingPlatform !== null || syncingAll;

          return (
            <Card key={platform.id} className="relative overflow-hidden">
              <div className={cn('absolute top-0 left-0 right-0 h-1', platform.color)} />

              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                  {platform.name}
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleSyncPlatform(platform.id)}
                  disabled={isDisabled}
                  className="w-full"
                  variant={isSyncing ? 'secondary' : 'default'}
                  size="sm"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground">
                  <p>Last sync: Never</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Contest Sync</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Syncing will fetch the latest contest data from each platform's API
          </p>
          <p>
            • Existing contests will be updated with new information
          </p>
          <p>
            • New contests will be added to the database
          </p>
          <p>
            • This operation may take a few seconds per platform
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
