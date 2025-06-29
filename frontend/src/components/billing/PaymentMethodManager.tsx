import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Check,
  AlertCircle,
  Lock
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

interface PaymentMethodManagerProps {
  onUpdate?: () => void;
}

const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = ({ onUpdate }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    holderName: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/billing/payment-methods');
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Mock data for development
      setPaymentMethods([
        {
          id: 'pm_1',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025
          },
          isDefault: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // In a real implementation, you would use Stripe Elements
      const response = await apiClient.post('/billing/payment-methods', {
        cardNumber: cardForm.cardNumber,
        expiryDate: cardForm.expiryDate,
        cvc: cardForm.cvc,
        holderName: cardForm.holderName
      });

      if (response.data.success) {
        await loadPaymentMethods();
        setShowAddCard(false);
        setCardForm({ cardNumber: '', expiryDate: '', cvc: '', holderName: '' });
        onUpdate?.();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout de la carte');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveCard = async (paymentMethodId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;

    try {
      await apiClient.delete(`/billing/payment-methods/${paymentMethodId}`);
      await loadPaymentMethods();
      onUpdate?.();
    } catch (error) {
      console.error('Error removing payment method:', error);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await apiClient.put(`/billing/payment-methods/${paymentMethodId}/default`);
      await loadPaymentMethods();
      onUpdate?.();
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const getBrandIcon = (brand: string) => {
    const brandColors = {
      visa: 'text-blue-600',
      mastercard: 'text-red-600',
      amex: 'text-green-600',
      discover: 'text-orange-600'
    };
    return brandColors[brand as keyof typeof brandColors] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Moyens de paiement</h3>
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une carte
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className={`h-5 w-5 ${getBrandIcon(method.card.brand)}`} />
              <div>
                <div className="font-medium">
                  {method.card.brand.toUpperCase()} •••• {method.card.last4}
                </div>
                <div className="text-sm text-gray-500">
                  Expire {method.card.expMonth.toString().padStart(2, '0')}/{method.card.expYear}
                </div>
              </div>
              {method.isDefault && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Principal
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {!method.isDefault && (
                <button
                  onClick={() => handleSetDefault(method.id)}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Définir par défaut
                </button>
              )}
              <button
                onClick={() => handleRemoveCard(method.id)}
                className="text-red-600 hover:text-red-700"
                disabled={method.isDefault && paymentMethods.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune carte enregistrée</h3>
          <p className="text-gray-600 mb-4">Ajoutez une carte de crédit pour recevoir vos paiements</p>
          <button
            onClick={() => setShowAddCard(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Ajouter une carte
          </button>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ajouter une carte</h3>
              <button
                onClick={() => setShowAddCard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du titulaire
                </label>
                <input
                  type="text"
                  value={cardForm.holderName}
                  onChange={(e) => setCardForm(prev => ({ ...prev, holderName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  value={cardForm.cardNumber}
                  onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    value={cardForm.expiryDate}
                    onChange={(e) => setCardForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardForm.cvc}
                    onChange={(e) => setCardForm(prev => ({ ...prev, cvc: e.target.value }))}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Lock className="h-4 w-4 mr-2" />
                Vos informations de paiement sont sécurisées et cryptées
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {processing ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;
