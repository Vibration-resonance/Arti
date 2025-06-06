# Simple script pour tester la connexion Supabase
# Execute: .\test-supabase.ps1

$envFile = ".env"
$supabaseUrl = ""
$supabaseKey = ""

# Lecture des variables d'environnement
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^VITE_SUPABASE_URL=(.*)$") {
            $supabaseUrl = $matches[1]
        }
        if ($_ -match "^VITE_SUPABASE_ANON_KEY=(.*)$") {
            $supabaseKey = $matches[1]
        }
    }
}

Write-Host "Test de connexion a Supabase..." -ForegroundColor Yellow
Write-Host "URL: $supabaseUrl" -ForegroundColor Cyan

try {
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
    }
    
    # Test simple avec un endpoint public
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/" -Headers $headers -Method Get -ErrorAction Stop
    
    Write-Host "✅ Connexion reussie!" -ForegroundColor Green
    
    # Test d'une Edge Function
    Write-Host "`nTest de l'Edge Function getPageStatus..." -ForegroundColor Yellow
    
    $testUrl = "https://example.com"
    $encodedUrl = [System.Web.HttpUtility]::UrlEncode($testUrl)
    $endpoint = "$supabaseUrl/functions/v1/getPageStatus?url=$encodedUrl"
    
    try {
        $functionResponse = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method Get -ErrorAction Stop
        
        Write-Host "✅ Edge Function accessible!" -ForegroundColor Green
        Write-Host "Response: $($functionResponse | ConvertTo-Json -Depth 1)" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Erreur lors de l'appel a l'Edge Function" -ForegroundColor Red
        Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
        
        Write-Host "`nImportant: Assurez-vous que:" -ForegroundColor Yellow
        Write-Host "1. Les Edge Functions sont deployees" -ForegroundColor White
        Write-Host "2. L'URL de l'API est correcte" -ForegroundColor White
        Write-Host "3. Les fonctions sont nommees correctement" -ForegroundColor White
    }
}
catch {
    Write-Host "❌ Echec de connexion a Supabase" -ForegroundColor Red
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
