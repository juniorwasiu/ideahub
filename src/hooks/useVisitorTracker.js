import { useEffect, useState, useRef } from 'react';
import { trackVisitor } from '../services/visitorTracker';
import { isFirebaseConfigured } from '../services/firebase';

/**
 * Custom React Hook to automatically track page visits, IP, device, and timing
 * @param {Object} options Configuration options
 * @param {boolean} options.enabled Whether tracking is active (default: true)
 * @param {Object} options.extraData Additional metadata to send along with the visit log
 * @returns {{ isTracking: boolean, isConfigured: boolean, visitorData: Object|null, error: any }}
 */
export function useVisitorTracker(options = {}) {
  const { enabled = true, extraData = {} } = options;
  const [isTracking, setIsTracking] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const [error, setError] = useState(null);
  const hasTrackedRef = useRef(false);
  const extraDataRef = useRef(extraData);

  useEffect(() => {
    extraDataRef.current = extraData;
  }, [extraData]);

  useEffect(() => {
    if (!enabled || hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    let isMounted = true;
    setIsTracking(true);

    async function executeTracking() {
      try {
        const result = await trackVisitor(extraDataRef.current);
        if (isMounted) {
          if (result.success) {
            setVisitorData(result.visitorData || null);
          } else {
            setError(result.error);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Tracking error');
        }
      } finally {
        if (isMounted) {
          setIsTracking(false);
        }
      }
    }

    // Execute asynchronously without blocking critical path rendering
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => executeTracking(), { timeout: 2000 });
      } else {
        setTimeout(executeTracking, 500);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return {
    isTracking,
    isConfigured: isFirebaseConfigured,
    visitorData,
    error
  };
}
