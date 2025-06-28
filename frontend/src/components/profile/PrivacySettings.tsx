import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Download, Trash2 } from 'lucide-react';

interface PrivacySettingsProps {
  user: any;
  onUpdate: () => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState({
    profileVisibility: user.privacy?.profileVisibility ?? 'public',
    showEmail: user.privacy?.showEmail ?? false,
    showPhone: user.privacy?.showPhone ?? false,
    allowMessages: user.privacy?.allowMessages ?? true,
    dataCollection: user.privacy?.dataCollection ?? true
  });

  const handleSave = async () => {
    // TODO: Implement API call
    console.log('Saving privacy settings:', settings);
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Confidentialité</h2>
        <p className="text-gray-600">Contrôlez la visibilité de vos informations</p>
      </div>

      {/* Profile Visibility */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Visibilité du profil</h3>
        <div className="space-y-3">
          {[
            { value: 'public', label: 'Public', description: 'Visible par tous les utilisateurs' },
            { value: 'clients', label: 'Clients uniquement', description: 'Visible seulement par vos clients' },
            { value: 'private', label: 'Privé', description: 'Visible seulement par vous' }
          ].map((option) => (
            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={settings.profileVisibility === option.value}
                onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                className="mt-1 h-4 w-4 text-indigo-600"
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de contact</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Afficher l'email</div>
              <div className="text-sm text-gray-600">Permettre aux autres de voir votre email</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, showEmail: !prev.showEmail }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showEmail ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.showEmail ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Afficher le téléphone</div>
              <div className="text-sm text-gray-600">Permettre aux autres de voir votre téléphone</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, showPhone: !prev.showPhone }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showPhone ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.showPhone ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gestion des données</h3>
        <div className="space-y-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Télécharger mes données
          </button>
          
          <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer mon compte
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
};

export default PrivacySettings;
