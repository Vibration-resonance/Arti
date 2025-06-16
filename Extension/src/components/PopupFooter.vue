<template>
  <div class="bg-gray-100 border-t p-4" :key="languageVersion">
    <!-- User role and subscription info -->
    <div v-if="userRole" class="mb-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div 
            class="w-3 h-3 rounded-full"
            :class="getRoleColorClass(userRole)"
          ></div>
          <span class="text-sm font-medium text-gray-700">
            {{ t('role_Free') }}
          </span>
        </div>
        
        <!-- Upgrade button for free users -->
        <button 
          v-if="userRole && userRole.toLowerCase() === 'free'"
          @click="$emit('upgrade')"
          class="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
        >
          {{ t('subscription.upgrade') }}
        </button>
      </div>

      <!-- Role benefits -->
      <div class="text-xs text-gray-500 mt-1">
        {{ getRoleBenefits(userRole) }}
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex items-center justify-between text-xs">
      <!-- Links -->
      <div class="flex items-center space-x-3">
        <a 
          href="https://arti-ai-detector.com/privacy"
          target="_blank"
          class="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {{ t('footer_privacy') }}
        </a>
        <a 
          href="https://arti-ai-detector.com/terms"
          target="_blank"
          class="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {{ t('footer_terms') }}
        </a>
        <a 
          href="https://arti-ai-detector.com/help"
          target="_blank"
          class="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {{ t('footer_help') }}
        </a>
      </div>

      <!-- Version -->
      <div class="text-gray-400">
        v{{ version }}
      </div>
    </div>

    <!-- Support us banner for free users -->
    <div v-if="userRole === 'free'" class="mt-3 p-3 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span class="text-sm font-medium text-orange-800">
            {{ t('footer.supportUs') }}
          </span>
        </div>
        <a 
          href="https://tipeee.com/arti-ai-detector"
          target="_blank"
          class="text-xs bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition-colors font-medium"
        >
          {{ t('footer.donate') }}
        </a>
      </div>
    </div>

    <!-- Pro features teaser for premium users -->
    <div v-if="userRole === 'premium'" class="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-purple-800 mb-1">
            {{ t('footer.upgradeToProTitle') }}
          </div>
          <div class="text-xs text-purple-600">
            {{ t('footer.upgradeToProDescription') }}
          </div>
        </div>
        <button 
          @click="$emit('upgrade')"
          class="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors font-medium"
        >
          {{ t('subscription.upgradeToPro') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { t } from '../i18n'

interface Props {
  userRole?: string | null
  languageVersion?: number
}

defineProps<Props>()

defineEmits<{
  'upgrade': []
}>()

const version = '1.0.0' // TODO: Get from manifest or package.json

const getRoleColorClass = (role: string) => {
  switch (role?.toLowerCase()) {
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

const getRoleBenefits = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'free':
      return t('role.freeBenefits')
    case 'premium':
      return t('role.premiumBenefits')
    case 'pro':
      return t('role.proBenefits')
    default:
      return ''
  }
}
</script>
