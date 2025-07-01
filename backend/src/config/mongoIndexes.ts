import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { ExpertModel } from '../models/Expert';
import { ProjectModel } from '../models/Project';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { ReviewModel } from '../models/Review';
import { Report } from '../models/Report';
import { Notification } from '../models/Notification';

/**
 * Configuration des indexes MongoDB pour optimiser les requêtes fréquentes
 * Améliore les performances des recherches, filtres et agrégations
 */
export const createMongoIndexes = async (): Promise<void> => {
  try {
    console.log('🔍 Creating MongoDB indexes...');

    // ===== USER INDEXES =====
    await UserModel.collection.createIndex({ email: 1 }, { unique: true });
    await UserModel.collection.createIndex({ role: 1 });
    await UserModel.collection.createIndex({ status: 1 });
    await UserModel.collection.createIndex({ createdAt: -1 });
    await UserModel.collection.createIndex({ lastLogin: -1 });
    await UserModel.collection.createIndex({ 
      email: 'text', 
      firstName: 'text', 
      lastName: 'text' 
    }, { 
      name: 'user_search_text' 
    });

    // ===== EXPERT INDEXES =====
    await ExpertModel.collection.createIndex({ userId: 1 }, { unique: true });
    await ExpertModel.collection.createIndex({ specialties: 1 });
    await ExpertModel.collection.createIndex({ industries: 1 });
    await ExpertModel.collection.createIndex({ location: 1 });
    await ExpertModel.collection.createIndex({ averageRating: -1 });
    await ExpertModel.collection.createIndex({ featured: -1, averageRating: -1 });
    await ExpertModel.collection.createIndex({ isApproved: 1, isActive: 1 });
    await ExpertModel.collection.createIndex({ 'hourlyRate.min': 1, 'hourlyRate.max': 1 });
    
    // Compound index for expert search
    await ExpertModel.collection.createIndex({
      isApproved: 1,
      isActive: 1,
      featured: -1,
      averageRating: -1
    }, {
      name: 'expert_search_compound'
    });
    
    // Text search index for experts
    await ExpertModel.collection.createIndex({
      name: 'text',
      title: 'text',
      bio: 'text',
      specialties: 'text',
      industries: 'text'
    }, {
      name: 'expert_search_text'
    });

    // ===== PROJECT INDEXES =====
    await ProjectModel.collection.createIndex({ clientId: 1 });
    await ProjectModel.collection.createIndex({ expertId: 1 });
    await ProjectModel.collection.createIndex({ status: 1 });
    await ProjectModel.collection.createIndex({ category: 1 });
    await ProjectModel.collection.createIndex({ budget: 1 });
    await ProjectModel.collection.createIndex({ deadline: 1 });
    await ProjectModel.collection.createIndex({ createdAt: -1 });
    await ProjectModel.collection.createIndex({ updatedAt: -1 });
    
    // Compound index for client dashboard
    await ProjectModel.collection.createIndex({ 
      clientId: 1, 
      status: 1, 
      createdAt: -1 
    }, { 
      name: 'client_projects_dashboard' 
    });
    
    // Compound index for expert dashboard
    await ProjectModel.collection.createIndex({ 
      expertId: 1, 
      status: 1, 
      createdAt: -1 
    }, { 
      name: 'expert_projects_dashboard' 
    });
    
    // Text search index for projects
    await ProjectModel.collection.createIndex({ 
      title: 'text', 
      description: 'text', 
      category: 'text' 
    }, { 
      name: 'project_text_search' 
    });

    // ===== CONVERSATION INDEXES =====
    await Conversation.collection.createIndex({ participants: 1 });
    await Conversation.collection.createIndex({ projectId: 1 });
    await Conversation.collection.createIndex({ lastMessageAt: -1 });
    await Conversation.collection.createIndex({ createdAt: -1 });
    
    // Index composé pour messagerie utilisateur
    await Conversation.collection.createIndex({ 
      participants: 1, 
      lastMessageAt: -1 
    }, { 
      name: 'user_conversations' 
    });

    // ===== MESSAGE INDEXES =====
    await Message.collection.createIndex({ conversationId: 1, createdAt: -1 });
    await Message.collection.createIndex({ senderId: 1 });
    await Message.collection.createIndex({ createdAt: -1 });
    await Message.collection.createIndex({ readBy: 1 });
    
    // Index pour recherche dans les messages
    await Message.collection.createIndex({ 
      content: 'text' 
    }, { 
      name: 'message_content_search' 
    });

    // ===== REVIEW INDEXES =====
    await ReviewModel.collection.createIndex({ expertId: 1 });
    await ReviewModel.collection.createIndex({ clientId: 1 });
    await ReviewModel.collection.createIndex({ projectId: 1 }, { unique: true });
    await ReviewModel.collection.createIndex({ rating: -1 });
    await ReviewModel.collection.createIndex({ createdAt: -1 });
    
    // Compound index for expert rating calculation
    await ReviewModel.collection.createIndex({ 
      expertId: 1, 
      rating: -1, 
      createdAt: -1 
    }, { 
      name: 'expert_rating_calculation' 
    });

    // ===== REPORT INDEXES =====
    await Report.collection.createIndex({ reporterId: 1 });
    await Report.collection.createIndex({ reportedUserId: 1 });
    await Report.collection.createIndex({ status: 1 });
    await Report.collection.createIndex({ severity: 1 });
    await Report.collection.createIndex({ createdAt: -1 });
    
    // Index composé pour modération admin
    await Report.collection.createIndex({ 
      status: 1, 
      severity: -1, 
      createdAt: -1 
    }, { 
      name: 'admin_moderation_queue' 
    });

    // ===== NOTIFICATION INDEXES =====
    await Notification.collection.createIndex({ userId: 1, createdAt: -1 });
    await Notification.collection.createIndex({ type: 1 });
    await Notification.collection.createIndex({ priority: 1 });
    await Notification.collection.createIndex({ read: 1 });
    await Notification.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    // Index composé pour notifications utilisateur
    await Notification.collection.createIndex({ 
      userId: 1, 
      read: 1, 
      priority: -1, 
      createdAt: -1 
    }, { 
      name: 'user_notifications_feed' 
    });

    console.log('✅ MongoDB indexes created successfully');

    // Afficher les statistiques des indexes
    await displayIndexStats();

  } catch (error) {
    console.error('❌ Error creating MongoDB indexes:', error);
    throw error;
  }
};

/**
 * Affiche les statistiques des indexes créés
 */
const displayIndexStats = async (): Promise<void> => {
  try {
    const collections = [
      { name: 'User', model: UserModel },
      { name: 'Expert', model: ExpertModel },
      { name: 'Project', model: ProjectModel },
      { name: 'Conversation', model: Conversation },
      { name: 'Message', model: Message },
      { name: 'Review', model: ReviewModel },
      { name: 'Report', model: Report },
      { name: 'Notification', model: Notification }
    ];

    console.log('\n📊 MongoDB Index Statistics:');
    console.log('================================');

    for (const collection of collections) {
      const indexes = await collection.model.collection.indexes();
      console.log(`${collection.name}: ${indexes.length} indexes`);
      
      // Afficher les noms des indexes personnalisés
      const customIndexes = indexes.filter((idx: any) => idx.name !== '_id_');
      if (customIndexes.length > 0) {
        customIndexes.forEach((idx: any) => {
          const keys = Object.keys(idx.key).join(', ');
          console.log(`  - ${idx.name || 'unnamed'}: (${keys})`);
        });
      }
    }

    console.log('================================\n');
  } catch (error) {
    console.error('Error displaying index stats:', error);
  }
};

/**
 * Supprime tous les indexes personnalisés (utile pour les tests)
 */
export const dropCustomIndexes = async (): Promise<void> => {
  try {
    console.log('🗑️ Dropping custom MongoDB indexes...');

    const collections = [UserModel, ExpertModel, ProjectModel, Conversation, Message, ReviewModel, Report, Notification];

    for (const collection of collections) {
      const indexes = await collection.collection.indexes();
      
      for (const index of indexes) {
        // Don't drop the default _id index
        if (index.name !== '_id_') {
          try {
            await collection.collection.dropIndex(index.name!);
            console.log(`  Dropped index: ${index.name}`);
          } catch (error) {
            // Ignore errors if index doesn't exist
            console.log(`  Index ${index.name} not found or already dropped`);
          }
        }
      }
    }

    console.log('✅ Custom indexes dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping indexes:', error);
    throw error;
  }
};

/**
 * Analyse les performances des requêtes avec explain()
 */
export const analyzeQueryPerformance = async (): Promise<void> => {
  try {
    console.log('🔍 Analyzing query performance...');

    // Example Expert query analysis
    const expertQuery = ExpertModel.find({ 
      specialties: { $in: ['E-commerce'] }, 
      'hourlyRate.max': { $lte: 100 },
      averageRating: { $gte: 4.0 }
    }).sort({ averageRating: -1 });

    const expertExplain = await expertQuery.explain('executionStats') as any;
    console.log('Expert Search Query Performance:');
    console.log(`  Documents examined: ${expertExplain.executionStats?.totalDocsExamined || 'N/A'}`);
    console.log(`  Documents returned: ${expertExplain.executionStats?.totalDocsReturned || 'N/A'}`);
    console.log(`  Execution time: ${expertExplain.executionStats?.executionTimeMillis || 'N/A'}ms`);
    console.log(`  Index used: ${expertExplain.executionStats?.indexName || 'No index'}`);

    // Example Project query analysis
    const projectQuery = ProjectModel.find({ 
      clientId: new mongoose.Types.ObjectId(),
      status: { $in: ['active', 'in-progress'] }
    }).sort({ createdAt: -1 });

    const projectExplain = await projectQuery.explain('executionStats') as any;
    console.log('\nProject Dashboard Query Performance:');
    console.log(`  Documents examined: ${projectExplain.executionStats?.totalDocsExamined || 'N/A'}`);
    console.log(`  Documents returned: ${projectExplain.executionStats?.totalDocsReturned || 'N/A'}`);
    console.log(`  Execution time: ${projectExplain.executionStats?.executionTimeMillis || 'N/A'}ms`);
    console.log(`  Index used: ${projectExplain.executionStats?.indexName || 'No index'}`);

  } catch (error) {
    console.error('❌ Error analyzing query performance:', error);
  }
};
