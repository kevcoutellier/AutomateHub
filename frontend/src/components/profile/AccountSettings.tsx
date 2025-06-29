import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Mail, 
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface AccountSettingsProps {
  user: any;
  onUpdate: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onUpdate }) => {
  const [activeSection, setActiveSection] = useState<'password' | 'two-factor' | 'sessions' | 'danger'>('password');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.twoFactorEnabled || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setSuccess('Mot de passe modifié avec succès');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    setLoading(true);
    setError(null);

    try {
      if (twoFactorEnabled) {
        await apiClient.post('/auth/disable-2fa');
        setTwoFactorEnabled(false);
        setSuccess('Authentification à deux facteurs désactivée');
      } else {
        const response = await apiClient.post('/auth/enable-2fa');
        // In a real app, you'd show the QR code here
        setTwoFactorEnabled(true);
        setSuccess('Authentification à deux facteurs activée');
      }
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la modification de l\'authentification à deux facteurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Tapez "SUPPRIMER" pour confirmer la suppression de votre compte :');
    if (confirmation !== 'SUPPRIMER') return;

    setLoading(true);
    setError(null);

    try {
      await apiClient.delete('/auth/delete-account');
      // Redirect to login or home page
      window.location.href = '/';
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression du compte');
      setLoading(false);
    }
  };

  const sections = [
    { id: 'password', label: 'Mot de passe', icon: Key },
    { id: 'two-factor', label: 'Authentification 2FA', icon: Shield },
    { id: 'sessions', label: 'Sessions actives', icon: Smartphone },
    { id: 'danger', label: 'Zone de danger', icon: AlertTriangle }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Paramètres de sécurité</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <section.icon className={`h-5 w-5 mr-3 ${
                  activeSection === section.id ? 'text-indigo-500' : 'text-gray-400'
                }`} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeSection === 'password' && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 caractères avec lettres, chiffres et symboles
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'two-factor' && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Authentification à deux facteurs</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className={`h-6 w-6 ${twoFactorEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium text-gray-900">
                      Authentification à deux facteurs
                    </div>
                    <div className="text-sm text-gray-600">
                      {twoFactorEnabled ? 'Activée' : 'Désactivée'} - Sécurisez votre compte avec une couche supplémentaire
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleToggleTwoFactor}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md ${
                    twoFactorEnabled
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-50`}
                >
                  {loading ? 'Modification...' : (twoFactorEnabled ? 'Désactiver' : 'Activer')}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'sessions' && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sessions actives</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Session actuelle</div>
                      <div className="text-sm text-gray-600">Chrome sur Windows • Paris, France</div>
                      <div className="text-xs text-gray-500">Dernière activité: maintenant</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Actuelle
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'danger' && (
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Zone de danger
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Supprimer le compte</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Suppression...' : 'Supprimer mon compte'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
