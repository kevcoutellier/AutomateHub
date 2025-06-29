import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour mesurer les performances des requêtes
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Ajouter le timestamp de début
  (req as any).startTime = Date.now();
  
  // Intercepter la réponse pour ajouter les métriques
  const originalSend = res.send;
  res.send = function(data: any) {
    const endTime = Date.now();
    const duration = endTime - (req as any).startTime;
    
    // Ajouter les headers de performance
    res.set('X-Response-Time', `${duration}ms`);
    res.set('X-Timestamp', new Date().toISOString());
    
    // Logger les requêtes lentes (> 1000ms)
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} - ${duration}ms`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};
