import { useEffect, useRef } from 'react';

export function useIntersectionObserver(
  callback: () => void,
  options = { threshold: 0.1 }
) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [callback, options]);

  return observerRef;
} 