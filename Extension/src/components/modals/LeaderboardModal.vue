<template>
  <div class="space-y-6">
    <!-- Leaderboard tabs -->
    <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="activePeriod = period.value"
        :class="[
          'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors',
          activePeriod === period.value
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        ]"
      >
        {{ period.label }}
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="spinner"></div>
      <span class="ml-2 text-sm text-gray-600">{{ t('loading') }}</span>
    </div>

    <!-- Leaderboard content -->
    <div v-else-if="leaderboardData.length > 0" class="space-y-4">
      <!-- Top 3 podium -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div 
          v-for="(user, index) in topThree" 
          :key="user.id"
          class="text-center"
          :class="index === 1 ? 'order-first' : ''"
        >
          <div 
            class="relative mx-auto mb-2 rounded-full overflow-hidden border-4"
            :class="getPodiumBorderClass(index)"
            :style="{ width: getPodiumSize(index), height: getPodiumSize(index) }"
          >            <div 
              v-if="user.avatar_url"
              class="w-full h-full"
            >
              <img 
                :src="user.avatar_url"
                :alt="user.pseudo"
                class="w-full h-full object-cover"
              >
            </div>
            <div 
              v-else
              class="w-full h-full bg-gray-300 flex items-center justify-center"
            >
              <svg class="w-1/2 h-1/2 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.58 10.76C10.21 10.54 9.78 10.38 9.31 10.31L7.39 8.39L6 9.78L8.61 12.39C8.68 12.85 8.85 13.28 9.08 13.67L5.06 17.69L6.47 19.1L10.5 15.07C11.14 15.54 11.94 15.82 12.81 15.82C13.68 15.82 14.48 15.54 15.12 15.07L19.14 19.09L20.55 17.68L16.53 13.66C16.76 13.27 16.93 12.84 17 12.38L19.61 9.77L21 9ZM12.81 14.32C11.77 14.32 10.92 13.47 10.92 12.43C10.92 11.39 11.77 10.54 12.81 10.54C13.85 10.54 14.7 11.39 14.7 12.43C14.7 13.47 13.85 14.32 12.81 14.32Z"/>
              </svg>
            </div>
            <div 
              class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              :class="getPodiumBackgroundClass(index)"
            >
              {{ index + 1 }}
            </div>
          </div>
          <div class="font-medium text-sm">{{ user.pseudo }}</div>
          <div class="text-xs text-gray-500">{{ user.total_points }} pts</div>
        </div>
      </div>

      <!-- Full leaderboard -->
      <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        <div 
          v-for="(user, index) in leaderboardData" 
          :key="user.id"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <!-- Rank -->
          <div class="flex-shrink-0 w-8 text-center">
            <span 
              class="text-sm font-bold"
              :class="getRankColorClass(index)"
            >
              {{ index + 1 }}
            </span>
          </div>          <!-- Avatar -->
          <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img 
              v-if="user.avatar_url"
              :src="user.avatar_url"
              :alt="user.pseudo"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full bg-gray-300 flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.58 10.76C10.21 10.54 9.78 10.38 9.31 10.31L7.39 8.39L6 9.78L8.61 12.39C8.68 12.85 8.85 13.28 9.08 13.67L5.06 17.69L6.47 19.1L10.5 15.07C11.14 15.54 11.94 15.82 12.81 15.82C13.68 15.82 14.48 15.54 15.12 15.07L19.14 19.09L20.55 17.68L16.53 13.66C16.76 13.27 16.93 12.84 17 12.38L19.61 9.77L21 9ZM12.81 14.32C11.77 14.32 10.92 13.47 10.92 12.43C10.92 11.39 11.77 10.54 12.81 10.54C13.85 10.54 14.7 11.39 14.7 12.43C14.7 13.47 13.85 14.32 12.81 14.32Z"/>
              </svg>
            </div>
          </div>

          <!-- User info -->
          <div class="flex-1">
            <div class="font-medium text-sm">{{ user.pseudo }}</div>
            <div class="text-xs text-gray-500">
              {{ user.total_points }} {{ t('leaderboard.points') }}
            </div>
          </div>

          <!-- Badges -->
          <div class="flex items-center gap-1">
            <div 
              v-for="badge in user.badges?.slice(0, 3)" 
              :key="badge.id"
              class="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              :class="getBadgeColorClass(badge.badge_type)"
              :title="t(`badge.${badge.badge_type}`)"
            >
              {{ getBadgeIcon(badge.badge_type) }}
            </div>
            <span 
              v-if="user.badges && user.badges.length > 3" 
              class="text-xs text-gray-400"
            >
              +{{ user.badges.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
      </svg>
      <div class="text-gray-500">{{ t('leaderboard.noData') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { t } from '../../i18n'
import { sendMessageToBackground } from '../../utils/chrome'

interface LeaderboardUser {
  id: string
  pseudo: string
  avatar_url: string
  total_points: number
  badges?: Array<{
    id: string
    badge_type: string
  }>
}

const activePeriod = ref('all')
const loading = ref(true)
const leaderboardData = ref<LeaderboardUser[]>([])

const periods = [
  { value: 'all', label: t('leaderboard.allTime') },
  { value: 'month', label: t('leaderboard.thisMonth') },
  { value: 'week', label: t('leaderboard.thisWeek') }
]

const topThree = computed(() => {
  return leaderboardData.value.slice(0, 3)
})

const loadLeaderboard = async () => {
  loading.value = true
  try {
    const response = await sendMessageToBackground({
      type: 'GET_LEADERBOARD',
      params: {
        period: activePeriod.value,
        limit: 50
      }
    })

    if (response?.success) {
      leaderboardData.value = response.data || []
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error)
  } finally {
    loading.value = false
  }
}

const getPodiumSize = (index: number) => {
  if (index === 0) return '60px' // Gold (1st place)
  if (index === 1) return '70px' // Silver (2nd place) - larger
  return '55px' // Bronze (3rd place)
}

const getPodiumBorderClass = (index: number) => {
  if (index === 0) return 'border-yellow-400'
  if (index === 1) return 'border-gray-400'
  return 'border-orange-400'
}

const getPodiumBackgroundClass = (index: number) => {
  if (index === 0) return 'bg-yellow-500'
  if (index === 1) return 'bg-gray-500'
  return 'bg-orange-500'
}

const getRankColorClass = (index: number) => {
  if (index < 3) return 'text-blue-600'
  if (index < 10) return 'text-gray-700'
  return 'text-gray-500'
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

watch(activePeriod, () => {
  loadLeaderboard()
})

onMounted(() => {
  loadLeaderboard()
})
</script>
