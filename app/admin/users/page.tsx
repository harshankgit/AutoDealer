'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Edit } from 'lucide-react';
import { useUser } from '@/context/user-context';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'superadmin') {
      router.push('/');
      return;
    }

    if (user) {
      fetchUsers();
    }
  }, [user, loading, router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch users');
        return;
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}`, 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === userId ? data.user : u));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update role');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  if (isLoading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Manage Users</CardTitle>
            <CardDescription className="dark:text-gray-300">Only superadmins can view, edit roles, and delete users.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 text-red-600">{error}</div>}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="mr-2 p-1 border rounded"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                          <option value="superadmin">superadmin</option>
                        </select>
                        <Button variant="destructive" size="sm" onClick={() => deleteUser(u.id)} className="ml-2">
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
