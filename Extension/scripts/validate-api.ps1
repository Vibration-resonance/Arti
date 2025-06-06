# Script de validation d'API pour Arti AI Detector
# Ce script permet de tester les appels API vers les Edge Functions Supabase

# Paramètres
param (
    [switch]$Auth,
    [switch]$Api,    Write-ColorText "❌ Des problemes ont ete detectes dans l'integration API." -Color Red
    Write-ColorText "Consultez les erreurs ci-dessus pour plus de details." -Color Yellow    [switch]$All,
    [string]$SupabaseUrl,
    [string]$SupabaseKey,
    [string]$TestUrl = "https://example.com"
)

function Write-ColorText {
    param (
        [string]$Text,
        [string]$Color,
        [switch]$NoNewLine
    )
    
    Write-Host $Text -ForegroundColor $Color -NoNewLine:$NoNewLine
}

function Test-Auth {
    Write-ColorText "🔐 " -Color Yellow -NoNewLine
    Write-ColorText "Test d'authentification..." -Color White
    
    try {
        $headers = @{
            "apikey" = $SupabaseKey
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$SupabaseUrl/auth/v1/user" -Headers $headers -Method Get -ErrorAction Stop
        
        Write-ColorText "✅ Connection à Supabase établie!" -Color Green
        Write-ColorText "   Endpoint auth: " -Color Gray -NoNewLine
        Write-ColorText "$SupabaseUrl/auth/v1" -Color Cyan
        return $true
    }
    catch {
    Write-ColorText "❌ Echec de connexion a Supabase" -Color Red
    Write-ColorText "   Erreur: $($_.Exception.Message)" -Color Red
        return $false
    }
}

function Test-EdgeFunction {
    param (
        [string]$FunctionName,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-ColorText "🌐 " -Color Yellow -NoNewLine
    Write-ColorText "Test de l'Edge Function " -Color White -NoNewLine
    Write-ColorText $FunctionName -Color Cyan
    
    try {
        $headers = @{
            "apikey" = $SupabaseKey
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $SupabaseKey"
        }
        
        $params = @{
            Uri = "$SupabaseUrl/functions/v1/$FunctionName"
            Headers = $headers
            Method = $Method
            ErrorAction = "Stop"
        }
        
        if ($Body -and $Method -ne "GET") {
            $params.Body = ($Body | ConvertTo-Json)
        }
        elseif ($Method -eq "GET" -and $Body) {
            # Construction d'une query string pour GET
            $queryParams = [System.Web.HttpUtility]::ParseQueryString([String]::Empty)
            foreach ($key in $Body.Keys) {
                $queryParams[$key] = $Body[$key]
            }
            $queryString = $queryParams.ToString()
            $params.Uri = "$($params.Uri)?$queryString"
        }
        
        $response = Invoke-RestMethod @params
        
        if ($response.success -eq $true) {
            Write-ColorText "✅ " -Color Green -NoNewLine
            Write-ColorText "Fonction $FunctionName disponible" -Color White
            Write-ColorText "   Statut: " -Color Gray -NoNewLine
            Write-ColorText "Succès" -Color Green
            return $true
        }
        else {
            Write-ColorText "⚠️ " -Color Yellow -NoNewLine
            Write-ColorText "Fonction $FunctionName a répondu avec une erreur" -Color White
            Write-ColorText "   Message: $($response.error)" -Color Yellow
            return $false
        }
    }
    catch {
        Write-ColorText "❌ " -Color Red -NoNewLine
        Write-ColorText "Échec d'accès à la fonction $FunctionName" -Color White
        Write-ColorText "   Erreur: $($_.Exception.Message)" -Color Red
        return $false
    }
}

function Test-AllEdgeFunctions {
    $allSuccess = $true
    
    # Test getPageStatus
    $pageStatusBody = @{
        url = $TestUrl
    }
    $allSuccess = $allSuccess -and (Test-EdgeFunction -FunctionName "getPageStatus" -Method "GET" -Body $pageStatusBody)
    
    # Test getTopUsers
    $topUsersBody = @{
        limit = 5
        period = "all"
    }
    $allSuccess = $allSuccess -and (Test-EdgeFunction -FunctionName "getTopUsers" -Method "GET" -Body $topUsersBody)
    
    # Test getRecentReports
    $recentReportsBody = @{
        limit = 5
    }
    $allSuccess = $allSuccess -and (Test-EdgeFunction -FunctionName "getRecentReports" -Method "GET" -Body $recentReportsBody)
    
    # Test getWhitelistDomains
    $allSuccess = $allSuccess -and (Test-EdgeFunction -FunctionName "getWhitelistDomains" -Method "GET")
    
    if ($allSuccess) {
        Write-ColorText "`n🎉 " -Color Green -NoNewLine
        Write-ColorText "Toutes les Edge Functions sont accessibles et fonctionnelles!" -Color Green
    }
    else {
        Write-ColorText "`n⚠️ " -Color Yellow -NoNewLine
        Write-ColorText "Certaines Edge Functions ne sont pas accessibles ou renvoient des erreurs." -Color Yellow
        Write-ColorText "   Veuillez vérifier le déploiement des fonctions et les logs dans la console Supabase." -Color Yellow
    }
    
    return $allSuccess
}

# Lecture des variables d'environnement si non fournies
if (-not $SupabaseUrl -or -not $SupabaseKey) {
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^VITE_SUPABASE_URL=(.*)$") {
                $SupabaseUrl = $matches[1]
            }
            if ($_ -match "^VITE_SUPABASE_ANON_KEY=(.*)$") {
                $SupabaseKey = $matches[1]
            }
        }
    }
}

# Afficher l'en-tête
Write-ColorText "`n📊 " -Color Cyan -NoNewLine
Write-ColorText "Arti AI Detector - Validation d'intégration API" -Color White
Write-ColorText "`n====================================================" -Color DarkGray
Write-ColorText "`nSupabase URL: " -Color Gray -NoNewLine
Write-ColorText $SupabaseUrl -Color Cyan
Write-ColorText "Test URL: " -Color Gray -NoNewLine
Write-ColorText $TestUrl -Color Cyan
Write-ColorText "`n====================================================" -Color DarkGray

# Exécution des tests
$result = $true

if ($Auth -or $All) {
    $result = $result -and (Test-Auth)
}

if ($Api -or $All) {
    $result = $result -and (Test-AllEdgeFunctions)
}

# Résumé
Write-ColorText "`n📝 " -Color Yellow -NoNewLine
Write-ColorText "Résultat global: " -Color White -NoNewLine

if ($result) {
    Write-ColorText "SUCCÈS" -Color Green
    Write-ColorText "L'intégration API semble fonctionnelle!" -Color Green
}
else {
    Write-ColorText "ÉCHEC" -Color Red
    Write-ColorText "Des problèmes ont été détectés dans l'intégration API." -Color Red
    Write-ColorText "Consultez les erreurs ci-dessus pour plus de détails." -Color Yellow
}

Write-ColorText "`n====================================================" -Color DarkGray
