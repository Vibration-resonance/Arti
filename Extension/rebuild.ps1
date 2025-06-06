# Rebuild Extension and Test OAuth Flow

echo "Building extension..."
npm run build

echo "Extension built. Now you need to:"
echo "1. Go to chrome://extensions/"
echo "2. Toggle Developer mode ON (if not already)"
echo "3. Click 'Load unpacked'"
echo "4. Select the 'dist' folder in this project"
echo ""
echo "After loading the extension, open it and try logging in to test the OAuth flow."

# PowerShell script to build both the multi-entry extension (popup, options, background) and the content script (IIFE)
# Usage: ./rebuild.ps1

Write-Host "[1/2] Build multi-entry (popup, options, background)..." -ForegroundColor Cyan
npx vite build --config vite.config.multi.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "Multi-entry build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[2/2] Build content script (IIFE)..." -ForegroundColor Cyan
npx vite build --config vite.config.content.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "Content script build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build complete! All extension files are in the dist/ folder." -ForegroundColor Green
