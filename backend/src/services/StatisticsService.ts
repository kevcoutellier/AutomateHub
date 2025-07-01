import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { ExpertModel } from '../models/Expert';
import { ProjectModel } from '../models/Project';
import { ReviewModel } from '../models/Review';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';

/**
 * Service pour les statistiques complexes avec pipelines d'agrégation MongoDB
 */
export class StatisticsService {
  /**
   * Statistiques globales de la plateforme
   */
  static async getPlatformStats(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
    const startDate = this.getStartDate(timeRange);
    
    const pipeline = [
      {
        $facet: {
          userStats: [
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                  $sum: {
                    $cond: [
                      { $gte: ['$lastLogin', startDate] },
                      1,
                      0
                    ]
                  }
                },
                newUsers: {
                  $sum: {
                    $cond: [
                      { $gte: ['$createdAt', startDate] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          expertStats: [
            {
              $lookup: {
                from: 'experts',
                localField: '_id',
                foreignField: 'userId',
                as: 'expertProfile'
              }
            },
            {
              $match: {
                'expertProfile.0': { $exists: true }
              }
            },
            {
              $group: {
                _id: null,
                totalExperts: { $sum: 1 },
                verifiedExperts: {
                  $sum: {
                    $cond: [
                      { $eq: ['$expertProfile.isVerified', true] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ];

    const [result] = await UserModel.aggregate(pipeline);
    return result;
  }

  /**
   * Statistiques des projets avec agrégations complexes
   */
  static async getProjectStats(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
    const startDate = this.getStartDate(timeRange);
    
    const pipeline: any[] = [
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalProjects: { $sum: 1 },
                activeProjects: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', ['active', 'in-progress']] },
                      1,
                      0
                    ]
                  }
                },
                completedProjects: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', 'completed'] },
                      1,
                      0
                    ]
                  }
                },
                totalBudget: { $sum: '$budget' },
                avgBudget: { $avg: '$budget' }
              }
            }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalBudget: { $sum: '$budget' }
              }
            },
            {
              $sort: { count: -1 as const }
            }
          ],
          categoryBreakdown: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
                avgBudget: { $avg: '$budget' },
                totalBudget: { $sum: '$budget' }
              }
            },
            {
              $sort: { count: -1 as const }
            }
          ],
          monthlyTrends: [
            {
              $match: {
                createdAt: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 },
                totalBudget: { $sum: '$budget' }
              }
            },
            {
              $sort: { '_id.year': 1 as const, '_id.month': 1 as const }
            }
          ]
        }
      }
    ];

    const [result] = await ProjectModel.aggregate(pipeline);
    return result;
  }

  /**
   * Statistiques des experts avec performance et ratings
   */
  static async getExpertPerformanceStats(expertId?: mongoose.Types.ObjectId) {
    const matchStage = expertId ? { userId: expertId } : {};
    
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'projects',
          localField: 'userId',
          foreignField: 'expertId',
          as: 'projects'
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: 'userId',
          foreignField: 'expertId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          totalProjects: { $size: '$projects' },
          completedProjects: {
            $size: {
              $filter: {
                input: '$projects',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          totalEarnings: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$projects',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                },
                as: 'project',
                in: '$$project.budget'
              }
            }
          },
          avgRating: { $avg: '$reviews.rating' },
          totalReviews: { $size: '$reviews' }
        }
      },
      {
        $project: {
          userId: 1,
          title: 1,
          specialties: 1,
          hourlyRate: 1,
          totalProjects: 1,
          completedProjects: 1,
          successRate: {
            $cond: [
              { $gt: ['$totalProjects', 0] },
              { $multiply: [{ $divide: ['$completedProjects', '$totalProjects'] }, 100] },
              0
            ]
          },
          totalEarnings: 1,
          avgEarnings: {
            $cond: [
              { $gt: ['$completedProjects', 0] },
              { $divide: ['$totalEarnings', '$completedProjects'] },
              0
            ]
          },
          avgRating: 1,
          totalReviews: 1
        }
      },
      {
        $sort: { totalEarnings: -1 as const }
      }
    ];

    return await ExpertModel.aggregate(pipeline);
  }

  /**
   * Analyse des revenus avec tendances temporelles
   */
  static async getRevenueAnalysis(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
    const startDate = this.getStartDate(timeRange);
    
    const pipeline: any[] = [
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$budget' },
                avgProjectValue: { $avg: '$budget' },
                projectCount: { $sum: 1 }
              }
            }
          ],
          monthlyRevenue: [
            {
              $group: {
                _id: {
                  year: { $year: '$completedAt' },
                  month: { $month: '$completedAt' }
                },
                revenue: { $sum: '$budget' },
                projectCount: { $sum: 1 }
              }
            },
            {
              $sort: { '_id.year': 1 as const, '_id.month': 1 as const }
            }
          ],
          categoryRevenue: [
            {
              $group: {
                _id: '$category',
                revenue: { $sum: '$budget' },
                projectCount: { $sum: 1 },
                avgValue: { $avg: '$budget' }
              }
            },
            {
              $sort: { revenue: -1 as const }
            }
          ],
          expertRevenue: [
            {
              $lookup: {
                from: 'experts',
                localField: 'expertId',
                foreignField: 'userId',
                as: 'expert'
              }
            },
            {
              $unwind: '$expert'
            },
            {
              $group: {
                _id: '$expertId',
                expertTitle: { $first: '$expert.title' },
                revenue: { $sum: '$budget' },
                projectCount: { $sum: 1 },
                avgProjectValue: { $avg: '$budget' }
              }
            },
            {
              $sort: { revenue: -1 as const }
            },
            {
              $limit: 10
            }
          ]
        }
      }
    ];

    const [result] = await ProjectModel.aggregate(pipeline);
    return result;
  }

  /**
   * Analyse de satisfaction client avec détails
   */
  static async getClientSatisfactionStats() {
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $lookup: {
          from: 'experts',
          localField: 'expertId',
          foreignField: 'userId',
          as: 'expert'
        }
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                avgRating: { $avg: '$rating' },
                avgCommunication: { $avg: '$communication' },
                avgQuality: { $avg: '$quality' },
                avgTimeliness: { $avg: '$timeliness' }
              }
            }
          ],
          ratingDistribution: [
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 }
              }
            },
            {
              $sort: { _id: 1 as const }
            }
          ],
          categoryRatings: [
            {
              $unwind: '$project'
            },
            {
              $group: {
                _id: '$project.category',
                avgRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
              }
            },
            {
              $sort: { avgRating: -1 as const }
            }
          ],
          expertRatings: [
            {
              $unwind: '$expert'
            },
            {
              $group: {
                _id: '$expertId',
                expertTitle: { $first: '$expert.title' },
                avgRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
              }
            },
            {
              $match: {
                reviewCount: { $gte: 3 }
              }
            },
            {
              $sort: { avgRating: -1 as const }
            },
            {
              $limit: 10
            }
          ]
        }
      }
    ];

    const [result] = await ReviewModel.aggregate(pipeline);
    return result;
  }

  /**
   * Statistiques de messagerie et engagement
   */
  static async getMessagingStats(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
    const startDate = this.getStartDate(timeRange);
    
    const conversationPipeline: any[] = [
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalConversations: { $sum: 1 },
                activeConversations: {
                  $sum: {
                    $cond: [
                      { $gte: ['$lastMessageAt', startDate] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          dailyActivity: [
            {
              $match: {
                lastMessageAt: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$lastMessageAt' },
                  month: { $month: '$lastMessageAt' },
                  day: { $dayOfMonth: '$lastMessageAt' }
                },
                conversationCount: { $sum: 1 }
              }
            },
            {
              $sort: { '_id.year': 1 as const, '_id.month': 1 as const, '_id.day': 1 as const }
            }
          ]
        }
      }
    ];

    const messagePipeline: any[] = [
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalMessages: { $sum: 1 },
                avgMessageLength: { $avg: { $strLenCP: '$content' } }
              }
            }
          ],
          dailyMessages: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' }
                },
                messageCount: { $sum: 1 }
              }
            },
            {
              $sort: { '_id.year': 1 as const, '_id.month': 1 as const, '_id.day': 1 as const }
            }
          ],
          userActivity: [
            {
              $group: {
                _id: '$senderId',
                messageCount: { $sum: 1 }
              }
            },
            {
              $sort: { messageCount: -1 as const }
            },
            {
              $limit: 10
            }
          ]
        }
      }
    ];

    const [conversationStats, messageStats] = await Promise.all([
      Conversation.aggregate(conversationPipeline),
      Message.aggregate(messagePipeline)
    ]);

    return {
      conversations: conversationStats[0],
      messages: messageStats[0]
    };
  }

  /**
   * Analyse de conversion et funnel
   */
  static async getConversionStats() {
    const pipeline = [
      {
        $facet: {
          userJourney: [
            {
              $lookup: {
                from: 'experts',
                localField: '_id',
                foreignField: 'userId',
                as: 'expertProfile'
              }
            },
            {
              $lookup: {
                from: 'projects',
                localField: '_id',
                foreignField: 'clientId',
                as: 'clientProjects'
              }
            },
            {
              $addFields: {
                isExpert: { $gt: [{ $size: '$expertProfile' }, 0] },
                hasProjects: { $gt: [{ $size: '$clientProjects' }, 0] },
                projectCount: { $size: '$clientProjects' }
              }
            },
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                expertsCount: {
                  $sum: { $cond: ['$isExpert', 1, 0] }
                },
                clientsWithProjects: {
                  $sum: { $cond: ['$hasProjects', 1, 0] }
                },
                avgProjectsPerClient: {
                  $avg: {
                    $cond: [
                      '$hasProjects',
                      '$projectCount',
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ];

    const [result] = await UserModel.aggregate(pipeline);
    return result;
  }

  /**
   * Utilitaire pour calculer la date de début selon la période
   */
  private static getStartDate(timeRange: '7d' | '30d' | '90d' | '1y'): Date {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}
