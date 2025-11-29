'use client';

import { WelcomeBanner } from '@/components/core/dashboard/welcome-banner';
import { StatsCard } from '@/components/core/dashboard/stats-card';
import { UpcomingContestsWidget } from '@/components/core/dashboard/upcoming-contests-widget';
import { RecentNotifications } from '@/components/core/dashboard/recent-notifications';
import { QuickActions } from '@/components/core/dashboard/quick-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotificationStats } from '@/lib/hooks/use-notifications';
import { useContestStats } from '@/lib/hooks/use-contests';
import { useProfile } from '@/lib/hooks/use-user';
import { Trophy, Bell, Code2, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: notificationStats, isLoading: notifStatsLoading } = useNotificationStats();
  const { data: contestStats, isLoading: contestStatsLoading } = useContestStats();

  const isLoading = profileLoading || notifStatsLoading || contestStatsLoading;

  return (
    <div className="relative space-y-6">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]" />
      
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </>
        ) : (
          <>
            <StatsCard
              icon={Trophy}
              title="Total Contests"
              value={contestStats?.totalContests || 0}
              description="Contests tracked"
            />
            <StatsCard
              icon={Code2}
              title="Active Platforms"
              value={profile?.preferences.platforms.length || 0}
              description="Platforms connected"
            />
            <StatsCard
              icon={Bell}
              title="Notifications Sent"
              value={notificationStats?.sent || 0}
              description={`${notificationStats?.successRate.toFixed(0) || 0}% success rate`}
            />
            <StatsCard
              icon={TrendingUp}
              title="Upcoming Contests"
              value={contestStats?.upcomingContests || 0}
              description="Next 7 days"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Contests */}
        <UpcomingContestsWidget />

        {/* Recent Notifications */}
        <RecentNotifications />
      </div>
    </div>
  );
}
