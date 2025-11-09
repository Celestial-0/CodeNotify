'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ContestStatsDto, PLATFORM_CONFIG, DIFFICULTY_CONFIG } from '@/lib/types/contest.types';
import { BarChart3, TrendingUp, Activity, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContestStatsChartsProps {
  stats?: ContestStatsDto;
  loading?: boolean;
  className?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'bg-primary',
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn('rounded-lg p-2', color, 'bg-opacity-10')}>
          <Icon className={cn('h-4 w-4', color.replace('bg-', 'text-'))} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ContestStatsCharts({
  stats,
  loading = false,
  className,
}: ContestStatsChartsProps) {
  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No statistics available</p>
      </div>
    );
  }

  const totalPlatforms = Object.keys(stats.platformBreakdown).length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Contests"
          value={stats.totalContests}
          icon={BarChart3}
          description={`Across ${totalPlatforms} platforms`}
          color="bg-blue-500"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingContests}
          icon={TrendingUp}
          description="Contests yet to start"
          color="bg-green-500"
        />
        <StatCard
          title="Running"
          value={stats.runningContests}
          icon={Activity}
          description="Currently active"
          color="bg-yellow-500"
        />
        <StatCard
          title="Finished"
          value={stats.finishedContests}
          icon={Award}
          description="Completed contests"
          color="bg-gray-500"
        />
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>Contests across different platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.platformBreakdown).map(([platform, count]) => {
              const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
              const percentage = ((count / stats.totalContests) * 100).toFixed(1);

              return (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-bold', config?.textColor || 'text-foreground')}>
                        {config?.icon || platform}
                      </span>
                      <span className="font-medium">{config?.name || platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn('h-full transition-all', config?.color || 'bg-primary')}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Difficulty Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Levels</CardTitle>
            <CardDescription>Contest difficulty distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.difficultyBreakdown).map(([difficulty, count]) => {
                const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG];
                const percentage = ((count / stats.totalContests) * 100).toFixed(1);

                return (
                  <div key={difficulty} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-3 w-3 rounded-full', config?.color || 'bg-gray-500')} />
                      <span className="text-sm font-medium">{config?.label || difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Contest Types</CardTitle>
            <CardDescription>Types of contests available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.typeBreakdown).map(([type, count]) => {
                const percentage = ((count / stats.totalContests) * 100).toFixed(1);

                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
