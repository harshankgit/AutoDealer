'use client';

import { cn } from '@/lib/utils';
import { useLoading } from '@/context/loading-context';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({
  className = ''
}: LoadingSpinnerProps) {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className={cn('h-1 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative', className)}>
      <div
        className="absolute top-0 h-full bg-blue-600 loading-bar-animation"
        style={{
          left: 0,
          boxShadow: '0 0 10px #3b82f6, 0 0 20px #3b82f6'
        }}
      />
    </div>
  );
}