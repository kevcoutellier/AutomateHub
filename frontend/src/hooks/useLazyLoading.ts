import { useState, useEffect, useCallback, useRef } from 'react';

interface LazyLoadingOptions<T> {
  fetchFunction: (page: number, limit: number, filters?: any) => Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>;
  initialLimit?: number;
  threshold?: number;
  filters?: any;
}

interface LazyLoadingState<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  total: number;
}

/**
 * Hook personnalisé pour le lazy loading avec intersection observer
 */
export function useLazyLoading<T>({
  fetchFunction,
  initialLimit = 12,
  threshold = 0.1,
  filters = {}
}: LazyLoadingOptions<T>) {
  const [state, setState] = useState<LazyLoadingState<T>>({
    items: [],
    loading: false,
    hasMore: true,
    error: null,
    page: 1,
    total: 0
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // Fonction pour charger les données
  const loadData = useCallback(async (page: number, reset = false) => {
    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetchFunction(page, initialLimit, filters);
      
      setState(prev => ({
        ...prev,
        items: reset ? response.data : [...prev.items, ...response.data],
        loading: false,
        hasMore: page < response.pagination.pages,
        page: page,
        total: response.pagination.total
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement'
      }));
    }
  }, [fetchFunction, initialLimit, filters, state.loading]);

  // Charger la page suivante
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      loadData(state.page + 1);
    }
  }, [state.hasMore, state.loading, state.page, loadData]);

  // Recharger depuis le début
  const refresh = useCallback(() => {
    setState(prev => ({
      ...prev,
      items: [],
      page: 1,
      hasMore: true,
      error: null
    }));
    loadData(1, true);
  }, [loadData]);

  // Configuration de l'intersection observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && state.hasMore && !state.loading) {
          loadMore();
        }
      },
      { threshold }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [state.hasMore, state.loading, loadMore, threshold]);

  // Chargement initial et lors du changement de filtres
  useEffect(() => {
    refresh();
  }, [JSON.stringify(filters)]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ...state,
    loadMore,
    refresh,
    loadingRef
  };
}

/**
 * Hook spécialisé pour le lazy loading des experts
 */
export function useExpertsLazyLoading(filters: any = {}) {
  return useLazyLoading({
    fetchFunction: async (page, limit, filters) => {
      const response = await fetch(`/api/experts?page=${page}&limit=${limit}&${new URLSearchParams(filters)}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des experts');
      const data = await response.json();
      return {
        data: data.data.experts,
        pagination: data.data.pagination
      };
    },
    filters,
    initialLimit: 12
  });
}

/**
 * Hook spécialisé pour le lazy loading des projets
 */
export function useProjectsLazyLoading(filters: any = {}) {
  return useLazyLoading({
    fetchFunction: async (page, limit, filters) => {
      const response = await fetch(`/api/projects?page=${page}&limit=${limit}&${new URLSearchParams(filters)}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des projets');
      const data = await response.json();
      return {
        data: data.data.projects,
        pagination: data.data.pagination
      };
    },
    filters,
    initialLimit: 10
  });
}

/**
 * Hook pour le lazy loading avec recherche
 */
export function useSearchLazyLoading<T>(
  searchFunction: (query: string, page: number, limit: number) => Promise<any>,
  query: string,
  debounceMs = 300
) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useLazyLoading<T>({
    fetchFunction: (page, limit) => searchFunction(debouncedQuery, page, limit),
    filters: { query: debouncedQuery }
  });
}
