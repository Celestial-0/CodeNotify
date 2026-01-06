"use client";

import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import { Activity } from "react";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useProfile } from "@/lib/hooks/use-user";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading, user, signout } = useAuthStore();
  // Only fetch profile when authenticated to avoid 401 errors
  const { data: profile } = useProfile({ enabled: isAuthenticated });

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center transition-all group-hover:rounded-lg">
              <span className="text-background font-semibold text-base">CN</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">CodeNotify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/contests"
              className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contests
            </Link>
            <Link
              href="/contests/upcoming"
              className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Upcoming
            </Link>
            <Link
              href="/contests/running"
              className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Live
            </Link>
            <Link
              href="/dashboard"
              className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="https://celestial-0.github.io/CodeNotify/"
              className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
          </div>

          {/* Desktop Right Section (Auth-aware) */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <AnimatedThemeToggler className="h-9 w-9 rounded-md border-0" />
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity>Loading…</Activity>
              </div>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt={profile?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(profile?.name || user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.name || user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email || user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signout()}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="h-9 text-[14px] font-medium">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="h-9 text-[14px] font-medium">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <AnimatedThemeToggler className="h-9 w-9 rounded-md border-0" />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
          <div className="px-3 sm:px-6 py-4 space-y-1">
            {/* Mobile user info when authenticated */}
            {isAuthenticated && !isLoading && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-accent/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={profile?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(profile?.name || user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile?.name || user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {profile?.email || user?.email}
                  </p>
                </div>
              </div>
            )}
            <Link
              href="/contests"
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contests
            </Link>
            <Link
              href="/contests/upcoming"
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Upcoming
            </Link>
            <Link
              href="/contests/running"
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Live
            </Link>
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="https://celestial-0.github.io/CodeNotify/"
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Docs
            </Link>
            <div className="pt-3 space-y-2 flex flex-col">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground px-3">
                  <Activity>Loading…</Activity>
                </div>
              ) : isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-9 text-sm font-medium"
                    asChild
                  >
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-9 text-sm font-medium text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => signout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full h-9 text-sm font-medium" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button size="sm" className="w-full h-9 text-sm font-medium" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
