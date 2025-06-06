# Arti AI Detector - Guide de test d'intégration Backend

Ce guide vous permet de tester l'intégration complète entre le frontend de l'extension et le backend Supabase.

## 📋 Prérequis

Avant de commencer les tests, assurez-vous d'avoir:

1. **Configuration complète du backend Supabase**
   - Projet Supabase créé et fonctionnel
   - Edge Functions déployées
   - Tables de base de données créées

2. **Configuration de l'extension**
   - Fichier `.env` créé avec vos valeurs:
     ```
     VITE_SUPABASE_URL=https://votre-projet.supabase.co
     VITE_SUPABASE_ANON_KEY=votre_cle_anon
     GOOGLE_AUTH_CLIENT_ID=votre_id_google
     ```
   - Build de l'extension généré: `npm run build`
   - Extension chargée dans Chrome (mode développeur)

## 🔍 Tests d'authentification

### Test 1: Connexion Google

1. **Ouvrir le popup**
   - Cliquer sur l'icône de l'extension

2. **Tester la connexion**
   - Cliquer sur "Se connecter avec Google"
   - Vérifier la redirection vers l'auth Google
   - Confirmer la connexion

3. **Vérifier les données utilisateur**
   - Après connexion, vérifier l'affichage du nom d'utilisateur
   - Confirmer que le statut "connecté" persiste après fermeture/réouverture

4. **Vérifier dans Supabase**
   - Aller dans "Authentication > Users" dans le dashboard Supabase
   - Confirmer que l'utilisateur a bien été créé

### Test 2: Déconnexion

1. **Se déconnecter**
   - Dans le popup ou la page d'options, cliquer sur "Déconnexion"
   - Vérifier que l'interface revient à l'état non-connecté

2. **Vérifier la persistance**
   - Fermer/rouvrir l'extension
   - Confirmer que l'utilisateur reste déconnecté

## 🌐 Tests d'API

### Test 3: Statut de page

1. **Visiter une nouvelle page**
   - Ouvrir une page web quelconque

2. **Vérifier le statut**
   - Cliquer sur l'icône d'extension
   - Confirmer que le statut de la page s'affiche correctement
   - Vérifier l'URL et le domaine affichés

3. **Appels API**
   - Ouvrir les DevTools (F12) > Onglet Network
   - Vérifier l'appel à l'API `getPageStatus`
   - Confirmer la réponse JSON correcte

### Test 4: Signalement d'une page

1. **Créer un signalement**
   - Sur une page, ouvrir l'extension
   - Cliquer sur "Signaler cette page"
   - Remplir le formulaire (type de contenu, commentaire)
   - Soumettre le signalement

2. **Vérifier la confirmation**
   - Confirmer le message de succès
   - Vérifier que le statut de la page est mis à jour

3. **Vérifier dans Supabase**
   - Consulter la table `reports` dans Supabase
   - Confirmer que le nouveau rapport est présent
   - Vérifier que l'ID utilisateur est correct

### Test 5: Votes

1. **Voter sur un signalement**
   - Trouver une page avec un signalement existant
   - Ouvrir l'extension
   - Voter (Approuver, Réfuter, Pas d'IA)

2. **Vérifier le vote**
   - Confirmer le message de succès
   - Vérifier que le compteur de votes est mis à jour

3. **Vérifier dans Supabase**
   - Consulter la table `votes` dans Supabase
   - Confirmer que le nouveau vote est enregistré

## 📊 Tests des statistiques

### Test 6: Tableau des scores

1. **Consulter le classement**
   - Ouvrir la page d'options
   - Aller dans l'onglet "Classement"
   - Vérifier que les données se chargent

2. **Filtrer par période**
   - Tester les filtres (Semaine, Mois, Tous)
   - Vérifier que les données sont mises à jour

3. **Appels API**
   - Vérifier l'appel à l'API `getTopUsers`
   - Confirmer la réponse JSON correcte

### Test 7: Badges et récompenses

1. **Consulter les statistiques**
   - Ouvrir la page d'options
   - Aller dans l'onglet "Statistiques"
   - Vérifier l'affichage des badges

2. **Gagner un badge**
   - Effectuer une action pour gagner un badge
     (ex: créer 1 signalement pour badge "Débutant")
   - Recharger les statistiques
   - Vérifier que le nouveau badge est débloqué

3. **Vérifier dans Supabase**
   - Consulter la table `user_badges` dans Supabase
   - Confirmer que le badge est attribué

## 💳 Tests d'abonnement (Premium)

### Test 8: Checkout Stripe

1. **Initialiser un abonnement**
   - Ouvrir la page d'options
   - Aller dans "Abonnement"
   - Cliquer sur "Passer à Premium"

2. **Vérifier redirection Stripe**
   - Confirmer la redirection vers Stripe Checkout
   - Vérifier que l'ID utilisateur est transmis

3. **Test de paiement**
   - Utiliser les cartes de test Stripe:
     ```
     4242 4242 4242 4242 (succès)
     4000 0000 0000 0002 (refusée)
     ```
   - Vérifier la redirection après paiement

### Test 9: Fonctionnalités Premium

1. **Vérifier le statut premium**
   - Après souscription, vérifier le badge Premium
   - Confirmer l'accès aux fonctionnalités Premium

2. **Vérifier dans Supabase**
   - Consulter la table `subscriptions` dans Supabase
   - Confirmer les détails de l'abonnement

## 📱 Tests de compatibilité

### Test 10: Navigateurs

- Tester sur Chrome (obligatoire)
- Tester sur Edge (optionnel)
- Tester sur Firefox Developer Edition (optionnel)

### Test 11: Responsive

- Tester l'extension sur desktop
- Tester le contenu script sur mobile
- Vérifier l'adaptation aux différentes tailles d'écran

## 🐛 Dépannage courant

### Erreurs d'authentification
- Vérifier les paramètres OAuth dans Google Cloud Console
- Vérifier que l'ID d'extension est autorisé
- Confirmer les redirections dans Supabase Auth

### Erreurs CORS
- Vérifier les paramètres CORS dans Supabase
- Confirmer que l'extension est listée dans `externally_connectable`

### Erreurs d'API Edge Functions
- Vérifier les logs Edge Functions dans Supabase
- Confirmer que les fonctions sont déployées
- Vérifier les réponses d'API dans DevTools

## ✅ Validation finale

Une fois tous les tests réussis, l'extension est prête pour le déploiement!

**La prochaine étape est la préparation pour la soumission au Chrome Web Store.**
