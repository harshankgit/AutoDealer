'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminChatbotModule from '@/components/chatbot/AdminChatbotModule';

export default function AdminChatbotPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const checkAuth = async () => {
      try {
        // Get user from localStorage (matches your existing auth system)
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'superadmin' && user.role !== 'admin') {
          router.push('/'); // Redirect to home if not admin
          return;
        }

        setUserRole(user.role);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userRole || (userRole !== 'superadmin' && userRole !== 'admin')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminChatbotModule />
    </div>
  );
}