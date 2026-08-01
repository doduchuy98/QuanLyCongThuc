import { useState, useEffect } from 'react';

export function useOffline() {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [swRegistered, setSwRegistered] = useState<boolean>(false);
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'caching' | 'cached'>('idle');

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setSwRegistered(true);
          setCacheStatus('cached');
          console.log('[SW] Service worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SW] Service worker registration failed:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheAllRecipesOffline = async (dataToCache: any) => {
    try {
      setCacheStatus('caching');
      // Save data explicitly into LocalStorage for quick access
      localStorage.setItem('app_recipes_offline_cache', JSON.stringify(dataToCache));

      // Trigger SW cache update if supported
      if ('caches' in window) {
        const cache = await caches.open('cute-recipe-app-v1');
        await cache.add('/');
        await cache.add('/index.html');
      }
      setCacheStatus('cached');
      return true;
    } catch (e) {
      console.warn('Cache error:', e);
      setCacheStatus('idle');
      return false;
    }
  };

  return {
    isOffline,
    swRegistered,
    cacheStatus,
    cacheAllRecipesOffline,
  };
}
