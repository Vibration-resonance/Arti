# Finalisation de l'Intégration OAuth

Ce document fournit les dernières étapes pour finaliser l'intégration de l'authentification Google OAuth dans l'extension Arti AI Detector.

## 1. Extension Chrome ID

L'ID d'une extension Chrome non-empaquetée est généré automatiquement à chaque chargement. Pour avoir un ID permanent, vous avez deux options :

### Option 1: Empaqueter l'extension

1. Allez dans `chrome://extensions/`
2. Activez le "Mode développeur" 
3. Cliquez sur "Empaqueter l'extension"
4. Sélectionnez le dossier `dist`
5. Vous obtiendrez un fichier `.crx` et un ID permanent

### Option 2: Publier sur le Chrome Web Store

1. Inscrivez-vous en tant que développeur Chrome
2. Créez une fiche pour l'extension
3. Téléchargez votre extension
4. Obtenez un ID permanent avant même la publication

## 2. Configuration OAuth Google

Une fois que vous avez l'ID permanent de votre extension :

1. Accédez à la [Google Cloud Console](https://console.cloud.google.com/)
2. Allez dans "APIs & Services" > "Credentials"
3. Éditez vos identifiants OAuth 2.0
4. Ajoutez les origines JavaScript autorisées :
   ```
   https://ybdwktfpcccxntmboqpv.supabase.co
   chrome-extension://VOTRE_EXTENSION_ID
   ```
5. Ajoutez les URI de redirection autorisés :
   ```
   https://ybdwktfpcccxntmboqpv.supabase.co/auth/v1/callback
   chrome-extension://VOTRE_EXTENSION_ID/popup.html
   ```

## 3. Mise à jour du manifest.json

Mettez à jour votre fichier `manifest.json` avec l'ID d'extension actuel et régénérez l'extension :

```json
"oauth2": {
  "client_id": "1089356741414-jav7mbl1vjea7m5nvkblmvbke757n0g9.apps.googleusercontent.com",
  "scopes": ["openid", "email", "profile"]
}
```

## 4. Configuration de Supabase Auth

1. Accédez au tableau de bord Supabase
2. Allez dans "Authentication" > "Providers"
3. Activez Google
4. Entrez votre Client ID et Client Secret
5. Dans les domaines autorisés, ajoutez :
   ```
   chrome-extension://VOTRE_EXTENSION_ID
   ```

## 5. Test de l'authentification

1. Ouvrez l'extension
2. Cliquez sur "Se connecter avec Google"
3. Vérifiez que le flux de connexion fonctionne :
   - Redirection vers Google
   - Autorisation
   - Redirection vers l'extension
   - Affichage des informations utilisateur

## 6. Dépannage courant

### Erreur de redirection
- Vérifiez que l'URI de redirection est exactement comme spécifié dans Google Cloud Console
- Vérifiez que l'ID de l'extension est correct

### Erreur CORS
- Vérifiez les paramètres CORS dans Supabase
- Ajoutez votre extension aux origines autorisées

### Erreur de connexion
- Vérifiez les logs dans la console du navigateur
- Assurez-vous que les clés API sont correctes dans `.env`
