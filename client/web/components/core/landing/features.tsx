"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Clock,
  Filter,
  Globe,
  Mail,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";

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

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything You Need to{" "}
            <span className="text-primary">Stay Ahead</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help competitive programmers never
            miss an opportunity to compete.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
