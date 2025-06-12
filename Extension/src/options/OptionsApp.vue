<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">          <!-- Logo and title -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ t('popup_title') }}</h1>
              <p class="text-sm text-gray-600">{{ t('settings.title') }}</p>
            </div>
          </div>

          <!-- User info and actions -->
          <div class="flex items-center space-x-4">
            <!-- Language selector -->
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-700">{{ t('settings.language') }}:</label>
              <select 
                v-model="currentLanguage"
                @change="handleLanguageChange"
                class="form-select text-sm"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <!-- User info -->
            <div v-if="isConnected && currentUser" class="flex items-center space-x-3">
              <img 
                :src="currentUser.avatar_url" 
                :alt="currentUser.pseudo"
                class="w-8 h-8 rounded-full border-2 border-gray-300"
              >
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{{ currentUser.pseudo }}</div>
                <div class="text-xs text-gray-500">{{ t(`role.${currentUser.role}`) }}</div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-600">
              {{ t('auth.guest') }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-6xl mx-auto px-4 py-8">
      <!-- Navigation tabs -->
      <nav class="mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>
      </nav>

      <!-- Tab content -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="space-y-8">
          <SettingsSection 
            @settings-saved="handleSettingsSaved"
          />
        </div>

        <!-- Account Tab -->
        <div v-else-if="activeTab === 'account'" class="space-y-6">
          <AccountSection 
            :user="currentUser"
            :is-connected="isConnected"
            @sign-in="handleSignIn"
            @sign-out="handleSignOut"
          />
        </div>

        <!-- Subscription Tab -->
        <div v-else-if="activeTab === 'subscription'" class="space-y-6">
          <SubscriptionSection 
            :current-plan="currentUser?.role || 'free'"
            @plan-changed="handlePlanChanged"
          />
        </div>

        <!-- Stats Tab -->
        <div v-else-if="activeTab === 'stats'" class="space-y-6">
          <StatsSection />
        </div>

        <!-- Leaderboard Tab -->
        <div v-else-if="activeTab === 'leaderboard'" class="space-y-6">
          <LeaderboardSection />
        </div>

        <!-- About Tab -->
        <div v-else-if="activeTab === 'about'" class="space-y-6">
          <AboutSection />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-12">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6 text-sm text-gray-600">
            <a 
              href="https://arti-ai-detector.com/privacy"
              target="_blank"
              class="hover:text-gray-900 transition-colors"
            >
              {{ t('footer.privacy') }}
            </a>
            <a 
              href="https://arti-ai-detector.com/terms"
              target="_blank"
              class="hover:text-gray-900 transition-colors"
            >
              {{ t('footer.terms') }}
            </a>
            <a 
              href="https://arti-ai-detector.com/help"
              target="_blank"
              class="hover:text-gray-900 transition-colors"
            >
              {{ t('footer.help') }}
            </a>
          </div>
          <div class="text-sm text-gray-500">
            v{{ version }}
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { t, changeLanguage, getCurrentLanguage } from '../i18n'
import { sendMessageToBackground } from '../utils/chrome'
import type { User } from '../types'

// Components
import SettingsSection from './sections/SettingsSection.vue'
import AccountSection from './sections/AccountSection.vue'
import SubscriptionSection from './sections/SubscriptionSection.vue'
import StatsSection from './sections/StatsSection.vue'
import LeaderboardSection from './sections/LeaderboardSection.vue'
import AboutSection from './sections/AboutSection.vue'

// State
const activeTab = ref('settings')
const currentUser = ref<User | null>(null)
const isConnected = ref(false)
const currentLanguage = ref(getCurrentLanguage())

// Computed
const tabs = computed(() => [
  { id: 'settings', label: t('settings.title') },
  { id: 'account', label: t('auth.account') },
  { id: 'subscription', label: t('subscription.title') },
  { id: 'stats', label: t('stats.title') },
  { id: 'leaderboard', label: t('leaderboard.title') },
  { id: 'about', label: t('about.title') }
])

const version = '1.0.0' // TODO: Get from manifest

// Methods
const handleLanguageChange = async () => {
  changeLanguage(currentLanguage.value)
  await sendMessageToBackground({
    type: 'UPDATE_SETTINGS',
    data: { language: currentLanguage.value }
  })
}

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

const handleSettingsSaved = (settings: any) => {
  console.log('Settings saved:', settings)
}

const handlePlanChanged = (plan: string) => {
  if (currentUser.value) {
    currentUser.value.role = plan
  }
}

const loadUserData = async () => {
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
}

// Initialize URL-based tab selection
const initializeFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const tab = urlParams.get('tab')
  if (tab && tabs.value.some(t => t.id === tab)) {
    activeTab.value = tab
  }
}

// Update URL when tab changes
const updateURL = (tabId: string) => {
  const url = new URL(window.location.href)
  url.searchParams.set('tab', tabId)
  window.history.replaceState({}, '', url.toString())
}

// Watch for tab changes
const handleTabChange = (newTab: string) => {
  activeTab.value = newTab
  updateURL(newTab)
}

// Lifecycle
onMounted(async () => {
  initializeFromURL()
  await loadUserData()
})
</script>

<style scoped>
.form-select {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500;
}
</style>
