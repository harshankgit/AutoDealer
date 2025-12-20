'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Filter,
  Search,
  X,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2
} from 'lucide-react';
import { useUser } from '@/context/user-context';

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  user_id: string | null;
  ip_address: string;
  user_agent: string;
  request_payload: any;
  response_payload: any;
  error_message: string | null;
  created_at: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalLogs: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface LogFilters {
  startDate: string;
  endDate: string;
  endpoint: string;
  statusCode: string;
  method: string;
  errorOnly: boolean;
}

const ApiLogs: React.FC = () => {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [successLogs, setSuccessLogs] = useState<ApiLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<ApiLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogFilters>({
    startDate: '',
    endDate: '',
    endpoint: '',
    statusCode: '',
    method: '',
    errorOnly: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [activeTab, setActiveTab] = useState<'all' | 'success' | 'error'>('all');
  const { user } = useUser();

  // Fetch logs from API
  const fetchLogs = async () => {
    if (!user || user.role !== 'superadmin') {
      setError('Access denied: Super admin access required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.endpoint && { endpoint: filters.endpoint }),
        ...(filters.statusCode && { statusCode: filters.statusCode }),
        ...(filters.method && { method: filters.method }),
        ...(filters.errorOnly && { errorOnly: 'true' })
      });

      const response = await fetch(`/api/admin/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const data = await response.json();
      const allLogs = data.logs || [];

      setLogs(allLogs);
      setSuccessLogs(allLogs.filter((log: ApiLog) => log.status_code >= 200 && log.status_code < 300));
      setErrorLogs(allLogs.filter((log: ApiLog) => log.status_code >= 400));
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and fetch logs
  const applyFilters = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      endpoint: '',
      statusCode: '',
      method: '',
      errorOnly: false
    });
    setCurrentPage(1);
  };

  // Clear old logs
  const clearLogs = async () => {
    if (!user || user.role !== 'superadmin') return;

    if (window.confirm('Are you sure you want to clear old logs? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/admin/logs', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        });

        if (response.ok) {
          fetchLogs(); // Refresh the logs
        } else {
          throw new Error('Failed to clear logs');
        }
      } catch (err) {
        console.error('Error clearing logs:', err);
        alert('Failed to clear logs');
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof LogFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'default';
    if (statusCode >= 400 && statusCode < 500) return 'secondary';
    if (statusCode >= 500) return 'destructive';
    return 'outline';
  };

  // Get method badge variant
  const getMethodBadgeVariant = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'secondary';
      case 'POST': return 'default';
      case 'PUT': return 'outline';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  // Get status icon
  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    } else if (statusCode >= 500) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Format response time
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Effect to fetch logs when filters or page changes
  useEffect(() => {
    fetchLogs();
  }, [filters, currentPage, user]);

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="w-full">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">API Logs</h3>
          <div className="text-center py-10">
            <div className="mx-auto bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have permission to access this feature.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Only super administrators can view API logs.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Get current logs based on active tab
  const getCurrentLogs = () => {
    switch (activeTab) {
      case 'success':
        return successLogs;
      case 'error':
        return errorLogs;
      default:
        return logs;
    }
  };

  const currentLogs = getCurrentLogs();

  return (
    <div className="w-full">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <CardTitle className="text-2xl">API Logs</CardTitle>
            <CardDescription className="mt-1">
              Monitor all API requests and their performance
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Old Logs
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs for Success/Error/All */}
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'all' | 'success' | 'error')} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Logs ({logs.length})</TabsTrigger>
            <TabsTrigger value="success">Success ({successLogs.length})</TabsTrigger>
            <TabsTrigger value="error">Errors ({errorLogs.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Method</label>
            <Select
              value={filters.method || 'all'}
              onValueChange={(value) => handleFilterChange('method', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Status</label>
            <Select
              value={filters.statusCode}
              onValueChange={(value) => handleFilterChange('statusCode', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="200">200 - OK</SelectItem>
                <SelectItem value="201">201 - Created</SelectItem>
                <SelectItem value="400">400 - Bad Request</SelectItem>
                <SelectItem value="401">401 - Unauthorized</SelectItem>
                <SelectItem value="403">403 - Forbidden</SelectItem>
                <SelectItem value="404">404 - Not Found</SelectItem>
                <SelectItem value="500">500 - Server Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Endpoint</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search endpoint..."
                value={filters.endpoint}
                onChange={(e) => handleFilterChange('endpoint', e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>

          <div className="flex items-end">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={applyFilters}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Requests</div>
            <div className="text-2xl font-bold">{pagination?.totalLogs || 0}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400">Success</div>
            <div className="text-2xl font-bold">
              {successLogs.length}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Client Errors</div>
            <div className="text-2xl font-bold">
              {logs.filter(log => log.status_code >= 400 && log.status_code < 500).length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-sm text-red-600 dark:text-red-400">Server Errors</div>
            <div className="text-2xl font-bold">
              {logs.filter(log => log.status_code >= 500).length}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>

            {/* Table skeleton */}
            <div className="rounded-md border mb-4">
              <div className="p-4 border-b">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center p-4">
                    <div className="w-[100px]">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                    <div className="w-20">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="w-20">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                    <div className="w-32">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="w-40">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination skeleton */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        )}

        {/* Logs table */}
        {!loading && !error && (
          <>
            <div className="rounded-md border mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <Badge variant={getMethodBadgeVariant(log.method)} className="capitalize">
                            {log.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm max-w-xs truncate">
                          {log.endpoint}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status_code)}
                            <Badge
                              variant={getStatusBadgeVariant(log.status_code)}
                              className="font-mono"
                            >
                              {log.status_code}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {formatResponseTime(log.response_time_ms)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {log.ip_address || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(log.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {currentLogs.length} of {pagination.totalLogs} logs
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {currentPage} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ApiLogs;