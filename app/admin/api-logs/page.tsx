'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/user-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApiLogs from '@/components/slider/ApiLogs';

export default function ApiLogsPage() {
  const { user } = useUser();
  
  // Check if user is superadmin
  if (!user || user.role !== 'superadmin') {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Access Denied</h3>
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500">Only super administrators can view API logs.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">API Logs</h1>
        <p className="text-muted-foreground">
          Monitor all API requests and their performance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Request Logs</CardTitle>
          <CardDescription>
            View all API requests, errors, and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiLogs />
        </CardContent>
      </Card>
    </div>
  );
}