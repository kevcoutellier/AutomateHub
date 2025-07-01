import React from 'react';

const UserManagementSimple: React.FC = () => {
  console.log('UserManagementSimple component rendering...');
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestion des utilisateurs (Test)</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">
          Ce composant de test s'affiche correctement. Si vous voyez ce message, 
          le problème ne vient pas du système de rendu des onglets.
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Jean Dupont</p>
              <p className="text-sm text-gray-500">jean@example.com</p>
            </div>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Actif
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Marie Martin</p>
              <p className="text-sm text-gray-500">marie@example.com</p>
            </div>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              En attente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementSimple;
