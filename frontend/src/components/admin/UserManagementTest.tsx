import React from 'react';
import { UserCheck, UserX, Mail } from 'lucide-react';

const UserManagementTest: React.FC = () => {
  console.log('UserManagementTest component rendering...');

  const testUsers = [
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
    }
  ];

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

  return (
    <div className="p-6">
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
        <h3 className="text-lg font-medium text-green-800">✅ Test de l'onglet Utilisateurs</h3>
        <p className="text-green-700 text-sm mt-1">
          Ce composant de test fonctionne ! L'erreur de rendu a été corrigée.
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Inviter un utilisateur
        </button>
      </div>

      {/* Table des utilisateurs */}
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
            {testUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
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
                  {user.projectsCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => console.log('Approve user', user.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Approuver"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => console.log('Suspend user', user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Suspendre"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => console.log('Contact user', user.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Contacter"
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
    </div>
  );
};

export default UserManagementTest;
