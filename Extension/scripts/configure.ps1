#!/usr/bin/env pwsh
# Configuration Helper Script for Arti AI Detector Extension

param(
    [switch]$Setup,
    [switch]$Verify,
    [switch]$Build,
    [string]$SupabaseUrl = "",
    [string]$SupabaseAnonKey = "",
    [string]$GoogleClientId = ""
)

Write-Host "🚀 Arti AI Detector Extension Configuration Helper" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

function Test-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Host "❌ .env file not found" -ForegroundColor Red
        return $false
    }
    Write-Host "✅ .env file exists" -ForegroundColor Green
    return $true
}

function Test-Dependencies {
    Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "❌ node_modules not found. Running npm install..." -ForegroundColor Red
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ npm install failed" -ForegroundColor Red
            return $false
        }
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    return $true
}

function Set-EnvironmentVariables {
    param(
        [string]$SupabaseUrl,
        [string]$SupabaseAnonKey,
        [string]$GoogleClientId
    )
    
    Write-Host "`n🔧 Setting up environment variables..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env from .env.example" -ForegroundColor Green
    }
    
    $envContent = Get-Content ".env"
    
    if ($SupabaseUrl) {
        $envContent = $envContent -replace "VITE_SUPABASE_URL=.*", "VITE_SUPABASE_URL=$SupabaseUrl"
        Write-Host "✅ Updated Supabase URL" -ForegroundColor Green
    }
    
    if ($SupabaseAnonKey) {
        $envContent = $envContent -replace "VITE_SUPABASE_ANON_KEY=.*", "VITE_SUPABASE_ANON_KEY=$SupabaseAnonKey"
        Write-Host "✅ Updated Supabase Anon Key" -ForegroundColor Green
    }
    
    if ($GoogleClientId) {
        $envContent = $envContent -replace "GOOGLE_AUTH_CLIENT_ID=.*", "GOOGLE_AUTH_CLIENT_ID=$GoogleClientId"
        Write-Host "✅ Updated Google Client ID" -ForegroundColor Green
    }
    
    $envContent | Set-Content ".env"
}

function Update-Manifest {
    param([string]$GoogleClientId)
    
    if ($GoogleClientId) {
        Write-Host "`n📝 Updating manifest.json..." -ForegroundColor Yellow
        
        $manifestPath = "public/manifest.json"
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        $manifest.oauth2.client_id = $GoogleClientId
        
        $manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath
        Write-Host "✅ Updated manifest.json with Google Client ID" -ForegroundColor Green
    }
}

function Test-Configuration {
    Write-Host "`n🔍 Verifying configuration..." -ForegroundColor Yellow
    
    $envVars = @{}
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                $envVars[$matches[1]] = $matches[2]
            }
        }
    }
    
    $requiredVars = @(
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY", 
        "GOOGLE_AUTH_CLIENT_ID"
    )
    
    $allValid = $true
    foreach ($var in $requiredVars) {
        if ($envVars[$var] -and $envVars[$var] -notlike "*your*" -and $envVars[$var] -notlike "*example*") {
            Write-Host "✅ $var configured" -ForegroundColor Green
        } else {
            Write-Host "❌ $var not configured or using placeholder" -ForegroundColor Red
            $allValid = $false
        }
    }
    
    return $allValid
}

function Build-Extension {
    Write-Host "`n🔨 Building extension..." -ForegroundColor Yellow
    
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Extension built successfully" -ForegroundColor Green
        Write-Host "📂 Built files are in the 'dist' folder" -ForegroundColor Cyan
        return $true
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        return $false
    }
}

function Show-LoadInstructions {
    Write-Host "`n📋 Loading Extension in Chrome:" -ForegroundColor Cyan
    Write-Host "1. Open Chrome and go to chrome://extensions/" -ForegroundColor White
    Write-Host "2. Enable 'Developer mode' (toggle in top right)" -ForegroundColor White
    Write-Host "3. Click 'Load unpacked'" -ForegroundColor White
    Write-Host "4. Select the 'dist' folder in this directory" -ForegroundColor White
    Write-Host "5. Note the Extension ID that appears" -ForegroundColor White
    Write-Host "6. Update your .env file with: EXTENSION_ID=your_extension_id" -ForegroundColor White
}

# Main execution
if ($Setup) {
    Write-Host "`n🔧 Running setup..." -ForegroundColor Yellow
    
    if (-not (Test-Dependencies)) {
        exit 1
    }
    
    Set-EnvironmentVariables -SupabaseUrl $SupabaseUrl -SupabaseAnonKey $SupabaseAnonKey -GoogleClientId $GoogleClientId
    Update-Manifest -GoogleClientId $GoogleClientId
    
    Write-Host "`n📋 Setup complete! Next steps:" -ForegroundColor Cyan
    Write-Host "1. Edit the .env file with your actual API keys" -ForegroundColor White
    Write-Host "2. Run: ./scripts/configure.ps1 -Verify" -ForegroundColor White
    Write-Host "3. Run: ./scripts/configure.ps1 -Build" -ForegroundColor White
}
elseif ($Verify) {
    if (Test-Configuration) {
        Write-Host "`n✅ Configuration is valid!" -ForegroundColor Green
        Write-Host "You can now build the extension with: ./scripts/configure.ps1 -Build" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Configuration incomplete. Please check your .env file." -ForegroundColor Red
        Write-Host "See CONFIGURATION_GUIDE.md for detailed instructions." -ForegroundColor Yellow
    }
}
elseif ($Build) {
    if (-not (Test-Dependencies)) {
        exit 1
    }
    
    if (-not (Test-Configuration)) {
        Write-Host "❌ Configuration incomplete. Run verification first: ./scripts/configure.ps1 -Verify" -ForegroundColor Red
        exit 1
    }
    
    if (Build-Extension) {
        Show-LoadInstructions
    }
}
else {
    Write-Host "`nUsage:" -ForegroundColor Yellow
    Write-Host "  ./scripts/configure.ps1 -Setup                    # Initial setup" -ForegroundColor White
    Write-Host "  ./scripts/configure.ps1 -Setup -SupabaseUrl <url> -SupabaseAnonKey <key> -GoogleClientId <id>" -ForegroundColor White
    Write-Host "  ./scripts/configure.ps1 -Verify                   # Verify configuration" -ForegroundColor White
    Write-Host "  ./scripts/configure.ps1 -Build                    # Build extension" -ForegroundColor White
    Write-Host "`nFor detailed setup instructions, see CONFIGURATION_GUIDE.md" -ForegroundColor Cyan
}
