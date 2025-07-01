// Performance Optimization Utilities for AutomateHub Frontend

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  bundleSize: number;
}

interface PerformanceReport {
  timestamp: string;
  metrics: PerformanceMetrics;
  recommendations: string[];
  browserInfo: {
    userAgent: string;
    connection: any;
    memory: {
      used: number;
      total: number;
      limit: number;
    } | null;
  };
}

interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enableCaching: boolean;
  enablePreloading: boolean;
}

class PerformanceOptimizer {
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics;
  private observer: IntersectionObserver | null = null;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableLazyLoading: true,
      enableImageOptimization: true,
      enableCodeSplitting: true,
      enableCaching: true,
      enablePreloading: true,
      ...config
    };

    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
      memoryUsage: 0,
      bundleSize: 0
    };

    this.initialize();
  }

  private initialize(): void {
    if (typeof window !== 'undefined') {
      this.setupPerformanceMonitoring();
      this.setupLazyLoading();
      this.setupImageOptimization();
      this.setupCaching();
    }
  }

  private setupPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      this.measureCoreWebVitals();
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      // Log performance metrics
      console.log('🚀 Performance Metrics:', {
        loadTime: `${this.metrics.loadTime.toFixed(2)}ms`,
        domContentLoaded: `${navigation.domContentLoadedEventEnd - navigation.fetchStart}ms`,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      });
    });

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }, 5000);
    }
  }

  private measureCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('📊 LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        console.log('⚡ FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('📐 CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private setupLazyLoading(): void {
    if (!this.config.enableLazyLoading) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            
            // Lazy load images
            if (target.tagName === 'IMG') {
              const img = target as HTMLImageElement;
              const dataSrc = img.getAttribute('data-src');
              if (dataSrc) {
                img.src = dataSrc;
                img.removeAttribute('data-src');
                this.observer?.unobserve(img);
              }
            }

            // Lazy load components
            if (target.hasAttribute('data-lazy-component')) {
              const componentName = target.getAttribute('data-lazy-component');
              this.loadComponent(componentName!);
              this.observer?.unobserve(target);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    // Auto-observe images with data-src
    document.querySelectorAll('img[data-src]').forEach((img) => {
      this.observer?.observe(img);
    });
  }

  private setupImageOptimization(): void {
    if (!this.config.enableImageOptimization) return;

    // Implement responsive images
    const images = document.querySelectorAll('img[data-responsive]');
    images.forEach((img) => {
      this.optimizeImage(img as HTMLImageElement);
    });
  }

  private optimizeImage(img: HTMLImageElement): void {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const containerWidth = img.parentElement?.offsetWidth || window.innerWidth;
    const optimalWidth = Math.round(containerWidth * devicePixelRatio);

    // Generate optimized image URL (assuming CDN with resize capabilities)
    const originalSrc = img.src || img.getAttribute('data-src');
    if (originalSrc && originalSrc.includes('amazonaws.com')) {
      const optimizedSrc = this.generateOptimizedImageUrl(originalSrc, optimalWidth);
      if (img.src) {
        img.src = optimizedSrc;
      } else {
        img.setAttribute('data-src', optimizedSrc);
      }
    }
  }

  private generateOptimizedImageUrl(originalUrl: string, width: number): string {
    // Add image optimization parameters for AWS S3/CloudFront
    const url = new URL(originalUrl);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', '85'); // Quality
    url.searchParams.set('f', 'webp'); // Format
    return url.toString();
  }

  private setupCaching(): void {
    if (!this.config.enableCaching) return;

    // Implement intelligent caching for API responses
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Check if this is an API call that should be cached
      if (this.shouldCacheRequest(url, init?.method || 'GET')) {
        const cacheKey = this.generateCacheKey(url, init);
        const cached = this.getFromCache(cacheKey);
        
        if (cached && !this.isCacheExpired(cached.timestamp)) {
          console.log('📦 Cache hit:', url);
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      const response = await originalFetch(input, init);
      
      // Cache successful responses
      if (response.ok && this.shouldCacheRequest(url, init?.method || 'GET')) {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        this.saveToCache(this.generateCacheKey(url, init), data);
      }

      return response;
    };
  }

  private shouldCacheRequest(url: string, method: string): boolean {
    return (
      method === 'GET' &&
      (url.includes('/api/experts') || 
       url.includes('/api/analytics') ||
       url.includes('/api/reviews'))
    );
  }

  private generateCacheKey(url: string, init?: RequestInit): string {
    return btoa(url + (init?.headers ? JSON.stringify(init.headers) : ''));
  }

  private getFromCache(key: string): { data: any; timestamp: number } | null {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private saveToCache(key: string, data: any): void {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }

  private isCacheExpired(timestamp: number): boolean {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    return Date.now() - timestamp > CACHE_DURATION;
  }

  private async loadComponent(componentName: string): Promise<void> {
    try {
      // Dynamic import for code splitting
      const module = await import(`../components/${componentName}`);
      console.log(`🔄 Lazy loaded component: ${componentName}`);
      return module.default;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
    }
  }

  private getFirstPaint(): string {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? `${firstPaint.startTime.toFixed(2)}ms` : 'N/A';
  }

  private getFirstContentfulPaint(): string {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? `${fcp.startTime.toFixed(2)}ms` : 'N/A';
  }

  // Public methods for manual optimization
  public preloadRoute(routePath: string): void {
    if (!this.config.enablePreloading) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = routePath;
    document.head.appendChild(link);
  }

  public preloadImage(src: string): void {
    if (!this.config.enablePreloading) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }

  public clearCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 Cache cleared');
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public generatePerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      recommendations: this.generateRecommendations(),
      browserInfo: {
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || 'unknown',
        memory: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
        } : null
      }
    };

    console.log('📊 Performance Report:', report);
    return report;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.loadTime > 3000) {
      recommendations.push('Consider implementing more aggressive code splitting');
    }

    if (this.metrics.memoryUsage > 50) {
      recommendations.push('Monitor memory usage - consider implementing virtual scrolling for large lists');
    }

    if (performance.getEntriesByType('navigation')[0]) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav.domContentLoadedEventEnd - nav.fetchStart > 2000) {
        recommendations.push('Optimize critical rendering path and reduce blocking resources');
      }
    }

    return recommendations;
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Utility functions for performance optimization
export const performanceUtils = {
  // Debounce function for search inputs
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait) as unknown as number;
    };
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Memoization for expensive calculations
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Virtual scrolling helper
  calculateVisibleItems: (
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    totalItems: number,
    overscan: number = 5
  ) => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex, visibleCount: endIndex - startIndex + 1 };
  }
};

export default PerformanceOptimizer;
