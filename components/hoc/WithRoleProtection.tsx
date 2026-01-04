'use client';

import { useUser } from '@/context/user-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface WithRoleProtectionProps {
  children: ReactNode;
  requiredRole: 'user' | 'admin' | 'superadmin';
  fallbackRoute?: string;
}

/**
 * Higher-order component to protect pages based on user role
 */
export default function WithRoleProtection({ 
  children, 
  requiredRole, 
  fallbackRoute = '/' 
}: WithRoleProtectionProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Check if user has the required role
      if (user.role !== requiredRole) {
        router.push(fallbackRoute);
      }
    } else if (!loading && !user) {
      // If user is not logged in, redirect to login
      router.push('/login');
    }
  }, [user, loading, requiredRole, fallbackRoute, router]);

  // Show nothing while checking user role
  if (loading || (user && user.role !== requiredRole) || (!user && !loading)) {
    return null;
  }

  return <>{children}</>;
}