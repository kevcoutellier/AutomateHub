# Système de Notifications AutomateHub

## Vue d'ensemble

Le système de notifications d'AutomateHub fournit des notifications en temps réel pour informer les utilisateurs des événements importants tels que les nouveaux messages, les mises à jour de projets, les correspondances d'experts et les notifications de paiement.

## Architecture

### Backend

#### Modèles
- **Notification** : Modèle principal pour stocker les notifications
- **NotificationService** : Service pour créer et gérer les notifications
- **Socket.IO** : Pour les notifications en temps réel

#### Composants principaux

1. **Modèle Notification** (`models/Notification.ts`)
```typescript
interface INotification {
  userId: string;
  type: 'message' | 'project_update' | 'milestone_update' | 'expert_match' | 'payment' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  relatedId?: string;
  relatedType?: string;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
}
```

2. **Service de Notifications** (`services/NotificationService.ts`)
- Création de notifications
- Envoi en temps réel via Socket.IO
- Gestion des compteurs de notifications non lues
- Nettoyage automatique des anciennes notifications

3. **Routes API** (`routes/notifications.ts`)
- `GET /api/notifications` - Récupérer les notifications avec pagination
- `GET /api/notifications/stats` - Statistiques des notifications
- `PUT /api/notifications/read` - Marquer comme lues
- `PUT /api/notifications/read-all` - Marquer toutes comme lues
- `DELETE /api/notifications` - Supprimer des notifications
- `GET /api/notifications/:id` - Récupérer une notification spécifique

### Frontend

#### Composants

1. **NotificationBell** (`components/NotificationBell.tsx`)
- Icône de cloche avec compteur de notifications non lues
- Animation lors de nouvelles notifications
- Ouverture du centre de notifications

2. **NotificationCenter** (`components/NotificationCenter.tsx`)
- Interface principale pour visualiser les notifications
- Filtrage par type, statut et priorité
- Actions de lecture et suppression
- Pagination et chargement infini

3. **Hook useNotifications** (`hooks/useNotifications.ts`)
- Gestion de l'état des notifications
- Connexion aux événements Socket.IO
- API calls pour les opérations CRUD

#### Services

1. **NotificationApi** (`services/notificationApi.ts`)
- Interface pour les appels API
- Types TypeScript pour les notifications

2. **Socket Service** (`services/socket.ts`)
- Gestion des connexions WebSocket
- Listeners pour les événements de notification

## Types de Notifications

### 1. Messages (`message`)
- **Déclencheur** : Nouveau message dans une conversation
- **Destinataire** : Récepteur du message
- **Priorité** : Medium
- **Action** : Redirection vers la conversation

### 2. Mises à jour de projet (`project_update`)
- **Déclencheurs** :
  - Changement de statut
  - Nouveau jalon ajouté
  - Échéance approchante
  - Projet terminé
- **Destinataires** : Client et expert du projet
- **Priorité** : Medium à High (selon le type)
- **Action** : Redirection vers le projet

### 3. Mises à jour de jalons (`milestone_update`)
- **Déclencheurs** :
  - Jalon complété
  - Jalon en retard
  - Modification de jalon
- **Destinataires** : Client et expert du projet
- **Priorité** : Medium à High
- **Action** : Redirection vers le projet

### 4. Correspondances d'experts (`expert_match`)
- **Déclencheur** : Nouvel expert correspondant aux critères du projet
- **Destinataire** : Client du projet
- **Priorité** : Medium
- **Action** : Redirection vers le profil de l'expert

### 5. Paiements (`payment`)
- **Déclencheurs** :
  - Paiement réussi
  - Échec de paiement
  - Paiement en attente
  - Remboursement
- **Destinataire** : Utilisateur concerné
- **Priorité** : Medium à High
- **Action** : Redirection vers la facturation

### 6. Système (`system`)
- **Déclencheurs** :
  - Bienvenue nouvel utilisateur
  - Rappels de profil incomplet
  - Vérification email
  - Maintenance programmée
  - Alertes de sécurité
- **Destinataire** : Utilisateurs concernés
- **Priorité** : Low à Urgent
- **Action** : Variable selon le type

## Niveaux de Priorité

1. **Low** : Informations générales, rappels non urgents
2. **Medium** : Mises à jour importantes, nouveaux messages
3. **High** : Échéances approchantes, problèmes de paiement
4. **Urgent** : Alertes de sécurité, problèmes critiques

## Intégration Socket.IO

### Événements émis par le serveur

```typescript
// Nouvelle notification
socket.emit('notification', {
  id: string,
  type: string,
  title: string,
  message: string,
  data: any,
  priority: string,
  actionUrl?: string,
  createdAt: string,
  isRead: boolean
});

// Mise à jour du compteur
socket.emit('notification_count_update', {
  unreadCount: number
});

// Notification de message (legacy)
socket.emit('message_notification', {
  conversationId: string,
  message: any,
  unreadCount: number
});
```

### Événements écoutés par le serveur

```typescript
// Rejoindre une conversation
socket.emit('join_conversation', conversationId);

// Envoyer un message
socket.emit('send_message', {
  conversationId: string,
  content: string,
  receiverId: string,
  messageType?: string
});

// Marquer les messages comme lus
socket.emit('mark_messages_read', {
  conversationId: string
});
```

## Déclencheurs de Notifications

### Utilitaires disponibles

```typescript
// Notifications de projet
triggerProjectNotifications.onStatusChange(projectId, clientId, expertId, newStatus, details);
triggerProjectNotifications.onMilestoneCompleted(projectId, clientId, expertId, milestoneTitle);
triggerProjectNotifications.onProjectCompleted(projectId, clientId, expertId);

// Notifications d'experts
triggerExpertMatchNotifications.onExpertMatch(clientId, projectId, expertId);
triggerExpertMatchNotifications.onExpertAccepted(expertId, projectId);

// Notifications de paiement
triggerPaymentNotifications.onPaymentSuccess(userId, amount, invoiceId);
triggerPaymentNotifications.onPaymentFailed(userId, amount, invoiceId);

// Notifications système
triggerSystemNotifications.onUserRegistration(userId, userName);
triggerSystemNotifications.onSecurityAlert(userId, alertType, details);
```

## Configuration

### Variables d'environnement

```env
# Socket.IO
SOCKET_IO_CORS_ORIGIN=http://localhost:5173

# Notifications
NOTIFICATION_CLEANUP_DAYS=30
NOTIFICATION_MAX_PER_USER=1000
```

### Base de données

Les notifications sont stockées dans MongoDB avec les index suivants :
- `{ userId: 1, isRead: 1, createdAt: -1 }`
- `{ userId: 1, type: 1, createdAt: -1 }`
- `{ userId: 1, priority: 1, createdAt: -1 }`
- `{ expiresAt: 1 }` (TTL index)

## Permissions et Sécurité

### Authentification
- Toutes les routes de notifications nécessitent une authentification
- Les utilisateurs ne peuvent accéder qu'à leurs propres notifications

### Validation
- Validation des paramètres de pagination
- Validation des IDs de notification
- Validation des types et priorités

### Rate Limiting
- Limitation du nombre de notifications par utilisateur
- Nettoyage automatique des anciennes notifications

## Notifications navigateur

### Permission
Le système demande automatiquement la permission pour les notifications navigateur lors de la première connexion.

### Affichage
Les notifications navigateur sont affichées pour :
- Nouveaux messages (si l'utilisateur n'est pas sur la page de conversation)
- Notifications haute priorité et urgentes
- Mises à jour importantes de projet

## Performance

### Optimisations
- Index MongoDB optimisés pour les requêtes fréquentes
- Pagination pour éviter le chargement de trop de notifications
- Nettoyage automatique des anciennes notifications
- Cache des compteurs de notifications non lues

### Monitoring
- Logs détaillés pour le debugging
- Métriques de performance des notifications
- Surveillance des connexions Socket.IO

## Tests

### Page de test
Une page de test est disponible à `/notification-test` pour :
- Tester l'envoi de notifications
- Visualiser les statistiques
- Tester les actions de lecture/suppression
- Déboguer les connexions temps réel

### Tests d'intégration
Les tests d'intégration couvrent :
- Création et envoi de notifications
- Réception en temps réel via Socket.IO
- Opérations CRUD sur les notifications
- Gestion des permissions

## Maintenance

### Nettoyage automatique
Un job de nettoyage s'exécute périodiquement pour :
- Supprimer les notifications expirées
- Supprimer les anciennes notifications lues (> 30 jours)
- Optimiser les performances de la base de données

### Monitoring
- Surveillance du nombre de notifications par utilisateur
- Alertes en cas de problème de connexion Socket.IO
- Métriques de performance des requêtes de notification

## Évolutions futures

### Fonctionnalités prévues
1. **Notifications push mobile** : Intégration avec Firebase Cloud Messaging
2. **Notifications email** : Résumés quotidiens/hebdomadaires
3. **Préférences utilisateur** : Contrôle granulaire des types de notifications
4. **Templates de notifications** : Personnalisation des messages
5. **Notifications groupées** : Regroupement par projet ou conversation
6. **Analytics** : Statistiques détaillées sur l'engagement des notifications

### Améliorations techniques
1. **Queue système** : Utilisation de Redis/Bull pour les notifications en lot
2. **Clustering** : Support multi-instance avec Redis adapter
3. **Webhooks** : Notifications vers des services externes
4. **GraphQL subscriptions** : Alternative à Socket.IO pour certains clients
