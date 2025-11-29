'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, Radio, Trophy } from 'lucide-react';

const contestNavItems = [
  {
    name: 'All Contests',
    href: '/contests',
    icon: Trophy,
    exact: true,
  },
  {
    name: 'Upcoming',
    href: '/contests/upcoming',
    icon: Calendar,
  },
  {
    name: 'Live',
    href: '/contests/running',
    icon: Radio,
    badge: 'live',
  },
];

export function ContestsNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {contestNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className={cn('h-4 w-4', item.badge === 'live' && active && 'animate-pulse')} />
                <span>{item.name}</span>
                {item.badge === 'live' && (
                  <span className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                    active 
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-green-500/10 text-green-600'
                  )}>
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      active ? 'bg-primary-foreground animate-pulse' : 'bg-green-500 animate-pulse'
                    )} />
                    Live
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
