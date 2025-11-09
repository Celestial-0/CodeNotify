'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDeactivateAccount } from '@/lib/hooks/use-user';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AccountDeletionDialog() {
  const [open, setOpen] = useState(false);
  const deactivateAccount = useDeactivateAccount();
  const router = useRouter();

  const handleDeactivate = async () => {
    try {
      await deactivateAccount.mutateAsync();
      toast.success('Account deactivated successfully');
      setOpen(false);
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to deactivate account'
      );
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Deactivate Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">
                Deactivate Account
              </DialogTitle>
              <DialogDescription>
                This action cannot be easily undone. Your account will be deactivated
                and you will stop receiving all notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">What happens when you deactivate:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>All contest notifications will stop</li>
                    <li>Your preferences will be preserved</li>
                    <li>You can reactivate your account anytime by signing in</li>
                    <li>Your data will be retained for 90 days</li>
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={deactivateAccount.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={deactivateAccount.isPending}
              >
                {deactivateAccount.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Deactivate Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
