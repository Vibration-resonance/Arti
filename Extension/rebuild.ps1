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
