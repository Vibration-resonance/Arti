<template>
  <div class="bg-white">
    <!-- Header -->
    <PopupHeader 
      :user="currentUser"
      :is-connected="isConnected"
      @sign-in="handleSignIn"
      @sign-out="handleSignOut"
      @open-modal="openModal"
      @language-changed="handleLanguageChange"
    />

    <!-- Main Content -->
    <div class="p-4 space-y-4">
      <!-- Feedback visuel signalement -->
      <div v-if="reportFeedback" :class="[
        'mb-2 px-4 py-2 rounded text-sm font-medium',
        reportFeedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
      ]">
        {{ reportFeedback.message }}
      </div>
      <!-- Current Page Status -->
      <PageStatusComponent 
        :status="pageStatus"
        :loading="statusLoading"
      />

      <!-- Actions Section -->
      <div v-if="isConnected && pageStatus">
        <ReportActions
          v-if="canReport"
          :page-url="currentUrl"
          :feedback-type="reportFeedback?.type"
          @report-submitted="handleReportSubmitted"
        />
        
        <VoteActions
          v-else-if="canVote"
          :report="mainReport"
          @vote-submitted="handleVoteSubmitted"
        />
      </div>

      <!-- Recent Reports -->
      <RecentReports 
        :reports="recentReports"
        :loading="reportsLoading"
      />
    </div>

    <!-- Footer -->
    <PopupFooter 
      :user-role="currentUser?.role"
      @upgrade="openUpgradeModal"
    />

    <!-- Modals -->
    <Teleport to="body">
      <ModalContainer
        v-if="activeModal"
        :modal-type="activeModal"
        @close="closeModal"
        @action="handleModalAction"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { t } from '../i18n'
import { getCurrentTab, sendMessageToBackground } from '../utils/chrome'
import type { User, PageStatus, Report } from '../types'

// Components
import PopupHeader from '../components/PopupHeader.vue'
import PopupFooter from '../components/PopupFooter.vue'
import PageStatusComponent from '../components/PageStatus.vue'
import ReportActions from '../components/ReportActions.vue'
import VoteActions from '../components/VoteActions.vue'
import RecentReports from '../components/RecentReports.vue'
import ModalContainer from '../components/ModalContainer.vue'

// State
const currentUser = ref<User | null>(null)
const isConnected = ref(false)
const currentUrl = ref('')
const pageStatus = ref<PageStatus | null>(null)
const recentReports = ref<Report[]>([])
const activeModal = ref<string | null>(null)

// Loading states
const statusLoading = ref(true)
const reportsLoading = ref(true)

// Feedback message
const reportFeedback = ref<{ type: 'success' | 'error', message: string } | null>(null)

// Computed
const canReport = computed(() => {
  return pageStatus.value &&
    (
      pageStatus.value.status === 'unknown' ||
      pageStatus.value.status === 'not_reported'
    )
})

const canVote = computed(() => {
  return pageStatus.value &&
    Array.isArray(pageStatus.value.reports) &&
    pageStatus.value.reports.length > 0 &&
    (
      pageStatus.value.status === 'ai' ||
      pageStatus.value.status === 'reported_ia' ||
      pageStatus.value.status === 'not_ai' ||
      pageStatus.value.status === 'confirmed_not_ia'
    )
})

const mainReport = computed(() => {
  return Array.isArray(pageStatus.value?.reports) && pageStatus.value.reports.length > 0
    ? pageStatus.value.reports[0]
    : null
})

// Methods
const handleSignIn = async () => {
  try {
    const response = await sendMessageToBackground({
      type: 'SIGN_IN'
    })

    if (response?.success) {
      currentUser.value = response.user
      isConnected.value = true
    } else {
      console.error('Sign in failed:', response?.error)
    }
  } catch (error) {
    console.error('Sign in error:', error)
  }
}

const handleSignOut = async () => {
  try {
    const response = await sendMessageToBackground({
      type: 'SIGN_OUT'
    })

    if (response?.success) {
      isConnected.value = false
      currentUser.value = null
    } else {
      console.error('Sign out failed:', response?.error)
    }
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

const handleLanguageChange = (language: string) => {
  // Language change is handled by the i18n system
  console.log('Language changed to:', language)
}

const openModal = (modalType: string) => {
  activeModal.value = modalType
}

const closeModal = () => {
  activeModal.value = null
}

const openUpgradeModal = () => {
  activeModal.value = 'upgrade'
}

const handleModalAction = (action: string, data?: any) => {
  console.log('Modal action:', action, data)
  // Handle different modal actions
  closeModal()
}

const handleReportSubmitted = async (reportData: any) => {
  if (!isConnected.value) {
    reportFeedback.value = { type: 'error', message: t('auth.signIn') + ' ' + t('report.submitError') };
    setTimeout(() => { reportFeedback.value = null }, 3000);
    return { success: false, error: t('auth.signIn') };
  }
  try {
    const response = await sendMessageToBackground({
      type: 'CREATE_REPORT',
      data: reportData
    })
    console.log('[PopupApp] Raw report response:', response); // <-- Debug log
    if (response?.success) {
      await loadPageStatus()
      await loadRecentReports()
      reportFeedback.value = { type: 'success', message: t('report_submitSuccess') }
    } else {
      // Log complet et explicite
      if (response && typeof response === 'object') {
        console.error('Report error response:', JSON.stringify(response, null, 2))
      } else {
        console.error('Report error response:', response)
      }
      // Affiche le message d'erreur brut si présent
      reportFeedback.value = { type: 'error', message: response?.error || response?.message || t('report.submitError') }
    }
    // Efface le message après 3s
    setTimeout(() => { reportFeedback.value = null }, 3000)
    return response
  } catch (error) {
    console.error('Error submitting report:', error)
    reportFeedback.value = { type: 'error', message: t('report.submitError') }
    setTimeout(() => { reportFeedback.value = null }, 3000)
    return { success: false, error: t('report.submitError') }
  }
}

const handleVoteSubmitted = async (voteData: any) => {
  try {
    const response = await sendMessageToBackground({
      type: 'CREATE_VOTE',
      data: voteData
    })

    if (response?.success) {
      await loadPageStatus()
    }
  } catch (error) {
    console.error('Error submitting vote:', error)
  }
}

const loadPageStatus = async () => {
  if (!currentUrl.value) return

  statusLoading.value = true
  try {
    const response = await sendMessageToBackground({
      type: 'GET_PAGE_STATUS',
      url: currentUrl.value
    })

    if (response?.success) {
      pageStatus.value = response.data
    }
  } catch (error) {
    console.error('Error loading page status:', error)
  } finally {
    statusLoading.value = false
  }
}

const loadRecentReports = async () => {
  reportsLoading.value = true
  try {
    const response = await sendMessageToBackground({
      type: 'GET_RECENT_REPORTS'
    })

    if (response?.success) {
      recentReports.value = response.data?.reports || []
    } else {
      recentReports.value = []
    }
  } catch (error) {
    console.error('Error loading recent reports:', error)
    recentReports.value = []
  } finally {
    reportsLoading.value = false
  }
}

const init = async () => {
  // Get current tab URL
  const tab = await getCurrentTab()
  if (tab?.url) {
    currentUrl.value = tab.url
  }

  // Check auth status and load user data
  try {
    const response = await sendMessageToBackground({
      type: 'GET_USER_DATA'
    })

    if (response?.success) {
      currentUser.value = response.data.user
      isConnected.value = response.data.isConnected
    }
  } catch (error) {
    console.error('Error loading user data:', error)
  }

  // Load data
  await Promise.all([
    loadPageStatus(),
    loadRecentReports()
  ])
}

// Lifecycle
onMounted(() => {
  init()
})
</script>
