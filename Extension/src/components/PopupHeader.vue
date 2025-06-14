<template>
  <div class="bg-blue-600 text-white p-4" :key="languageVersion">
    <div class="flex items-center justify-between mb-3">      <!-- Logo et titre -->
      <div class="flex items-center space-x-2">
        <img 
          src="/icons/icon-128.png" 
          alt="Arti AI Detector logo" 
          class="w-8 h-8"
        />
        <h1 class="font-semibold text-lg">{{ t('popup_title') }}</h1>
      </div>

      <!-- User info ou bouton de connexion -->
      <div v-if="isConnected && user" class="flex items-center space-x-2">
        <img 
          :src="user.avatar_url" 
          :alt="user.pseudo"
          class="w-8 h-8 rounded-full border-2 border-white"
        >
        <span class="text-sm font-medium">{{ user.pseudo }}</span>
      </div>
      <div v-else class="flex items-center space-x-2">
        <span class="text-sm opacity-75">{{ t('auth.guest') }}</span>
        <button 
          @click="$emit('sign-in')"
          class="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          {{ t('auth.signIn') }}
        </button>
      </div>
    </div>

    <!-- Navigation pour utilisateurs connectés -->
    <div v-if="isConnected" class="flex items-center justify-between">
      <!-- Sélecteur de langue -->
      <LanguageSelector @language-changed="$emit('language-changed', $event)" />

      <!-- Boutons d'actions -->
      <div class="flex items-center space-x-2">
        <button 
          @click="$emit('open-modal', 'leaderboard')"
          class="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          :title="t('leaderboard.title')"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 6l2.29 2.29c.63.63.18 1.71-.71 1.71H16V6zM12 6v4h2.59c.89 0 1.34-1.08.71-1.71L12 6z"/>
            <path d="M9 12H6.41c-.89 0-1.34 1.08-.71 1.71L9 17v-5zM15 12v5l3.29-3.29c.63-.63.18-1.71-.71-1.71H15z"/>
          </svg>
        </button>

        <button 
          @click="$emit('open-modal', 'stats')"
          class="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          :title="t('stats.title')"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        </button>

        <button 
          @click="$emit('open-modal', 'settings')"
          class="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          :title="t('settings.title')"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
        </button>

        <!-- Lien support -->
        <a 
          href="https://tipeee.com/arti-ai-detector" 
          target="_blank"
          class="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          :title="t('popup.supportUs')"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17.5,7.5L16,9L14.5,7.5L13,9L11.5,7.5L10,9L8.5,7.5L7,9V11L8.5,12.5L7,14V16L8.5,14.5L10,16L11.5,14.5L13,16L14.5,14.5L16,16L17.5,14.5L19,16V14L17.5,12.5L19,11V9L17.5,7.5Z"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Navigation pour invités -->
    <div v-else class="flex justify-center">
      <button 
        @click="$emit('open-modal', 'leaderboard')"
        class="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {{ t('leaderboard.title') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { t } from '../i18n'
import type { User } from '../types'
import LanguageSelector from './LanguageSelector.vue'

interface Props {
  user?: User | null
  isConnected: boolean
  languageVersion?: number
}

defineProps<Props>()

defineEmits<{
  'sign-in': []
  'sign-out': []
  'open-modal': [type: string]
  'language-changed': [language: string]
}>()
</script>
