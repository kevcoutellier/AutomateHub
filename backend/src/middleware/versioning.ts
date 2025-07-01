import { Request, Response, NextFunction } from 'express';
import ApiResponseHelper from '../utils/apiResponse';

/**
 * Interface pour la configuration du versioning
 */
interface VersionConfig {
  supportedVersions: string[];
  defaultVersion: string;
  deprecatedVersions: string[];
}

/**
 * Configuration du versioning API
 */
const versionConfig: VersionConfig = {
  supportedVersions: ['v1'],
  defaultVersion: 'v1',
  deprecatedVersions: []
};

/**
 * Middleware de versioning API
 * Supporte les versions via:
 * - URL path: /api/v1/users
 * - Header: Accept-Version: v1
 * - Query parameter: ?version=v1
 */
export const versioningMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let requestedVersion: string | undefined;

    // 1. Vérifier dans l'URL path
    const urlVersionMatch = req.path.match(/^\/api\/(v\d+)\//); 
    if (urlVersionMatch) {
      requestedVersion = urlVersionMatch[1];
    }

    // 2. Vérifier dans les headers
    if (!requestedVersion) {
      requestedVersion = req.headers['accept-version'] as string;
    }

    // 3. Vérifier dans les query parameters
    if (!requestedVersion) {
      requestedVersion = req.query.version as string;
    }

    // 4. Utiliser la version par défaut si aucune spécifiée
    if (!requestedVersion) {
      requestedVersion = versionConfig.defaultVersion;
    }

    // Valider la version
    if (!versionConfig.supportedVersions.includes(requestedVersion)) {
      ApiResponseHelper.error(
        res,
        `API version '${requestedVersion}' is not supported. Supported versions: ${versionConfig.supportedVersions.join(', ')}`,
        400,
        'UNSUPPORTED_API_VERSION'
      );
      return;
    }

    // Avertir si la version est dépréciée
    if (versionConfig.deprecatedVersions.includes(requestedVersion)) {
      res.set('Warning', `299 - "API version ${requestedVersion} is deprecated"`);
    }

    // Ajouter la version aux locals pour utilisation dans les routes
    res.locals.apiVersion = requestedVersion;

    // Ajouter les headers de versioning
    res.set('API-Version', requestedVersion);
    res.set('Supported-Versions', versionConfig.supportedVersions.join(', '));

    next();
  } catch (error) {
    ApiResponseHelper.serverError(res, 'Error processing API version');
  }
};

/**
 * Middleware pour rediriger les anciennes URLs vers les nouvelles avec version
 */
export const legacyRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Si l'URL ne contient pas de version, rediriger vers v1
  if (req.path.startsWith('/api/') && !req.path.match(/^\/api\/v\d+\//)) {
    const newPath = req.path.replace('/api/', `/api/${versionConfig.defaultVersion}/`);
    return res.redirect(301, newPath + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
  }
  next();
};

/**
 * Utilitaire pour vérifier la compatibilité de version
 */
export const isVersionCompatible = (requiredVersion: string, currentVersion: string): boolean => {
  const required = parseInt(requiredVersion.replace('v', ''));
  const current = parseInt(currentVersion.replace('v', ''));
  return current >= required;
};

/**
 * Décorateur pour marquer une route comme dépréciée
 */
export const deprecated = (version: string, message?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const warning = message || `This endpoint is deprecated since version ${version}`;
    res.set('Warning', `299 - "${warning}"`);
    next();
  };
};

/**
 * Middleware pour les fonctionnalités spécifiques à une version
 */
export const requireVersion = (minVersion: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentVersion = res.locals.apiVersion || versionConfig.defaultVersion;
    
    if (!isVersionCompatible(minVersion, currentVersion)) {
      ApiResponseHelper.error(
        res,
        `This endpoint requires API version ${minVersion} or higher`,
        400,
        'VERSION_TOO_LOW'
      );
      return;
    }
    
    next();
  };
};

export default {
  versioningMiddleware,
  legacyRedirectMiddleware,
  deprecated,
  requireVersion,
  isVersionCompatible
};
