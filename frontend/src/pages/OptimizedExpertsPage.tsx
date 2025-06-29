import React from 'react';
import SEOHead from '../components/SEOHead';
import ResponsiveHeader from '../components/ResponsiveHeader';
import LazyExpertsList from '../components/LazyExpertsList';
import { getExpertsPageSEO } from '../utils/seoUtils';
import '../styles/responsive.css';

interface OptimizedExpertsPageProps {
  filters?: {
    specialties?: string[];
    location?: string;
    search?: string;
  };
}

const OptimizedExpertsPage: React.FC<OptimizedExpertsPageProps> = ({ filters = {} }) => {
  // Génération des métadonnées SEO
  const seoData = getExpertsPageSEO(filters);

  return (
    <>
      {/* SEO Head avec métadonnées optimisées */}
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        type={seoData.type}
        structuredData={seoData.structuredData}
      />

      {/* Header responsive */}
      <ResponsiveHeader />

      {/* Contenu principal avec classes responsive */}
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section Responsive */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="container-responsive spacing-mobile">
            <div className="text-center">
              <h1 className="heading-1 text-white mb-4">
                {filters.specialties?.[0] 
                  ? `Experts en ${filters.specialties[0]}` 
                  : 'Découvrez nos experts qualifiés'
                }
              </h1>
              <p className="text-responsive text-blue-100 max-w-2xl mx-auto">
                {filters.location
                  ? `Trouvez les meilleurs experts ${filters.specialties?.[0] ? `en ${filters.specialties[0]}` : ''} à ${filters.location}`
                  : 'Parcourez notre sélection d\'experts dans tous les domaines pour réaliser vos projets'
                }
              </p>
            </div>

            {/* Stats Section Mobile */}
            <div className="stats-mobile mt-8">
              <div className="stat-card-mobile">
                <span className="stat-value">500+</span>
                <span className="stat-label">Experts vérifiés</span>
              </div>
              <div className="stat-card-mobile">
                <span className="stat-value">4.8/5</span>
                <span className="stat-label">Note moyenne</span>
              </div>
              <div className="stat-card-mobile">
                <span className="stat-value">1000+</span>
                <span className="stat-label">Projets réalisés</span>
              </div>
              <div className="stat-card-mobile">
                <span className="stat-value">24h</span>
                <span className="stat-label">Temps de réponse</span>
              </div>
            </div>
          </div>
        </section>

        {/* Liste des experts avec lazy loading */}
        <section className="py-8">
          <LazyExpertsList />
        </section>

        {/* Section d'aide responsive */}
        <section className="bg-white border-t border-gray-200">
          <div className="container-responsive spacing-mobile">
            <div className="text-center">
              <h2 className="heading-2 mb-4">
                Besoin d'aide pour choisir ?
              </h2>
              <p className="text-responsive mb-6">
                Notre équipe est là pour vous accompagner dans le choix de l'expert idéal pour votre projet.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-mobile btn-primary">
                  Parler à un conseiller
                </button>
                <button className="btn-mobile btn-secondary">
                  Voir le guide
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer responsive */}
      <footer className="bg-gray-900 text-white">
        <div className="container-responsive spacing-mobile">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="heading-3 text-white mb-4">AutomateHub</h3>
              <p className="text-responsive text-gray-300">
                La plateforme de référence pour trouver et collaborer avec les meilleurs experts.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Experts</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="/experts/category/développement-web" className="hover:text-white">Développement Web</a></li>
                <li><a href="/experts/category/marketing-digital" className="hover:text-white">Marketing Digital</a></li>
                <li><a href="/experts/category/design-ui-ux" className="hover:text-white">Design UI/UX</a></li>
                <li><a href="/experts/category/data-science" className="hover:text-white">Data Science</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="/about" className="hover:text-white">À propos</a></li>
                <li><a href="/how-it-works" className="hover:text-white">Comment ça marche</a></li>
                <li><a href="/pricing" className="hover:text-white">Tarifs</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="/help" className="hover:text-white">Centre d'aide</a></li>
                <li><a href="/terms" className="hover:text-white">Conditions d'utilisation</a></li>
                <li><a href="/privacy" className="hover:text-white">Confidentialité</a></li>
                <li><a href="/security" className="hover:text-white">Sécurité</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AutomateHub. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default OptimizedExpertsPage;
