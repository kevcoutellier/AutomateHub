import { Response } from 'express';

/**
 * Interface standardisée pour toutes les réponses API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Classe utilitaire pour standardiser les réponses API
 */
export class ApiResponseHelper {
  private static version = 'v1';

  /**
   * Réponse de succès standardisée
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        version: this.version,
        requestId: res.locals.requestId,
        ...meta
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Réponse d'erreur standardisée
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    error?: string,
    data?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: this.version,
        requestId: res.locals.requestId
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Réponse avec pagination
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string
  ): Response {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return this.success(res, data, message, 200, {
      pagination: {
        ...pagination,
        totalPages
      }
    });
  }

  /**
   * Réponse de création réussie
   */
  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message || 'Resource created successfully', 201);
  }

  /**
   * Réponse de mise à jour réussie
   */
  static updated<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message || 'Resource updated successfully', 200);
  }

  /**
   * Réponse de suppression réussie
   */
  static deleted(res: Response, message?: string): Response {
    return this.success(res, null, message || 'Resource deleted successfully', 200);
  }

  /**
   * Réponse non trouvé
   */
  static notFound(res: Response, message?: string): Response {
    return this.error(res, message || 'Resource not found', 404);
  }

  /**
   * Réponse non autorisé
   */
  static unauthorized(res: Response, message?: string): Response {
    return this.error(res, message || 'Unauthorized access', 401);
  }

  /**
   * Réponse interdit
   */
  static forbidden(res: Response, message?: string): Response {
    return this.error(res, message || 'Access forbidden', 403);
  }

  /**
   * Réponse de validation échouée
   */
  static validationError(res: Response, errors: any, message?: string): Response {
    return this.error(
      res,
      message || 'Validation failed',
      422,
      'VALIDATION_ERROR',
      errors
    );
  }

  /**
   * Réponse d'erreur serveur
   */
  static serverError(res: Response, message?: string, error?: string): Response {
    return this.error(
      res,
      message || 'Internal server error',
      500,
      error || 'INTERNAL_SERVER_ERROR'
    );
  }

  /**
   * Réponse de rate limiting
   */
  static rateLimited(res: Response, message?: string): Response {
    return this.error(
      res,
      message || 'Rate limit exceeded',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }
}

/**
 * Middleware pour ajouter un ID de requête unique
 */
export const requestIdMiddleware = (req: any, res: Response, next: any) => {
  res.locals.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
};

export default ApiResponseHelper;
