// components/CarRecommendation/CarImagePlaceholder.tsx
import { Car } from 'lucide-react';

interface CarImagePlaceholderProps {
  brand?: string;
  model?: string;
  className?: string;
}

const CarImagePlaceholder = ({ brand, model, className = '' }: CarImagePlaceholderProps) => {
  return (
    <div className={`bg-gray-100 dark:bg-gray-700 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center ${className}`}>
      <div className="text-center p-4">
        <Car className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {brand && model ? `${brand} ${model}` : 'Car Image'}
        </p>
      </div>
    </div>
  );
};

export default CarImagePlaceholder;