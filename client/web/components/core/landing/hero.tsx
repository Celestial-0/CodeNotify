"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Bell } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in duration-700">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Never Miss a Coding Contest Again
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Smart Contest Alerts
          </span>
          <br />
          <span className="text-foreground">For Competitive Coders</span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          Get personalized notifications for coding contests from Codeforces,
          LeetCode, CodeChef, and AtCoder. Choose your preferred platforms,
          set notification timings, and never miss a contest.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <Button size="lg" asChild className="group">
            <Link href="/auth/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">View Features</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-700">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              4
            </div>
            <div className="text-sm text-muted-foreground">Platforms</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              1000+
            </div>
            <div className="text-sm text-muted-foreground">Contests/Year</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              3
            </div>
            <div className="text-sm text-muted-foreground">
              Notification Channels
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              24/7
            </div>
            <div className="text-sm text-muted-foreground">Monitoring</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full p-1">
          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  );
}
