'use client';

import Link, { LinkProps } from 'next/link';
import { useLoading } from '@/context/loading-context';
import { ReactNode } from 'react';

interface LoadingLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LoadingLink({
  children,
  className,
  onClick,
  ...props
}: LoadingLinkProps) {
  const { startLoading } = useLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // Start loading before navigation
    startLoading();

    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}