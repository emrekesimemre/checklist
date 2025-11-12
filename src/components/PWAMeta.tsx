'use client';

import { useEffect } from 'react';

export default function PWAMeta() {
  useEffect(() => {
    // Add manifest link
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);

    // Add theme color meta
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#1976d2';
    document.head.appendChild(themeColor);

    // Add Apple meta tags
    const appleCapable = document.createElement('meta');
    appleCapable.name = 'apple-mobile-web-app-capable';
    appleCapable.content = 'yes';
    document.head.appendChild(appleCapable);

    const appleStatusBar = document.createElement('meta');
    appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
    appleStatusBar.content = 'default';
    document.head.appendChild(appleStatusBar);

    const appleTitle = document.createElement('meta');
    appleTitle.name = 'apple-mobile-web-app-title';
    appleTitle.content = 'Checklist';
    document.head.appendChild(appleTitle);

    // Add Apple touch icon
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = '/icon-192x192.png';
    document.head.appendChild(appleIcon);

    // Add favicon
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.sizes = '32x32';
    favicon.href = '/favicon-32x32.png';
    document.head.appendChild(favicon);

    const favicon16 = document.createElement('link');
    favicon16.rel = 'icon';
    favicon16.type = 'image/png';
    favicon16.sizes = '16x16';
    favicon16.href = '/favicon-16x16.png';
    document.head.appendChild(favicon16);

    const faviconIco = document.createElement('link');
    faviconIco.rel = 'shortcut icon';
    faviconIco.href = '/favicon.ico';
    document.head.appendChild(faviconIco);

    // Cleanup function
    return () => {
      document.head.removeChild(manifestLink);
      document.head.removeChild(themeColor);
      document.head.removeChild(appleCapable);
      document.head.removeChild(appleStatusBar);
      document.head.removeChild(appleTitle);
      document.head.removeChild(appleIcon);
      document.head.removeChild(favicon);
      document.head.removeChild(favicon16);
      document.head.removeChild(faviconIco);
    };
  }, []);

  return null;
}

