'use client';

import { usePathname } from 'next/navigation';

export const useCurrentLocation = () => {
  const pathname = usePathname();
  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${pathname}` 
    : '';
  return [pathname, currentUrl];
};

