# Arti AI Detector Extension - Configuration Guide

This guide will help you configure the extension with your Supabase backend and Google authentication.

## Prerequisites

1. **Supabase Project**: You should have already set up the Supabase backend following the backend setup guide
2. **Google Cloud Console**: Access to create OAuth credentials
3. **Stripe Account**: For payment processing (optional for testing)

## Step 1: Configure Environment Variables

1. Copy the example environment file:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit the `.env` file with your actual values:

### Supabase Configuration
Get these from your Supabase project dashboard:
- Go to your Supabase project at https://supabase.com/dashboard
- Navigate to **Settings > API**
- Copy the values:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Identity API**:
   - Go to **APIs & Services > Library**
   - Search for "Google Identity"
   - Enable the API

4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services > Credentials**
   - Click **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs**
   - Choose **Chrome Extension** as application type
   - Add your extension ID (you'll get this after loading the extension)

5. Configure the OAuth consent screen:
   - Go to **APIs & Services > OAuth consent screen**
   - Fill in the required information
   - Add your email to test users if using External user type

6. Update your `.env` file:
```bash
GOOGLE_AUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_AUTH_CLIENT_SECRET=your_client_secret
```

### Stripe Configuration (Optional)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from **Developers > API keys**
3. Set up a webhook endpoint for your Supabase project
4. Update your `.env` file:
```bash
STRIPE_API_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 2: Update Chrome Extension Manifest

1. Open `public/manifest.json`
2. Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Google OAuth client ID

## Step 3: Build and Load Extension

1. Build the extension:
   ```powershell
   npm run build
   ```

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `dist` folder

3. Note the Extension ID that appears

4. Update your `.env` file with the Extension ID:
   ```bash
   EXTENSION_ID=your_extension_id_here
   ```

5. Update your Google OAuth credentials:
   - Go back to Google Cloud Console > Credentials
   - Edit your OAuth client
   - Add the Extension ID to the authorized origins

## Step 4: Configure Supabase Authentication

1. In your Supabase dashboard, go to **Authentication > Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth client ID
   - Client Secret: Your Google OAuth client secret

4. Configure redirect URLs:
   - Add: `chrome-extension://YOUR_EXTENSION_ID`
   - Add: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

## Step 5: Test the Extension

1. **Authentication Test**:
   - Click the extension icon
   - Try to sign in with Google
   - Check that user data appears correctly

2. **API Test**:
   - Visit any webpage
   - Check if the floating button appears
   - Try reporting a page
   - Try voting on existing reports

3. **Backend Integration Test**:
   - Check Supabase dashboard for new data
   - Verify Edge Functions are responding
   - Test the leaderboard and stats

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure your extension ID is added to Supabase CORS settings
   - Check that `externally_connectable` in manifest.json includes your Supabase URL

2. **Authentication Issues**:
   - Verify Google OAuth configuration
   - Check that redirect URLs match exactly
   - Ensure extension ID is correct in all configurations

3. **API Errors**:
   - Check Supabase Edge Functions logs
   - Verify environment variables are correctly set
   - Test Edge Functions directly in Supabase dashboard

4. **Build Issues**:
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript compilation with `npm run type-check`
   - Verify environment variables are available during build

### Development Mode

For development, you can run:
```powershell
npm run dev
```
This will watch for changes and rebuild automatically.

### Production Build

For production deployment:
```powershell
npm run build:prod
```

## Security Notes

- Never commit your `.env` file to version control
- Use test API keys during development
- Rotate API keys regularly
- Monitor API usage in Supabase dashboard
- Enable Row Level Security policies in Supabase

## Next Steps

Once everything is configured and tested:
1. Test the extension thoroughly on different websites
2. Monitor backend performance and costs
3. Consider setting up automated testing
4. Prepare for Chrome Web Store submission
5. Set up user analytics and error monitoring
