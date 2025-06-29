import React, { useState } from 'react';
import { useExpertsLazyLoading } from '../hooks/useLazyLoading';
import { Star, MapPin, Clock, Filter, Search } from 'lucide-react';

interface Expert {
  _id: string;
  name: string;
  title: string;
  specialties: string[];
  industries: string[];
  hourlyRate: {
    min?: number;
    max?: number;
    amount?: number;
  };
  location: string;
  availability: string;
  profileImage?: string;
  averageRating: number;
  reviewCount: number;
  projectsCompleted: number;
  responseTime: string;
  featured: boolean;
}

interface ExpertFilters {
  search?: string;
  specialties?: string[];
  industries?: string[];
  minRating?: number;
  maxRate?: number;
  location?: string;
  availability?: string;
}

const LazyExpertsList: React.FC = () => {
  const [filters, setFilters] = useState<ExpertFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    items: experts,
    loading,
    hasMore,
    error,
    total,
    loadingRef,
    refresh
  } = useExpertsLazyLoading(filters);

  // Gestion de la recherche avec debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setTimeout(() => {
      setFilters(prev => ({ ...prev, search: query }));
    }, 300);
  };

  // Gestion des filtres
  const handleFilterChange = (key: keyof ExpertFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset des filtres
  const resetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const ExpertCard: React.FC<{ expert: Expert }> = ({ expert }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
      {expert.featured && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full inline-block mb-3">
          ⭐ Expert Vedette
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
          {expert.profileImage ? (
            <img 
              src={expert.profileImage} 
              alt={expert.name}
              className="w-full h-full rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            expert.name.charAt(0)
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {expert.name}
          </h3>
          <p className="text-gray-600 mb-2">{expert.title}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{expert.averageRating.toFixed(1)}</span>
              <span>({expert.reviewCount} avis)</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{expert.location}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{expert.responseTime}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {expert.specialties.slice(0, 3).map((specialty, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {specialty}
              </span>
            ))}
            {expert.specialties.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{expert.specialties.length - 3} autres
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-green-600">
              {expert.hourlyRate.amount ? (
                `${expert.hourlyRate.amount}€/h`
              ) : (
                `${expert.hourlyRate.min}€ - ${expert.hourlyRate.max}€/h`
              )}
            </div>
            
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Voir le profil
              </button>
              <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                Contacter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FilterPanel: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spécialités
          </label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) => handleFilterChange('specialties', e.target.value ? [e.target.value] : [])}
          >
            <option value="">Toutes les spécialités</option>
            <option value="Développement Web">Développement Web</option>
            <option value="Design UI/UX">Design UI/UX</option>
            <option value="Marketing Digital">Marketing Digital</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note minimale
          </label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
          >
            <option value="">Toutes les notes</option>
            <option value="4.5">4.5+ étoiles</option>
            <option value="4.0">4.0+ étoiles</option>
            <option value="3.5">3.5+ étoiles</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tarif maximum (€/h)
          </label>
          <input
            type="number"
            placeholder="Ex: 100"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) => handleFilterChange('maxRate', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Disponibilité
          </label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) => handleFilterChange('availability', e.target.value || undefined)}
          >
            <option value="">Toutes disponibilités</option>
            <option value="available">Disponible</option>
            <option value="busy">Occupé</option>
            <option value="unavailable">Indisponible</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={resetFilters}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Réinitialiser
        </button>
        <button 
          onClick={() => setShowFilters(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Appliquer
        </button>
      </div>
    </div>
  );

  const LoadingSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded mb-3 w-1/2"></div>
          <div className="flex gap-2 mb-3">
            <div className="h-6 bg-gray-300 rounded-full w-16"></div>
            <div className="h-6 bg-gray-300 rounded-full w-20"></div>
            <div className="h-6 bg-gray-300 rounded-full w-18"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-300 rounded w-24"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-300 rounded w-20"></div>
              <div className="h-8 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header avec recherche */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Découvrez nos experts
            </h1>
            <p className="text-gray-600">
              {total > 0 && `${total} experts disponibles`}
            </p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un expert..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtres */}
      {showFilters && <FilterPanel />}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={refresh}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Liste des experts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {experts.map((expert) => (
          <ExpertCard key={expert._id} expert={expert} />
        ))}
        
        {/* Skeletons de chargement */}
        {loading && (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>

      {/* Indicateur de chargement pour l'intersection observer */}
      {hasMore && (
        <div 
          ref={loadingRef}
          className="flex justify-center items-center py-8"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement des experts...</span>
        </div>
      )}

      {/* Message de fin */}
      {!hasMore && experts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            Vous avez vu tous les experts disponibles ({total} au total)
          </p>
        </div>
      )}

      {/* Message aucun résultat */}
      {!loading && experts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun expert trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <button 
            onClick={resetFilters}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
};

export default LazyExpertsList;
