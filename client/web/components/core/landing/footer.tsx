import { Separator } from "@/components/ui/separator";
import { Github, Mail, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">CodeNotify</h3>
            <p className="text-sm text-muted-foreground">
              Smart contest alert system for competitive programmers.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:contact@codenotify.dev"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/contests"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse Contests
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/notifications"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Notifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/signin"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/profile"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Support */}
          <div>
            <h4 className="font-semibold mb-4">Platforms</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">
                  Codeforces
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  LeetCode
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  CodeChef
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  AtCoder
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CodeNotify. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for competitive programmers
          </p>
        </div>
      </div>
    </footer>
  );
}
