'use client';

import { useEffect, useState } from 'react';

// Component to show PWA status in dev mode
export function PWAStatus() {
  const [swStatus, setSwStatus] = useState<string>('checking...');
  const [isOnline, setIsOnline] = useState(true);
  const [cacheCount, setCacheCount] = useState<number>(0);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Service Worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          setSwStatus('active');
        }
      }).catch(() => {
        setSwStatus('not registered');
      });

      // Get cache count
      if ('caches' in window) {
        caches.keys().then((names) => {
          setCacheCount(names.length);
        });
      }
    } else {
      setSwStatus('not supported');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs rounded-lg p-3 font-mono space-y-1">
      <div className="font-bold mb-2">PWA Status</div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        {isOnline ? 'Online' : 'Offline'}
      </div>
      <div>SW: {swStatus}</div>
      <div>Caches: {cacheCount}</div>
    </div>
  );
}

