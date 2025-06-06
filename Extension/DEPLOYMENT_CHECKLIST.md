# 🚀 Arti AI Detector Extension - Deployment Checklist

This checklist ensures your extension is properly configured and ready for deployment.

## ✅ Pre-Deployment Checklist

### 1. Backend Verification
- [ ] Supabase project is live and accessible
- [ ] All Edge Functions are deployed and working
- [ ] Database schema is complete with RLS policies
- [ ] Badge system is configured with default badges
- [ ] Stripe integration is set up (if using premium features)

### 2. Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `VITE_SUPABASE_URL` points to your live Supabase project
- [ ] `VITE_SUPABASE_ANON_KEY` is set with your project's anon key
- [ ] `GOOGLE_AUTH_CLIENT_ID` configured for Chrome extension
- [ ] `STRIPE_API_KEY` set (if using premium features)
- [ ] No placeholder values remain in `.env`

### 3. Google OAuth Setup
- [ ] Google Cloud Console project created
- [ ] Google Identity API enabled
- [ ] OAuth 2.0 credentials created for Chrome Extension
- [ ] OAuth consent screen configured
- [ ] Test users added (if using External user type)
- [ ] Extension ID added to OAuth configuration

### 4. Chrome Extension Manifest
- [ ] `manifest.json` updated with correct Google Client ID
- [ ] Extension permissions are appropriate
- [ ] Icons are present in `public/icons/`
- [ ] Localization files are complete

### 5. Build and Testing
- [ ] Dependencies installed (`npm install`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Extension builds without errors (`npm run build`)
- [ ] Extension loads in Chrome without errors
- [ ] Authentication flow works end-to-end
- [ ] API calls to Supabase Edge Functions succeed
- [ ] Content script appears on web pages
- [ ] Popup interface functions correctly
- [ ] Options page loads and saves settings

## 🔧 Quick Setup Commands

Run these commands in PowerShell from the Extension directory:

```powershell
# 1. Initial setup
./scripts/configure.ps1 -Setup

# 2. Configure with your values (optional - can edit .env manually)
./scripts/configure.ps1 -Setup -SupabaseUrl "https://your-project.supabase.co" -SupabaseAnonKey "your-key" -GoogleClientId "your-client-id"

# 3. Verify configuration
./scripts/configure.ps1 -Verify

# 4. Build extension
./scripts/configure.ps1 -Build
```

## 🧪 Testing Procedures

### Authentication Testing
1. Load extension in Chrome
2. Click extension icon to open popup
3. Click "Sign In with Google"
4. Verify user data appears in popup
5. Check Supabase Auth dashboard for new user

### Content Detection Testing
1. Visit any webpage
2. Verify floating button appears (if enabled in settings)
3. Try reporting a page as AI-generated
4. Check Supabase dashboard for new report
5. Try voting on existing reports
6. Verify vote counts update

### API Integration Testing
1. Open browser developer tools
2. Monitor network requests to Supabase
3. Verify Edge Functions respond correctly
4. Check for CORS errors
5. Test error handling for failed requests

### UI/UX Testing
1. Test popup responsiveness
2. Verify all modals open and close properly
3. Test language switching
4. Verify settings persistence
5. Test badge display and progression

## 🚨 Common Issues & Solutions

### CORS Errors
**Problem**: Extension can't connect to Supabase
**Solution**: 
- Verify extension ID in `externally_connectable` in manifest.json
- Check Supabase CORS settings include your extension

### Authentication Failures
**Problem**: Google sign-in doesn't work
**Solution**:
- Verify OAuth client ID in manifest.json matches Google Console
- Check that extension ID is added to OAuth configuration
- Ensure redirect URLs are correctly configured

### API Call Failures
**Problem**: Edge Functions return errors
**Solution**:
- Check Supabase Edge Functions logs
- Verify environment variables in Edge Functions
- Test functions directly in Supabase dashboard

### Build Issues
**Problem**: Extension won't build
**Solution**:
- Run `npm install` to ensure dependencies
- Check TypeScript errors with `npm run type-check`
- Verify all environment variables are defined

## 📦 Production Deployment

### Chrome Web Store Preparation
1. **Create store listing assets**:
   - Screenshots of extension in action
   - Promotional images (440x280, 920x680, 1400x560)
   - Detailed description
   - Privacy policy

2. **Code review**:
   - Remove development console.log statements
   - Ensure no test API keys in code
   - Verify all user data is handled securely
   - Test with production Supabase environment

3. **Final testing**:
   - Test on multiple websites
   - Verify performance on slow connections
   - Test with different Chrome versions
   - Ensure accessibility compliance

### Production Environment
1. **Supabase Production Setup**:
   - Create production Supabase project
   - Deploy Edge Functions to production
   - Update environment variables for production
   - Configure production database

2. **Stripe Production** (if applicable):
   - Switch to live Stripe API keys
   - Configure production webhooks
   - Test payment flows

3. **Monitoring Setup**:
   - Set up error monitoring (Sentry, etc.)
   - Configure analytics
   - Monitor API usage and costs

## 📋 Final Verification

Before submitting to Chrome Web Store:

- [ ] Extension works on major websites (Google, Twitter, news sites)
- [ ] All features function as expected
- [ ] No console errors in production build
- [ ] Privacy policy addresses data collection
- [ ] User analytics comply with store policies
- [ ] Performance is acceptable on various devices
- [ ] Accessibility features work properly

## 🎯 Success Metrics

Track these metrics post-launch:
- User acquisition and retention rates
- AI detection accuracy from community votes
- API response times and error rates
- User engagement with premium features
- Community participation in voting/reporting

---

**📞 Support**: If you encounter issues during deployment, check the troubleshooting section in CONFIGURATION_GUIDE.md or review the Edge Function logs in your Supabase dashboard.
