'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Database, Bell, Shield, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          System Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
          <CardDescription>
            Manage database connection and synchronization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="db-connection">Connection String</Label>
            <Input
              id="db-connection"
              type="password"
              placeholder="mongodb://localhost:27017/codenotify"
              readOnly
            />
            <p className="text-sm text-muted-foreground">
              Configure via environment variables in .env file
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-sync on startup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync contests when the server starts
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Configuration
          </CardTitle>
          <CardDescription>
            Configure notification delivery services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable email delivery service
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>WhatsApp notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable WhatsApp delivery via Twilio
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable push notifications via Firebase
              </p>
            </div>
            <Switch />
          </div>

          <div className="space-y-2 pt-4">
            <Label>Default notification time</Label>
            <Input type="time" defaultValue="09:00" />
            <p className="text-sm text-muted-foreground">
              Default time to send daily contest reminders
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Configuration
          </CardTitle>
          <CardDescription>
            Manage authentication and authorization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>JWT Token expiration</Label>
            <Input type="text" defaultValue="1h" readOnly />
            <p className="text-sm text-muted-foreground">
              Configure via JWT_EXPIRES_IN environment variable
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require email verification</Label>
              <p className="text-sm text-muted-foreground">
                Users must verify email before accessing features
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-factor authentication</Label>
              <p className="text-sm text-muted-foreground">
                Enable 2FA for admin accounts
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Configuration
          </CardTitle>
          <CardDescription>
            Optimize system performance and caching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cache TTL (seconds)</Label>
            <Input type="number" defaultValue="3600" />
            <p className="text-sm text-muted-foreground">
              Time-to-live for cached contest data
            </p>
          </div>

          <div className="space-y-2">
            <Label>Rate limit (requests per minute)</Label>
            <Input type="number" defaultValue="100" />
            <p className="text-sm text-muted-foreground">
              Maximum API requests per user per minute
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable API caching</Label>
              <p className="text-sm text-muted-foreground">
                Cache frequently accessed API responses
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
