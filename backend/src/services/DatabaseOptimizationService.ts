import { ExpertModel } from '../models/Expert';
import { ProjectModel } from '../models/Project';
import { UserModel } from '../models/User';
import { ReviewModel } from '../models/Review';
import { Conversation } from '../models/Conversation';

/**
 * Service d'optimisation des requêtes database
 * Implémente des patterns de performance pour réduire les temps de réponse
 */
export class DatabaseOptimizationService {
  
  /**
   * Recherche d'experts optimisée avec agrégation et indexation
   */
  static async findExpertsOptimized(filters: any, pagination: any, sort: any) {
    const { page = 1, limit = 12 } = pagination;
    const skip = (page - 1) * limit;

    // Pipeline d'agrégation optimisé
    const pipeline = [
      // 1. Filtrage initial avec index
      { $match: filters },
      
      // 2. Lookup optimisé pour les reviews avec limitation
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'expertId',
          as: 'reviews',
          pipeline: [
            { $sort: { createdAt: -1 as 1 | -1 } },
            { $limit: 5 }, // Limiter les reviews pour la performance
            { $project: { rating: 1, createdAt: 1 } }
          ]
        }
      },
      
      // 3. Calcul des statistiques en temps réel
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating' },
              else: 0
            }
          },
          lastReviewDate: { $max: '$reviews.createdAt' }
        }
      },
      
      // 4. Projection optimisée - seulement les champs nécessaires
      {
        $project: {
          name: 1,
          title: 1,
          specialties: 1,
          industries: 1,
          hourlyRate: 1,
          location: 1,
          availability: 1,
          featured: 1,
          profileImage: 1,
          reviewCount: 1,
          averageRating: 1,
          lastReviewDate: 1,
          projectsCompleted: 1,
          successRate: 1,
          responseTime: 1
        }
      },
      
      // 5. Tri avec priorité aux experts featured
      { $sort: { featured: -1, ...sort } },
      
      // 6. Pagination
      { $skip: skip },
      { $limit: limit }
    ];

    // Exécution parallèle de la requête et du count
    const [experts, totalCount] = await Promise.all([
      ExpertModel.aggregate(pipeline),
      ExpertModel.countDocuments(filters)
    ]);

    return {
      experts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Recherche de projets optimisée avec population sélective
   */
  static async findProjectsOptimized(filters: any, pagination: any, userId?: string) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Requête de base avec sélection de champs optimisée
    const query = ProjectModel.find(filters)
      .select('title description status budget deadline createdAt clientId expertId progress milestones')
      .populate('clientId', 'firstName lastName email profileImage')
      .populate('expertId', 'name title profileImage averageRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Utiliser lean() pour de meilleures performances

    // Exécution parallèle
    const [projects, totalCount] = await Promise.all([
      query.exec(),
      ProjectModel.countDocuments(filters)
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Récupération optimisée des conversations avec messages récents
   */
  static async findConversationsOptimized(userId: string, pagination: any) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const pipeline = [
      // 1. Filtrage par participant
      {
        $match: {
          participants: userId
        }
      },
      
      // 2. Lookup des derniers messages avec limitation
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'conversationId',
          as: 'recentMessages',
          pipeline: [
            { $sort: { createdAt: -1 as 1 | -1 } },
            { $limit: 1 }, // Seulement le dernier message
            {
              $project: {
                content: 1,
                senderId: 1,
                createdAt: 1,
                messageType: 1
              }
            }
          ]
        }
      },
      
      // 3. Lookup des participants avec champs limités
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participantDetails',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                profileImage: 1,
                role: 1
              }
            }
          ]
        }
      },
      
      // 4. Calcul des messages non lus
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ['$recentMessages', 0] },
          unreadCount: {
            $size: {
              $filter: {
                input: '$messages',
                cond: {
                  $and: [
                    { $ne: ['$$this.senderId', userId] },
                    { $eq: ['$$this.read', false] }
                  ]
                }
              }
            }
          }
        }
      },
      
      // 5. Tri par dernière activité
      { $sort: { updatedAt: -1 as const } },
      
      // 6. Pagination
      { $skip: skip },
      { $limit: limit }
    ];

    const [conversations, totalCount] = await Promise.all([
      Conversation.aggregate(pipeline),
      Conversation.countDocuments({ participants: userId })
    ]);

    return {
      conversations,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Statistiques dashboard optimisées avec cache
   */
  static async getDashboardStatsOptimized(userId: string, role: string) {
    const cacheKey = `dashboard_stats_${userId}_${role}`;
    
    // Pipeline d'agrégation selon le rôle
    if (role === 'expert') {
      const pipeline = [
        {
          $facet: {
            // Projets actifs
            activeProjects: [
              { $match: { expertId: userId, status: { $in: ['in-progress', 'planning'] } } },
              { $count: 'count' }
            ],
            // Revenus du mois
            monthlyRevenue: [
              {
                $match: {
                  expertId: userId,
                  status: 'completed',
                  completedAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  }
                }
              },
              { $group: { _id: null, total: { $sum: '$budget.amount' } } }
            ],
            // Reviews récentes
            recentReviews: [
              { $match: { expertId: userId } },
              { $sort: { createdAt: -1 as 1 | -1 } },
              { $limit: 5 },
              {
                $group: {
                  _id: null,
                  averageRating: { $avg: '$rating' },
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ];

      const [stats] = await ProjectModel.aggregate(pipeline);
      
      return {
        activeProjects: stats.activeProjects[0]?.count || 0,
        monthlyRevenue: stats.monthlyRevenue[0]?.total || 0,
        averageRating: stats.recentReviews[0]?.averageRating || 0,
        totalReviews: stats.recentReviews[0]?.count || 0
      };
    } else if (role === 'client') {
      const pipeline = [
        {
          $facet: {
            // Projets actifs
            activeProjects: [
              { $match: { clientId: userId, status: { $in: ['in-progress', 'planning'] } } },
              { $count: 'count' }
            ],
            // Budget total engagé
            totalBudget: [
              { $match: { clientId: userId } },
              { $group: { _id: null, total: { $sum: '$budget.amount' } } }
            ],
            // Projets complétés
            completedProjects: [
              { $match: { clientId: userId, status: 'completed' } },
              { $count: 'count' }
            ]
          }
        }
      ];

      const [stats] = await ProjectModel.aggregate(pipeline);
      
      return {
        activeProjects: stats.activeProjects[0]?.count || 0,
        totalBudget: stats.totalBudget[0]?.total || 0,
        completedProjects: stats.completedProjects[0]?.count || 0
      };
    }

    return {};
  }

  /**
   * Création d'index optimisés pour les performances
   */
  static async createOptimizedIndexes() {
    try {
      // Index pour les experts
      await ExpertModel.collection.createIndex({ 
        specialties: 1, 
        industries: 1, 
        averageRating: -1 
      });
      await ExpertModel.collection.createIndex({ 
        location: 'text', 
        name: 'text', 
        title: 'text' 
      });
      await ExpertModel.collection.createIndex({ featured: -1, averageRating: -1 });

      // Index pour les projets
      await ProjectModel.collection.createIndex({ 
        clientId: 1, 
        status: 1, 
        createdAt: -1 
      });
      await ProjectModel.collection.createIndex({ 
        expertId: 1, 
        status: 1, 
        deadline: 1 
      });

      // Index pour les conversations
      await Conversation.collection.createIndex({ 
        participants: 1, 
        updatedAt: -1 
      });

      // Index pour les reviews
      await ReviewModel.collection.createIndex({ 
        expertId: 1, 
        createdAt: -1 
      });

      console.log('✅ Index optimisés créés avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création des index:', error);
    }
  }

  /**
   * Nettoyage et maintenance de la base de données
   */
  static async performMaintenance() {
    try {
      // Supprimer les conversations vides de plus de 30 jours
      await Conversation.deleteMany({
        messages: { $size: 0 },
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      // Mettre à jour les statistiques des experts
      const experts = await ExpertModel.find();
      for (const expert of experts) {
        const reviews = await ReviewModel.find({ expertId: expert._id });
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        await ExpertModel.updateOne(
          { _id: expert._id },
          { 
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: reviews.length
          }
        );
      }

      console.log('✅ Maintenance de la base de données terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la maintenance:', error);
    }
  }
}
