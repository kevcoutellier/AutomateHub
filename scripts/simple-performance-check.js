#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AutomateHub - Vérification Simple de Performance');
console.log('='.repeat(55));

async function simplePerformanceCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {},
    builds: {},
    files: {},
    recommendations: []
  };

  try {
    // 1. Vérification environnement
    console.log('\n📋 1. Vérification de l\'environnement...');
    results.environment = checkEnvironment();
    
    // 2. Vérification des builds
    console.log('\n🔨 2. Vérification des builds...');
    results.builds = checkBuilds();
    
    // 3. Analyse des fichiers d'optimisation
    console.log('\n⚡ 3. Vérification des optimisations...');
    results.files = checkOptimizationFiles();
    
    // 4. Génération des recommandations
    console.log('\n💡 4. Génération des recommandations...');
    results.recommendations = generateRecommendations(results);
    
    // 5. Rapport final
    generateSimpleReport(results);
    
    console.log('\n✅ Vérification terminée avec succès!');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  }
}

function checkEnvironment() {
  const env = {};
  
  try {
    env.node = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`   ✅ Node.js: ${env.node}`);
  } catch (error) {
    env.node = 'Non disponible';
    console.log('   ❌ Node.js: Non disponible');
  }
  
  try {
    env.npm = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`   ✅ npm: ${env.npm}`);
  } catch (error) {
    env.npm = 'Non disponible';
    console.log('   ❌ npm: Non disponible');
  }
  
  return env;
}

function checkBuilds() {
  const builds = {};
  
  // Vérifier build backend
  const backendDist = path.join(__dirname, '..', 'backend', 'dist');
  builds.backend = {
    exists: fs.existsSync(backendDist),
    path: backendDist
  };
  
  if (builds.backend.exists) {
    try {
      const files = fs.readdirSync(backendDist);
      builds.backend.files = files.length;
      console.log(`   ✅ Backend build: ${files.length} fichiers`);
    } catch (error) {
      builds.backend.files = 0;
      console.log('   ⚠️  Backend build: Erreur de lecture');
    }
  } else {
    console.log('   ❌ Backend build: Non trouvé');
  }
  
  // Vérifier build frontend
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  builds.frontend = {
    exists: fs.existsSync(frontendDist),
    path: frontendDist
  };
  
  if (builds.frontend.exists) {
    try {
      const files = fs.readdirSync(frontendDist);
      builds.frontend.files = files.length;
      
      // Calculer la taille du bundle
      let totalSize = 0;
      files.forEach(file => {
        const filePath = path.join(frontendDist, file);
        if (fs.statSync(filePath).isFile()) {
          totalSize += fs.statSync(filePath).size;
        }
      });
      
      builds.frontend.size = formatBytes(totalSize);
      console.log(`   ✅ Frontend build: ${files.length} fichiers, ${builds.frontend.size}`);
    } catch (error) {
      builds.frontend.files = 0;
      console.log('   ⚠️  Frontend build: Erreur de lecture');
    }
  } else {
    console.log('   ❌ Frontend build: Non trouvé');
  }
  
  return builds;
}

function checkOptimizationFiles() {
  const optimizations = [
    {
      name: 'Performance Optimizer',
      path: 'frontend/src/utils/performanceOptimizer.ts',
      category: 'Frontend'
    },
    {
      name: 'Performance Monitor',
      path: 'frontend/src/components/PerformanceMonitor.tsx',
      category: 'Frontend'
    },
    {
      name: 'Lazy Loading Hook',
      path: 'frontend/src/hooks/useLazyLoading.ts',
      category: 'Frontend'
    },
    {
      name: 'Database Optimization Service',
      path: 'backend/src/services/DatabaseOptimizationService.ts',
      category: 'Backend'
    },
    {
      name: 'Performance Test Suite',
      path: 'backend/tests/performance/performance-suite.ts',
      category: 'Backend'
    },
    {
      name: 'Load Test Suite',
      path: 'backend/tests/load/load-test.ts',
      category: 'Backend'
    }
  ];
  
  const results = {
    implemented: 0,
    total: optimizations.length,
    details: {}
  };
  
  optimizations.forEach(opt => {
    const fullPath = path.join(__dirname, '..', opt.path);
    const exists = fs.existsSync(fullPath);
    
    results.details[opt.name] = {
      exists,
      path: opt.path,
      category: opt.category
    };
    
    if (exists) {
      results.implemented++;
      console.log(`   ✅ ${opt.name} (${opt.category})`);
    } else {
      console.log(`   ❌ ${opt.name} (${opt.category})`);
    }
  });
  
  const percentage = Math.round((results.implemented / results.total) * 100);
  console.log(`\n   📊 Optimisations: ${results.implemented}/${results.total} (${percentage}%)`);
  
  return results;
}

function generateRecommendations(results) {
  const recommendations = [];
  
  // Recommandations environnement
  if (results.environment.node === 'Non disponible') {
    recommendations.push('Installer Node.js pour exécuter l\'application');
  }
  
  if (results.environment.npm === 'Non disponible') {
    recommendations.push('Installer npm pour la gestion des dépendances');
  }
  
  // Recommandations builds
  if (!results.builds.backend.exists) {
    recommendations.push('Exécuter "npm run build" dans le dossier backend');
  }
  
  if (!results.builds.frontend.exists) {
    recommendations.push('Exécuter "npm run build" dans le dossier frontend');
  }
  
  // Recommandations optimisations
  const optimizationRate = (results.files.implemented / results.files.total) * 100;
  
  if (optimizationRate < 80) {
    recommendations.push('Implémenter les optimisations de performance manquantes');
  }
  
  if (optimizationRate >= 80 && optimizationRate < 100) {
    recommendations.push('Finaliser les dernières optimisations pour atteindre 100%');
  }
  
  if (optimizationRate === 100) {
    recommendations.push('Toutes les optimisations sont implémentées - Tester en production');
  }
  
  // Recommandations générales
  recommendations.push('Configurer le monitoring en production');
  recommendations.push('Mettre en place des tests de performance réguliers');
  
  return recommendations;
}

function generateSimpleReport(results) {
  console.log('\n📊 RAPPORT DE VÉRIFICATION PERFORMANCE');
  console.log('='.repeat(50));
  
  // Environnement
  console.log('\n🔧 Environnement:');
  console.log(`   Node.js: ${results.environment.node}`);
  console.log(`   npm: ${results.environment.npm}`);
  
  // Builds
  console.log('\n🔨 Builds:');
  console.log(`   Backend: ${results.builds.backend.exists ? '✅ Disponible' : '❌ Manquant'}`);
  if (results.builds.backend.files) {
    console.log(`            ${results.builds.backend.files} fichiers`);
  }
  
  console.log(`   Frontend: ${results.builds.frontend.exists ? '✅ Disponible' : '❌ Manquant'}`);
  if (results.builds.frontend.files) {
    console.log(`             ${results.builds.frontend.files} fichiers, ${results.builds.frontend.size || 'N/A'}`);
  }
  
  // Optimisations
  console.log('\n⚡ Optimisations:');
  const percentage = Math.round((results.files.implemented / results.files.total) * 100);
  console.log(`   Implémentées: ${results.files.implemented}/${results.files.total} (${percentage}%)`);
  
  // Score global
  let score = 0;
  if (results.environment.node !== 'Non disponible') score += 20;
  if (results.environment.npm !== 'Non disponible') score += 20;
  if (results.builds.backend.exists) score += 20;
  if (results.builds.frontend.exists) score += 20;
  score += Math.round(percentage * 0.2); // 20% max pour les optimisations
  
  console.log(`\n🎯 Score Global: ${score}/100`);
  
  // Recommandations
  console.log('\n💡 Recommandations:');
  results.recommendations.forEach(rec => {
    console.log(`   • ${rec}`);
  });
  
  // Sauvegarde du rapport
  const reportPath = path.join(__dirname, '..', 'reports', 'simple-performance-check.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Exécution si appelé directement
if (require.main === module) {
  simplePerformanceCheck().catch(console.error);
}

module.exports = { simplePerformanceCheck };
