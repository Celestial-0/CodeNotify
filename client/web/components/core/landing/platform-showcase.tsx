"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const platforms = [
  {
    name: "Codeforces",
    color: "bg-red-500",
    logo: "CF",
  },
  {
    name: "LeetCode",
    color: "bg-orange-500",
    logo: "LC",
  },
  {
    name: "CodeChef",
    color: "bg-amber-600",
    logo: "CC",
  },
  {
    name: "AtCoder",
    color: "bg-gray-700",
    logo: "AC",
  },
];

export function PlatformShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % platforms.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Supported Platforms
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get notified about contests from all major competitive programming
            platforms
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {platforms.map((platform, index) => (
            <div
              key={platform.name}
              className={`relative group cursor-pointer transition-all duration-500 ${
                activeIndex === index ? "scale-105" : "scale-100"
              }`}
            >
              <div
                className={`p-8 rounded-xl border-2 bg-card transition-all duration-300 ${
                  activeIndex === index
                    ? "border-primary shadow-xl"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Logo/Icon */}
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-lg ${platform.color} flex items-center justify-center text-white font-bold text-xl`}
                >
                  {platform.logo}
                </div>

                {/* Platform Name */}
                <h3 className="text-center font-semibold text-lg mb-2">
                  {platform.name}
                </h3>

                {/* Active Indicator */}
                {activeIndex === index && (
                  <Badge variant="default" className="absolute -top-2 -right-2">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Platform Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            More platforms coming soon...
          </p>
        </div>
      </div>
    </section>
  );
}
