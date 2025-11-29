"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink } from "lucide-react";

// --- Types ---

interface Platform {
  name: string;
  color: string; // Tailwind text/bg color class for theming
  brandColor: string; // Hex for glow effects
  logo: string;
  description: string;
  stats: string;
}

const platforms: Platform[] = [
  {
    name: "Codeforces",
    color: "text-blue-600 dark:text-blue-400",
    brandColor: "#1F8ACB",
    logo: "https://cdn.iconscout.com/icon/free/png-256/free-code-forces-3628695-3029920.png",
    description: "The gold standard for competitive programming contests.",
    stats: "Top Rated",
  },
  {
    name: "LeetCode",
    color: "text-orange-500 dark:text-orange-400",
    brandColor: "#FFA116",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/LeetCode_Logo_1.png",
    description: "Ace your technical interviews with curated challenges.",
    stats: "Most Popular",
  },
  {
    name: "CodeChef",
    color: "text-amber-700 dark:text-amber-600",
    brandColor: "#5B4638",
    logo: "https://cdn.codechef.com/images/cc-logo.svg",
    description: "Monthly long challenges and cook-offs for all levels.",
    stats: "Beginner Friendly",
  },
  {
    name: "AtCoder",
    color: "text-zinc-800 dark:text-zinc-200",
    brandColor: "#000000",
    logo: "https://img.atcoder.jp/assets/atcoder.png", // Using the official logo URL
    description: "High-quality problems from Japan's premier platform.",
    stats: "High Quality",
  },
];

// --- Utility: Moving Border Effect (Simulated) ---
const MovingBorder = ({ color }: { color: string }) => (
  <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl p-px">
    <div
      className="absolute -inset-full animate-[spin_4s_linear_infinite]"
      style={{
        background: `conic-gradient(from 90deg at 50% 50%, transparent 50%, ${color} 100%)`,
      }}
    />
  </div>
);

// --- Main Component ---

export function PlatformShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-rotate active platform unless hovering
  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % platforms.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
      {/* Ambient Background Glow */}
      <div 
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[100px] transition-colors duration-1000"
        style={{ backgroundColor: platforms[activeIndex].brandColor }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-primary/20 bg-primary/5 text-primary">
            Ecosystem
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Supported <span className="text-primary">Platforms</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We integrate directly with the APIs of major competitive programming sites to ensure you never miss a beat.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {platforms.map((platform, index) => {
            const isActive = index === activeIndex;
            
            return (
              <motion.div
                key={platform.name}
                className="relative group cursor-pointer"
                onClick={() => setActiveIndex(index)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Active State Border Gradient */}
                {isActive && <MovingBorder color={platform.brandColor} />}

                <div className={`relative h-full overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 ${
                  isActive ? "border-transparent shadow-xl" : "border-border hover:border-primary/30"
                }`}>
                  
                  {/* Card Header: Logo & Badge */}
                  <div className="flex items-center justify-between m-4">
                    <div className="relative h-12 w-12 flex items-center justify-center rounded-lg bg-secondary/50 p-4 backdrop-blur-sm">
                      {/* Using optimized <Image> component for better performance */}
                      <Image
                        src={platform.logo}
                        alt={`${platform.name} logo`}
                        fill
                        className="object-contain p-2"
                        style={{ filter: isActive ? 'none' : 'grayscale(70%)', transition: 'filter 0.3s' }}
                      />
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs font-medium animate-in fade-in zoom-in">
                        Active
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className={`text-xl font-bold transition-colors duration-300 ${isActive ? platform.color : "text-foreground"}`}>
                      {platform.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {platform.description}
                    </p>
                  </div>

                  {/* Footer Stats / Features */}
                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/50">
                     <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                        {platform.stats}
                     </Badge>
                     {isActive && (
                       <motion.div 
                         initial={{ opacity: 0, x: -10 }} 
                         animate={{ opacity: 1, x: 0 }}
                         className="ml-auto text-primary"
                       >
                         <CheckCircle2 className="h-4 w-4" />
                       </motion.div>
                     )}
                  </div>

                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
                    style={{ backgroundColor: platform.brandColor }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Integration Note */}
        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
            <p className="text-sm text-muted-foreground">
                Don&apos;t see your favorite platform?
            </p>
            <button className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Request Integration <ExternalLink className="h-3 w-3" />
            </button>
        </div>
      </div>
    </section>
  );
}