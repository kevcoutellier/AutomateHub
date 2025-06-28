import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  FileText, 
  Camera,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiClient } from '../services/api';
import ProfileSettings from '../components/profile/ProfileSettings';
import SecuritySettings from '../components/profile/SecuritySettings';
import NotificationSettings from '../components/profile/NotificationSettings';
import BillingSettings from '../components/profile/BillingSettings';
import PrivacySettings from '../components/profile/PrivacySettings';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'billing' | 'privacy'>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCurrentUser();
      setUser(response.data.user);
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = () => {
    loadUserData();
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User, description: 'Informations personnelles et photo' },
    { id: 'security', label: 'Sécurité', icon: Shield, description: 'Mot de passe et authentification' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Préférences de notification' },
    { id: 'billing', label: 'Facturation', icon: CreditCard, description: 'Moyens de paiement et factures' },
    { id: 'privacy', label: 'Confidentialité', icon: FileText, description: 'Paramètres de confidentialité' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Utilisateur non trouvé'}</div>
          <button
            onClick={loadUserData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img 
                    className="h-16 w-16 rounded-full object-cover" 
                    src={user.avatar} 
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-indigo-500 flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'expert' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'client' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'expert' ? 'Expert' : 
                     user.role === 'client' ? 'Client' : 
                     user.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 mr-3 ${
                    activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Profil complété</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {user.profileCompletion || 75}%
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Dernière connexion</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {user.lastLoginAt ? 
                      new Date(user.lastLoginAt).toLocaleDateString('fr-FR') : 
                      'Jamais'
                    }
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Statut du compte</dt>
                  <dd className="text-sm font-medium text-green-600">Actif</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {activeTab === 'profile' && (
                <ProfileSettings user={user} onUpdate={handleUserUpdate} />
              )}
              
              {activeTab === 'security' && (
                <SecuritySettings user={user} onUpdate={handleUserUpdate} />
              )}
              
              {activeTab === 'notifications' && (
                <NotificationSettings user={user} onUpdate={handleUserUpdate} />
              )}
              
              {activeTab === 'billing' && (
                <BillingSettings user={user} onUpdate={handleUserUpdate} />
              )}
              
              {activeTab === 'privacy' && (
                <PrivacySettings user={user} onUpdate={handleUserUpdate} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
