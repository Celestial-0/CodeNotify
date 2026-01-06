"use client";

import {
  Bell,
  Clock,
  Filter,
  Globe,
  Mail,
  MessageSquare,
  Shield,
  Zap,
  LucideIcon,
} from "lucide-react";

// --- Types ---

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const features = [
  {
    icon: Globe,
    title: "Multi-Platform Support",
    description:
      "Track contests from Codeforces, LeetCode, CodeChef, and AtCoder all in one place.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Get timely alerts via Email, WhatsApp, and Push notifications before contests start.",
  },
  {
    icon: Clock,
    title: "Customizable Timing",
    description:
      "Set notification preferences from 1 hour to 7 days before a contest begins.",
  },
  {
    icon: Filter,
    title: "Advanced Filtering",
    description:
      "Filter contests by platform, difficulty, type, and date range to match your preferences.",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description:
      "Automatic synchronization with contest platforms ensures you always have the latest information.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    description:
      "Receive contest reminders directly on WhatsApp for instant mobile notifications.",
  },
  {
    icon: Mail,
    title: "Email Digest",
    description:
      "Choose between immediate alerts, daily digests, or weekly summaries of upcoming contests.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data is protected with industry-standard encryption and security practices.",
  },
];

// --- Utility Components ---

const BackgroundGrid = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]">
    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 blur-[100px]"></div>
  </div>
);

// --- Feature Card Component ---

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureProps) => {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{
        animation: `fade-in-up 0.5s ease-out forwards`,
        animationDelay: `${index * 100}ms`,
        opacity: 0
      }}
    >
      {/* Decorative Gradient Blob on Hover */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Icon Container with Fill Animation */}
        <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <div>
          <h3 className="mb-2 text-base sm:text-lg font-semibold leading-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-24 sm:py-32">
      <BackgroundGrid />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          {/* Pill Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-primary"></span>
            Robust Features
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Everything you need to <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">stay ahead</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Powerful features designed to help competitive programmers never miss an opportunity to compete.
          </p>
        </div>

        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}