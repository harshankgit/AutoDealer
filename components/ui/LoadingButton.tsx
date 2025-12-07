'use client';

import { Button, ButtonProps } from '@/components/ui/button';
import { useLoading } from '@/context/loading-context';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import Link from 'next/link';

interface LoadingButtonProps extends ButtonProps {
  href?: string;
  onClick?: () => any | Promise<any>;
  children: ReactNode;
  className?: string;
}

export function LoadingButton({ 
  href,
  onClick,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  const { setLoading } = useLoading();
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Show the loading spinner
    setLoading(true);
    
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
      // Hide the loading spinner after a brief delay to ensure page transition
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  if (href) {
    // If href is provided, wrap in Link to maintain navigation behavior
    return (
      <Link href={href}>
        <Button
          onClick={handleClick}
          className={className}
          {...props}
        >
          {children}
        </Button>
      </Link>
    );
  }

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