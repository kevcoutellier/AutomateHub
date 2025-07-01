import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Mail } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  joinDate?: string;
  lastLogin?: string;
  projectsCount?: number;
}

// Fonction pour valider et nettoyer les données utilisateur
const validateUser = (user: any): User => {
  return {
    id: user.id || Math.random().toString(),
    name: user.name || user.username || 'Utilisateur',
    email: user.email || 'email@example.com',
    role: user.role || 'client',
    status: user.status || 'active',
    joinDate: user.joinDate || user.createdAt || new Date().toISOString().split('T')[0],
    lastLogin: user.lastLogin || user.lastActivity || new Date().toISOString().split('T')[0],
    projectsCount: typeof user.projectsCount === 'number' ? user.projectsCount : 0
  };
};

const UserManagement: React.FC = () => {
  console.log('UserManagement component loading...');
  
  // Initialiser avec des données mock pour éviter la page blanche
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean@example.com',
      role: 'client',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-01-20',
      projectsCount: 3
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie@example.com',
      role: 'expert',
      status: 'pending',
      joinDate: '2024-01-18',
      lastLogin: '2024-01-19',
      projectsCount: 0
    },
    {
      id: '3',
      name: 'Sophie Durand',
      email: 'sophie@example.com',
      role: 'expert',
      status: 'active',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-21',
      projectsCount: 5
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'local' | 'api'>('local');

  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });

  const handleUserAction = async (userId: string, action: string) => {
    try {
      console.log(`Performing action ${action} on user ${userId}`);
      
      if (!userId) {
        setError('ID utilisateur manquant');
        return;
      }
      
      if (action === 'suspend') {
        await adminApi.suspendUser(userId, 'Action administrative');
      } else if (action === 'approve') {
        await adminApi.activateUser(userId);
      } else if (action === 'contact') {
        console.log(`Contact user ${userId}`);
        // TODO: Implémenter la fonctionnalité de contact
        return;
      }
      
      // Recharger les données après l'action
      await loadUsers();
    } catch (error) {
      console.error(`Error performing ${action} on user ${userId}:`, error);
      setError(`Erreur lors de l'action ${action}`);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading users with filters:', filters);
      
      // Timeout pour éviter les blocages
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      );
      
      const apiPromise = adminApi.getUsers({
        role: filters.role !== 'all' ? filters.role : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
        limit: 50
      });
      
      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log('API Response:', response);
      
      // Gérer différents formats de réponse
      if (response && response.success && response.data) {
        const newUsers = response.data.users || response.data || [];
        if (Array.isArray(newUsers) && newUsers.length > 0) {
          const validatedUsers = newUsers.map(validateUser);
          setUsers(validatedUsers);
          setDataSource('api');
          setError(null);
          return;
        }
      } else if (response && Array.isArray(response) && response.length > 0) {
        const validatedUsers = response.map(validateUser);
        setUsers(validatedUsers);
        setDataSource('api');
        setError(null);
        return;
      } else if (response && response.users && Array.isArray(response.users)) {
        const validatedUsers = response.users.map(validateUser);
        setUsers(validatedUsers);
        setDataSource('api');
        setError(null);
        return;
      }
      
      // Si aucune donnée valide, garder les données existantes
      console.log('No valid data from API, keeping existing users');
      
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Impossible de charger les données depuis le serveur. Affichage des données locales.');
      // En cas d'erreur, on garde les données mock déjà initialisées
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger les données depuis l'API après le premier rendu
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 500); // Délai pour permettre l'affichage initial
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  useEffect(() => {
    // Recharger quand les filtres changent
    if (filters.role !== 'all' || filters.status !== 'all' || filters.search) {
      loadUsers();
    }
  }, [filters]);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {status === 'active' ? 'Actif' :
         status === 'pending' ? 'En attente' :
         status === 'suspended' ? 'Suspendu' :
         'Inactif'}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      client: 'bg-blue-100 text-blue-800',
      expert: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[role as keyof typeof styles]}`}>
        {role === 'client' ? 'Client' :
         role === 'expert' ? 'Expert' :
         'Admin'}
      </span>
    );
  };

  // Debug: Toujours afficher le contenu, même en cas de chargement
  console.log('UserManagement render - users:', users.length, 'loading:', loading, 'error:', error);

  if (error && users.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadUsers}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Toujours rendre le contenu avec gestion d'erreur
  try {
    return (
      <div className="p-6">
      {loading && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 text-sm">Chargement en cours...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}
      
      {dataSource === 'local' && !loading && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 text-sm">
            📊 Affichage des données d'exemple. Les vraies données seront chargées depuis l'API.
          </p>
        </div>
      )}
      
      {dataSource === 'api' && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 text-sm">
            ✅ Données chargées depuis l'API en temps réel.
          </p>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Inviter un utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <select
          value={filters.role}
          onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="expert">Experts</option>
          <option value="admin">Administrateurs</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="pending">En attente</option>
          <option value="suspended">Suspendus</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name || 'Nom non disponible'}</div>
                      <div className="text-sm text-gray-500">{user.email || 'Email non disponible'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.projectsCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => user.id && handleUserAction(user.id, 'approve')}
                      className="text-green-600 hover:text-green-900"
                      title="Approuver"
                      disabled={!user.id}
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => user.id && handleUserAction(user.id, 'suspend')}
                      className="text-red-600 hover:text-red-900"
                      title="Suspendre"
                      disabled={!user.id}
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => user.id && handleUserAction(user.id, 'contact')}
                      className="text-blue-600 hover:text-blue-900"
                      title="Contacter"
                      disabled={!user.id}
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Affichage de 1 à {users.length} sur {users.length} utilisateurs
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
            Précédent
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
            Suivant
          </button>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error rendering UserManagement:', error);
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de rendu</h3>
          <p className="text-red-700">Une erreur s'est produite lors du chargement de la gestion des utilisateurs.</p>
          <p className="text-sm text-red-600 mt-2">Erreur: {error instanceof Error ? error.message : 'Erreur inconnue'}</p>
        </div>
      </div>
    );
  }
};

export default UserManagement;
