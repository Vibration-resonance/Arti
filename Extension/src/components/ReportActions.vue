<template>
  <div class="report-actions-panel bg-blue-50 rounded-lg p-4 border border-blue-200" :key="languageVersion">
    <h3 class="font-medium text-blue-800 mb-3 flex items-center gap-2">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 6L9 17l-5-5 1.41-1.41L9 14.17 18.59 4.59 20 6z"/>
      </svg>
      {{ t('popup_reportPage') }}
    </h3>

    <p class="text-sm text-blue-700 mb-4">
      {{ t('popup_reportPageDescription') }}
    </p>

    <form @submit.prevent="submitReport" class="space-y-4">
      <!-- Report type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('report_contentType') }}
        </label>
        <select 
          v-model="reportData.content_type"
          class="form-select w-full"
          required
        >
          <option value="">{{ t('report_selectType') }}</option>
          <option value="text">{{ t('contentTypes_text') }}</option>
          <option value="image">{{ t('contentTypes_image') }}</option>
          <option value="video">{{ t('contentTypes_video') }}</option>
          <option value="audio">{{ t('contentTypes_audio') }}</option>
          <option value="other">{{ t('common_optional') }}</option>
        </select>
      </div>

      <!-- Evidence URL (optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('report_evidenceUrl') }}
          <span class="text-gray-500 font-normal">({{ t('optional') }})</span>
        </label>
        <input
          v-model="reportData.evidence_url"
          type="url"
          class="form-input w-full"
          :placeholder="t('report_evidenceUrlPlaceholder')"
        >
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('report_description') }}
          <span class="text-gray-500 font-normal">({{ t('optional') }})</span>
        </label>
        <textarea 
          v-model="reportData.description"
          class="form-textarea w-full"
          rows="3"
          :placeholder="t('report_descriptionPlaceholder')"
          maxlength="500"
        ></textarea>
        <div class="text-xs text-gray-500 mt-1">
          {{ reportData.description.length }}/500
        </div>
      </div>

      <!-- Submit button -->
      <button 
        type="submit" 
        :disabled="submitting || !reportData.content_type"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="submitting" class="flex items-center justify-center gap-2">
          <div class="spinner"></div>
          {{ t('report_submitting') }}
        </span>
        <span v-else>
          {{ t('report_submit') }}
        </span>
      </button>
      <div v-if="errorMessage" class="text-red-600 text-sm mt-2">{{ errorMessage }}</div>
      <div v-if="feedbackType === 'success'" class="text-green-700 bg-green-50 border border-green-200 rounded text-sm mt-2 px-3 py-2 flex items-center gap-2">
        <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
        {{ t('report_submitSuccess') }}
      </div>
    </form>

    <!-- Info box -->
    <div class="mt-4 p-3 bg-gray-50 rounded border text-sm text-gray-600">
      <div class="flex items-start gap-2">
        <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 20C10.9 20 10 19.1 10 18C10 16.9 10.9 16 12 16C13.1 16 14 16.9 14 18C14 19.1 13.1 20 12 20ZM12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7Z"/>
        </svg>
        <div>
          <div class="font-medium mb-1">{{ t('report_infoTitle') }}</div>
          <div>{{ t('report_infoText') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { t } from '../i18n'

interface Props {
  pageUrl: string
  languageVersion?: number // Ajout de la prop
}

const props = defineProps<Props & { feedbackType?: string }>()

interface ReportData {
  content_type: string
  evidence_url: string
  description: string
}

const submitting = ref(false)
const errorMessage = ref('')

const reportData = reactive<ReportData>({
  content_type: '',
  evidence_url: '',
  description: ''
})

const emit = defineEmits<{
  'report-submitted': [data: any]
}>()

const resetForm = () => {
  reportData.content_type = ''
  reportData.evidence_url = ''
  reportData.description = ''
}

// Listen for parent feedback to reset form on success
watch(() => props.feedbackType, (val) => {
  if (val === 'success') resetForm()
})

const submitReport = async () => {
  errorMessage.value = ''
  if (!reportData.content_type) {
    errorMessage.value = t('report.selectType')
    return
  }
  submitting.value = true
  try {
    const data = {
      url: props.pageUrl,
      type_contenu: reportData.content_type,
      commentaire: reportData.description || null,
      anonyme: false,
      whitelist_request: false
    }
    emit('report-submitted', data)
  } catch (error) {
    errorMessage.value = t('report.submitError')
    console.error('Error submitting report:', error)
  } finally {
    submitting.value = false
  }
}
</script>
