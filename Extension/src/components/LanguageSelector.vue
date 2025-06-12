<template>
  <div class="relative">
    <select 
      v-model="currentLanguage"
      @change="handleLanguageChange"
      class="bg-blue-500 border border-blue-400 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      <option value="en">🇺🇸 EN</option>
      <option value="fr">🇫🇷 FR</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCurrentLanguage, changeLanguage } from '../i18n'
import { sendMessageToBackground } from '../utils/chrome'

const currentLanguage = ref('en')

const handleLanguageChange = async () => {
  await changeLanguage(currentLanguage.value)
  // Synchronise la langue avec le background (et donc tous les scripts)
  await sendMessageToBackground({
    type: 'UPDATE_SETTINGS',
    data: { language: currentLanguage.value }
  })
  emit('language-changed', currentLanguage.value)
}

const emit = defineEmits<{
  'language-changed': [language: string]
}>()

onMounted(async () => {
  // D'abord essayer de récupérer la langue depuis chrome.storage
  try {
    const response = await sendMessageToBackground({ type: 'GET_SETTINGS' });
    if (response?.success && response.data?.language) {
      currentLanguage.value = response.data.language;
      // S'assurer que l'i18n utilise la bonne langue
      await changeLanguage(response.data.language);
      console.log('[LanguageSelector:onMounted] Using chrome.storage language:', response.data.language);
      return;
    }
  } catch (error) {
    console.warn('[LanguageSelector:onMounted] Failed to get settings:', error);
  }
  
  // Fallback sur getCurrentLanguage
  currentLanguage.value = getCurrentLanguage();
  console.log('[LanguageSelector:onMounted] Using fallback language:', currentLanguage.value);
})
</script>
