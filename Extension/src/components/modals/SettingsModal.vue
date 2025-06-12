<template>
  <div class="space-y-6">
    <form @submit.prevent="saveSettings" class="space-y-6">
      <!-- Notification settings -->
      <div>
        <h3 class="font-medium text-gray-800 mb-4">{{ t('settings.notifications') }}</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input 
              v-model="settings.showFloatingButton"
              type="checkbox" 
              class="form-checkbox"
            >
            <div>
              <div class="text-sm font-medium text-gray-700">
                {{ t('settings.showFloatingButton') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('settings.showFloatingButtonDescription') }}
              </div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input 
              v-model="settings.autoDetection"
              type="checkbox" 
              class="form-checkbox"
            >
            <div>
              <div class="text-sm font-medium text-gray-700">
                {{ t('settings.autoDetection') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('settings.autoDetectionDescription') }}
              </div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input 
              v-model="settings.showNotifications"
              type="checkbox" 
              class="form-checkbox"
            >
            <div>
              <div class="text-sm font-medium text-gray-700">
                {{ t('settings.showNotifications') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('settings.showNotificationsDescription') }}
              </div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input 
              v-model="settings.soundNotifications"
              type="checkbox" 
              class="form-checkbox"
            >
            <div>
              <div class="text-sm font-medium text-gray-700">
                {{ t('settings.soundNotifications') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('settings.soundNotificationsDescription') }}
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Privacy settings -->
      <div>
        <h3 class="font-medium text-gray-800 mb-4">{{ t('settings.privacy') }}</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input 
              v-model="settings.anonymousReporting"
              type="checkbox" 
              class="form-checkbox"
            >
            <div>
              <div class="text-sm font-medium text-gray-700">
                {{ t('settings.anonymousReporting') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('settings.anonymousReportingDescription') }}
              </div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input 
              v-model="settings.shareStatistics"
              type="checkbox" 
              class="form-checkbox"
            >
            <div>
              <div class="text-sm font-medium text-gray-700">
                {{ t('settings.shareStatistics') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('settings.shareStatisticsDescription') }}
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Appearance settings -->
      <div>
        <h3 class="font-medium text-gray-800 mb-4">{{ t('settings.appearance') }}</h3>
        <div class="space-y-4">
          <!-- Floating button position -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('settings.floatingButtonPosition') }}
            </label>
            <select 
              v-model="settings.floatingButtonPosition"
              class="form-select w-full"
            >
              <option value="bottom-right">{{ t('settings.bottomRight') }}</option>
              <option value="bottom-left">{{ t('settings.bottomLeft') }}</option>
              <option value="top-right">{{ t('settings.topRight') }}</option>
              <option value="top-left">{{ t('settings.topLeft') }}</option>
            </select>
          </div>

          <!-- Button size -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('settings.buttonSize') }}
            </label>
            <div class="flex items-center gap-4">
              <input 
                v-model="settings.buttonSize"
                type="range" 
                min="32" 
                max="64" 
                step="8"
                class="flex-1"
              >
              <span class="text-sm text-gray-600 w-12">{{ settings.buttonSize }}px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced settings -->
      <div>
        <h3 class="font-medium text-gray-800 mb-4">{{ t('settings.advanced') }}</h3>
        <div class="space-y-4">
          <!-- Whitelist domains -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('settings.whitelistDomains') }}
            </label>
            <div class="space-y-2">
              <div 
                v-for="(domain, index) in settings.whitelistDomains" 
                :key="index"
                class="flex items-center gap-2"
              >
                <input 
                  v-model="settings.whitelistDomains[index]"
                  type="text" 
                  class="form-input flex-1"
                  placeholder="example.com"
                >
                <button 
                  type="button"
                  @click="removeDomain(index)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <button 
                type="button"
                @click="addDomain"
                class="text-sm text-blue-600 hover:text-blue-700"
              >
                + {{ t('settings.addDomain') }}
              </button>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ t('settings.whitelistDomainsDescription') }}
            </div>
          </div>

          <!-- API endpoint -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('settings.apiEndpoint') }}
            </label>
            <input 
              v-model="settings.apiEndpoint"
              type="url" 
              class="form-input w-full"
              placeholder="https://api.arti-ai-detector.com"
            >
            <div class="text-xs text-gray-500 mt-1">
              {{ t('settings.apiEndpointDescription') }}
            </div>
          </div>

          <!-- Debug mode -->
          <label class="flex items-center gap-3">
            <input 
              v-model="settings.debugMode"
              type="checkbox" 
              class="form-checkbox"
            >
            <div>
              <div class="text-sm font-medium text-gray-700">
                {{ t('settings.debugMode') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('settings.debugModeDescription') }}
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center justify-between pt-4 border-t">
        <button 
          type="button"
          @click="resetSettings"
          class="btn-secondary"
        >
          {{ t('settings.reset') }}
        </button>
        
        <div class="flex items-center gap-3">
          <button 
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            {{ t('cancel') }}
          </button>
          <button 
            type="submit"
            :disabled="saving"
            class="btn-primary disabled:opacity-50"
          >
            <span v-if="saving" class="flex items-center gap-2">
              <div class="spinner"></div>
              {{ t('saving') }}
            </span>
            <span v-else>
              {{ t('save') }}
            </span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { t } from '../../i18n'
import { sendMessageToBackground } from '../../utils/chrome'

interface ExtensionSettings {
  showFloatingButton: boolean
  autoDetection: boolean
  showNotifications: boolean
  soundNotifications: boolean
  anonymousReporting: boolean
  shareStatistics: boolean
  floatingButtonPosition: string
  buttonSize: number
  whitelistDomains: string[]
  apiEndpoint: string
  debugMode: boolean
}

const saving = ref(false)

const settings = reactive<ExtensionSettings>({
  showFloatingButton: true,
  autoDetection: true,
  showNotifications: true,
  soundNotifications: false,
  anonymousReporting: false,
  shareStatistics: true,
  floatingButtonPosition: 'bottom-right',
  buttonSize: 48,
  whitelistDomains: [],
  apiEndpoint: 'https://api.arti-ai-detector.com',
  debugMode: false
})

const emit = defineEmits<{
  'close': []
  'action': [action: string, data?: any]
}>()

const loadSettings = async () => {
  try {
    const response = await sendMessageToBackground({
      type: 'GET_SETTINGS'
    })

    if (response?.success && response.data) {
      Object.assign(settings, response.data)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const response = await sendMessageToBackground({
      type: 'UPDATE_SETTINGS',
      data: { ...settings }
    })

    if (response?.success) {
      emit('action', 'settings-saved', settings)
    }
  } catch (error) {
    console.error('Error saving settings:', error)
  } finally {
    saving.value = false
  }
}

const resetSettings = async () => {
  if (confirm(t('settings.resetConfirm'))) {
    try {
      const response = await sendMessageToBackground({
        type: 'RESET_SETTINGS'
      })

      if (response?.success) {
        await loadSettings()
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
    }
  }
}

const addDomain = () => {
  settings.whitelistDomains.push('')
}

const removeDomain = (index: number) => {
  settings.whitelistDomains.splice(index, 1)
}

onMounted(() => {
  loadSettings()
})
</script>
