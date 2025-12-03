// app/analytics/page.tsx
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your website performance and visitor analytics
          </p>
        </div>

        <DashboardWidgets />
      </div>
    </div>
  );
}