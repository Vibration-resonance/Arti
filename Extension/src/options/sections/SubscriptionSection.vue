<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('subscription.title') }}</h2>
      <p class="text-gray-600 mb-6">{{ t('subscription.description') }}</p>
    </div>

    <!-- Current plan display -->
    <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
      <div class="text-center">
        <div class="text-lg font-semibold text-gray-800 mb-2">
          {{ t('subscription.currentPlan') }}
        </div>
        <div class="text-3xl font-bold text-blue-600 mb-3">
          {{ t(`subscription.${currentPlan}`) }}
        </div>
        <div class="text-sm text-gray-600 mb-4">
          {{ getPlanDescription(currentPlan) }}
        </div>
        <div 
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="getPlanBadgeClass(currentPlan)"
        >
          {{ t(`role.${currentPlan}`) }}
        </div>
      </div>
    </div>

    <!-- Subscription plans comparison -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900 text-center">
        {{ t('subscription.choosePlan') }}
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Free plan -->
        <div 
          class="border rounded-xl p-6 relative h-full flex flex-col"
          :class="currentPlan === 'free' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white'"
        >
          <div v-if="currentPlan === 'free'" class="absolute top-4 right-4">
            <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {{ t('subscription.current') }}
            </span>
          </div>
          
          <div class="text-center mb-6">
            <h4 class="text-xl font-bold text-gray-800">
              {{ t('subscription.free') }}
            </h4>
            <div class="text-3xl font-bold text-gray-800 mt-2">
              {{ t('subscription.freePrice') }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              {{ t('subscription.forever') }}
            </div>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.freeFeature1') }}
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.freeFeature2') }}
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.freeFeature3') }}
            </li>
          </ul>

          <button 
            v-if="currentPlan !== 'free'"
            @click="downgradeToPlan('free')"
            class="w-full btn-secondary"
          >
            {{ t('subscription.downgrade') }}
          </button>
          <div 
            v-else
            class="w-full py-3 text-center text-sm text-gray-500 border border-gray-300 rounded-lg bg-gray-50"
          >
            {{ t('subscription.currentPlan') }}
          </div>
        </div>

        <!-- Premium plan -->
        <div 
          class="border rounded-xl p-6 relative h-full flex flex-col"
          :class="currentPlan === 'premium' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white'"
        >
          <!-- Popular badge -->
          <div v-if="currentPlan !== 'premium'" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span class="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              {{ t('subscription.recommended') }}
            </span>
          </div>

          <div v-if="currentPlan === 'premium'" class="absolute top-4 right-4">
            <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {{ t('subscription.current') }}
            </span>
          </div>
          
          <div class="text-center mb-6">
            <h4 class="text-xl font-bold text-gray-800">
              {{ t('subscription.premium') }}
            </h4>
            <div class="text-3xl font-bold text-blue-600 mt-2">
              €4.99<span class="text-lg text-gray-600">/{{ t('subscription.month') }}</span>
            </div>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.premiumFeature1') }}
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.premiumFeature2') }}
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.premiumFeature3') }}
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.premiumFeature4') }}
            </li>
          </ul>

          <button 
            v-if="currentPlan === 'free'"
            @click="upgradeToPlan('premium')"
            :disabled="upgrading"
            class="w-full btn-primary disabled:opacity-50"
          >
            <span v-if="upgrading" class="flex items-center justify-center gap-2">
              <div class="spinner"></div>
              {{ t('subscription.processing') }}
            </span>
            <span v-else>
              {{ t('subscription.upgradeToPremium') }}
            </span>
          </button>
          <button 
            v-else-if="currentPlan === 'pro'"
            @click="downgradeToPlan('premium')"
            class="w-full btn-secondary"
          >
            {{ t('subscription.downgrade') }}
          </button>
          <div 
            v-else
            class="w-full py-3 text-center text-sm text-gray-500 border border-gray-300 rounded-lg bg-gray-50"
          >
            {{ t('subscription.currentPlan') }}
          </div>
        </div>

        <!-- Pro plan -->
        <div 
          class="border rounded-xl p-6 relative h-full flex flex-col"
          :class="currentPlan === 'pro' ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 bg-white'"
        >
          <div v-if="currentPlan === 'pro'" class="absolute top-4 right-4">
            <span class="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
              {{ t('subscription.current') }}
            </span>
          </div>
          
          <div class="text-center mb-6">
            <h4 class="text-xl font-bold text-gray-800">
              {{ t('subscription.pro') }}
            </h4>
            <div class="text-3xl font-bold text-purple-600 mt-2">
              €9.99<span class="text-lg text-gray-600">/{{ t('subscription.month') }}</span>
            </div>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.proFeature1') }}
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.proFeature2') }}
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.proFeature3') }}
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.proFeature4') }}
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              {{ t('subscription.proFeature5') }}
            </li>
          </ul>

          <button 
            v-if="currentPlan !== 'pro'"
            @click="upgradeToPlan('pro')"
            :disabled="upgrading"
            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <span v-if="upgrading" class="flex items-center justify-center gap-2">
              <div class="spinner"></div>
              {{ t('subscription.processing') }}
            </span>
            <span v-else>
              {{ t('subscription.upgradeToPro') }}
            </span>
          </button>
          <div 
            v-else
            class="w-full py-3 text-center text-sm text-gray-500 border border-gray-300 rounded-lg bg-gray-50"
          >
            {{ t('subscription.currentPlan') }}
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="bg-gray-50 rounded-lg p-6">
      <h4 class="text-lg font-medium text-gray-800 mb-4">
        {{ t('subscription.faqTitle') }}
      </h4>
      <div class="space-y-4 text-sm">
        <div>
          <div class="font-medium text-gray-700 mb-1">{{ t('subscription.faq1Question') }}</div>
          <div class="text-gray-600">{{ t('subscription.faq1Answer') }}</div>
        </div>
        <div>
          <div class="font-medium text-gray-700 mb-1">{{ t('subscription.faq2Question') }}</div>
          <div class="text-gray-600">{{ t('subscription.faq2Answer') }}</div>
        </div>
        <div>
          <div class="font-medium text-gray-700 mb-1">{{ t('subscription.faq3Question') }}</div>
          <div class="text-gray-600">{{ t('subscription.faq3Answer') }}</div>
        </div>
      </div>
    </div>

    <!-- Additional links -->
    <div class="flex items-center justify-between pt-6 border-t">
      <a 
        href="https://arti-ai-detector.com/pricing"
        target="_blank"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        {{ t('subscription.learnMore') }}
      </a>
      
      <a 
        href="https://arti-ai-detector.com/billing"
        target="_blank"
        class="text-sm text-gray-600 hover:text-gray-700"
      >
        {{ t('subscription.manageBilling') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { t } from '../../i18n'
import { sendMessageToBackground } from '../../utils/chrome'

interface Props {
  currentPlan: string
}

const props = withDefaults(defineProps<Props>(), {
  currentPlan: 'free'
})

const upgrading = ref(false)

const emit = defineEmits<{
  'plan-changed': [plan: string]
}>()

const getPlanDescription = (plan: string) => {
  switch (plan) {
    case 'free':
      return t('subscription.freeDescription')
    case 'premium':
      return t('subscription.premiumDescription')
    case 'pro':
      return t('subscription.proDescription')
    default:
      return ''
  }
}

const getPlanBadgeClass = (plan: string) => {
  switch (plan) {
    case 'free':
      return 'bg-gray-100 text-gray-700'
    case 'premium':
      return 'bg-blue-100 text-blue-700'
    case 'pro':
      return 'bg-purple-100 text-purple-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const upgradeToPlan = async (plan: string) => {
  upgrading.value = true
  
  try {
    const response = await sendMessageToBackground({
      type: 'CREATE_CHECKOUT_SESSION',
      plan: plan
    })

    if (response?.success && response.checkout_url) {
      // Open Stripe checkout in new tab
      window.open(response.checkout_url, '_blank')
    } else {
      console.error('Failed to create checkout session')
    }
  } catch (error) {
    console.error('Error upgrading plan:', error)
  } finally {
    upgrading.value = false
  }
}

const downgradeToPlan = async (plan: string) => {
  if (confirm(t('subscription.downgradeConfirm'))) {
    try {
      const response = await sendMessageToBackground({
        type: 'UPDATE_SUBSCRIPTION',
        plan: plan
      })

      if (response?.success) {
        emit('plan-changed', plan)
      }
    } catch (error) {
      console.error('Error downgrading plan:', error)
    }
  }
}
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors;
}

.spinner {
  @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
}
</style>
