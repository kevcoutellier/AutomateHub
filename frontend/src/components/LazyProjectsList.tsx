import React, { useState } from 'react';
import { useProjectsLazyLoading } from '../hooks/useLazyLoading';
import { Calendar, DollarSign, User, Clock, Filter, Search, TrendingUp } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  budget: {
    amount: number;
    currency: string;
  };
  deadline: string;
  createdAt: string;
  clientId: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  expertId?: {
    name: string;
    title: string;
    profileImage?: string;
    averageRating: number;
  };
  progress: number;
  milestones: Array<{
    title: string;
    completed: boolean;
    dueDate: string;
  }>;
}

interface ProjectFilters {
  search?: string;
  status?: string;
  minBudget?: number;
  maxBudget?: number;
  dateRange?: string;
}

const LazyProjectsList: React.FC<{ userRole?: 'client' | 'expert' | 'admin' }> = ({ 
  userRole = 'admin' 
}) => {
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    items: projects,
    loading,
    hasMore,
    error,
    total,
    loadingRef,
    refresh
  } = useProjectsLazyLoading(filters);

  // Gestion de la recherche avec debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setTimeout(() => {
      setFilters(prev => ({ ...prev, search: query }));
    }, 300);
  };

  // Gestion des filtres
  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset des filtres
  const resetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Fonction utilitaire pour le statut
  const getStatusInfo = (status: string) => {
    const statusMap = {
      planning: { label: 'Planification', color: 'bg-yellow-100 text-yellow-800', icon: '📋' },
      'in-progress': { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: '⚡' },
      review: { label: 'En révision', color: 'bg-purple-100 text-purple-800', icon: '👁️' },
      completed: { label: 'Terminé', color: 'bg-green-100 text-green-800', icon: '✅' },
      cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: '❌' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.planning;
  };

  // Fonction pour calculer les jours restants
  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const statusInfo = getStatusInfo(project.status);
    const daysRemaining = getDaysRemaining(project.deadline);
    const completedMilestones = project.milestones.filter(m => m.completed).length;

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
        {/* Header du projet */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {project.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {project.description}
            </p>
          </div>
          
          <div className="ml-4">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              <span>{statusInfo.icon}</span>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Informations du projet */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-600">
              {project.budget.amount.toLocaleString()}€
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {daysRemaining > 0 ? `${daysRemaining}j restants` : 
               daysRemaining === 0 ? 'Échéance aujourd\'hui' : 
               `${Math.abs(daysRemaining)}j de retard`}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>{project.progress}% terminé</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{completedMilestones}/{project.milestones.length} jalons</span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progression</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Client */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {project.clientId.profileImage ? (
                  <img 
                    src={project.clientId.profileImage} 
                    alt="Client"
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {project.clientId.firstName} {project.clientId.lastName}
                </p>
                <p className="text-gray-500">Client</p>
              </div>
            </div>

            {/* Expert */}
            {project.expertId && (
              <>
                <div className="text-gray-400">→</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    {project.expertId.profileImage ? (
                      <img 
                        src={project.expertId.profileImage} 
                        alt="Expert"
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {project.expertId.name}
                    </p>
                    <p className="text-gray-500">
                      ⭐ {project.expertId.averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Voir les détails
          </button>
          
          {userRole === 'client' && project.status === 'planning' && (
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Modifier
            </button>
          )}
          
          {userRole === 'expert' && project.status === 'in-progress' && (
            <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm">
              Mettre à jour
            </button>
          )}
          
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Messages
          </button>
        </div>
      </div>
    );
  };

  const FilterPanel: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
          >
            <option value="">Tous les statuts</option>
            <option value="planning">Planification</option>
            <option value="in-progress">En cours</option>
            <option value="review">En révision</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget minimum (€)
          </label>
          <input
            type="number"
            placeholder="Ex: 1000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) => handleFilterChange('minBudget', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget maximum (€)
          </label>
          <input
            type="number"
            placeholder="Ex: 10000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) => handleFilterChange('maxBudget', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            onChange={(e) => handleFilterChange('dateRange', e.target.value || undefined)}
          >
            <option value="">Toutes les périodes</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
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
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded mb-3 w-full"></div>
        </div>
        <div className="h-6 bg-gray-300 rounded-full w-20"></div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded w-16"></div>
        ))}
      </div>
      
      <div className="h-2 bg-gray-300 rounded mb-4"></div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      </div>
      
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <div className="flex-1 h-8 bg-gray-300 rounded"></div>
        <div className="w-20 h-8 bg-gray-300 rounded"></div>
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
              {userRole === 'client' ? 'Mes projets' : 
               userRole === 'expert' ? 'Projets assignés' : 
               'Tous les projets'}
            </h1>
            <p className="text-gray-600">
              {total > 0 && `${total} projets au total`}
            </p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
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
            
            {userRole === 'client' && (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Nouveau projet
              </button>
            )}
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

      {/* Liste des projets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
        
        {/* Skeletons de chargement */}
        {loading && (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
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
          <span className="ml-2 text-gray-600">Chargement des projets...</span>
        </div>
      )}

      {/* Message de fin */}
      {!hasMore && projects.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            Vous avez vu tous les projets ({total} au total)
          </p>
        </div>
      )}

      {/* Message aucun résultat */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun projet trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            {userRole === 'client' 
              ? "Vous n'avez pas encore créé de projet"
              : "Aucun projet ne correspond à vos critères"
            }
          </p>
          {userRole === 'client' ? (
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Créer votre premier projet
            </button>
          ) : (
            <button 
              onClick={resetFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LazyProjectsList;
