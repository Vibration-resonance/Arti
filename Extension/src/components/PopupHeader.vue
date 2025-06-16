<template>
  <div class="bg-blue-600 text-white p-4" :key="languageVersion">
    <div class="flex items-center justify-between mb-3">      <!-- Logo et titre -->
      <div class="flex items-center space-x-2">
        <img 
          src="/icons/icon-128.png" 
          alt="Arti AI Detector logo" 
          class="w-6 h-6"
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
          <img src="/icons/trophy.png" alt="Leaderboard" class="w-7 h-7" />
        </button>

        <button 
          @click="$emit('open-modal', 'stats')"
          class="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          :title="t('stats.title')"
        >
          <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        </button>

        <button 
          @click="$emit('open-modal', 'settings')"
          class="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          :title="t('settings.title')"
        >
          <img src="/icons/roue.png" alt="Options" class="w-7 h-7" />
        </button>

        <!-- Lien support -->
        <a 
          href="https://tipeee.com/arti-ai-detector" 
          target="_blank"
          class="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          :title="t('popup.supportUs')"
        >
          <img src="/icons/tip.png" alt="Tipeee" class="w-7 h-7" />
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
