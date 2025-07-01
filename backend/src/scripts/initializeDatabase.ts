import mongoose from 'mongoose';
import { config } from '../config/config';
import { createMongoIndexes, analyzeQueryPerformance } from '../config/mongoIndexes';
import { connectDatabase } from '../config/database';

/**
 * Script d'initialisation de la base de données
 * - Connexion à MongoDB
 * - Création des indexes optimisés
 * - Analyse des performances
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Initializing AutomateHub Database...\n');

    // 1. Connexion à la base de données
    console.log('📡 Connecting to MongoDB...');
    await connectDatabase();

    // 2. Création des indexes optimisés
    console.log('\n🔍 Creating optimized MongoDB indexes...');
    await createMongoIndexes();

    // 3. Analyse des performances des requêtes
    console.log('\n📊 Analyzing query performance...');
    await analyzeQueryPerformance();

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ MongoDB connection established');
    console.log('  ✅ Optimized indexes created');
    console.log('  ✅ Query performance analyzed');
    console.log('  ✅ Audit trail system ready');
    console.log('\n🎯 Your AutomateHub database is now optimized for production!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
    process.exit(0);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
