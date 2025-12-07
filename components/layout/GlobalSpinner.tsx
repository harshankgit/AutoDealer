'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/context/loading-context';

// This component handles showing the global spinner when navigation occurs
// It uses the App Router's navigation tracking to detect route changes
export default function GlobalSpinner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading } = useLoading();
  const isInitialRender = useRef(true);

  // Create a unique key based on pathname and search params to detect navigation
  const navigationKey = `${pathname}?${searchParams?.toString() || ''}`;

  useEffect(() => {
    // For the initial render, don't trigger loading
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // This effect runs when navigationKey changes after initial render
    // which happens on navigation in the App Router
    startLoading();

    // Add a small delay to ensure loading spinner is visible
    const timer = setTimeout(() => {
      stopLoading();
    }, 500);

    // Clean up the timer
    return () => clearTimeout(timer);
  }, [navigationKey, startLoading, stopLoading]);

  return null;
}