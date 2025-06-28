import React, { useState } from 'react';
import { Bell, Mail, Smartphone, MessageSquare, Calendar, DollarSign, Save } from 'lucide-react';
import { apiClient } from '../../services/api';

interface NotificationSettingsProps {
  user: any;
  onUpdate: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState({
    email: {
      projectUpdates: user.notifications?.email?.projectUpdates ?? true,
      messages: user.notifications?.email?.messages ?? true,
      milestones: user.notifications?.email?.milestones ?? true,
      payments: user.notifications?.email?.payments ?? true,
      marketing: user.notifications?.email?.marketing ?? false,
      security: user.notifications?.email?.security ?? true
    },
    push: {
      projectUpdates: user.notifications?.push?.projectUpdates ?? true,
      messages: user.notifications?.push?.messages ?? true,
      milestones: user.notifications?.push?.milestones ?? false,
      payments: user.notifications?.push?.payments ?? true,
      marketing: user.notifications?.push?.marketing ?? false,
      security: user.notifications?.push?.security ?? true
    },
    frequency: user.notifications?.frequency ?? 'immediate'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiClient.updateNotificationSettings(settings);
      setMessage({ type: 'success', text: 'Préférences de notification mises à jour' });
      onUpdate();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des préférences' });
      console.error('Error updating notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEmailSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }));
  };

  const updatePushSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      push: { ...prev.push, [key]: value }
    }));
  };

  const notificationTypes = [
    {
      key: 'projectUpdates',
      label: 'Mises à jour de projet',
      description: 'Notifications sur les changements de statut et progression',
      icon: Calendar
    },
    {
      key: 'messages',
      label: 'Nouveaux messages',
      description: 'Messages reçus dans vos projets',
      icon: MessageSquare
    },
    {
      key: 'milestones',
      label: 'Jalons et échéances',
      description: 'Rappels pour les jalons et dates importantes',
      icon: Calendar
    },
    {
      key: 'payments',
      label: 'Paiements et facturation',
      description: 'Notifications de paiement et factures',
      icon: DollarSign
    },
    {
      key: 'marketing',
      label: 'Marketing et promotions',
      description: 'Offres spéciales et nouvelles fonctionnalités',
      icon: Bell
    },
    {
      key: 'security',
      label: 'Sécurité',
      description: 'Alertes de sécurité et connexions suspectes',
      icon: Bell
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">Gérez vos préférences de notification</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Frequency Settings */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fréquence des notifications</h3>
          <div className="space-y-3">
            {[
              { value: 'immediate', label: 'Immédiate', description: 'Recevoir les notifications dès qu\'elles arrivent' },
              { value: 'hourly', label: 'Toutes les heures', description: 'Regrouper les notifications par heure' },
              { value: 'daily', label: 'Quotidienne', description: 'Résumé quotidien des notifications' },
              { value: 'weekly', label: 'Hebdomadaire', description: 'Résumé hebdomadaire des notifications' }
            ].map((option) => (
              <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={settings.frequency === option.value}
                  onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value }))}
                  className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Mail className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notifications par email</h3>
          </div>
          
          <div className="space-y-4">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <type.icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => updateEmailSetting(type.key, !settings.email[type.key as keyof typeof settings.email])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.email[type.key as keyof typeof settings.email] ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.email[type.key as keyof typeof settings.email] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notifications push</h3>
          </div>
          
          <div className="space-y-4">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <type.icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => updatePushSetting(type.key, !settings.push[type.key as keyof typeof settings.push])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.push[type.key as keyof typeof settings.push] ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.push[type.key as keyof typeof settings.push] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                Object.keys(settings.email).forEach(key => {
                  updateEmailSetting(key, true);
                });
                Object.keys(settings.push).forEach(key => {
                  updatePushSetting(key, true);
                });
              }}
              className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 text-left"
            >
              <div className="font-medium text-gray-900">Activer toutes les notifications</div>
              <div className="text-sm text-gray-600">Recevoir toutes les notifications disponibles</div>
            </button>
            
            <button
              onClick={() => {
                Object.keys(settings.email).forEach(key => {
                  if (key !== 'security' && key !== 'payments') {
                    updateEmailSetting(key, false);
                  }
                });
                Object.keys(settings.push).forEach(key => {
                  if (key !== 'security' && key !== 'payments') {
                    updatePushSetting(key, false);
                  }
                });
              }}
              className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 text-left"
            >
              <div className="font-medium text-gray-900">Mode essentiel</div>
              <div className="text-sm text-gray-600">Seulement les notifications importantes</div>
            </button>
          </div>
        </div>

        {/* Notification Preview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu des notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-white rounded-lg border">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Nouveau message de Jean Dupont</div>
                <div className="text-sm text-gray-600">Il y a 5 minutes • Projet: Développement App Mobile</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-white rounded-lg border">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Jalon terminé: Phase de conception</div>
                <div className="text-sm text-gray-600">Il y a 2 heures • Projet: Site E-commerce</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-white rounded-lg border">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Paiement reçu: 2,500€</div>
                <div className="text-sm text-gray-600">Il y a 1 jour • Facture #INV-2024-001</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
