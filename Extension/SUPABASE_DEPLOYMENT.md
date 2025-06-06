# Guide de déploiement des Edge Functions Supabase
# Ce guide vous aide à déployer les Edge Functions vers votre projet Supabase

## Prérequis

1. **Installer Supabase CLI**
   ```powershell
   # Si vous avez npm
   npm install -g supabase
   
   # Ou avec PowerShell et Chocolatey
   choco install supabase-cli
   ```

2. **Se connecter à Supabase**
   ```powershell
   supabase login
   ```

## Déployer les Edge Functions

1. **Lier votre projet local à votre projet Supabase**
   ```powershell
   cd "d:\arti ai ext\Extension"
   supabase link --project-ref ybdwktfpcccxntmboqpv
   ```

2. **Déployer les migrations de base de données**
   ```powershell
   supabase db push
   ```

3. **Déployer chaque Edge Function**
   ```powershell
   # Déployer toutes les fonctions
   supabase functions deploy create-checkout-session
   supabase functions deploy create-report
   supabase functions deploy create-vote
   supabase functions deploy get-page-status
   supabase functions deploy get-recent-reports
   supabase functions deploy get-top-users
   supabase functions deploy get-whitelist-domains
   supabase functions deploy stripe-webhook
   ```

## Vérifier le déploiement

1. **Lister les fonctions déployées**
   ```powershell
   supabase functions list
   ```

2. **Tester une fonction**
   ```powershell
   # Ouvrez votre navigateur à l'adresse
   # https://ybdwktfpcccxntmboqpv.supabase.co/functions/v1/getPageStatus?url=https://example.com
   ```

## Configuration Google OAuth

1. **Créez des identifiants OAuth dans la Google Cloud Console**
   - Allez sur https://console.cloud.google.com/
   - Créez un nouveau projet ou utilisez un existant
   - Allez dans "APIs & Services" > "Credentials"
   - Créez des identifiants OAuth 2.0
   - Type d'application : Application Web
   - Ajoutez les origines JavaScript autorisées:
     ```
     https://ybdwktfpcccxntmboqpv.supabase.co
     chrome-extension://VOTRE_EXTENSION_ID
     ```
   - Ajoutez les URI de redirection autorisés:
     ```
     https://ybdwktfpcccxntmboqpv.supabase.co/auth/v1/callback
     chrome-extension://VOTRE_EXTENSION_ID/popup.html
     ```

2. **Mettez à jour votre fichier .env**
   ```
   GOOGLE_AUTH_CLIENT_ID=votre_client_id.apps.googleusercontent.com
   GOOGLE_AUTH_CLIENT_SECRET=votre_client_secret
   ```

3. **Configurez Supabase Auth**
   - Allez dans votre projet Supabase > Authentication > Providers
   - Activez Google
   - Ajoutez vos identifiants Google OAuth

## Construire l'extension

Une fois tout configuré:

```powershell
# Construire l'extension
cd "d:\arti ai ext\Extension"
npm run build

# Charger l'extension dans Chrome
# 1. Ouvrez chrome://extensions/
# 2. Activez le mode développeur
# 3. Cliquez sur "Charger l'extension non empaquetée"
# 4. Sélectionnez le dossier "dist"

# Notez l'ID d'extension et mettez à jour votre fichier .env
EXTENSION_ID=votre_extension_id
```

## Tester l'extension

Après avoir chargé l'extension:
1. Cliquez sur l'icône d'extension
2. Testez la connexion Google
3. Visitez des sites web et testez les fonctionnalités de rapport et vote
