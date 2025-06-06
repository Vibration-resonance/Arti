<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('stats.title') }}</h2>
      <p class="text-gray-600 mb-6">{{ t('stats.description') }}</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="spinner mr-3"></div>
      <span class="text-gray-600">{{ t('loading') }}</span>
    </div>

    <!-- Stats content -->
    <div v-else class="space-y-8">
      <!-- Overview cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">
            {{ stats.total_reports || 0 }}
          </div>
          <div class="text-sm text-blue-700 font-medium">
            {{ t('stats.totalReports') }}
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ stats.total_votes || 0 }}
          </div>
          <div class="text-sm text-green-700 font-medium">
            {{ t('stats.totalVotes') }}
          </div>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {{ stats.total_points || 0 }}
          </div>
          <div class="text-sm text-purple-700 font-medium">
            {{ t('stats.totalPoints') }}
          </div>
        </div>

        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-yellow-600 mb-2">
            {{ stats.accuracy_percentage || 0 }}%
          </div>
          <div class="text-sm text-yellow-700 font-medium">
            {{ t('stats.accuracy') }}
          </div>
        </div>
      </div>

      <!-- Weekly progress -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('stats.thisWeek') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 mb-1">
              {{ stats.reports_this_week || 0 }}
            </div>
            <div class="text-sm text-gray-600">{{ t('stats.reportsThisWeek') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 mb-1">
              {{ stats.votes_this_week || 0 }}
            </div>
            <div class="text-sm text-gray-600">{{ t('stats.votesThisWeek') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600 mb-1">
              {{ stats.points_this_week || 0 }}
            </div>
            <div class="text-sm text-gray-600">{{ t('stats.pointsThisWeek') }}</div>
          </div>
        </div>
      </div>

      <!-- Detailed breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Reports by type -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('stats.reportsByType') }}</h3>
          <div class="space-y-3">
            <div 
              v-for="(count, type) in stats.reports_by_type" 
              :key="type"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div 
                  class="w-3 h-3 rounded-full"
                  :class="getTypeColor(type)"
                ></div>
                <span class="text-sm text-gray-700">{{ t(`reportType.${type}`) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">{{ count }}</span>
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full"
                    :class="getTypeColor(type)"
                    :style="{ width: `${getPercentage(count, stats.total_reports)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vote accuracy -->
        <div class="bg-white border rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('stats.voteAccuracy') }}</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="text-sm text-gray-700">{{ t('vote.approve') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">
                  {{ stats.vote_accuracy?.approve || 0 }}%
                </span>
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full"
                    :style="{ width: `${stats.vote_accuracy?.approve || 0}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <span class="text-sm text-gray-700">{{ t('vote.refute') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">
                  {{ stats.vote_accuracy?.refute || 0 }}%
                </span>
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-red-500 h-2 rounded-full"
                    :style="{ width: `${stats.vote_accuracy?.refute || 0}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-gray-500"></div>
                <span class="text-sm text-gray-700">{{ t('vote.notAi') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">
                  {{ stats.vote_accuracy?.not_ai || 0 }}%
                </span>
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gray-500 h-2 rounded-full"
                    :style="{ width: `${stats.vote_accuracy?.not_ai || 0}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Badges earned -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('badges.earned') }}</h3>
        <div v-if="stats.badges && stats.badges.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="badge in stats.badges" 
            :key="badge.id"
            class="flex items-center gap-3 p-3 rounded-lg"
            :class="getBadgeColorClass(badge.badge_type)"
          >
            <div class="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17.5,7.5L16,9L14.5,7.5L13,9L11.5,7.5L10,9L8.5,7.5L7,9V11L8.5,12.5L7,14V16L8.5,14.5L10,16L11.5,14.5L13,16L14.5,14.5L16,16L17.5,14.5L19,16V14L17.5,12.5L19,11V9L17.5,7.5Z"/>
              </svg>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium">{{ t(`badges.${badge.badge_type}`) }}</div>
              <div class="text-xs opacity-75">{{ formatDate(badge.earned_at) }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17.5,7.5L16,9L14.5,7.5L13,9L11.5,7.5L10,9L8.5,7.5L7,9V11L8.5,12.5L7,14V16L8.5,14.5L10,16L11.5,14.5L13,16L14.5,14.5L16,16L17.5,14.5L19,16V14L17.5,12.5L19,11V9L17.5,7.5Z"/>
          </svg>
          <div class="text-sm font-medium mb-1">{{ t('badges.noBadges') }}</div>
          <div class="text-xs">{{ t('badges.earnBadges') }}</div>
        </div>
      </div>

      <!-- Export stats -->
      <div class="bg-gray-50 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('stats.exportData') }}</h3>
            <p class="text-sm text-gray-600">{{ t('stats.exportDescription') }}</p>
          </div>
          <button 
            @click="exportStats"
            :disabled="exporting"
            class="btn-secondary disabled:opacity-50"
          >
            <span v-if="exporting" class="flex items-center gap-2">
              <div class="spinner"></div>
              {{ t('stats.exporting') }}
            </span>
            <span v-else>
              {{ t('stats.exportData') }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { t } from '../../i18n'
import { sendMessageToBackground } from '../../utils/chrome'

interface UserStats {
  total_reports: number
  total_votes: number
  total_points: number
  accuracy_percentage: number
  reports_by_type: Record<string, number>
  vote_accuracy: {
    approve: number
    refute: number
    not_ai: number
  }
  reports_this_week: number
  votes_this_week: number
  points_this_week: number
  badges: Array<{
    id: string
    badge_type: string
    earned_at: string
  }>
}

const loading = ref(true)
const exporting = ref(false)
const stats = ref<UserStats>({
  total_reports: 0,
  total_votes: 0,
  total_points: 0,
  accuracy_percentage: 0,
  reports_by_type: {},
  vote_accuracy: { approve: 0, refute: 0, not_ai: 0 },
  reports_this_week: 0,
  votes_this_week: 0,
  points_this_week: 0,
  badges: []
})

const loadStats = async () => {
  loading.value = true
  try {
    const response = await sendMessageToBackground({
      type: 'GET_USER_STATS'
    })

    if (response?.success) {
      stats.value = response.data || stats.value
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    loading.value = false
  }
}

const getBadgeColorClass = (badgeType: string) => {
  switch (badgeType) {
    case 'first_report':
      return 'bg-blue-100 text-blue-800'
    case 'accuracy_master':
      return 'bg-green-100 text-green-800'
    case 'speed_demon':
      return 'bg-yellow-100 text-yellow-800'
    case 'community_hero':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'ai_generated':
      return 'bg-red-500'
    case 'human_written':
      return 'bg-green-500'
    case 'mixed_content':
      return 'bg-yellow-500'
    case 'uncertain':
      return 'bg-gray-500'
    default:
      return 'bg-blue-500'
  }
}

const getPercentage = (value: number, total: number) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const exportStats = async () => {
  exporting.value = true
  try {
    const response = await sendMessageToBackground({
      type: 'EXPORT_USER_STATS'
    })

    if (response?.success) {
      // Create and download file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arti-ai-detector-stats-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Error exporting stats:', error)
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadStats()
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
