<template>
  <Transition name="modal" appear>
    <div 
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div 
        class="modal-content"
        @click.stop
        ref="modalContentRef"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-800">
            {{ getModalTitle() }}
          </h2>
          <button 
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="modal-body">
          <component 
            :is="getModalComponent()"
            v-bind="getModalProps()"
            @action="handleModalAction"
            @close="$emit('close')"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { t } from '../i18n'

// Import modal components
import LeaderboardModal from './modals/LeaderboardModal.vue'
import StatsModal from './modals/StatsModal.vue'
import SettingsModal from './modals/SettingsModal.vue'
import UpgradeModal from './modals/UpgradeModal.vue'

interface Props {
  modalType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'action': [action: string, data?: any]
}>()

const getModalComponent = () => {
  switch (props.modalType) {
    case 'leaderboard':
      return LeaderboardModal
    case 'stats':
      return StatsModal
    case 'settings':
      return SettingsModal
    case 'upgrade':
      return UpgradeModal
    default:
      return 'div'
  }
}

const getModalTitle = () => {
  switch (props.modalType) {
    case 'leaderboard':
      return t('leaderboard.title')
    case 'stats':
      return t('stats.title')
    case 'settings':
      return t('settings.title')
    case 'upgrade':
      return t('subscription.upgrade')
    default:
      return ''
  }
}

const getModalSizeClass = () => {
  switch (props.modalType) {
    case 'leaderboard':
      return 'max-w-lg'
    case 'stats':
      return 'max-w-md'
    case 'settings':
      return 'max-w-md'
    case 'upgrade':
      return 'max-w-lg'
    default:
      return 'max-w-md'
  }
}

const getModalProps = () => {
  // Return specific props for each modal type
  return {}
}

const handleOverlayClick = () => {
  emit('close')
}

const handleModalAction = (action: string, data?: any) => {
  emit('action', action, data)
}

const modalContentRef = ref<HTMLElement | null>(null)

function preventScrollPropagation(e: WheelEvent) {
  const el = modalContentRef.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  const delta = e.deltaY
  if (
    (delta < 0 && scrollTop === 0) ||
    (delta > 0 && scrollTop + clientHeight >= scrollHeight)
  ) {
    e.preventDefault()
  }
}

onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  const app = document.getElementById('app')
  if (app) app.style.overflow = 'hidden'
  if (modalContentRef.value) {
    modalContentRef.value.addEventListener('wheel', preventScrollPropagation, { passive: false })
  }
})

onUnmounted(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  const app = document.getElementById('app')
  if (app) app.style.overflow = ''
  if (modalContentRef.value) {
    modalContentRef.value.removeEventListener('wheel', preventScrollPropagation)
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  z-index: 50;
  margin: 0;
  padding: 0;
}

.modal-content {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  box-shadow: none;
  overflow-y: auto;
  background: #fff;
  margin: 0;
  padding: 1.5rem; /* Ajoute une marge intérieure pour éviter que le contenu soit collé aux bords */
}
</style>
