'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserTable } from '@/components/core/admin';
import {
  useAdminUsers,
  useUpdateUserRole,
  useDeleteUser,
} from '@/lib/hooks/use-admin';
import type { AdminUser, AdminUsersResponse } from '@/lib/types/admin.types';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 20;

  const { data, isLoading, refetch } = useAdminUsers(limit, page * limit) as {
    data: AdminUsersResponse | undefined;
    isLoading: boolean;
    refetch: () => Promise<{ data: AdminUsersResponse }>;
  };
  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();

  const handleUpdateRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role });
      await refetch();
      toast.success(`User role updated to ${role}`);
    } catch (error) {
      toast.error('Failed to update user role');
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      await refetch();
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
      throw error;
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const filteredUsers = data?.users.filter((user: AdminUser) =>
    search
      ? user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button disabled>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User (Coming Soon)
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Users:</span>{' '}
            <span className="font-semibold">{data.total}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Showing:</span>{' '}
            <span className="font-semibold">
              {page * limit + 1}-{Math.min((page + 1) * limit, data.total)} of{' '}
              {data.total}
            </span>
          </div>
        </div>
      )}

      {/* User Table */}
      <UserTable
        users={filteredUsers || []}
        loading={isLoading}
        onUpdateRole={handleUpdateRole}
        onDeleteUser={handleDeleteUser}
        onViewUser={handleViewUser}
      />

      {/* Pagination */}
      {data && data.total > limit && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {Math.ceil(data.total / limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * limit >= data.total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
