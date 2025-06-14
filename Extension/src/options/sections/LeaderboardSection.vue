<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('leaderboard.title') }}</h2>
      <p class="text-gray-600 mb-6">{{ t('leaderboard.description') }}</p>
    </div>

    <!-- Filters -->
    <div class="bg-white border rounded-lg p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">{{ t('leaderboard.period') }}:</label>
          <select 
            v-model="selectedPeriod"
            @change="loadLeaderboard"
            class="form-select"
          >
            <option value="week">{{ t('time.thisWeek') }}</option>
            <option value="month">{{ t('time.thisMonth') }}</option>
            <option value="all">{{ t('time.allTime') }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">{{ t('leaderboard.category') }}:</label>
          <select 
            v-model="selectedCategory"
            @change="loadLeaderboard"
            class="form-select"
          >
            <option value="points">{{ t('stats.totalPoints') }}</option>
            <option value="reports">{{ t('stats.totalReports') }}</option>
            <option value="accuracy">{{ t('stats.accuracy') }}</option>
          </select>
        </div>

        <button 
          @click="loadLeaderboard"
          :disabled="loading"
          class="btn-secondary disabled:opacity-50"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <div class="spinner"></div>
            {{ t('loading') }}
          </span>
          <span v-else>
            {{ t('common.refresh') }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="spinner mr-3"></div>
      <span class="text-gray-600">{{ t('loading') }}</span>
    </div>

    <!-- Leaderboard content -->
    <div v-else class="space-y-6">
      <!-- Log visuel pour debug -->
      <div class="text-xs text-red-600">Nb users: {{ leaderboard.length }}</div>

      <!-- Top 3 podium -->
      <div v-if="leaderboard.length >= 3" class="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-6 text-center">{{ t('leaderboard.topContributors') }}</h3>
        <div class="flex items-end justify-center gap-4">
          <!-- Second place -->
          <div class="text-center">
            <div class="w-20 h-20 bg-silver rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              2
            </div>
            <img 
              :src="leaderboard[1]?.avatar_url" 
              :alt="leaderboard[1]?.pseudo"
              class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-300"
            >
            <div class="text-sm font-medium text-gray-900">{{ leaderboard[1]?.pseudo }}</div>
            <div class="text-xs text-gray-600">{{ formatLeaderboardValue(leaderboard[1]) }}</div>
          </div>

          <!-- First place -->
          <div class="text-center">
            <div class="w-24 h-24 bg-gold rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              1
            </div>
            <img 
              :src="leaderboard[0]?.avatar_url" 
              :alt="leaderboard[0]?.pseudo"
              class="w-16 h-16 rounded-full mx-auto mb-2 border-3 border-yellow-400"
            >
            <div class="text-base font-bold text-gray-900">{{ leaderboard[0]?.pseudo }}</div>
            <div class="text-sm text-gray-600">{{ formatLeaderboardValue(leaderboard[0]) }}</div>
          </div>

          <!-- Third place -->
          <div class="text-center">
            <div class="w-20 h-20 bg-bronze rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              3
            </div>
            <img 
              :src="leaderboard[2]?.avatar_url" 
              :alt="leaderboard[2]?.pseudo"
              class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-300"
            >
            <div class="text-sm font-medium text-gray-900">{{ leaderboard[2]?.pseudo }}</div>
            <div class="text-xs text-gray-600">{{ formatLeaderboardValue(leaderboard[2]) }}</div>
          </div>
        </div>
      </div>

      <!-- Full leaderboard table -->
      <div class="bg-white border rounded-lg overflow-hidden">
        <div class="bg-gray-50 px-6 py-3 border-b">
          <h3 class="text-lg font-medium text-gray-900">{{ t('leaderboard.rankings') }}</h3>
        </div>
        
        <div v-if="leaderboard.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 6l2.29 2.29c.63.63.18 1.71-.71 1.71H16V6zM12 6v4h2.59c.89 0 1.34-1.08.71-1.71L12 6z"/>
            <path d="M9 12H6.41c-.89 0-1.34 1.08-.71 1.71L9 17v-5zM15 12v5l3.29-3.29c.63-.63.18-1.71-.71-1.71H15z"/>
          </svg>
          <div class="text-sm font-medium mb-1">{{ t('leaderboard.noData') }}</div>
          <div class="text-xs">{{ t('leaderboard.noDataDescription') }}</div>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div 
            v-for="(user, index) in leaderboard" 
            :key="user.id"
            class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': user.id === currentUserId }"
          >
            <!-- Rank -->
            <div class="w-8 text-center">
              <span 
                class="text-lg font-bold"
                :class="getRankColorClass(index + 1)"
              >
                {{ index + 1 }}
              </span>
            </div>

            <!-- Avatar and info -->
            <div class="flex items-center gap-3 flex-1">
              <img 
                :src="user.avatar_url" 
                :alt="user.pseudo"
                class="w-10 h-10 rounded-full border border-gray-300"
              >
              <div>
                <div class="font-medium text-gray-900 flex items-center gap-2">
                  {{ user.pseudo }}
                  <span v-if="user.id === currentUserId" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {{ t('leaderboard.you') }}
                  </span>
                </div>
                <div class="text-sm text-gray-600">
                  {{ t(`role.${user.role}`) }}
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="flex items-center gap-6 text-sm">
              <div class="text-center">
                <div class="font-medium text-gray-900">{{ user.total_points || 0 }}</div>
                <div class="text-xs text-gray-500">{{ t('stats.points') }}</div>
              </div>
              <div class="text-center">
                <div class="font-medium text-gray-900">{{ user.total_reports || 0 }}</div>
                <div class="text-xs text-gray-500">{{ t('stats.reports') }}</div>
              </div>
              <div class="text-center">
                <div class="font-medium text-gray-900">{{ user.accuracy_percentage || 0 }}%</div>
                <div class="text-xs text-gray-500">{{ t('stats.accuracy') }}</div>
              </div>
            </div>

            <!-- Badge -->
            <div v-if="user.top_badge" class="flex items-center gap-2">
              <div 
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                :class="getBadgeColorClass(user.top_badge.badge_type)"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17.5,7.5L16,9L14.5,7.5L13,9L11.5,7.5L10,9L8.5,7.5L7,9V11L8.5,12.5L7,14V16L8.5,14.5L10,16L11.5,14.5L13,16L14.5,14.5L16,16L17.5,14.5L19,16V14L17.5,12.5L19,11V9L17.5,7.5Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Your position (if not in top 10) -->
      <div v-if="userPosition && userPosition.rank > 10" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-blue-900">{{ t('leaderboard.yourPosition') }}</h4>
            <p class="text-xs text-blue-700">{{ t('leaderboard.rank') }} #{{ userPosition.rank }}</p>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-blue-900">{{ formatLeaderboardValue(userPosition) }}</div>
            <div class="text-xs text-blue-700">{{ getCategoryLabel() }}</div>
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

interface LeaderboardUser {
  id: string
  pseudo: string
  avatar_url: string
  role: string
  total_points: number
  total_reports: number
  accuracy_percentage: number
  top_badge?: {
    badge_type: string
  }
}

const loading = ref(true)
const selectedPeriod = ref('week')
const selectedCategory = ref('points')
const leaderboard = ref<LeaderboardUser[]>([])
const userPosition = ref<LeaderboardUser & { rank: number } | null>(null)
const currentUserId = ref<string | null>(null)

const loadLeaderboard = async () => {
  loading.value = true
  try {
    const response = await sendMessageToBackground({
      type: 'GET_LEADERBOARD',
      period: selectedPeriod.value,
      category: selectedCategory.value
    })

    console.log('[Leaderboard] Réponse reçue du background:', response)

    if (response?.success) {
      // Mapping pour correspondre à l'interface attendue par le composant
      leaderboard.value = (response.data.users || []).map((user: any) => ({
        id: user.id,
        pseudo: user.pseudo,
        avatar_url: user.avatar_url,
        role: user.role,
        total_points: user.total_points,
        total_reports: user.total_reports,
        accuracy_percentage: user.accuracy_percentage,
        top_badge: user.badges && user.badges.length > 0 ? { badge_type: user.badges[0].badge_type } : undefined
      }))
      userPosition.value = response.data.user_position
      currentUserId.value = response.data.current_user_id
      console.log('[Leaderboard] leaderboard.value:', leaderboard.value)
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error)
  } finally {
    loading.value = false
  }
}

const getRankColorClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'text-yellow-600'
    case 2:
      return 'text-gray-600'
    case 3:
      return 'text-orange-600'
    default:
      return 'text-gray-800'
  }
}

const getBadgeColorClass = (badgeType: string) => {
  switch (badgeType) {
    case 'first_report':
      return 'bg-blue-500'
    case 'accuracy_master':
      return 'bg-green-500'
    case 'speed_demon':
      return 'bg-yellow-500'
    case 'community_hero':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

const formatLeaderboardValue = (user: LeaderboardUser) => {
  if (!user) return '0'
  
  switch (selectedCategory.value) {
    case 'points':
      return `${user.total_points} ${t('stats.points')}`
    case 'reports':
      return `${user.total_reports} ${t('stats.reports')}`
    case 'accuracy':
      return `${user.accuracy_percentage}%`
    default:
      return user.total_points.toString()
  }
}

const getCategoryLabel = () => {
  switch (selectedCategory.value) {
    case 'points':
      return t('stats.totalPoints')
    case 'reports':
      return t('stats.totalReports')
    case 'accuracy':
      return t('stats.accuracy')
    default:
      return t('stats.totalPoints')
  }
}

console.log('[Leaderboard] Composant monté')

onMounted(() => {
  console.log('[Leaderboard] onMounted appelé')
  loadLeaderboard()
})
</script>

<style scoped>
.form-select {
  @apply text-sm px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm;
}

.spinner {
  @apply w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin;
}

.bg-gold {
  background: linear-gradient(145deg, #ffd700, #ffed4e);
}

.bg-silver {
  background: linear-gradient(145deg, #c0c0c0, #e5e5e5);
}

.bg-bronze {
  background: linear-gradient(145deg, #cd7f32, #d2691e);
}
</style>
