# Script de configuration pour le développement Arti AI Detector
Write-Host "🚀 Configuration du développement Arti AI Detector..." -ForegroundColor Green

# Vérifier si Supabase CLI est installé
try {
    supabase --version | Out-Null
    Write-Host "✅ Supabase CLI détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé. Installation requise:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Créer le fichier .env local s'il n'existe pas
if (-not (Test-Path ".env")) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Veuillez configurer vos variables d'environnement dans .env" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Étapes de configuration nécessaires:" -ForegroundColor Cyan
Write-Host "1. Créer un projet Supabase sur https://supabase.com"
Write-Host "2. Activer l'authentification Google dans Authentication > Providers"
Write-Host "3. Copier les clés API dans votre fichier .env"
Write-Host "4. Créer un compte Stripe et copier les clés dans .env"
Write-Host ""

# Démarrer Supabase local
Write-Host "🔥 Démarrage de Supabase local..." -ForegroundColor Green
supabase start

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Supabase local démarré avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Tableau de bord: http://localhost:54323" -ForegroundColor Cyan
    Write-Host "🔗 API URL: http://localhost:54321" -ForegroundColor Cyan
    Write-Host "📄 Anon Key: Consultez la sortie ci-dessus" -ForegroundColor Cyan
    Write-Host ""
    
    # Exécuter les migrations
    Write-Host "🔄 Exécution des migrations de base de données..." -ForegroundColor Yellow
    supabase db reset
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations exécutées avec succès!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Prochaines étapes:" -ForegroundColor Cyan
        Write-Host "1. Configurer vos variables d'environnement dans .env"
        Write-Host "2. Lancer le développement: npm run dev"
        Write-Host "3. Construire l'extension: npm run build"
        Write-Host ""
    } else {
        Write-Host "❌ Erreur lors de l'exécution des migrations" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Erreur lors du démarrage de Supabase" -ForegroundColor Red
}
