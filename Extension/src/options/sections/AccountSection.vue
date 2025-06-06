<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('auth.account') }}</h2>
      <p class="text-gray-600 mb-6">{{ t('auth.accountDescription') }}</p>
    </div>

    <!-- Connected user -->
    <div v-if="isConnected && user" class="space-y-6">
      <!-- User profile card -->
      <div class="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div class="flex items-center space-x-4">
          <img 
            :src="user.avatar_url" 
            :alt="user.pseudo"
            class="w-16 h-16 rounded-full border-3 border-white shadow-lg"
          >
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ user.pseudo }}</h3>
            <p class="text-sm text-gray-600">{{ user.email }}</p>
            <div class="flex items-center space-x-2 mt-2">
              <div 
                class="w-3 h-3 rounded-full"
                :class="getRoleColorClass(user.role)"
              ></div>
              <span class="text-sm font-medium text-gray-700">
                {{ t(`role.${user.role}`) }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-600">{{ t('auth.memberSince') }}</div>
            <div class="text-sm font-medium text-gray-900">
              {{ formatDate(user.created_at) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-600 mb-1">
            {{ userStats.total_reports || 0 }}
          </div>
          <div class="text-sm text-blue-700">
            {{ t('stats.totalReports') }}
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-600 mb-1">
            {{ userStats.total_points || 0 }}
          </div>
          <div class="text-sm text-green-700">
            {{ t('stats.totalPoints') }}
          </div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-yellow-600 mb-1">
            {{ userStats.accuracy_percentage || 0 }}%
          </div>
          <div class="text-sm text-yellow-700">
            {{ t('stats.accuracy') }}
          </div>
        </div>
      </div>

      <!-- Account actions -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('auth.accountActions') }}</h3>
        <div class="space-y-4">
          <!-- Update profile -->
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-700">{{ t('auth.updateProfile') }}</h4>
              <p class="text-sm text-gray-500">{{ t('auth.updateProfileDescription') }}</p>
            </div>
            <a 
              href="https://arti-ai-detector.com/profile"
              target="_blank"
              class="btn-secondary"
            >
              {{ t('auth.updateProfile') }}
            </a>
          </div>

          <!-- Export data -->
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-700">{{ t('auth.exportData') }}</h4>
              <p class="text-sm text-gray-500">{{ t('auth.exportDataDescription') }}</p>
            </div>
            <button 
              @click="exportUserData"
              :disabled="exporting"
              class="btn-secondary disabled:opacity-50"
            >
              <span v-if="exporting" class="flex items-center gap-2">
                <div class="spinner"></div>
                {{ t('auth.exporting') }}
              </span>
              <span v-else>
                {{ t('auth.exportData') }}
              </span>
            </button>
          </div>

          <!-- Delete account -->
          <div class="flex items-center justify-between border-t pt-4">
            <div>
              <h4 class="text-sm font-medium text-red-700">{{ t('auth.deleteAccount') }}</h4>
              <p class="text-sm text-gray-500">{{ t('auth.deleteAccountDescription') }}</p>
            </div>
            <button 
              @click="deleteAccount"
              class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {{ t('auth.deleteAccount') }}
            </button>
          </div>

          <!-- Sign out -->
          <div class="flex items-center justify-between border-t pt-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700">{{ t('auth.signOut') }}</h4>
              <p class="text-sm text-gray-500">{{ t('auth.signOutDescription') }}</p>
            </div>
            <button 
              @click="handleSignOut"
              class="btn-secondary"
            >
              {{ t('auth.signOut') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Not connected -->
    <div v-else class="text-center py-12">
      <div class="max-w-md mx-auto">
        <!-- Icon -->
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <!-- Content -->
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('auth.notSignedIn') }}</h3>
        <p class="text-gray-600 mb-6">{{ t('auth.signInToAccess') }}</p>

        <!-- Benefits -->
        <div class="text-left mb-6 space-y-2">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('auth.benefit1') }}
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('auth.benefit2') }}
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('auth.benefit3') }}
          </div>
        </div>

        <!-- Sign in button -->
        <button 
          @click="handleSignIn"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
        >
          {{ t('auth.signInWithGoogle') }}
        </button>

        <p class="text-xs text-gray-500 mt-4">
          {{ t('auth.termsAgreement') }}
          <a href="https://arti-ai-detector.com/terms" target="_blank" class="text-blue-600 hover:text-blue-700">
            {{ t('footer.terms') }}
          </a>
          {{ t('common.and') }}
          <a href="https://arti-ai-detector.com/privacy" target="_blank" class="text-blue-600 hover:text-blue-700">
            {{ t('footer.privacy') }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { t } from '../../i18n'
import { sendMessageToBackground } from '../../utils/chrome'
import type { User } from '../../types'

interface Props {
  user?: User | null
  isConnected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'sign-in': []
  'sign-out': []
}>()

const exporting = ref(false)
const userStats = ref({
  total_reports: 0,
  total_points: 0,
  accuracy_percentage: 0
})

const getRoleColorClass = (role: string) => {
  switch (role) {
    case 'free':
      return 'bg-gray-400'
    case 'premium':
      return 'bg-blue-500'
    case 'pro':
      return 'bg-purple-600'
    default:
      return 'bg-gray-400'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const handleSignIn = () => {
  emit('sign-in')
}

const handleSignOut = () => {
  if (confirm(t('auth.signOutConfirm'))) {
    emit('sign-out')
  }
}

const exportUserData = async () => {
  exporting.value = true
  try {
    const response = await sendMessageToBackground({
      type: 'EXPORT_USER_DATA'
    })

    if (response?.success) {
      // Create and download file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arti-ai-detector-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Error exporting user data:', error)
  } finally {
    exporting.value = false
  }
}

const deleteAccount = async () => {
  const confirmed = confirm(t('auth.deleteAccountConfirm'))
  if (!confirmed) return

  const doubleConfirmed = confirm(t('auth.deleteAccountDoubleConfirm'))
  if (!doubleConfirmed) return

  try {
    const response = await sendMessageToBackground({
      type: 'DELETE_ACCOUNT'
    })

    if (response?.success) {
      alert(t('auth.accountDeleted'))
      emit('sign-out')
    }
  } catch (error) {
    console.error('Error deleting account:', error)
    alert(t('auth.deleteAccountError'))
  }
}

const loadUserStats = async () => {
  if (!props.isConnected) return

  try {
    const response = await sendMessageToBackground({
      type: 'GET_USER_STATS'
    })

    if (response?.success) {
      userStats.value = response.data || userStats.value
    }
  } catch (error) {
    console.error('Error loading user stats:', error)
  }
}

onMounted(() => {
  loadUserStats()
})
</script>

<style scoped>
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors;
}

.spinner {
  @apply w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin;
}
</style>
