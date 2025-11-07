'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-E717Z3TMN6', {
        page_path: pathname,
      });
    }
  }, [pathname]);
}

export default usePageTracking;

