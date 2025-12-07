import { useRouter } from 'next/navigation';
import { useLoading } from '@/context/loading-context';

export function useNavigationLoading() {
  const router = useRouter();
  const { startLoading } = useLoading();

  const navigateWithLoading = (path: string) => {
    startLoading();
    router.push(path);
  };

  return { navigateWithLoading, router };
}