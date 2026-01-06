"use client";

import * as React from "react"
import { Separator } from "@/components/ui/separator"
import { Mail, Code2 } from "lucide-react"
import { siGithub, siX } from "simple-icons"

// --- Components ---

const SocialButton = ({ href, iconPath, label }: { href: string; iconPath: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
    aria-label={label}
  >
    <svg
      role="img"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current transition-transform group-hover:scale-110"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={iconPath} />
    </svg>
  </a>
)

const EmailButton = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
    aria-label={label}
  >
    <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
  </a>
)
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <a
      href={href}
      className="group inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
      </span>
    </a>
  </li>
)

const FooterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-4">
    <h4 className="font-semibold tracking-tight text-foreground">{title}</h4>
    <ul className="space-y-3">{children}</ul>
  </div>
)

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border bg-background">
      {/* Decorative background grid (subtle) */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">

          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">CodeNotify</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              The ultimate contest tracking platform for competitive programmers. Never miss a round again.
            </p>
            <div className="flex gap-3">
              <SocialButton href="https://github.com/celestial-0/CodeNotify" iconPath={siGithub.path} label="GitHub" />
              <SocialButton href="https://x.com/Celestial_Yash" iconPath={siX.path} label="X (Twitter)" />
              <EmailButton href="mailto:yashkumarsingh@ieee.org" label="Email" />
            </div>
          </div>

          {/* Product Links */}
          <FooterSection title="Product">
            <FooterLink href="#features">Features</FooterLink>
            <FooterLink href="/contests">Browse Contests</FooterLink>
            <FooterLink href="/dashboard">Dashboard</FooterLink>
            <FooterLink href="/dashboard/notifications">Notifications</FooterLink>
            <FooterLink href="/changelog">Changelog</FooterLink>
          </FooterSection>

          {/* Resources Links */}
          <FooterSection title="Resources">
            <FooterLink href="/auth/signin">Sign In</FooterLink>
            <FooterLink href="/auth/signup">Get Started</FooterLink>
            <FooterLink href="https://celestial-0.github.io/CodeNotify/">Documentation</FooterLink>
            <FooterLink href="https://celestial-0.github.io/CodeNotify/api/overview.html">API Reference</FooterLink>
            <FooterLink href="/community">Community</FooterLink>
          </FooterSection>

          {/* Platforms (Visual List) */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold tracking-tight text-foreground">Integrations</h4>
            <div className="flex flex-wrap gap-2">
              {['Codeforces', 'LeetCode', 'CodeChef', 'AtCoder'].map((platform) => (
                <span key={platform} className="inline-flex items-center rounded-md border border-border bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary">
                  {platform}
                </span>
              ))}
            </div>
            {/* Status Widget */}
            <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-xs">
              <p className="text-xs text-muted-foreground mb-2">System Status</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-foreground">All systems operational</span>
              </div>
            </div>
          </div>

        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            &copy; {currentYear} CodeNotify Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}