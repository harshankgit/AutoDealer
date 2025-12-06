'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function BackButton({ className = '', variant = 'outline', size = 'default' }: BackButtonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Button
      onClick={handleGoBack}
      variant={variant}
      size={size}
      className={`flex items-center ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );
}