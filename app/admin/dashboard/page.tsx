'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { AdminDashboardSkeleton } from '@/components/skeletons/AdminDashboardSkeleton';

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/');
      return;
    }

    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  // If still loading user context, show basic spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show skeleton while loading dashboard data
  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  // Redirect to main admin page since it has the same content
  router.push('/admin');
  return null;
}