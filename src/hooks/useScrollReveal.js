import { useEffect, useRef, useState } from 'react';

/**
 * Reusable intersection observer hook for smooth element reveals on scroll.
 */
export function useScrollReveal(options = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }) {
  const elementRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (isRevealed) return;

    const currentElem = elementRef.current;
    if (!currentElem) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsRevealed(true);
        observer.unobserve(entry.target);
      }
    }, options);

    observer.observe(currentElem);

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [options, isRevealed]);

  return [elementRef, isRevealed];
}
