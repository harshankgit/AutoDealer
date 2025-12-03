// components/dashboard/AnalyticsDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement);

interface MonthlyVisitData {
  month: string;
  count: number;
  unique_users: number;
}

interface AnalyticsData {
  totalVisits: number;
  totalUniqueUsers: number;
  monthlyVisits: MonthlyVisitData[];
  performanceMetrics: any;
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/homepage/stats');
      const data = await response.json();
      
      // Calculate aggregated stats
      const totalVisits = data.monthlyVisits.reduce((sum: number, item: MonthlyVisitData) => sum + item.count, 0);
      const totalUnique = data.monthlyVisits.reduce((sum: number, item: MonthlyVisitData) => sum + item.unique_users, 0);
      
      setAnalyticsData({
        totalVisits,
        totalUniqueUsers: totalUnique,
        monthlyVisits: data.monthlyVisits || [],
        performanceMetrics: data.performanceMetrics
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="text-center py-8">Failed to load analytics data</div>;
  }

  // Prepare chart data
  const barChartData = {
    labels: analyticsData.monthlyVisits.map(item => item.month),
    datasets: [
      {
        label: 'Total Visits',
        data: analyticsData.monthlyVisits.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Unique Visitors',
        data: analyticsData.monthlyVisits.map(item => item.unique_users),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Calculate returning visitor rate
  const returningVisitorRate = analyticsData.totalVisits > 0 
    ? ((analyticsData.totalVisits - analyticsData.totalUniqueUsers) / analyticsData.totalVisits * 100).toFixed(1)
    : '0';

  // Device type pie chart data (simulated)
  const deviceData = {
    labels: ['Mobile', 'Desktop'],
    datasets: [
      {
        data: [65, 35], // Simulated data - you can get actual data from your tracking
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium text-gray-500">Total Visits</h3>
          <p className="text-3xl font-bold mt-2">{analyticsData.totalVisits}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium text-gray-500">Unique Visitors</h3>
          <p className="text-3xl font-bold mt-2">{analyticsData.totalUniqueUsers}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium text-gray-500">Returning Visitors</h3>
          <p className="text-3xl font-bold mt-2">{returningVisitorRate}%</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium text-gray-500">Avg. Sessions/Month</h3>
          <p className="text-3xl font-bold mt-2">
            {analyticsData.monthlyVisits.length > 0 
              ? Math.round(analyticsData.totalVisits / analyticsData.monthlyVisits.length) 
              : 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Visits Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">Monthly Visit Analytics</h3>
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Visits vs Unique Visitors' }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>

        {/* Device Type Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">Device Type Distribution</h3>
          <div className="flex justify-center">
            <Pie
              data={deviceData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  title: { display: true, text: 'Mobile vs Desktop' }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Monthly Data Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Visitors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.monthlyVisits.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.unique_users}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.count > 0 
                      ? `${(((item.count - item.unique_users) / item.count) * 100).toFixed(1)}%` 
                      : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}