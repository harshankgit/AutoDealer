'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useLoading } from '@/context/loading-context';

export function NavigationMonitor() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  const previousUrlRef = useRef(`${pathname}?${searchParams}`);

  // Store the original router.push method
  const originalPushRef = useRef(router.push);

  useEffect(() => {
    // Override router.push to trigger loading
    (router as any).push = function (...args: any) {
      startLoading();
      originalPushRef.current.apply(this, args);
    };

    return () => {
      // Restore original push method on cleanup
      (router as any).push = originalPushRef.current;
    };
  }, [router, startLoading]);

  // Monitor URL changes
  useEffect(() => {
    const currentUrl = `${pathname}?${searchParams}`;
    
    // If URL changed (excluding initial render), trigger loading
    if (previousUrlRef.current && previousUrlRef.current !== currentUrl) {
      // We already triggered loading via the router.push override
    }
    
    previousUrlRef.current = currentUrl;
  }, [pathname, searchParams]);

  return null;
}