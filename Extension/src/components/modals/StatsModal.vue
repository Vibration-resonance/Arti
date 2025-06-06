<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="spinner"></div>
      <span class="ml-2 text-sm text-gray-600">{{ t('loading') }}</span>
    </div>

    <!-- Stats content -->
    <div v-else class="space-y-6">
      <!-- Overview cards -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-blue-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-600 mb-1">
            {{ stats.total_reports || 0 }}
          </div>
          <div class="text-sm text-blue-700">
            {{ t('stats.totalReports') }}
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-600 mb-1">
            {{ stats.total_votes || 0 }}
          </div>
          <div class="text-sm text-green-700">
            {{ t('stats.totalVotes') }}
          </div>
        </div>

        <div class="bg-purple-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-purple-600 mb-1">
            {{ stats.total_points || 0 }}
          </div>
          <div class="text-sm text-purple-700">
            {{ t('stats.totalPoints') }}
          </div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-yellow-600 mb-1">
            {{ stats.accuracy_percentage || 0 }}%
          </div>
          <div class="text-sm text-yellow-700">
            {{ t('stats.accuracy') }}
          </div>
        </div>
      </div>

      <!-- Detailed stats -->
      <div class="space-y-4">
        <h3 class="font-medium text-gray-800">{{ t('stats.breakdown') }}</h3>
        
        <!-- Reports breakdown -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-sm text-gray-700 mb-3">
            {{ t('stats.reportsByType') }}
          </h4>
          <div class="space-y-2">
            <div 
              v-for="(count, type) in stats.reports_by_type" 
              :key="type"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-600">{{ t(`reportType.${type}`) }}</span>
              <span class="font-medium">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- Vote accuracy -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-sm text-gray-700 mb-3">
            {{ t('stats.voteAccuracy') }}
          </h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">{{ t('vote.approve') }}</span>
              <span class="font-medium text-green-600">
                {{ stats.vote_accuracy?.approve || 0 }}%
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">{{ t('vote.refute') }}</span>
              <span class="font-medium text-red-600">
                {{ stats.vote_accuracy?.refute || 0 }}%
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">{{ t('vote.notAi') }}</span>
              <span class="font-medium text-gray-600">
                {{ stats.vote_accuracy?.not_ai || 0 }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Recent activity -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-sm text-gray-700 mb-3">
            {{ t('stats.recentActivity') }}
          </h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">{{ t('stats.reportsThisWeek') }}</span>
              <span class="font-medium">{{ stats.reports_this_week || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">{{ t('stats.votesThisWeek') }}</span>
              <span class="font-medium">{{ stats.votes_this_week || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">{{ t('stats.pointsThisWeek') }}</span>
              <span class="font-medium text-purple-600">
                {{ stats.points_this_week || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Badges section -->
      <div v-if="stats.badges && stats.badges.length > 0" class="space-y-4">
        <h3 class="font-medium text-gray-800">{{ t('stats.badges') }}</h3>
        <div class="grid grid-cols-3 gap-3">
          <div 
            v-for="badge in stats.badges" 
            :key="badge.id"
            class="bg-white rounded-lg p-3 border text-center"
          >
            <div 
              class="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-lg"
              :class="getBadgeColorClass(badge.badge_type)"
            >
              {{ getBadgeIcon(badge.badge_type) }}
            </div>
            <div class="text-xs font-medium text-gray-700">
              {{ t(`badge.${badge.badge_type}`) }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formatDate(badge.earned_at) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Progress section -->
      <div class="space-y-4">
        <h3 class="font-medium text-gray-800">{{ t('stats.progress') }}</h3>
        
        <!-- Next level progress -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">
              {{ t('stats.nextLevel') }}
            </span>
            <span class="text-sm text-gray-600">
              {{ stats.total_points || 0 }} / {{ getNextLevelPoints() }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${getProgressPercentage()}%` }"
            ></div>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            {{ getPointsToNextLevel() }} {{ t('stats.pointsToNext') }}
          </div>
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
      stats.value = { ...stats.value, ...response.data }
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
      return 'bg-blue-100 text-blue-600'
    case 'accuracy_master':
      return 'bg-green-100 text-green-600'
    case 'speed_demon':
      return 'bg-yellow-100 text-yellow-600'
    case 'community_hero':
      return 'bg-purple-100 text-purple-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getBadgeIcon = (badgeType: string) => {
  switch (badgeType) {
    case 'first_report':
      return '🚀'
    case 'accuracy_master':
      return '🎯'
    case 'speed_demon':
      return '⚡'
    case 'community_hero':
      return '👑'
    default:
      return '🏆'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getNextLevelPoints = () => {
  const currentPoints = stats.value.total_points || 0
  // Define level thresholds
  const levels = [100, 250, 500, 1000, 2500, 5000, 10000]
  return levels.find(level => level > currentPoints) || levels[levels.length - 1] + 10000
}

const getProgressPercentage = () => {
  const currentPoints = stats.value.total_points || 0
  const nextLevel = getNextLevelPoints()
  const previousLevel = getPreviousLevelPoints()
  
  if (currentPoints >= nextLevel) return 100
  
  const progress = (currentPoints - previousLevel) / (nextLevel - previousLevel)
  return Math.max(0, Math.min(100, progress * 100))
}

const getPreviousLevelPoints = () => {
  const currentPoints = stats.value.total_points || 0
  const levels = [0, 100, 250, 500, 1000, 2500, 5000, 10000]
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (currentPoints >= levels[i]) {
      return levels[i]
    }
  }
  return 0
}

const getPointsToNextLevel = () => {
  const currentPoints = stats.value.total_points || 0
  const nextLevel = getNextLevelPoints()
  return Math.max(0, nextLevel - currentPoints)
}

onMounted(() => {
  loadStats()
})
</script>
