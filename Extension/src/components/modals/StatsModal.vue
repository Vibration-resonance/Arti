<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="spinner"></div>
      <span class="ml-2 text-sm text-gray-600">{{ t('loading') }}</span>
    </div>

    <!-- Stats content -->
    <div v-else class="space-y-6">
      <!-- User header -->
      <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <img v-if="user.avatar_url" :src="user.avatar_url" class="w-12 h-12 rounded-full border" alt="avatar" />
        <div v-else class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>
        <div>
          <div class="font-bold text-sm text-gray-800 max-w-xs truncate overflow-ellipsis overflow-hidden whitespace-nowrap">{{ user.username || t('stats.unknownUser') }}</div>
          <div class="text-sm text-gray-600 flex items-center">
            <span>{{ t('stats.confidenceIndex') }}: </span>
            <span class="ml-1 font-semibold text-blue-600">{{ stats.indice_confiance ?? '-' }}</span>
          </div>
        </div>
      </div>

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
            {{ stats.points_totaux || 0 }}
          </div>
          <div class="text-sm text-purple-700">
            {{ t('stats.totalPoints') }}
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
            <div v-for="(count, type) in stats.reports_by_type" :key="type" class="flex justify-between text-sm">
              <span>{{ t(`stats.contentType.${type}`) }}</span>
              <span class="font-semibold">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Badges section -->
      <div class="space-y-4">
        <h3 class="font-medium text-gray-800">{{ t('stats.badges') }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div v-for="badge in stats.badges" :key="badge.category"
            class="rounded-lg p-3 border text-center transition-all duration-200 relative group"
            :style="{ background: badge.unlocked ? badge.current_color : '#f3f4f6', color: badge.unlocked ? '#222' : '#bbb', borderColor: badge.unlocked ? badge.current_color : '#e5e7eb' }">
            <!-- Tooltip -->
            <div class="absolute z-20 left-1/2 -translate-x-1/2 -top-2 -translate-y-full w-48 bg-gray-900 text-white text-xs rounded px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
              style="white-space: pre-line;">
              {{ getBadgeDescription(badge) }}
            </div>
            <div class="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-xl bg-white/70 border"
              :style="{ background: badge.unlocked ? badge.current_color : '#e5e7eb' }">
              <img v-if="badge.icon" :src="`/icons/badges/${badge.icon}`" :alt="badge.label" class="w-12 h-12 object-contain" />
              <span v-else>🏆</span>
            </div>
            <div class="text-xs font-medium mt-1">{{ t('badgeNames.' + badge.label) }}</div>
            <div v-if="badge.unlocked && badge.earned_at" class="text-xs text-gray-500 mt-1">
              {{ formatDate(badge.earned_at) }}
            </div>
            <div v-else class="text-xs text-gray-400 mt-1">{{ t('stats.locked') }}</div>
            <div class="mt-2">
              <div class="w-full bg-gray-200 rounded-full h-1">
                <div class="h-1 rounded-full transition-all duration-300"
                  :style="{ width: badge.progress + '%', background: badge.unlocked ? badge.current_color : '#bbb' }"></div>
              </div>
              <div class="text-xxs text-gray-500 mt-1">
                {{ badge.current_value }} / {{ badge.next_threshold || badge.current_threshold }}
                <span v-if="badge.next_tier">({{ t('stats.nextTier') }}: {{ t('badgeNames.' + badge.next_tier) }})</span>
                <span v-else>({{ t('stats.maxTier') }})</span>
              </div>
              <div v-if="badge.current_tier" class="text-xxs text-gray-400 mt-1">
                {{ t('stats.currentTier') }}: {{ t('badgeNames.' + badge.current_tier) }}
              </div>
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
              {{ stats.points_totaux || 0 }} / {{ getNextLevelPoints() }}
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

interface BadgeCard {
  category: string;
  label: string;
  icon: string;
  unlocked: boolean;
  current_value: number;
  current_tier: string | null;
  current_color: string;
  current_threshold: number | null;
  next_tier: string | null;
  next_color: string | null;
  next_threshold: number | null;
  progress: number;
  earned_at: string | null;
}
interface UserStats {
  total_reports: number
  total_votes: number
  points_totaux: number
  indice_confiance?: number
  reports_by_type: Record<string, number>
  badges: BadgeCard[]
}

const loading = ref(true)
const stats = ref<UserStats>({
  total_reports: 0,
  total_votes: 0,
  points_totaux: 0,
  reports_by_type: {},
  badges: []
})
const user = ref({ username: '', avatar_url: '' })

const loadStats = async () => {
  loading.value = true
  try {
    // Récupérer l'utilisateur courant
    const userResp = await sendMessageToBackground({ type: 'GET_USER_DATA' })
    const userId = userResp?.data?.user?.id
    user.value.username = userResp?.data?.user?.user_metadata?.username || userResp?.data?.user?.email || ''
    user.value.avatar_url = userResp?.data?.user?.avatar_url || userResp?.data?.user?.user_metadata?.avatar_url || userResp?.data?.user?.user_metadata?.picture || ''
    if (!userId) throw new Error('Utilisateur non connecté')

    // Récupérer les stats avec le bon userId
    const response = await sendMessageToBackground({
      type: 'GET_USER_STATS',
      userId
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

const getNextLevelPoints = () => {
  const currentPoints = stats.value.points_totaux || 0
  // Define level thresholds
  const levels = [100, 250, 500, 1000, 2500, 5000, 10000]
  return levels.find(level => level > currentPoints) || levels[levels.length - 1] + 10000
}

const getProgressPercentage = () => {
  const currentPoints = stats.value.points_totaux || 0
  const nextLevel = getNextLevelPoints()
  const previousLevel = getPreviousLevelPoints()
  if (currentPoints >= nextLevel) return 100
  const progress = (currentPoints - previousLevel) / (nextLevel - previousLevel)
  return Math.max(0, Math.min(100, progress * 100))
}

const getPreviousLevelPoints = () => {
  const currentPoints = stats.value.points_totaux || 0
  const levels = [0, 100, 250, 500, 1000, 2500, 5000, 10000]
  for (let i = levels.length - 1; i >= 0; i--) {
    if (currentPoints >= levels[i]) {
      return levels[i]
    }
  }
  return 0
}

const getPointsToNextLevel = () => {
  const currentPoints = stats.value.points_totaux || 0
  const nextLevel = getNextLevelPoints()
  return Math.max(0, nextLevel - currentPoints)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// RENDRE formatDate accessible au template
defineExpose({ formatDate })

function getBadgeDescription(badge: BadgeCard) {
  switch (badge.category) {
    case 'reports':
      return t('stats.badgeDescReports', { n: badge.next_threshold || badge.current_threshold });
    case 'votes':
      return t('stats.badgeDescVotes', { n: badge.next_threshold || badge.current_threshold });
    case 'votes_received':
      return t('stats.badgeDescVotesReceived', { n: badge.next_threshold || badge.current_threshold });
    case 'confidence':
      return t('stats.badgeDescConfidence', { n: badge.next_threshold || badge.current_threshold });
    case 'special':
      return t('stats.badgeDescMaster');
    default:
      return '';
  }
}

// Appel initial pour charger les stats
onMounted(() => {
  loadStats()
})
</script>
