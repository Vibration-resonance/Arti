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

const currentLanguage = ref('en')

const handleLanguageChange = () => {
  changeLanguage(currentLanguage.value)
  emit('language-changed', currentLanguage.value)
}

const emit = defineEmits<{
  'language-changed': [language: string]
}>()

onMounted(() => {
  currentLanguage.value = getCurrentLanguage()
})
</script>
