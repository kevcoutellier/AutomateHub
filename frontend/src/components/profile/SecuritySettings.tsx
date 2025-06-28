import React, { useState } from 'react';
import { 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface SecuritySettingsProps {
  user: any;
  onUpdate: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user, onUpdate }) => {
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.twoFactorEnabled || false);
  const [sessions, setSessions] = useState([
    {
      id: '1',
      device: 'Chrome sur Windows',
      location: 'Paris, France',
      lastActive: '2024-01-15T10:30:00Z',
      current: true
    },
    {
      id: '2',
      device: 'Safari sur iPhone',
      location: 'Paris, France',
      lastActive: '2024-01-14T15:45:00Z',
      current: false
    }
  ]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    try {
      setLoading(true);
      await apiClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onUpdate();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du mot de passe' });
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTwoFactor = async () => {
    try {
      // TODO: Implement 2FA toggle API call
      setTwoFactorEnabled(!twoFactorEnabled);
      setMessage({ 
        type: 'success', 
        text: twoFactorEnabled ? 
          'Authentification à deux facteurs désactivée' : 
          'Authentification à deux facteurs activée'
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la modification de l\'authentification à deux facteurs' });
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      // TODO: Implement session revocation API call
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setMessage({ type: 'success', text: 'Session révoquée avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la révocation de la session' });
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return { text: 'Très faible', color: 'text-red-600' };
      case 2: return { text: 'Faible', color: 'text-orange-600' };
      case 3: return { text: 'Moyen', color: 'text-yellow-600' };
      case 4: return { text: 'Fort', color: 'text-blue-600' };
      case 5: return { text: 'Très fort', color: 'text-green-600' };
      default: return { text: '', color: '' };
    }
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sécurité</h2>
          <p className="text-gray-600">Gérez la sécurité de votre compte</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Password Change */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Lock className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Changer le mot de passe</h3>
          </div>
          
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
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength <= 1 ? 'bg-red-500' :
                          passwordStrength <= 2 ? 'bg-orange-500' :
                          passwordStrength <= 3 ? 'bg-yellow-500' :
                          passwordStrength <= 4 ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${strengthInfo.color}`}>
                      {strengthInfo.text}
                    </span>
                  </div>
                  <ul className="mt-2 text-xs text-gray-600 space-y-1">
                    <li className={passwordForm.newPassword.length >= 8 ? 'text-green-600' : ''}>
                      ✓ Au moins 8 caractères
                    </li>
                    <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                      ✓ Une lettre majuscule
                    </li>
                    <li className={/[a-z]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                      ✓ Une lettre minuscule
                    </li>
                    <li className={/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                      ✓ Un chiffre
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                      ✓ Un caractère spécial
                    </li>
                  </ul>
                </div>
              )}
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
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordForm.newPassword !== passwordForm.confirmPassword}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Authentification à deux facteurs</h3>
                <p className="text-sm text-gray-600">Ajoutez une couche de sécurité supplémentaire</p>
              </div>
            </div>
            <button
              onClick={toggleTwoFactor}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {twoFactorEnabled ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">Authentification à deux facteurs activée</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">Authentification à deux facteurs désactivée</span>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Key className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Sessions actives</h3>
          </div>
          
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${session.current ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{session.device}</p>
                    <p className="text-sm text-gray-600">{session.location}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {session.current ? 'Session actuelle' : 
                         `Dernière activité: ${new Date(session.lastActive).toLocaleDateString('fr-FR')}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {!session.current && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Révoquer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Recommandations de sécurité</h3>
          </div>
          
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Utilisez un mot de passe unique et fort
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Activez l'authentification à deux facteurs
            </li>
            <li className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              Vérifiez régulièrement vos sessions actives
            </li>
            <li className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              Ne partagez jamais vos identifiants
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
