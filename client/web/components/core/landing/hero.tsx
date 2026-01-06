"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, Code2, Terminal, Trophy, Zap } from "lucide-react";
import { APP_VERSION_DISPLAY } from "@/lib/constants/version";

// --- Types ---

interface SpotlightProps {
  className?: string;
}

interface BadgeProps {
  children: React.ReactNode;
}

interface PlatformIconProps {
  color: string;
  name: string;
}

// --- Utility Components ---

const Spotlight: React.FC<SpotlightProps> = ({ className = "" }) => {
  return (
    <div
      className={`pointer-events-none absolute -top-40 left-0 right-0 mx-auto h-[500px] w-full max-w-7xl bg-linear-to-b from-primary/20 via-primary/5 to-transparent blur-3xl ${className}`}
    />
  );
};

const AnimatedGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
  );
};

const Badge: React.FC<BadgeProps> = ({ children }) => {
  return (
    <div className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border transition-all hover:bg-muted">
      <span className="absolute inset-0 -z-10 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {children}
    </div>
  );
};

const PlatformIcon: React.FC<PlatformIconProps> = ({ color, name }) => (
  <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-1.5 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1">
    <div className={`h-2 w-2 rounded-full ${color}`} />
    <span className="text-sm font-medium text-muted-foreground">
      {name}
    </span>
  </div>
);

// --- Main Hero Component ---

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Timeout ensures the initial "opacity-0" state is rendered before animating in
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background selection:bg-primary/20">
      {/* Background Atmosphere */}
      <AnimatedGrid />
      <Spotlight />

      {/* Floating Elements (Decorative) */}
      <div className="absolute top-20 left-[10%] hidden animate-float md:block opacity-20 dark:opacity-10">
        <Code2 className="h-12 w-12 -rotate-12 text-foreground" />
      </div>
      <div className="absolute top-40 right-[10%] hidden animate-float-delayed md:block opacity-20 dark:opacity-10">
        <Terminal className="h-10 w-10 rotate-12 text-foreground" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-24 sm:pb-32">

        {/* 1. Animated Badge */}
        <div className={`transform transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}>
          <Badge>
            <Bell className="mr-1 h-3 w-3 text-primary animate-pulse" />
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent font-semibold">
              {APP_VERSION_DISPLAY}
            </span>
            <span className="mx-1 text-muted-foreground/50">|</span>
            Never miss a contest
          </Badge>
        </div>

        {/* 2. Main Typography */}
        <div className="mt-8 max-w-4xl text-center">
          <h1 className={`text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl transition-all duration-1000 delay-100 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            Smart Contest Alerts <br />
            <span className="relative whitespace-nowrap">
              <span className="absolute -inset-1 -rotate-1 bg-linear-to-r from-primary to-primary/50 blur opacity-20 dark:opacity-40"></span>
              <span className="relative bg-linear-to-b from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                For Competitors
              </span>
            </span>
          </h1>

          <p className={`mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl transition-all duration-1000 delay-200 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            Sync schedules from <span className="font-semibold text-foreground">Codeforces, LeetCode, CodeChef & AtCoder</span> directly to your calendar. Get WhatsApp & Discord notifications instantly.
          </p>
        </div>

        {/* 3. CTA Buttons */}
        <div className={`mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 transition-all duration-1000 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>

          {/* Primary Button with "Shimmer" effect */}
          <Button
            size="lg"
            className="group relative overflow-hidden rounded-full bg-primary px-8 py-6 text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(var(--primary),0.3)]"
            asChild
          >
            <a href="/auth/signup">
              <span className="relative z-10 flex items-center font-semibold">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent z-0" />
            </a>
          </Button>

          {/* Secondary Button */}
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-border bg-background px-8 py-6 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            asChild
          >
            <a href="#features">
              View Live Demo
            </a>
          </Button>
        </div>

        {/* 4. Visual Proof / Mockup Area */}
        <div className={`relative mt-20 w-full max-w-5xl transition-all duration-1000 delay-500 ${mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>

          {/* Gradient Glow behind the card */}
          <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary via-primary/50 to-primary/30 opacity-20 blur-2xl" />

          {/* The "App Interface" Card */}
          <div className="relative rounded-xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">

            {/* Mock Header */}
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-xs font-mono text-muted-foreground">dashboard.tsx</div>
            </div>

            {/* Mock Content Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
              {/* Upcoming Contests Column */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Upcoming Contests</h3>
                  <span className="text-xs text-primary">Live Updates</span>
                </div>

                {/* Mock Item 1 */}
                <div className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Codeforces Round #982</p>
                      <p className="text-sm text-muted-foreground">Div 2 • Starts in 2h 15m</p>
                    </div>
                  </div>
                  <div className="hidden rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400 sm:block">
                    Registered
                  </div>
                </div>

                {/* Mock Item 2 */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">LeetCode Weekly 389</p>
                      <p className="text-sm text-muted-foreground">Global • Starts tomorrow</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">Register</Button>
                </div>
              </div>

              {/* Stats Column */}
              <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Your Streak
                </div>
                <div className="text-3xl font-bold text-foreground">12 Days</div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[70%] bg-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Top 5% of users this week</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Moving Ticker / Social Proof */}
        <div className={`mt-16 flex w-full max-w-2xl flex-wrap justify-center gap-3 sm:gap-4 transition-all duration-1000 delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <PlatformIcon color="bg-[#FFC01E]" name="LeetCode" />
          <PlatformIcon color="bg-[#1F8ACB]" name="Codeforces" />
          <PlatformIcon color="bg-[#5B4638]" name="CodeChef" />
          <PlatformIcon color="bg-[#000000] dark:bg-white" name="AtCoder" />
          {/* <PlatformIcon color="bg-[#1BA94C]" name="HackerRank" /> */}
        </div>

      </div>

      {/* Global Style overrides for standard Tailwind config not covering specific animations */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-20px) rotate(-12deg); }
          100% { transform: translateY(0px) rotate(-12deg); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-15px) rotate(12deg); }
          100% { transform: translateY(0px) rotate(12deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite 1s;
        }
      `}</style>
    </section>
  );
}