<template>
  <div class="space-y-6">
    <!-- Current plan display -->
    <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
      <div class="text-lg font-semibold text-gray-800 mb-2">
        {{ t('subscription.currentPlan') }}
      </div>
      <div class="text-2xl font-bold text-blue-600 mb-3">
        {{ t(`subscription.${currentPlan}`) }}
      </div>
      <div class="text-sm text-gray-600">
        {{ getPlanDescription(currentPlan) }}
      </div>
    </div>

    <!-- Subscription plans -->
    <div class="space-y-4">
      <h3 class="font-semibold text-gray-800 text-center">
        {{ t('subscription.choosePlan') }}
      </h3>

      <!-- Free plan -->
      <div 
        class="border rounded-lg p-6 relative"
        :class="currentPlan === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
      >
        <div v-if="currentPlan === 'free'" class="absolute top-4 right-4">
          <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {{ t('subscription.current') }}
          </span>
        </div>
        
        <div class="text-center mb-4">
          <h4 class="text-lg font-semibold text-gray-800">
            {{ t('subscription.free') }}
          </h4>
          <div class="text-3xl font-bold text-gray-800 mt-2">
            {{ t('subscription.freePrice') }}
          </div>
        </div>

        <ul class="space-y-2 mb-6">
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('subscription.freeFeature1') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('subscription.freeFeature2') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
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
      </div>

      <!-- Premium plan -->
      <div 
        class="border rounded-lg p-6 relative"
        :class="currentPlan === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
      >
        <div v-if="currentPlan === 'premium'" class="absolute top-4 right-4">
          <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {{ t('subscription.current') }}
          </span>
        </div>
        
        <div class="text-center mb-4">
          <h4 class="text-lg font-semibold text-gray-800">
            {{ t('subscription.premium') }}
          </h4>
          <div class="text-3xl font-bold text-blue-600 mt-2">
            €4.99<span class="text-lg text-gray-600">/{{ t('subscription.month') }}</span>
          </div>
        </div>

        <ul class="space-y-2 mb-6">
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('subscription.premiumFeature1') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('subscription.premiumFeature2') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('subscription.premiumFeature3') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
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
      </div>

      <!-- Pro plan -->
      <div 
        class="border rounded-lg p-6 relative overflow-hidden"
        :class="currentPlan === 'pro' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'"
      >
        <!-- Popular badge -->
        <div class="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 transform rotate-12 translate-x-3 -translate-y-1">
          {{ t('subscription.popular') }}
        </div>

        <div v-if="currentPlan === 'pro'" class="absolute top-4 right-4">
          <span class="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
            {{ t('subscription.current') }}
          </span>
        </div>
        
        <div class="text-center mb-4">
          <h4 class="text-lg font-semibold text-gray-800">
            {{ t('subscription.pro') }}
          </h4>
          <div class="text-3xl font-bold text-purple-600 mt-2">
            €9.99<span class="text-lg text-gray-600">/{{ t('subscription.month') }}</span>
          </div>
        </div>

        <ul class="space-y-2 mb-6">
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('subscription.proFeature1') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('subscription.proFeature2') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('subscription.proFeature3') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            {{ t('subscription.proFeature4') }}
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>

    <!-- FAQ or additional info -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-800 mb-2">
        {{ t('subscription.faqTitle') }}
      </h4>
      <div class="text-sm text-gray-600 space-y-2">
        <div>
          <strong>{{ t('subscription.faq1Question') }}</strong><br>
          {{ t('subscription.faq1Answer') }}
        </div>
        <div>
          <strong>{{ t('subscription.faq2Question') }}</strong><br>
          {{ t('subscription.faq2Answer') }}
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex justify-between pt-4 border-t">
      <a 
        href="https://arti-ai-detector.com/pricing"
        target="_blank"
        class="text-sm text-blue-600 hover:text-blue-700"
      >
        {{ t('subscription.learnMore') }}
      </a>
      
      <button 
        @click="$emit('close')"
        class="btn-secondary"
      >
        {{ t('close') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { t } from '../../i18n'
import { sendMessageToBackground } from '../../utils/chrome'

interface Props {
  currentPlan?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentPlan: 'free'
})

const upgrading = ref(false)

const emit = defineEmits<{
  'close': []
  'action': [action: string, data?: any]
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

const upgradeToPlan = async (plan: string) => {
  upgrading.value = true
  
  try {
    const response = await sendMessageToBackground({
      type: 'CREATE_CHECKOUT_SESSION',
      plan: plan
    })

    if (response?.success && response.checkout_url) {
      // Open Stripe checkout in new tab
      chrome.tabs.create({ url: response.checkout_url })
      emit('close')
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
        emit('action', 'plan-changed', plan)
        emit('close')
      }
    } catch (error) {
      console.error('Error downgrading plan:', error)
    }
  }
}
</script>
