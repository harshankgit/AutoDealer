import { HelpCircle } from 'lucide-react';

interface HelpIconProps {
  className?: string;
  size?: number;
}

export default function HelpIcon({ className, size = 24 }: HelpIconProps) {
  return (
    <HelpCircle
      className={className}
      size={size}
    />
  );
}