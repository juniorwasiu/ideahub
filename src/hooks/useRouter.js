import { useState, useEffect, useCallback } from 'react';

/**
 * Lightweight client-side router hook supporting HTML5 History API
 */
export function useRouter() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
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
