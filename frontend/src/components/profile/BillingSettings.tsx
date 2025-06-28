import React, { useState } from 'react';
import { CreditCard, Download, Plus, Trash2, DollarSign } from 'lucide-react';

interface BillingSettingsProps {
  user: any;
  onUpdate: () => void;
}

const BillingSettings: React.FC<BillingSettingsProps> = ({ user, onUpdate }) => {
  const [paymentMethods] = useState([
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', expiryMonth: 12, expiryYear: 2025, isDefault: true },
    { id: '2', type: 'card', last4: '1234', brand: 'Mastercard', expiryMonth: 8, expiryYear: 2026, isDefault: false }
  ]);

  const [invoices] = useState([
    { id: 'INV-001', date: '2024-01-15', amount: 2500, status: 'paid', description: 'Projet App Mobile' },
    { id: 'INV-002', date: '2024-01-01', amount: 1800, status: 'pending', description: 'Consultation SEO' }
  ]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Facturation</h2>
        <p className="text-gray-600">Gérez vos moyens de paiement et factures</p>
      </div>

      {/* Payment Methods */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Moyens de paiement</h3>
          <button className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </button>
        </div>
        
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">{method.brand} •••• {method.last4}</div>
                  <div className="text-sm text-gray-600">Expire {method.expiryMonth}/{method.expiryYear}</div>
                </div>
                {method.isDefault && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Par défaut</span>
                )}
              </div>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Factures récentes</h3>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">{invoice.id}</div>
                  <div className="text-sm text-gray-600">{invoice.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{invoice.amount}€</div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-700">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
