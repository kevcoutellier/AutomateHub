import React, { useState } from 'react';
import { AuthModal } from '../auth/AuthModal';
import { SimpleAuthModal } from './SimpleAuthModal';
import { TestAuthModal } from './TestAuthModal';

export const AuthModalTest: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSimpleOpen, setIsSimpleOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Test des Modales d'Authentification</h2>
      
      <div className="space-x-4">
        <button
          onClick={() => {
            setMode('signin');
            setIsOpen(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tester Connexion (Original)
        </button>
        
        <button
          onClick={() => {
            setMode('signup');
            setIsOpen(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Tester Inscription (Original)
        </button>
      </div>

      <div className="space-x-4 mt-4">
        <button
          onClick={() => {
            setMode('signin');
            setIsSimpleOpen(true);
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Tester Connexion (Simple)
        </button>
        
        <button
          onClick={() => {
            setMode('signup');
            setIsSimpleOpen(true);
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Tester Inscription (Simple)
        </button>
      </div>

      <div className="space-x-4 mt-4">
        <button
          onClick={() => {
            setMode('signin');
            setIsTestOpen(true);
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Tester Connexion (Framer Motion)
        </button>
        
        <button
          onClick={() => {
            setMode('signup');
            setIsTestOpen(true);
          }}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Tester Inscription (Framer Motion)
        </button>
      </div>

      <div className="text-sm text-gray-600">
        État modal originale: {isOpen ? 'Ouverte' : 'Fermée'}<br/>
        État modal simple: {isSimpleOpen ? 'Ouverte' : 'Fermée'}<br/>
        État modal test: {isTestOpen ? 'Ouverte' : 'Fermée'}
      </div>

      <AuthModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialMode={mode}
        onAuthSuccess={() => {
          console.log('Authentification réussie!');
          setIsOpen(false);
        }}
      />

      <SimpleAuthModal
        isOpen={isSimpleOpen}
        onClose={() => setIsSimpleOpen(false)}
        initialMode={mode}
      />

      <TestAuthModal
        isOpen={isTestOpen}
        onClose={() => setIsTestOpen(false)}
        initialMode={mode}
      />
    </div>
  );
};
