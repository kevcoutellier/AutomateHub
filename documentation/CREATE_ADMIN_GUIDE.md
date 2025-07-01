# Guide pour Créer un Compte Admin

## 🎯 Objectif
Créer un compte administrateur dans la base de données AutomateHub.

## 📋 Prérequis

### 1. MongoDB doit être installé et en cours d'exécution
```bash
# Vérifier si MongoDB est installé
mongod --version

# Si MongoDB n'est pas installé, téléchargez-le depuis:
# https://www.mongodb.com/try/download/community

# Démarrer MongoDB (Windows)
net start MongoDB
# ou
mongod --dbpath "C:\data\db"
```

### 2. Variables d'environnement configurées
Assurez-vous que le fichier `.env` existe dans `backend/` avec:
```env
MONGODB_URI=mongodb://localhost:27017/automatehub
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 🚀 Méthodes pour Créer un Admin

### Méthode 1: Script Automatique (Recommandé)
```bash
cd backend
npm run create-admin
```

### Méthode 2: Via le Script de Seed
Modifiez `backend/src/scripts/seedData.ts` pour inclure un admin:

```typescript
const sampleUsers = [
  // ... autres utilisateurs
  {
    email: 'admin@automatehub.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'AutomateHub',
    role: 'admin',
    isEmailVerified: true
  }
];
```

Puis exécutez:
```bash
cd backend
npm run seed
```

### Méthode 3: Directement via MongoDB
```bash
# Connectez-vous à MongoDB
mongo automatehub

# Insérez l'admin directement
db.users.insertOne({
  email: "admin@automatehub.com",
  password: "$2b$10$...", // Hash du mot de passe
  firstName: "Admin",
  lastName: "AutomateHub",
  role: "admin",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 🔐 Informations de Connexion Admin

Une fois créé, utilisez ces identifiants:
- **Email:** admin@automatehub.com
- **Mot de passe:** admin123
- **Rôle:** admin

## ⚠️ Sécurité

1. **Changez le mot de passe par défaut** après la première connexion
2. Utilisez un mot de passe fort en production
3. Activez l'authentification à deux facteurs si disponible

## 🔧 Dépannage

### Erreur de connexion MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Démarrez MongoDB avec `net start MongoDB` ou `mongod`

### Erreur "Admin already exists"
**Solution:** L'admin existe déjà, utilisez les identifiants existants

### Erreur de compilation TypeScript
**Solution:** 
```bash
cd backend
npm run build
```

## 📞 Support
Si vous rencontrez des problèmes, vérifiez:
1. MongoDB est démarré
2. Le fichier `.env` est configuré
3. Les dépendances sont installées (`npm install`)
