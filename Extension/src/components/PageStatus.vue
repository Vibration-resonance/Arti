<template>
  <div class="bg-gray-50 rounded-lg p-4 border">
    <h3 class="font-medium text-gray-800 mb-3 flex items-center gap-2">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1V3H9V1L3 7V9H21M21 12V10H3V12H21M21 15V13H3V15H21M21 18V16H3V18H21Z"/>
      </svg>
      {{ t('popup_currentPage') }}
    </h3>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="spinner"></div>
      <span class="ml-2 text-sm text-gray-600">{{ t('loading') }}</span>
    </div>

    <!-- Status display -->
    <div v-else-if="status" class="space-y-3">
      <!-- URL -->
      <div class="text-sm text-gray-600 break-all">
        {{ truncateUrl(status.url) }}
      </div>

      <!-- Status indicator -->
      <div class="flex items-center gap-3">
        <div 
          class="w-4 h-4 rounded-full flex-shrink-0"
          :class="getStatusColorClass(status.status)"
        ></div>
        <div class="flex-1">
          <div class="font-medium text-gray-800">
            {{ t(`status_${status.status}`) }}
          </div>
          <div class="text-sm text-gray-600">
            {{ getStatusDescription(status) }}
          </div>
        </div>
      </div>

      <!-- Reports summary -->
      <div v-if="Array.isArray(status.reports) && status.reports.length > 0" class="mt-3">
        <div class="text-sm text-gray-600 mb-2">
          {{ t('popup_reportsCount', { count: status.reports.length }) }}
        </div>
        
        <!-- Main report info -->
        <div class="bg-white rounded p-3 border">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-800">
              {{ t('reportType_' + (status.reports[0].report_type || status.reports[0].type_contenu || 'undefined')) }}
            </span>
            <span class="text-xs text-gray-500">
              {{ formatDate(status.reports[0].created_at) }}
            </span>
          </div>
          
          <!-- Votes summary -->
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1 text-green-600">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
              {{ status.reports[0].approve_votes || 0 }}
              <span>{{ t('vote_approve') }}</span>
            </div>
            <div class="flex items-center gap-1 text-red-600">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              {{ status.reports[0].refute_votes || 0 }}
              <span>{{ t('vote_refute') }}</span>
            </div>
            <div class="flex items-center gap-1 text-gray-600">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
              </svg>
              {{ status.reports[0].not_ai_votes || 0 }}
              <span>{{ t('vote_notAi') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Domain reports info -->
      <div v-if="status.domain_reports_count > 0" class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
        <div class="flex items-center gap-2 text-orange-700">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <span class="text-sm font-medium">
            {{ t('popup_domainReports', { count: status.domain_reports_count }) }}
          </span>
        </div>
      </div>
    </div>

    <!-- No status -->
    <div v-else class="text-center py-8 text-gray-500">
      {{ t('popup_noStatus') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { t } from '../i18n'
import type { PageStatus } from '../types'

interface Props {
  status: PageStatus | null
  loading: boolean
}

const props = defineProps<Props>()

const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'ai':
      return 'bg-red-500'
    case 'not_ai':
      return 'bg-green-500'
    case 'whitelisted':
      return 'bg-white border border-gray-300'
    default:
      return 'bg-gray-400'
  }
}

const getStatusDescription = (status: PageStatus) => {
  if (status.status === 'unknown' && status.domain_reports_count > 0) {
    return t('status_unknownWithReports')
  }
  return t(`status_${status.status}Description`)
}

const truncateUrl = (url: string) => {
  if (url.length > 60) {
    return url.substring(0, 57) + '...'
  }
  return url
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>
