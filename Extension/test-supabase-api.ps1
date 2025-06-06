# Script de test pour les Edge Functions Supabase

# Chargement des variables d'environnement depuis le fichier .env
$envFile = Get-Content -Path ".\.env" -ErrorAction SilentlyContinue
$supabaseUrl = ""
$supabaseAnonKey = ""

foreach ($line in $envFile) {
    if ($line -match "VITE_SUPABASE_URL=(.+)") {
        $supabaseUrl = $matches[1]
    }
    if ($line -match "VITE_SUPABASE_ANON_KEY=(.+)") {
        $supabaseAnonKey = $matches[1]
    }
}

# Vérifier si les variables sont définies
if (-not $supabaseUrl -or -not $supabaseAnonKey) {
    Write-Host "Erreur: Variables d'environnement manquantes. Verifiez votre fichier .env" -ForegroundColor Red
    exit 1
}

# Fonctions à tester
$functions = @(
    @{
        "name" = "getPageStatus"
        "endpoint" = "$supabaseUrl/functions/v1/get-page-status?url=https://example.com"
    },
    @{
        "name" = "getRecentReports"
        "endpoint" = "$supabaseUrl/functions/v1/get-recent-reports?limit=5"
    },
    @{
        "name" = "getTopUsers"
        "endpoint" = "$supabaseUrl/functions/v1/get-top-users?limit=5"
    },
    @{
        "name" = "getWhitelistDomains"
        "endpoint" = "$supabaseUrl/functions/v1/get-whitelist-domains"
    }
)

Write-Host "`n===== Test de connexion aux Edge Functions Supabase =====" -ForegroundColor Cyan

# Tester chaque fonction
foreach ($function in $functions) {
    Write-Host "`nTest de la fonction: $($function.name)" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "apikey" = $supabaseAnonKey
            "Authorization" = "Bearer $supabaseAnonKey"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri $function.endpoint -Method Get -Headers $headers -ErrorAction Stop
        
        Write-Host "Succes! Reponse recue:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3 | Write-Host
    } catch {
        Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        }
    }
}

Write-Host "`n===== Test termine =====" -ForegroundColor Cyan
