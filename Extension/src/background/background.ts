import { apiClient } from '../utils/api';
import { getDomain } from '../utils/helpers';
import { authService } from '../utils/auth';
import type { PageStatus, ExtensionSettings } from '../types';

// Installation de l'extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Arti AI Detector installed:', details.reason);
  
  // Initialiser les paramètres par défaut
  const defaultSettings: ExtensionSettings = {
    language: 'en',
    showFloatingButton: true,
    showNotifications: true,
    anonymousMode: false,
    theme: 'auto',
  };
  
  chrome.storage.local.set({ settings: defaultSettings });
  
  // Créer le menu contextuel
  chrome.contextMenus.create({
    id: 'reportPage',
    title: 'Report this page as AI content',
    contexts: ['page'],
  });
});

// Gestion des messages des content scripts et popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Garder le canal ouvert pour les réponses asynchrones
});

async function handleMessage(message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    switch (message.type) {
      case 'GET_PAGE_STATUS':
        const status = await getPageStatus(message.url);
        sendResponse({ success: true, data: status });
        break;
        
      case 'CREATE_REPORT':
        const reportResult = await createReport(message.data);
        sendResponse(reportResult);
        break;
        
      case 'CREATE_VOTE':
        const voteResult = await createVote(message.data);
        sendResponse(voteResult);
        break;
        
      case 'GET_LEADERBOARD':
        const leaderboard = await getLeaderboard(message.params);
        sendResponse(leaderboard);
        break;
        
      case 'GET_USER_STATS':
        const userStats = await getUserStats(message.userId);
        sendResponse(userStats);
        break;
        
      case 'UPDATE_SETTINGS':
        await updateSettings(message.data);
        sendResponse({ success: true });
        break;
        
      case 'GET_SETTINGS':
        const settings = await getSettings();
        sendResponse({ success: true, data: settings });
        break;

      case 'SIGN_IN':
        const signInResult = await authService.signInWithGoogle();
        sendResponse(signInResult);
        break;

      case 'SIGN_OUT':
        const signOutResult = await authService.signOut();
        sendResponse(signOutResult);
        break;

      case 'GET_USER_DATA':
        const currentUser = await authService.getCurrentUser();
        sendResponse({ 
          success: true, 
          data: { 
            user: currentUser, 
            isConnected: !!currentUser 
          } 
        });
        break;

      case 'GET_RECENT_REPORTS':
        const recentReports = await getRecentReports();
        sendResponse(recentReports);
        break;

      case 'CREATE_CHECKOUT_SESSION':
        const checkoutResult = await createCheckoutSession(message.plan);
        sendResponse(checkoutResult);
        break;

      case 'EXPORT_USER_DATA':
        const exportResult = await exportUserData();
        sendResponse(exportResult);
        break;

      case 'DELETE_ACCOUNT':
        const deleteResult = await deleteAccount();
        sendResponse(deleteResult);
        break;

      case 'RESET_SETTINGS':
        await resetSettings();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Récupérer le statut d'une page
async function getPageStatus(url: string): Promise<PageStatus> {
  const response = await apiClient.get<PageStatus>(`/get-page-status?url=${encodeURIComponent(url)}`);
  
  if (!response.success) {
    // Retourner un statut par défaut en cas d'erreur
    return {
      url,
      domain: getDomain(url),
      status: 'unknown',
      is_whitelisted: false,
      reports: [],
      domain_reports_count: 0,
      confidence_score: 0,
    };
  }
  
  return response.data!;
}

// Créer un signalement
async function createReport(data: any) {
  try {
    const response = await apiClient.post('/create-report', data);
    console.log('[background] createReport response:', response);
    if (typeof response !== 'object' || response === null || !('success' in response)) {
      console.error('[background] Malformed response from create-report:', response);
      return { success: false, error: 'Malformed response from server.' };
    }
    return response;
  } catch (error) {
    console.error('[background] Error in createReport:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Créer un vote
async function createVote(data: any) {
  return await apiClient.post('/create-vote', data);
}

// Récupérer le leaderboard
async function getLeaderboard(params: any) {
  const queryString = new URLSearchParams(params).toString();
  return await apiClient.get(`/get-top-users?${queryString}`);
}

// Récupérer les stats utilisateur
async function getUserStats(userId: string) {
  return await apiClient.get(`/get-user-stats?userId=${userId}`);
}

// Mettre à jour les paramètres
async function updateSettings(settings: ExtensionSettings) {
  await chrome.storage.local.set({ settings });
  
  // Notifier tous les onglets des changements
  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SETTINGS_UPDATED',
        settings,
      }).catch(() => {
        // Ignorer les erreurs si le content script n'est pas chargé
      });
    }
  });
}

// Récupérer les paramètres
async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get('settings');
  return result.settings || {
    language: 'en',
    showFloatingButton: true,
    showNotifications: true,
    anonymousMode: false,
    theme: 'auto',
  };
}

// Récupérer les rapports récents
async function getRecentReports() {
  return await apiClient.get('/get-recent-reports');
}

// Récupérer les domaines whitelist
async function getWhitelistDomains() {
  return await apiClient.get('/get-whitelist-domains');
}

// Créer une session de paiement Stripe
async function createCheckoutSession(plan: string) {
  return await apiClient.post('/create-checkout-session', { plan });
}

// Exporter les données utilisateur
async function exportUserData() {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }
  
  return await apiClient.get(`/exportUserData?userId=${user.id}`);
}

// Supprimer le compte utilisateur
async function deleteAccount() {
  const user = await authService.getCurrentUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }
  
  const result = await apiClient.delete(`/deleteAccount?userId=${user.id}`);
  if (result.success) {
    await authService.signOut();
  }
  return result;
}

// Réinitialiser les paramètres
async function resetSettings() {
  const defaultSettings: ExtensionSettings = {
    language: 'en',
    showFloatingButton: true,
    showNotifications: true,
    anonymousMode: false,
    theme: 'auto',
  };
  
  await chrome.storage.local.set({ settings: defaultSettings });
  
  // Notifier tous les onglets des changements
  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SETTINGS_UPDATED',
        settings: defaultSettings,
      }).catch(() => {
        // Ignorer les erreurs si le content script n'est pas chargé
      });
    }
  });
}

// Gestion du menu contextuel
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'reportPage' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'OPEN_REPORT_MODAL',
      url: tab.url,
    });
  }
});

// Gestion des changements d'onglet
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    updateBadge(tab.url, activeInfo.tabId);
  }
});

// Gestion des mises à jour d'URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateBadge(tab.url, tabId);
  }
});

// Mettre à jour le badge de l'extension
async function updateBadge(url: string, tabId: number) {
  try {
    const status = await getPageStatus(url);
    
    let badgeText = '';
    let badgeColor = '#6b7280'; // Gris par défaut
    
    switch (status.status) {
      case 'ai':
        badgeText = 'AI';
        badgeColor = '#ef4444'; // Rouge
        break;
      case 'not_ai':
        badgeText = '✓';
        badgeColor = '#10b981'; // Vert
        break;
      case 'pending':
        badgeText = '?';
        badgeColor = '#f59e0b'; // Orange
        break;
      case 'whitelisted':
        badgeText = '';
        badgeColor = '#ffffff'; // Blanc
        break;
      default:
        if (status.domain_reports_count > 0) {
          badgeText = '!';
          badgeColor = '#f97316'; // Orange plus
        }
    }
    
    chrome.action.setBadgeText({ text: badgeText, tabId });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId });
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Gérer l'authentification Google
chrome.identity.onSignInChanged.addListener((account, signedIn) => {
  console.log('Auth state changed:', { account, signedIn });
  
  // Notifier tous les onglets du changement d'état d'auth
  chrome.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'AUTH_STATE_CHANGED',
          signedIn,
          account,
        }).catch(() => {
          // Ignorer les erreurs
        });
      }
    });
  });
});

export {};
