import { t } from '../i18n';
import { getStatusColor } from '../utils/helpers';
import { sendMessageToBackground } from '../utils/chrome';
import { changeLanguage } from '../i18n'; // <-- add this import
import type { PageStatus, ExtensionSettings } from '../types';

// Helper function to safely convert i18n result to string
const safeT = (key: string, options?: any): string => {
  const result = t(key, options);
  // LOG: clé, langue courante, valeur retournée
  // @ts-ignore
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[safeT]', { key, currentLang: window.localStorage?.getItem('arti-ai-detector-language'), result });
  }
  return typeof result === 'string' ? result : String(result);
};

class ArtiAIDetectorContent {
  private floatingButton: HTMLElement | null = null;
  private floatingPanel: HTMLElement | null = null;
  private currentPageStatus: PageStatus | null = null;
  private settings: ExtensionSettings | null = null;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  // Ajout d'une propriété pour stocker la version liée de handleOutsideClick
  private handleOutsideClickBound: (e: Event) => void;

  constructor() {
    this.handleOutsideClickBound = this.handleOutsideClick.bind(this);
    this.init();
    window.addEventListener('resize', () => this.positionPanelRelativeToButton());
  }

  private positionPanelRelativeToButton() {
    const button = this.floatingButton;
    const panel = this.floatingPanel;
    if (!button || !panel) {
      return;
    }



    // Utilise offset si le bouton est déplacé (drag)
    let btnLeft = button.offsetLeft;
    let btnTop = button.offsetTop;
    let btnWidth = button.offsetWidth;
    // fallback sur getBoundingClientRect si offsetLeft/Top = 0
    if (!btnLeft && !btnTop) {
      const btnRect = button.getBoundingClientRect();
      btnLeft = btnRect.left;
      btnTop = btnRect.top;
      btnWidth = btnRect.width;
    }
    const panelRect = panel.getBoundingClientRect();
    const padding = 16;

    let left = btnLeft + btnWidth + padding;
    let top = btnTop;

    // Si le panel déborde à droite, essayer de le placer à gauche du bouton
    if (left + panelRect.width > window.innerWidth - padding) {
      left = btnLeft - panelRect.width - padding;
    }
    // Si ça déborde encore à gauche, coller le panel au bord gauche
    if (left < padding) left = padding;

    // Si le panel déborde en bas, le remonter
    if (top + panelRect.height > window.innerHeight - padding) {
      top = window.innerHeight - panelRect.height - padding;
    }
    // Si ça déborde encore en haut, coller le panel en haut
    if (top < padding) top = padding;

    // Fallback : si la position est hors écran, force en haut à gauche
    if (left < 0 || left > window.innerWidth - 50 || top < 0 || top > window.innerHeight - 50) {
      left = 20;
      top = 20;
    }

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.maxHeight = `calc(100vh - ${2 * padding}px)`;
    panel.style.overflowY = 'auto';
    panel.style.position = 'fixed';
    panel.style.display = 'block';
    panel.style.visibility = 'visible';
    panel.style.zIndex = '10001';
  }

  private async init() {
    // Récupérer les paramètres depuis chrome.storage d'abord, avec valeurs par défaut
    const response = await sendMessageToBackground({ type: 'GET_SETTINGS' });
    // eslint-disable-next-line no-console
    console.log('[ArtiAIDetectorContent:init] settings response', response);
    
    let languageToUse = 'en'; // Défaut
    
    if (response?.success && response.data) {
      this.settings = response.data;
      if (this.settings?.language) {
        languageToUse = this.settings.language;
        // eslint-disable-next-line no-console
        console.log('[ArtiAIDetectorContent:init] Using extension language:', languageToUse);
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn('[ArtiAIDetectorContent:init] Failed to get settings, using defaults');
    }
    
    // Forcer l'application de la langue dans le content script
    await changeLanguage(languageToUse);

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
    // Si le bouton existe déjà, on le met simplement à jour sans le supprimer
    if (this.floatingButton) {
      const status = this.currentPageStatus?.status || 'unknown';
      const color = getStatusColor(status);
      this.floatingButton.style.backgroundColor = color;
      this.floatingButton.innerHTML = this.getStatusIcon(status);
      this.floatingButton.title = this.getTooltipText(status);
      // Réattacher les événements pour s'assurer qu'ils sont à jour
      this.setupButtonEvents();
      return;
    }

    // Déterminer la position à partir des settings
    let positionStyle = '';
    switch (this.settings?.floatingButtonPosition) {
      case 'top-left':
        positionStyle = 'top: 20px; left: 20px;';
        break;
      case 'top-right':
        positionStyle = 'top: 20px; right: 20px;';
        break;
      case 'bottom-left':
        positionStyle = 'bottom: 20px; left: 20px;';
        break;
      case 'bottom-right':
      default:
        positionStyle = 'bottom: 20px; right: 20px;';
        break;
    }

    // Sinon, on crée le bouton normalement
    this.floatingButton = document.createElement('div');
    this.floatingButton.id = 'arti-ai-detector-button';
    this.floatingButton.className = 'arti-ai-detector-floating-button';
    const status = this.currentPageStatus?.status || 'unknown';
    const color = getStatusColor(status);
    this.floatingButton.style.cssText = `
      position: fixed;
      ${positionStyle}
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: ${color};
      border: 2px solid #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      z-index: 2147483647 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #fff;
      transition: all 0.3s ease;
      user-select: none;
    `;
    this.floatingButton.innerHTML = this.getStatusIcon(status);
    this.floatingButton.title = this.getTooltipText(status);
    this.setupButtonEvents();
    document.body.appendChild(this.floatingButton);
  }

  private getStatusIcon(status: string): string {
    // Affiche toujours l'image arti.png, non sélectionnable et non draggable
    return `<img src="chrome-extension://${chrome.runtime.id}/icons/arti.png" alt="Arti AI" style="width: 40px; height: 40px; display: block; user-select: none; pointer-events: none; -webkit-user-drag: none;" draggable="false" />`;
  }

  private getTooltipText(status: string): string {
    switch (status) {
      case 'ai':
        return safeT('floating_tooltip_aiDetected');
      case 'not_ai':
        return safeT('floating_tooltip_humanContent');
      case 'whitelisted':
        return safeT('floating_tooltip_whitelisted');
      default:
        return this.currentPageStatus?.domain_reports_count 
          ? safeT('floating_tooltip_domainReported')
          : safeT('floating_tooltip_notReported');
    }
  }

  private setupButtonEvents() {
    if (!this.floatingButton) return;

    let clickTimeout: number;
    let dragStarted = false;
    const button = this.floatingButton; // capture locale non nulle

    button.addEventListener('mousedown', (e) => {
      dragStarted = false;
      this.isDragging = false;
      this.dragOffset.x = e.clientX - button.offsetLeft;
      this.dragOffset.y = e.clientY - button.offsetTop;
      
      clickTimeout = window.setTimeout(() => {
        this.isDragging = true;
        dragStarted = true;
        button.style.cursor = 'grabbing';
        button.classList.add('moving');
        if (this.floatingPanel) this.floatingPanel.classList.add('moving');
      }, 150); // plus réactif
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        e.preventDefault();
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        const maxX = window.innerWidth - button.offsetWidth;
        const maxY = window.innerHeight - button.offsetHeight;
        button.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        button.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        button.style.right = 'auto';
        button.style.bottom = 'auto';
        // Repositionne le panel si ouvert
        if (this.floatingPanel) this.positionPanelRelativeToButton();
      }
    });

    document.addEventListener('mouseup', () => {
      clearTimeout(clickTimeout);
      if (this.isDragging) {
        this.isDragging = false;
        button.style.cursor = 'pointer';
        button.classList.remove('moving');
        if (this.floatingPanel) {
          this.floatingPanel.classList.remove('moving');
        }
      }
    });

    // Click sur le bouton (hors drag)
    button.addEventListener('click', (e) => {
      if (!dragStarted) {
        e.stopPropagation();
        this.toggleFloatingPanel();
      }
      dragStarted = false;
    });

    // Hover effects
    button.addEventListener('mouseenter', () => {
      if (!this.isDragging) {
        button.style.transform = 'scale(1.1)';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        button.style.transform = 'scale(1)';
      }
    });

    // Empêche le drag & drop natif de l'image dans le bouton
    button.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
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
    // Si le panel existe déjà, on le supprime avant de le recréer (pour éviter les doublons et garantir la bonne langue)
    if (this.floatingPanel) {
      this.floatingPanel.remove();
      this.floatingPanel = null;
      document.removeEventListener('click', this.handleOutsideClickBound);
    }

    this.floatingPanel = document.createElement('div');
    this.floatingPanel.id = 'arti-ai-detector-panel';
    this.floatingPanel.className = 'arti-ai-detector-floating-panel';
    this.floatingPanel.style.cssText = `
      position: fixed;
      width: 350px;
      max-height: 500px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 2147483647 !important;
      overflow: hidden;
      animation: arti-slideUp 0.3s ease-out;
      display: block;
      visibility: visible;
    `;

    this.floatingPanel.innerHTML = this.createPanelContent();

    document.addEventListener('click', this.handleOutsideClickBound);

    document.body.appendChild(this.floatingPanel);
    this.setupPanelEvents();
    setTimeout(() => {
      this.positionPanelRelativeToButton();
    }, 10);
  }

  private hideFloatingPanel() {
    if (this.floatingPanel) {
      this.floatingPanel.remove();
      this.floatingPanel = null;
      document.removeEventListener('click', this.handleOutsideClickBound);
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

    return `
      <div class="arti-ai-detector-panel-content">
        <!-- Header -->
        <div class="bg-blue-600 text-white p-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">${safeT('popup_title')}</h3>
            <button id="close-panel" class="text-white hover:text-gray-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Current Page Status -->
        <div class="p-4 border-b">
          <h4 class="font-medium mb-2">${safeT('popup_currentPage')}</h4>
          <div class="text-sm text-gray-600 mb-2 break-all">${status.url}</div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" style="background-color: ${statusColor}"></div>
            <span class="text-sm font-medium">${safeT(`status_${status.status}`)}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-4">
          ${this.createActionsContent(status)}
        </div>
      </div>
    `;
  }
  private createActionsContent(status: PageStatus): string {
    if (status.status === 'not_reported' || status.status === 'domain_has_reports') {
      return `
        <div class="report-actions-panel bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 class="font-medium text-blue-800 mb-3 flex items-center gap-2">
            <img src="chrome-extension://${chrome.runtime.id}/icons/icon-128.png" class="w-5 h-5" alt="Arti AI Detector">
            ${safeT('popup_reportPage')}
          </h4>

          <form id="report-form" class="space-y-4">
            <!-- Report type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${safeT('report_contentType')}
              </label>
              <select 
                id="report-type" 
                class="form-select w-full"
                required
              >
                <option value="">${safeT('report_selectType')}</option>
                <option value="text">${safeT('contentTypes_text')}</option>
                <option value="image">${safeT('contentTypes_image')}</option>
                <option value="video">${safeT('contentTypes_video')}</option>
                <option value="audio">${safeT('contentTypes_audio')}</option>
                <option value="other">${safeT('common_optional')}</option>
              </select>
            </div>

            <!-- Evidence URL (optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${safeT('report_evidenceUrl')}
                <span class="text-gray-500 font-normal">(${safeT('optional')})</span>
              </label>
              <input
                id="evidence-url"
                type="url"
                class="form-input w-full"
                placeholder="${safeT('report_evidenceUrlPlaceholder')}"
              >
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${safeT('report_description')}
                <span class="text-gray-500 font-normal">(${safeT('optional')})</span>
              </label>
              <textarea 
                id="report-description"
                class="form-textarea w-full"
                rows="3"
                placeholder="${safeT('report_descriptionPlaceholder')}"
                maxlength="500"
              ></textarea>
              <div class="flex items-center justify-between text-xs text-gray-500 mt-1 flex-nowrap">
                <span class="flex-shrink-0" style="min-width:0"><span id="char-count">0</span>/500</span>
                <label class="flex items-center gap-1 min-w-0 w-auto flex-shrink-0 ml-2">
                  <input type="checkbox" id="report-anonyme" class="flex-shrink-0" />
                  <span class="text-sm text-gray-700 whitespace-nowrap min-w-0 max-w-full">${safeT('report.report_anonymous')}</span>
                </label>
              </div>
            </div>

            <!-- Submit button -->
            <button 
              type="submit" 
              id="submit-report"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span id="submit-text">${safeT('report_submit')}</span>
              <span id="submit-loading" class="hidden flex items-center justify-center gap-2">
                <div class="spinner"></div>
                ${safeT('report_submitting')}
              </span>
            </button>
            
            <div id="report-error" class="hidden text-red-600 text-sm mt-2"></div>
            <div id="report-success" class="hidden text-green-700 bg-green-50 border border-green-200 rounded text-sm mt-2 px-3 py-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              ${safeT('report_submitSuccess')}
            </div>
          </form>
        </div>
      `;
    } else if (status.status === 'ai' || status.status === 'pending') {
      // Boutons de vote uniquement pour les pages signalées
      return `
        <div class="space-y-2">
          <div class="text-sm text-gray-600 mb-3">${safeT('popup_votePage')}</div>
          <div class="flex gap-2">
            <button id="vote-approve" class="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm">
              ${safeT('vote_approve')}
            </button>
            <button id="vote-refute" class="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm">
              ${safeT('vote_refute')}
            </button>
            <button id="vote-not-ai" class="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm">
              ${safeT('vote_notAi')}
            </button>
          </div>
        </div>
      `;
    } else {
      // Pour les autres statuts (whitelisted, not_ai, etc.), pas d'actions disponibles
      return `
        <div class="text-center text-gray-500 text-sm py-4">
          ${safeT('popup_noActionsAvailable')}
        </div>
      `;
    }
  }

  private setupPanelEvents() {
    if (!this.floatingPanel) return;

    // Fermer le panel
    const closeBtn = this.floatingPanel.querySelector('#close-panel');
    closeBtn?.addEventListener('click', () => this.hideFloatingPanel());

    // Gestion du formulaire de signalement
    const reportForm = this.floatingPanel.querySelector('#report-form');
    if (reportForm) {
      this.setupReportFormEvents();
    }

    // Actions de vote
    const voteApprove = this.floatingPanel.querySelector('#vote-approve');
    const voteRefute = this.floatingPanel.querySelector('#vote-refute');
    const voteNotAi = this.floatingPanel.querySelector('#vote-not-ai');

    voteApprove?.addEventListener('click', () => this.submitVote('approve'));
    voteRefute?.addEventListener('click', () => this.submitVote('refute'));
    voteNotAi?.addEventListener('click', () => this.submitVote('not_ai'));
  }

  private setupReportFormEvents() {
    const reportForm = this.floatingPanel?.querySelector('#report-form') as HTMLFormElement;
    const reportType = this.floatingPanel?.querySelector('#report-type') as HTMLSelectElement;
    const description = this.floatingPanel?.querySelector('#report-description') as HTMLTextAreaElement;
    const charCount = this.floatingPanel?.querySelector('#char-count');
    const submitBtn = this.floatingPanel?.querySelector('#submit-report') as HTMLButtonElement;

    if (!reportForm || !reportType || !description || !submitBtn) return;

    // Compteur de caractères
    description.addEventListener('input', () => {
      if (charCount) {
        charCount.textContent = description.value.length.toString();
      }
    });

    // Validation en temps réel
    const validateForm = () => {
      const isValid = reportType.value.trim() !== '';
      submitBtn.disabled = !isValid;
    };

    reportType.addEventListener('change', validateForm);
    validateForm(); // Validation initiale

    // Soumission du formulaire
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!reportType.value) {
        this.showFormError(safeT('report_selectType'));
        return;
      }

      // Vérifier si l'utilisateur est connecté
      const userResponse = await sendMessageToBackground({
        type: 'GET_USER_DATA'
      });

      if (!userResponse?.success || !userResponse.data.isConnected) {
        this.showNotification(safeT('auth.signInRequired'), 'warning');
        // Ouvrir le popup pour se connecter
        chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
        this.hideFloatingPanel();
        return;
      }

      // Préparer les données
      const evidenceUrlInput = this.floatingPanel?.querySelector('#evidence-url') as HTMLInputElement;
      const anonymeInput = this.floatingPanel?.querySelector('#report-anonyme') as HTMLInputElement;
      const reportData = {
        url: window.location.href,
        type_contenu: reportType.value,
        commentaire: description.value || null,
        evidence_url: evidenceUrlInput?.value || null,
        anonyme: anonymeInput?.checked || false,
        whitelist_request: false
      };

      // Afficher l'état de chargement
      this.setSubmitState(true);
      this.hideFormMessages();

      try {
        const response = await sendMessageToBackground({
          type: 'CREATE_REPORT',
          data: reportData
        });

        if (response?.success) {
          this.showFormSuccess();
          this.resetReportForm();
          // Recharger le statut de la page
          await this.checkPageStatus();
          this.updateFloatingButton();
          // Fermer le panel après 2 secondes
          setTimeout(() => {
            this.hideFloatingPanel();
          }, 2000);
        } else {
          const errorMessage = response?.error || safeT('report_submitError');
          this.showFormError(errorMessage);
        }
      } catch (error) {
        console.error('Error submitting report:', error);
        this.showFormError(safeT('report_submitError'));
      } finally {
        this.setSubmitState(false);
      }
    });

    // Initialiser la case à cocher anonyme selon les settings
    const anonymeInput = this.floatingPanel?.querySelector('#report-anonyme') as HTMLInputElement;
    if (anonymeInput && this.settings && typeof this.settings.anonymousReporting === 'boolean') {
      anonymeInput.checked = !!this.settings.anonymousReporting;
    }
  }

  private setSubmitState(loading: boolean) {
    const submitBtn = this.floatingPanel?.querySelector('#submit-report') as HTMLButtonElement;
    const submitText = this.floatingPanel?.querySelector('#submit-text');
    const submitLoading = this.floatingPanel?.querySelector('#submit-loading');

    if (submitBtn && submitText && submitLoading) {
      submitBtn.disabled = loading;
      if (loading) {
        submitText.classList.add('hidden');
        submitLoading.classList.remove('hidden');
      } else {
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
      }
    }
  }

  private showFormError(message: string) {
    const errorDiv = this.floatingPanel?.querySelector('#report-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }

  private showFormSuccess() {
    const successDiv = this.floatingPanel?.querySelector('#report-success');
    if (successDiv) {
      successDiv.classList.remove('hidden');
    }
  }

  private hideFormMessages() {
    const errorDiv = this.floatingPanel?.querySelector('#report-error');
    const successDiv = this.floatingPanel?.querySelector('#report-success');
    
    if (errorDiv) errorDiv.classList.add('hidden');
    if (successDiv) successDiv.classList.add('hidden');
  }

  private resetReportForm() {
    const reportType = this.floatingPanel?.querySelector('#report-type') as HTMLSelectElement;
    const evidenceUrl = this.floatingPanel?.querySelector('#evidence-url') as HTMLInputElement;
    const description = this.floatingPanel?.querySelector('#report-description') as HTMLTextAreaElement;
    const charCount = this.floatingPanel?.querySelector('#char-count');

    if (reportType) reportType.value = '';
    if (evidenceUrl) evidenceUrl.value = '';
    if (description) description.value = '';
    if (charCount) charCount.textContent = '0';
  }

  private async submitVote(voteType: string) {
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
        message = safeT('notifications_aiConfirmed');
        type = 'error'; // était 'warning', devient 'error' pour rouge
        break;
      case 'not_ai':
        message = safeT('notifications_humanConfirmed');
        type = 'success';
        break;
      default:
        if (this.currentPageStatus.domain_reports_count > 0) {
          message = safeT('notifications_domainHasReports');
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
      animation: arti-slideIn 0.3s ease-out;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'arti-slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
      // eslint-disable-next-line no-console
      console.log('[ArtiAIDetectorContent:chrome.runtime.onMessage]', message);
      switch (message.type) {
        case 'SETTINGS_UPDATED':
          this.settings = message.settings;
          if (this.settings?.language) {
            // eslint-disable-next-line no-console
            console.log('[ArtiAIDetectorContent:SETTINGS_UPDATED] changeLanguage', this.settings.language);
            changeLanguage(this.settings.language); // Update i18n language
            this.rerenderPanelIfOpen(); // Re-render panel if open
          }
          this.handleSettingsUpdate();
          break;
        case 'PAGE_STATUS_UPDATED':
          this.currentPageStatus = message.status;
          this.updateFloatingButton();
          break;
        case 'OPEN_REPORT_MODAL':
          // Si le bouton flottant existe, ouvrir le panel avec le formulaire
          if (this.floatingButton) {
            this.showFloatingPanel();
          } else {
            // Fallback : ouvrir le popup principal
            chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
          }
          break;
      }
    });

    // Écouter les changements dans chrome.storage pour synchronisation directe
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.settings) {
        const newSettings = changes.settings.newValue;
        this.settings = newSettings;
        // Toujours mettre à jour l'affichage du bouton flottant
        this.handleSettingsUpdate();
        // Mettre à jour la langue si besoin
        if (newSettings?.language && newSettings.language !== this.settings?.language) {
          // eslint-disable-next-line no-console
          console.log('[ArtiAIDetectorContent:storage.onChanged] changeLanguage', newSettings.language);
          changeLanguage(newSettings.language);
          this.rerenderPanelIfOpen();
        }
      }
    });
  }

  private handleSettingsUpdate() {
    if (!this.settings) return;
    // Log pour debug
    // eslint-disable-next-line no-console
    console.log('[handleSettingsUpdate] showFloatingButton:', this.settings.showFloatingButton);
    // Afficher/masquer le bouton flottant uniquement si l'option d'affichage est explicitement false
    if (this.settings.showFloatingButton === false) {
      if (this.floatingButton) {
        this.floatingButton.remove();
        this.floatingButton = null;
      }
    } else {
      if (!this.floatingButton) {
        this.createFloatingButton();
      }
      // Ne pas recréer le bouton si déjà présent (évite le flash lors du changement de langue)
    }
    // Ne pas toucher au bouton si déjà présent et showFloatingButton reste vrai ou undefined
  }

  // Add a method to re-render the panel content if open
  private rerenderPanelIfOpen() {
    // Met à jour le bouton flottant sans le supprimer/recréer
    if (this.floatingButton && this.currentPageStatus) {
      const status = this.currentPageStatus.status;
      const color = getStatusColor(status);
      const icon = this.getStatusIcon(status);
      this.floatingButton.style.backgroundColor = color;
      this.floatingButton.innerHTML = icon;
      this.floatingButton.title = this.getTooltipText(status);
    } else if (this.settings?.showFloatingButton && !this.floatingButton) {
      this.createFloatingButton();
    }
    // Si le panel était ouvert, on met à jour son contenu sans le recréer
    if (this.floatingPanel) {
      this.floatingPanel.innerHTML = this.createPanelContent();
      this.setupPanelEvents();
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

  .arti-ai-detector-floating-button {
    z-index: 2147483647 !important;
  }
  .arti-ai-detector-floating-panel,
  .arti-ai-detector-panel-content {
    z-index: 2147483647 !important;
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
