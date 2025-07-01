import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface pour l'audit trail
 */
export interface IAuditLog extends Document {
  collectionName: string;
  documentId: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete';
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  userRole?: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: {
    ip?: string;
    userAgent?: string;
    timestamp: Date;
    source: 'api' | 'admin' | 'system';
  };
  createdAt: Date;
}

/**
 * Schéma pour l'audit trail
 */
const auditLogSchema = new Schema<IAuditLog>({
  collectionName: { type: String, required: true, index: true },
  documentId: { type: Schema.Types.ObjectId, required: true, index: true },
  action: { type: String, enum: ['create', 'update', 'delete'], required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  userEmail: { type: String, index: true },
  userRole: { type: String, index: true },
  changes: [{
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed }
  }],
  metadata: {
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    source: { type: String, enum: ['api', 'admin', 'system'], default: 'api' }
  },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Index composé pour les requêtes d'audit fréquentes
auditLogSchema.index({ collection: 1, documentId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// TTL index pour supprimer automatiquement les logs après 2 ans
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 ans

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

/**
 * Utilitaire pour créer un log d'audit
 */
export const createAuditLog = async (params: {
  collection: string;
  documentId: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete';
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  userRole?: string;
  changes?: { field: string; oldValue: any; newValue: any }[];
  metadata?: {
    ip?: string;
    userAgent?: string;
    source?: 'api' | 'admin' | 'system';
  };
}): Promise<IAuditLog> => {
  try {
    const auditLog = new AuditLog({
      collection: params.collection,
      documentId: params.documentId,
      action: params.action,
      userId: params.userId,
      userEmail: params.userEmail,
      userRole: params.userRole,
      changes: params.changes || [],
      metadata: {
        ip: params.metadata?.ip,
        userAgent: params.metadata?.userAgent,
        timestamp: new Date(),
        source: params.metadata?.source || 'api'
      }
    });

    return await auditLog.save();
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

/**
 * Plugin Mongoose pour l'audit trail automatique
 */
export function auditTrailPlugin(schema: Schema, options: { 
  collectionName: string;
  excludeFields?: string[];
  includeUser?: boolean;
}) {
  const { collectionName, excludeFields = [], includeUser = true } = options;

  // Hook pre-save pour capturer les changements
  schema.pre('save', async function(this: any) {
    if (this.isNew) {
      // Document créé
      this._auditAction = 'create';
      this._auditChanges = [];
    } else {
      // Document modifié
      this._auditAction = 'update';
      this._auditChanges = [];

      const modifiedPaths = this.modifiedPaths();
      
      for (const path of modifiedPaths) {
        if (!excludeFields.includes(path) && path !== '__v' && path !== 'updatedAt') {
          this._auditChanges.push({
            field: path,
            oldValue: this.get(path, null, { getters: false }),
            newValue: this.get(path)
          });
        }
      }
    }
  });

  // Hook post-save pour créer le log d'audit
  schema.post('save', async function(this: any) {
    try {
      const auditData: any = {
        collection: collectionName,
        documentId: this._id,
        action: this._auditAction,
        changes: this._auditChanges || []
      };

      // Ajouter les informations utilisateur si disponibles
      if (includeUser && this._auditUser) {
        auditData.userId = this._auditUser.id;
        auditData.userEmail = this._auditUser.email;
        auditData.userRole = this._auditUser.role;
      }

      // Ajouter les métadonnées de la requête si disponibles
      if (this._auditMetadata) {
        auditData.metadata = this._auditMetadata;
      }

      await createAuditLog(auditData);
    } catch (error) {
      console.error('Error in audit trail post-save hook:', error);
      // Ne pas faire échouer la sauvegarde principale
    }
  });

  // Hook pre-deleteOne pour capturer la suppression
  schema.pre('deleteOne', { document: true, query: false }, async function(this: any) {
    this._auditAction = 'delete';
    this._auditDocumentSnapshot = this.toObject();
  });

  // Hook post-deleteOne pour créer le log d'audit
  schema.post('deleteOne', { document: true, query: false }, async function(this: any) {
    try {
      const auditData: any = {
        collection: collectionName,
        documentId: this._id,
        action: 'delete',
        changes: [{
          field: '_document',
          oldValue: this._auditDocumentSnapshot,
          newValue: null
        }]
      };

      if (includeUser && this._auditUser) {
        auditData.userId = this._auditUser.id;
        auditData.userEmail = this._auditUser.email;
        auditData.userRole = this._auditUser.role;
      }

      if (this._auditMetadata) {
        auditData.metadata = this._auditMetadata;
      }

      await createAuditLog(auditData);
    } catch (error) {
      console.error('Error in audit trail post-deleteOne hook:', error);
    }
  });

  // Méthode pour définir l'utilisateur pour l'audit
  schema.methods.setAuditUser = function(user: { 
    id: mongoose.Types.ObjectId; 
    email: string; 
    role: string 
  }) {
    this._auditUser = user;
    return this;
  };

  // Méthode pour définir les métadonnées pour l'audit
  schema.methods.setAuditMetadata = function(metadata: {
    ip?: string;
    userAgent?: string;
    source?: 'api' | 'admin' | 'system';
  }) {
    this._auditMetadata = metadata;
    return this;
  };
}

/**
 * Middleware Express pour ajouter automatiquement les informations d'audit
 */
export const auditMiddleware = (req: any, res: any, next: any) => {
  // Ajouter les informations d'audit à la requête
  req.auditMetadata = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    source: req.path.startsWith('/admin') ? 'admin' : 'api'
  };

  // Fonction helper pour ajouter l'audit à un document
  req.addAuditInfo = (document: any) => {
    if (req.user) {
      document.setAuditUser({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      });
    }
    document.setAuditMetadata(req.auditMetadata);
    return document;
  };

  next();
};

/**
 * Service pour récupérer l'historique d'audit
 */
export class AuditService {
  /**
   * Récupère l'historique d'audit pour un document
   */
  static async getDocumentHistory(
    collection: string,
    documentId: mongoose.Types.ObjectId,
    options: {
      limit?: number;
      skip?: number;
      action?: 'create' | 'update' | 'delete';
      userId?: mongoose.Types.ObjectId;
    } = {}
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const { limit = 50, skip = 0, action, userId } = options;

    const query: any = { collection, documentId };
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'firstName lastName email')
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return { logs, total };
  }

  /**
   * Récupère l'historique d'audit pour un utilisateur
   */
  static async getUserActivity(
    userId: mongoose.Types.ObjectId,
    options: {
      limit?: number;
      skip?: number;
      collection?: string;
      action?: 'create' | 'update' | 'delete';
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const { limit = 50, skip = 0, collection, action, startDate, endDate } = options;

    const query: any = { userId };
    if (collection) query.collection = collection;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return { logs, total };
  }

  /**
   * Récupère les statistiques d'audit
   */
  static async getAuditStats(options: {
    startDate?: Date;
    endDate?: Date;
    collection?: string;
  } = {}): Promise<{
    totalLogs: number;
    actionBreakdown: { action: string; count: number }[];
    collectionBreakdown: { collection: string; count: number }[];
    userActivity: { userId: string; userEmail: string; count: number }[];
  }> {
    const { startDate, endDate, collection } = options;

    const matchStage: any = {};
    if (collection) matchStage.collection = collection;
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $facet: {
          totalLogs: [{ $count: 'count' }],
          actionBreakdown: [
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $project: { action: '$_id', count: 1, _id: 0 } },
            { $sort: { count: -1 as const } }
          ],
          collectionBreakdown: [
            { $group: { _id: '$collectionName', count: { $sum: 1 } } },
            { $project: { collection: '$_id', count: 1, _id: 0 } },
            { $sort: { count: -1 as const } }
          ],
          userActivity: [
            { $match: { userId: { $exists: true } } },
            { $group: { _id: { userId: '$userId', userEmail: '$userEmail' }, count: { $sum: 1 } } },
            { $project: { userId: '$_id.userId', userEmail: '$_id.userEmail', count: 1, _id: 0 } },
            { $sort: { count: -1 as const } },
            { $limit: 10 }
          ]
        }
      }
    ];

    const [result] = await AuditLog.aggregate(pipeline);

    return {
      totalLogs: result.totalLogs[0]?.count || 0,
      actionBreakdown: result.actionBreakdown || [],
      collectionBreakdown: result.collectionBreakdown || [],
      userActivity: result.userActivity || []
    };
  }
}
