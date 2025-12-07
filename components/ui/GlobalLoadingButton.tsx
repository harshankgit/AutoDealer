'use client';

import { Button, ButtonProps } from '@/components/ui/button';
import { useLoading } from '@/context/loading-context';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback } from 'react';
import Link from 'next/link';

interface LoadingButtonProps extends Omit<ButtonProps, 'onClick' | 'asChild'> {
  href?: string;
  onClick?: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
  triggerLoading?: boolean; // Whether to trigger the global loading spinner
}

export function GlobalLoadingButton({ 
  href,
  onClick,
  children,
  className,
  triggerLoading = true,
  ...props
}: LoadingButtonProps) {
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (triggerLoading) {
      startLoading();
    }
    
    try {
      if (onClick) {
        await onClick();
      }
      
      if (href) {
        router.push(href);
      }
    } catch (error) {
      console.error('Error during button click:', error);
    } finally {
      if (triggerLoading) {
        // Hide the loading spinner after a brief delay to ensure any transition happens
        setTimeout(() => {
          stopLoading();
        }, 500);
      }
    }
  }, [onClick, href, router, startLoading, stopLoading, triggerLoading]);

  return (
    <Button
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}