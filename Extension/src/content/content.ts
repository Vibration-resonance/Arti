import { t } from '../i18n';
import { getStatusColor, formatDate } from '../utils/helpers';
import { sendMessageToBackground } from '../utils/chrome';
import type { PageStatus, ExtensionSettings } from '../types';

// Helper function to safely convert i18n result to string
const safeT = (key: string, options?: any): string => {
  const result = t(key, options);
  return typeof result === 'string' ? result : String(result);
};

class ArtiAIDetectorContent {
  private floatingButton: HTMLElement | null = null;
  private floatingPanel: HTMLElement | null = null;
  private currentPageStatus: PageStatus | null = null;
  private settings: ExtensionSettings | null = null;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  constructor() {
    this.init();
  }

  private async init() {
    // Récupérer les paramètres
    const response = await sendMessageToBackground({ type: 'GET_SETTINGS' });
    if (response?.success) {
      this.settings = response.data;
    }

    // Ne pas injecter sur les pages d'extension Chrome
    if (window.location.href.startsWith('chrome://') || 
        window.location.href.startsWith('chrome-extension://') ||
        window.location.href.startsWith('moz-extension://')) {
      return;
    }

    // Vérifier si le domaine est en whitelist
    await this.checkPageStatus();
    
    if (this.currentPageStatus?.is_whitelisted) {
      return; // Ne pas injecter sur les domaines whitelistés
    }

    // Créer l'interface si activée
    if (this.settings?.showFloatingButton !== false) {
      this.createFloatingButton();
    }

    // Afficher les notifications si activées
    if (this.settings?.showNotifications !== false) {
      this.showStatusNotification();
    }

    // Écouter les messages du background script
    this.setupMessageListener();
  }

  private async checkPageStatus() {
    const response = await sendMessageToBackground({
      type: 'GET_PAGE_STATUS',
      url: window.location.href,
    });

    if (response?.success) {
      this.currentPageStatus = response.data;
    }
  }

  private createFloatingButton() {
    // Supprimer le bouton existant s'il y en a un
    if (this.floatingButton) {
      this.floatingButton.remove();
    }

    this.floatingButton = document.createElement('div');
    this.floatingButton.id = 'arti-ai-detector-button';
    this.floatingButton.className = 'arti-ai-detector-floating-button';
    
    const status = this.currentPageStatus?.status || 'unknown';
    const color = getStatusColor(status);
    
    this.floatingButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: ${color};
      border: 2px solid #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #fff;
      transition: all 0.3s ease;
      user-select: none;
    `;

    // Icône selon le statut
    const icon = this.getStatusIcon(status);
    this.floatingButton.innerHTML = icon;

    // Tooltip
    this.floatingButton.title = this.getTooltipText(status);

    // Events
    this.setupButtonEvents();

    document.body.appendChild(this.floatingButton);
  }
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'ai':
        return '🤖';
      case 'not_ai':
        return '✓';
      case 'pending':
        return '?';
      case 'whitelisted':
        return '✓';
      default:
        return this.currentPageStatus?.domain_reports_count ? '!' : '●';
    }
  }  private getTooltipText(status: string): string {
    switch (status) {
      case 'ai':
        return safeT('floating.tooltip.aiDetected');
      case 'not_ai':
        return safeT('floating.tooltip.humanContent');
      case 'pending':
        return safeT('status.pending');
      case 'whitelisted':
        return safeT('floating.tooltip.whitelisted');
      default:
        return this.currentPageStatus?.domain_reports_count 
          ? safeT('floating.tooltip.domainReported')
          : safeT('floating.tooltip.notReported');
    }
  }

  private setupButtonEvents() {
    if (!this.floatingButton) return;

    let clickTimeout: number;

    this.floatingButton.addEventListener('mousedown', (e) => {
      this.isDragging = false;
      this.dragOffset.x = e.clientX - this.floatingButton!.offsetLeft;
      this.dragOffset.y = e.clientY - this.floatingButton!.offsetTop;
      
      clickTimeout = window.setTimeout(() => {
        this.isDragging = true;
        this.floatingButton!.style.cursor = 'grabbing';
      }, 200);
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.floatingButton) {
        e.preventDefault();
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Contraindre dans la fenêtre
        const maxX = window.innerWidth - this.floatingButton.offsetWidth;
        const maxY = window.innerHeight - this.floatingButton.offsetHeight;
        
        this.floatingButton.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        this.floatingButton.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        this.floatingButton.style.right = 'auto';
        this.floatingButton.style.bottom = 'auto';
      }
    });

    document.addEventListener('mouseup', () => {
      clearTimeout(clickTimeout);
      if (this.isDragging) {
        this.isDragging = false;
        if (this.floatingButton) {
          this.floatingButton.style.cursor = 'pointer';
        }
      }
    });

    this.floatingButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isDragging) {
        this.toggleFloatingPanel();
      }
    });

    // Hover effects
    this.floatingButton.addEventListener('mouseenter', () => {
      if (!this.isDragging) {
        this.floatingButton!.style.transform = 'scale(1.1)';
      }
    });

    this.floatingButton.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        this.floatingButton!.style.transform = 'scale(1)';
      }
    });
  }

  private toggleFloatingPanel() {
    if (this.floatingPanel) {
      this.hideFloatingPanel();
    } else {
      this.showFloatingPanel();
    }
  }

  private showFloatingPanel() {
    this.floatingPanel = document.createElement('div');
    this.floatingPanel.id = 'arti-ai-detector-panel';
    this.floatingPanel.className = 'arti-ai-detector-floating-panel';
    
    this.floatingPanel.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      max-height: 500px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    `;

    this.floatingPanel.innerHTML = this.createPanelContent();
    
    // Fermer en cliquant à l'extérieur
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    document.body.appendChild(this.floatingPanel);
    this.setupPanelEvents();
  }

  private hideFloatingPanel() {
    if (this.floatingPanel) {
      this.floatingPanel.remove();
      this.floatingPanel = null;
      document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }
  }

  private handleOutsideClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!this.floatingPanel?.contains(target) && !this.floatingButton?.contains(target)) {
      this.hideFloatingPanel();
    }
  }  private createPanelContent(): string {
    const status = this.currentPageStatus;
    if (!status) {
      return `
        <div class="p-4">
          <div class="text-center text-gray-500">
            ${safeT('common.loading')}
          </div>
        </div>
      `;
    }

    const statusColor = getStatusColor(status.status);
    const reports = status.reports.slice(0, 5);

    return `
      <div class="arti-ai-detector-panel-content">
        <!-- Header -->
        <div class="bg-blue-600 text-white p-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">${safeT('popup.title')}</h3>
            <button id="close-panel" class="text-white hover:text-gray-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Current Page Status -->
        <div class="p-4 border-b">
          <h4 class="font-medium mb-2">${safeT('popup.currentPage')}</h4>
          <div class="text-sm text-gray-600 mb-2 break-all">${status.url}</div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" style="background-color: ${statusColor}"></div>
            <span class="text-sm font-medium">${safeT(`status.${status.status}`)}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-4 border-b">
          ${this.createActionsContent(status)}
        </div>

        <!-- Recent Reports -->
        <div class="p-4">
          <h4 class="font-medium mb-3">${safeT('popup.recentReports')}</h4>
          ${reports.length > 0 ? this.createReportsContent(reports) : `
            <div class="text-center text-gray-500 text-sm py-4">
              ${safeT('popup.noReports')}
            </div>
          `}
        </div>
      </div>
    `;
  }
  private createActionsContent(status: PageStatus): string {
    // Ici on devrait vérifier si l'utilisateur est connecté
    // Pour simplifier, on affiche toujours les actions
    
    if (status.status === 'unknown' || status.status === 'pending') {
      return `
        <button id="report-page" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          ${safeT('popup.reportPage')}
        </button>
      `;
    } else {
      return `
        <div class="space-y-2">
          <div class="text-sm text-gray-600 mb-3">${safeT('popup.votePage')}</div>
          <div class="flex gap-2">
            <button id="vote-approve" class="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm">
              ${safeT('vote.approve')}
            </button>
            <button id="vote-refute" class="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm">
              ${safeT('vote.refute')}
            </button>
            <button id="vote-not-ai" class="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm">
              ${safeT('vote.notAi')}
            </button>
          </div>
        </div>
      `;
    }
  }
  private createReportsContent(reports: any[]): string {
    return reports.map(report => `
      <div class="mb-3 p-3 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600 break-all mb-1">${report.url}</div>
        <div class="text-xs text-gray-500">${formatDate(report.created_at)}</div>
        <div class="text-xs text-gray-500">${safeT(`contentTypes.${report.type_contenu}`)}</div>
      </div>
    `).join('');
  }

  private setupPanelEvents() {
    if (!this.floatingPanel) return;

    // Fermer le panel
    const closeBtn = this.floatingPanel.querySelector('#close-panel');
    closeBtn?.addEventListener('click', () => this.hideFloatingPanel());

    // Actions de signalement et vote
    const reportBtn = this.floatingPanel.querySelector('#report-page');
    const voteApprove = this.floatingPanel.querySelector('#vote-approve');
    const voteRefute = this.floatingPanel.querySelector('#vote-refute');
    const voteNotAi = this.floatingPanel.querySelector('#vote-not-ai');

    reportBtn?.addEventListener('click', () => this.openReportModal());
    voteApprove?.addEventListener('click', () => this.submitVote('approve'));
    voteRefute?.addEventListener('click', () => this.submitVote('refute'));
    voteNotAi?.addEventListener('click', () => this.submitVote('not_ai'));
  }

  private openReportModal() {
    // Ouvrir le popup principal pour le signalement
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    this.hideFloatingPanel();
  }  private async submitVote(voteType: string) {
    if (!this.currentPageStatus?.reports.length) return;

    const reportId = this.currentPageStatus.reports[0].id;
    
    try {
      // Check if user is authenticated first
      const userResponse = await sendMessageToBackground({
        type: 'GET_USER_DATA'
      });

      if (!userResponse?.success || !userResponse.data.isConnected) {
        this.showNotification(safeT('auth.signInRequired'), 'warning');
        // Open popup for sign in
        chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
        this.hideFloatingPanel();
        return;
      }

      const response = await sendMessageToBackground({
        type: 'CREATE_VOTE',
        data: {
          report_id: reportId,
          vote_type: voteType,
        },
      });

      if (response?.success) {
        this.showNotification(safeT('vote.voteSuccess'), 'success');
        await this.checkPageStatus();
        this.updateFloatingButton();
        this.hideFloatingPanel();
      } else {
        const errorMessage = response?.error || safeT('vote.voteError');
        this.showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      this.showNotification(safeT('vote.voteError'), 'error');
    }
  }

  private updateFloatingButton() {
    if (this.floatingButton && this.currentPageStatus) {
      const status = this.currentPageStatus.status;
      const color = getStatusColor(status);
      const icon = this.getStatusIcon(status);
      
      this.floatingButton.style.backgroundColor = color;
      this.floatingButton.innerHTML = icon;
      this.floatingButton.title = this.getTooltipText(status);
    }
  }
  private showStatusNotification() {
    if (!this.currentPageStatus) return;

    const { status } = this.currentPageStatus;
    let message = '';
    let type: 'success' | 'warning' | 'info' = 'info';

    switch (status) {
      case 'ai':
        message = safeT('notifications.aiConfirmed');
        type = 'warning';
        break;
      case 'not_ai':
        message = safeT('notifications.humanConfirmed');
        type = 'success';
        break;
      default:
        if (this.currentPageStatus.domain_reports_count > 0) {
          message = safeT('notifications.domainHasReports');
          type = 'warning';
        }
    }

    if (message) {
      this.showNotification(message, type, 3000);
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = 'arti-ai-detector-notification';
    
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10002;
      max-width: 300px;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
      switch (message.type) {
        case 'SETTINGS_UPDATED':
          this.settings = message.settings;
          this.handleSettingsUpdate();
          break;
        case 'PAGE_STATUS_UPDATED':
          this.currentPageStatus = message.status;
          this.updateFloatingButton();
          break;
        case 'OPEN_REPORT_MODAL':
          this.openReportModal();
          break;
      }
    });
  }

  private handleSettingsUpdate() {
    if (!this.settings) return;

    // Afficher/masquer le bouton flottant
    if (this.settings.showFloatingButton) {
      if (!this.floatingButton) {
        this.createFloatingButton();
      }
    } else {
      if (this.floatingButton) {
        this.floatingButton.remove();
        this.floatingButton = null;
      }
    }
  }
}

// Injecter les styles CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  .arti-ai-detector-floating-button:hover {
    transform: scale(1.1) !important;
  }

  .arti-ai-detector-panel-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
`;
document.head.appendChild(style);

// Initialiser le content script
new ArtiAIDetectorContent();
