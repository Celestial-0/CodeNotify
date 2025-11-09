'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Code2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { PlatformSyncResult, AllPlatformsSyncResult, SyncResult } from '@/lib/types/admin.types';

interface ContestSyncPanelProps {
  onSyncPlatform: (platform: string, forceSync?: boolean) => Promise<PlatformSyncResult>;
  onSyncAll: () => Promise<AllPlatformsSyncResult>;
}

const PLATFORMS = [
  { id: 'codeforces', name: 'Codeforces', color: '#1F8ACB' },
  { id: 'leetcode', name: 'LeetCode', color: '#FFA116' },
  { id: 'codechef', name: 'CodeChef', color: '#5B4638' },
  { id: 'atcoder', name: 'AtCoder', color: '#000000' },
];

export function ContestSyncPanel({
  onSyncPlatform,
  onSyncAll,
}: ContestSyncPanelProps) {
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [lastSync, setLastSync] = useState<Record<string, Date>>({});
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});

  const handleSyncPlatform = async (platformId: string, forceSync: boolean = false) => {
    setSyncingPlatform(platformId);
    try {
      const result = await onSyncPlatform(platformId, forceSync);
      setSyncResults((prev) => ({
        ...prev,
        [platformId]: {
          synced: result.synced,
          updated: result.updated,
          failed: result.failed,
        },
      }));
      setLastSync((prev) => ({ ...prev, [platformId]: new Date() }));
      toast.success(
        `${result.synced} contests synced, ${result.updated} updated for ${platformId}`
      );
    } catch {
      toast.error(`Failed to sync ${platformId}`);
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const result = await onSyncAll();
      const newResults: Record<string, SyncResult> = {};
      Object.entries(result.results).forEach(([platform, data]: [string, SyncResult]) => {
        newResults[platform] = data;
        setLastSync((prev) => ({ ...prev, [platform]: new Date() }));
      });
      setSyncResults(newResults);
      toast.success('All platforms synced successfully');
    } catch {
      toast.error('Failed to sync all platforms');
    } finally {
      setSyncingAll(false);
    }
  };

  const getTotalStats = () => {
    const totals = { synced: 0, updated: 0, failed: 0 };
    Object.values(syncResults).forEach((result) => {
      totals.synced += result.synced;
      totals.updated += result.updated;
      totals.failed += result.failed;
    });
    return totals;
  };

  const totalStats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Synced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.synced}</div>
            <p className="text-xs text-muted-foreground mt-1">
              New contests added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.updated}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contests updated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.failed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sync failures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sync All Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sync All Platforms
            </span>
            <Button
              onClick={handleSyncAll}
              disabled={syncingAll || syncingPlatform !== null}
            >
              {syncingAll ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync All
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Synchronize contests from all platforms at once
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Individual Platform Sync */}
      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const isSyncing = syncingPlatform === platform.id;
          const result = syncResults[platform.id];
          const lastSyncTime = lastSync[platform.id];

          return (
            <Card key={platform.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code2
                      className="h-5 w-5"
                      style={{ color: platform.color }}
                    />
                    {platform.name}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleSyncPlatform(platform.id)}
                    disabled={isSyncing || syncingAll}
                  >
                    {isSyncing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </CardTitle>
                {lastSyncTime && (
                  <CardDescription className="text-xs">
                    Last synced: {format(lastSyncTime, 'MMM d, yyyy h:mm a')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">New:</span>
                      <Badge variant="secondary">{result.synced}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Updated:</span>
                      <Badge variant="secondary">{result.updated}</Badge>
                    </div>
                    {result.failed > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Failed:</span>
                        <Badge variant="destructive">{result.failed}</Badge>
                      </div>
                    )}
                    {result.synced + result.updated > 0 && (
                      <Progress
                        value={
                          ((result.synced + result.updated) /
                            (result.synced + result.updated + result.failed)) *
                          100
                        }
                        className="h-2"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>No sync data available</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
