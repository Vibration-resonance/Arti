<template>
  <div class="bg-white rounded-lg border">
    <div class="p-4 border-b">
      <h3 class="font-medium text-gray-800 flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
        </svg>
        {{ t('popup_recentReports') }}
      </h3>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-4 flex items-center justify-center">
      <div class="spinner"></div>
      <span class="ml-2 text-sm text-gray-600">{{ t('loading') }}</span>
    </div>

    <!-- Reports list -->
    <div v-else-if="Array.isArray(reports) && reports.length > 0" class="max-h-64 overflow-y-auto custom-scrollbar">
      <div 
        v-for="report in reports" 
        :key="report.id"
        class="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="font-medium text-sm text-gray-800 mb-1">
              {{ t(`reporttype_${report.type_contenu || report.report_type}`) }}
            </div>
            <div class="text-xs text-gray-600 break-all">
              {{ truncateUrl(report.url || report.page_url) }}
            </div>
          </div>
          <div class="text-xs text-gray-500 ml-2 flex-shrink-0">
            {{ formatRelativeTime(report.created_at) }}
          </div>
        </div>

        <!-- Description -->
        <div v-if="report.commentaire || report.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
          {{ report.commentaire || report.description }}
        </div>

        <!-- Votes summary -->
        <div class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1 text-green-600">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ report.vote_stats?.approve || 0 }}
          </div>
          <div class="flex items-center gap-1 text-red-600">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            {{ report.vote_stats?.refute || 0 }}
          </div>
          <div class="flex items-center gap-1 text-gray-600">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
            </svg>
            {{ report.vote_stats?.not_ia || 0 }}
          </div>
        </div>

        <!-- Status indicator -->
        <div class="mt-2 flex items-center gap-2">
          <div 
            class="w-2 h-2 rounded-full"
            :class="getStatusColorClass(report.status)"
          ></div>
          <span class="text-xs text-gray-600">
            {{ t(`status_${report.status}`) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="p-8 text-center">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5 0 1.93-1.57 3.5-3.5 3.5S8.5 11.43 8.5 9.5 10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
      </svg>
      <div class="text-gray-500 text-sm">
        {{ t('popup.noReports') }}
      </div>
      <div class="text-gray-400 text-xs mt-1">
        {{ t('popup.noReportsDescription') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { t } from '../i18n'
import type { Report } from '../types'

interface Props {
  reports: Report[]
  loading: boolean
}

defineProps({
  reports: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'ai':
    case 'reported_ia':
      return 'bg-red-500'
    case 'not_ai':
      return 'bg-green-500'
    case 'confirmed_not_ia':
      return 'bg-emerald-700'
    case 'domain_has_reports':
      return 'bg-orange-400'
    case 'domain_confirmed_not_ia':
      return 'bg-green-200 border border-green-400'
    case 'whitelisted':
      return 'bg-white border border-gray-300'
    case 'not_reported':
    case 'unknown':
    default:
      return 'bg-gray-400'
  }
}

const truncateUrl = (url: string) => {
  if (url.length > 40) {
    return url.substring(0, 37) + '...'
  }
  return url
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return t('time_minutesAgo', { count: diffInMinutes })
  } else if (diffInHours < 24) {
    return t('time_hoursAgo', { count: diffInHours })
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return t('time_daysAgo', { count: diffInDays })
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
