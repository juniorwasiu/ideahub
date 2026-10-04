import { useState, useEffect, useCallback } from 'react';

/**
 * Lightweight client-side router hook supporting HTML5 History API
 */
export function useRouter() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.redirect) {
        const redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;
        try {
          const url = new URL(redirect);
          if (url.pathname && url.pathname !== '/') {
            window.history.replaceState(null, '', url.pathname + url.search + url.hash);
            return url.pathname;
          }
        } catch {
          // Ignore invalid URL
        }
      }
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = useCallback((toPath) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== toPath) {
        window.history.pushState({}, '', toPath);
        setCurrentPath(toPath);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  const isAnalyticsRoute = currentPath.startsWith('/analytics');

  return {
    currentPath,
    navigate,
    isAnalyticsRoute
  };
}
