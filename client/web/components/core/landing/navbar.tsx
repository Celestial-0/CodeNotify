"use client";

import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                CN
              </span>
            </div>
            <span className="font-bold text-xl">CodeNotify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/contests"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contests
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Docs
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <AnimatedThemeToggler className="h-9 w-9 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center" />
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <AnimatedThemeToggler className="h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/contests"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Contests
            </Link>
            <Link
              href="/pricing"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Docs
            </Link>
            <div className="pt-4 space-y-2">
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
