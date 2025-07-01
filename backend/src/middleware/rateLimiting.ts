import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import ApiResponseHelper from '../utils/apiResponse';

/**
 * Configuration du rate limiting par endpoint
 */
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Configurations prédéfinies pour différents types d'endpoints
 */
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Authentification - Plus restrictif
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par 15 minutes
    message: 'Too many authentication attempts, please try again later',
    skipSuccessfulRequests: true
  },

  // Endpoints généraux
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par 15 minutes
    message: 'Too many requests, please try again later'
  },

  // Upload de fichiers
  upload: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20, // 20 uploads par heure
    message: 'Too many file uploads, please try again later'
  },

  // Recherche et listing
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 recherches par minute
    message: 'Too many search requests, please slow down'
  },

  // Messagerie
  messaging: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // 50 messages par minute
    message: 'Too many messages sent, please slow down'
  },

  // Analytics et rapports
  analytics: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 requêtes analytics par 5 minutes
    message: 'Too many analytics requests, please wait before requesting more data'
  },

  // Administration
  admin: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 actions admin par minute
    message: 'Too many admin actions, please slow down'
  },

  // Notifications
  notifications: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 notifications par minute
    message: 'Too many notification requests, please slow down'
  }
};

/**
 * Store en mémoire pour le rate limiting par utilisateur
 * En production, utiliser Redis
 */
class MemoryStore {
  private hits: Map<string, { count: number; resetTime: number }> = new Map();

  increment(key: string, windowMs: number): { totalHits: number; timeToReset: number } {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const current = this.hits.get(key);
    
    if (!current || current.resetTime <= now) {
      // Nouveau window ou window expiré
      this.hits.set(key, { count: 1, resetTime });
      return { totalHits: 1, timeToReset: windowMs };
    }
    
    // Incrémenter dans le window actuel
    current.count++;
    this.hits.set(key, current);
    
    return { 
      totalHits: current.count, 
      timeToReset: current.resetTime - now 
    };
  }

  decrement(key: string): void {
    const current = this.hits.get(key);
    if (current && current.count > 0) {
      current.count--;
      this.hits.set(key, current);
    }
  }

  resetKey(key: string): void {
    this.hits.delete(key);
  }

  // Nettoyage périodique des entrées expirées
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.hits.entries()) {
      if (value.resetTime <= now) {
        this.hits.delete(key);
      }
    }
  }
}

const store = new MemoryStore();

// Nettoyage périodique toutes les 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000);

/**
 * Générateur de clé pour le rate limiting
 */
const keyGenerator = (req: Request): string => {
  // Utiliser l'ID utilisateur si authentifié, sinon l'IP
  const userId = (req as any).user?._id?.toString();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  return userId ? `user:${userId}` : `ip:${ip}`;
};

/**
 * Handler personnalisé pour les réponses de rate limiting
 */
const rateLimitHandler = (req: Request, res: Response) => {
  return ApiResponseHelper.rateLimited(
    res,
    'Rate limit exceeded. Please try again later.'
  );
};

/**
 * Créateur de middleware de rate limiting
 */
export const createRateLimit = (configName: keyof typeof rateLimitConfigs) => {
  const config = rateLimitConfigs[configName];
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    keyGenerator,
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    // Store personnalisé (en production, utiliser Redis)
    store: {
      incr: (key: string, cb: (err: any, totalHits: number, resetTime: Date) => void) => {
        try {
          const result = store.increment(key, config.windowMs);
          const resetDate = new Date(Date.now() + result.timeToReset);
          cb(null, result.totalHits, resetDate);
        } catch (err) {
          cb(err, 0, new Date());
        }
      },
      decrement: (key: string) => store.decrement(key),
      resetKey: (key: string) => store.resetKey(key)
    }
  });
};

/**
 * Rate limiting par utilisateur avec limites personnalisées
 */
export const createUserRateLimit = (
  windowMs: number,
  maxRequests: number,
  message?: string
) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: message || 'Too many requests from this user',
    keyGenerator: (req: Request) => {
      const userId = (req as any).user?._id?.toString();
      return userId || req.ip || 'anonymous';
    },
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * Rate limiting adaptatif basé sur le rôle utilisateur
 */
export const adaptiveRateLimit = (baseConfig: keyof typeof rateLimitConfigs) => {
  return (req: Request, res: Response, next: any) => {
    const user = (req as any).user;
    const config = { ...rateLimitConfigs[baseConfig] };
    
    // Augmenter les limites pour les utilisateurs premium/admin
    if (user?.role === 'admin') {
      config.max *= 5; // 5x plus de requêtes pour les admins
    } else if (user?.role === 'expert') {
      config.max *= 2; // 2x plus pour les experts
    }
    
    const limiter = rateLimit({
      ...config,
      keyGenerator,
      handler: rateLimitHandler,
      standardHeaders: true,
      legacyHeaders: false
    });
    
    limiter(req, res, next);
  };
};

/**
 * Middleware pour whitelister certaines IPs ou utilisateurs
 */
export const whitelist = (ips: string[] = [], userIds: string[] = []) => {
  return (req: Request, res: Response, next: any) => {
    const ip = req.ip || req.connection.remoteAddress || '';
    const userId = (req as any).user?._id?.toString() || '';
    
    if (ips.includes(ip) || userIds.includes(userId)) {
      return next(); // Skip rate limiting
    }
    
    next();
  };
};

/**
 * Middleware de rate limiting global
 */
export const globalRateLimit = createRateLimit('general');

/**
 * Rate limits spécialisés
 */
export const authRateLimit = createRateLimit('auth');
export const uploadRateLimit = createRateLimit('upload');
export const searchRateLimit = createRateLimit('search');
export const messagingRateLimit = createRateLimit('messaging');
export const analyticsRateLimit = createRateLimit('analytics');
export const adminRateLimit = createRateLimit('admin');
export const notificationsRateLimit = createRateLimit('notifications');

export default {
  createRateLimit,
  createUserRateLimit,
  adaptiveRateLimit,
  whitelist,
  globalRateLimit,
  authRateLimit,
  uploadRateLimit,
  searchRateLimit,
  messagingRateLimit,
  analyticsRateLimit,
  adminRateLimit,
  notificationsRateLimit
};
