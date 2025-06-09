<template>
  <div class="bg-gray-50 rounded-lg p-4 border">
    <h3 class="font-medium text-gray-800 mb-3 flex items-center gap-2">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
      </svg>
      {{ t('popup_votePage') }}
    </h3>

    <div v-if="report" class="space-y-4">
      <!-- Report info -->
      <div class="bg-white rounded p-3 border">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-800">
            {{ t('reportType_' + (report.report_type || report.type_contenu || 'undefined')) }}
          </span>
          <span class="text-xs text-gray-500">
            {{ formatDate(report.created_at) }}
          </span>
        </div>
        
        <div v-if="report.description" class="text-sm text-gray-600 mb-3">
          {{ report.description }}
        </div>

        <!-- Current votes -->
        <div class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1 text-green-600">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ report.approve_votes || 0 }} {{ t('vote_approve') }}
          </div>
          <div class="flex items-center gap-1 text-red-600">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            {{ report.refute_votes || 0 }} {{ t('vote_refute') }}
          </div>
          <div class="flex items-center gap-1 text-gray-600">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
            </svg>
            {{ report.not_ai_votes || 0 }} {{ t('vote_notAi') }}
          </div>
        </div>
      </div>

      <!-- Vote description -->
      <p class="text-sm text-gray-600">
        {{ t('vote_description') }}
      </p>

      <!-- Vote buttons -->
      <div class="grid grid-cols-3 gap-2">
        <button 
          @click="submitVote('approve')"
          :disabled="voting"
          class="flex flex-col items-center gap-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
          </svg>
          <span class="text-xs font-medium">{{ t('vote_approve') }}</span>
        </button>

        <button 
          @click="submitVote('refute')"
          :disabled="voting"
          class="flex flex-col items-center gap-1 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          <span class="text-xs font-medium">{{ t('vote_refute') }}</span>
        </button>

        <button 
          @click="submitVote('not_ia')"
          :disabled="voting"
          class="flex flex-col items-center gap-1 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
          </svg>
          <span class="text-xs font-medium">{{ t('vote_notAi') }}</span>
        </button>
      </div>

      <!-- Vote explanations -->
      <div class="text-xs text-gray-500 space-y-1">
        <div><strong>{{ t('vote_approve') }}:</strong> {{ t('vote_approveHelp') }}</div>
        <div><strong>{{ t('vote_refute') }}:</strong> {{ t('vote_refuteHelp') }}</div>
        <div><strong>{{ t('vote_notAi') }}:</strong> {{ t('vote_notAiHelp') }}</div>
      </div>

      <!-- Loading state -->
      <div v-if="voting" class="flex items-center justify-center py-4">
        <div class="spinner"></div>
        <span class="ml-2 text-sm text-gray-600">{{ t('vote.submitting') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { t } from '../i18n'
import type { Report } from '../types'

interface Props {
  report: Report | null
}

const props = defineProps<Props>()

const voting = ref(false)

const emit = defineEmits<{
  'vote-submitted': [data: any]
}>()

const submitVote = async (voteType: string) => {
  if (!props.report || voting.value) return

  voting.value = true

  try {
    const data = {
      report_id: props.report.id,
      vote_type: voteType,
    }

    emit('vote-submitted', data)
  } catch (error) {
    console.error('Error submitting vote:', error)
  } finally {
    voting.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>
