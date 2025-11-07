'use client';

import { useEffect } from 'react';

export default function GoogleAnalytics() {
  useEffect(() => {
    // Check if scripts already exist (to avoid duplicates)
    if (document.getElementById('google-analytics-script') || document.getElementById('google-analytics-config')) {
      return;
    }

    // Create and insert analytics script at the top of head
    const script1 = document.createElement('script');
    script1.id = 'google-analytics-script';
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-E717Z3TMN6';
    
    // Insert at the beginning of head (before any other scripts)
    const firstChild = document.head.firstChild;
    if (firstChild) {
      document.head.insertBefore(script1, firstChild);
    } else {
      document.head.appendChild(script1);
    }

    // Create and insert config script right after
    const script2 = document.createElement('script');
    script2.id = 'google-analytics-config';
    script2.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-E717Z3TMN6', {
        send_page_view: false,
        page_path: window.location.pathname,
      });
    `;
    document.head.insertBefore(script2, script1.nextSibling);

    // Initialize gtag function globally
    (window as any).gtag = function(...args: any[]) {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(args);
    };
  }, []);

  return null;
}

