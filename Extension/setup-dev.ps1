# Arti AI Detector - Development Setup

# This script sets up the development environment for the next phase

Write-Host "🚀 Arti AI Detector - Development Environment Setup" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Check current directory
$currentDir = Get-Location
Write-Host "📁 Current directory: $currentDir" -ForegroundColor Yellow

# Navigate to extension directory
if (Test-Path "d:\arti ai ext\Extension") {
    Set-Location "d:\arti ai ext\Extension"
    Write-Host "✅ Navigated to extension directory" -ForegroundColor Green
} else {
    Write-Host "❌ Extension directory not found!" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if dist exists and has files
if ((Test-Path "dist") -and (Get-ChildItem "dist" | Measure-Object).Count -gt 0) {
    Write-Host "✅ Extension build found" -ForegroundColor Green
    
    # Show build info
    $buildFiles = Get-ChildItem "dist" -File | Measure-Object -Property Length -Sum
    $buildSize = [math]::Round($buildFiles.Sum / 1KB, 2)
    Write-Host "📊 Build size: $buildSize KB" -ForegroundColor Gray
} else {
    Write-Host "🔨 Running build..." -ForegroundColor Yellow
    npm run build
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Load extension in Chrome: chrome://extensions/ -> Load unpacked -> select 'dist' folder" -ForegroundColor White
Write-Host "2. Test popup interface and options page" -ForegroundColor White
Write-Host "3. Set up Supabase project for backend integration" -ForegroundColor White
Write-Host "4. Create extension icons (16x16, 48x48, 128x128)" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  Development Commands:" -ForegroundColor Cyan
Write-Host "npm run dev     - Start development build with watch mode" -ForegroundColor Gray
Write-Host "npm run build   - Create production build" -ForegroundColor Gray
Write-Host "npm run preview - Preview production build" -ForegroundColor Gray
Write-Host ""

# Show extension structure
Write-Host "📁 Extension Structure:" -ForegroundColor Cyan
Write-Host "dist/" -ForegroundColor White
Write-Host "├── manifest.json       (Extension manifest)" -ForegroundColor Gray
Write-Host "├── popup.html         (Popup interface)" -ForegroundColor Gray
Write-Host "├── options.html       (Options page)" -ForegroundColor Gray
Write-Host "├── background.js      (Service worker)" -ForegroundColor Gray
Write-Host "├── content.js         (Content script)" -ForegroundColor Gray
Write-Host "├── popup.js           (Popup Vue app)" -ForegroundColor Gray
Write-Host "├── options.js         (Options Vue app)" -ForegroundColor Gray
Write-Host "├── *.css              (Styles)" -ForegroundColor Gray
Write-Host "└── _locales/          (Internationalization)" -ForegroundColor Gray
Write-Host ""

Write-Host "🏁 Ready for Testing & Further Development!" -ForegroundColor Green
