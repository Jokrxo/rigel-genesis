/**
 * Performance optimization utilities
 */

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy loads an image
 */
export function lazyLoadImage(img: HTMLImageElement) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const image = entry.target as HTMLImageElement;
        const src = image.dataset.src;
        if (src) {
          image.src = src;
          image.removeAttribute('data-src');
        }
        observer.unobserve(image);
      }
    });
  });

  observer.observe(img);
}

/**
 * Memoizes expensive function calls
 */
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Batches multiple function calls
 */
export function batchRequests<T>(
  requests: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> {
  const batches: (() => Promise<T>)[][] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    batches.push(requests.slice(i, i + batchSize));
  }

  return batches.reduce(
    async (acc, batch) => {
      const results = await acc;
      const batchResults = await Promise.all(batch.map((req) => req()));
      return [...results, ...batchResults];
    },
    Promise.resolve<T[]>([])
  );
}

/**
 * Measures component render time
 */
export function measurePerformance(
  componentName: string,
  callback: () => void
) {
  const start = performance.now();
  callback();
  const end = performance.now();
  // console.log(`${componentName} rendered in ${(end - start).toFixed(2)}ms`);
}
