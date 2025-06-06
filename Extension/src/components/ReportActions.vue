<template>
  <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
    <h3 class="font-medium text-blue-800 mb-3 flex items-center gap-2">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 6L9 17l-5-5 1.41-1.41L9 14.17 18.59 4.59 20 6z"/>
      </svg>
      {{ t('popup.reportPage') }}
    </h3>

    <p class="text-sm text-blue-700 mb-4">
      {{ t('popup.reportPageDescription') }}
    </p>

    <form @submit.prevent="submitReport" class="space-y-4">
      <!-- Report type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('report.type') }}
        </label>
        <select 
          v-model="reportData.report_type"
          class="form-select w-full"
          required
        >
          <option value="">{{ t('report.selectType') }}</option>
          <option value="ai_content">{{ t('reportType.ai_content') }}</option>
          <option value="suspicious_content">{{ t('reportType.suspicious_content') }}</option>
          <option value="misleading_content">{{ t('reportType.misleading_content') }}</option>
          <option value="spam_content">{{ t('reportType.spam_content') }}</option>
          <option value="other">{{ t('reportType.other') }}</option>
        </select>
      </div>

      <!-- Evidence URL (optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('report.evidenceUrl') }}
          <span class="text-gray-500 font-normal">({{ t('optional') }})</span>
        </label>
        <input 
          v-model="reportData.evidence_url"
          type="url"
          class="form-input w-full"
          :placeholder="t('report.evidenceUrlPlaceholder')"
        >
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('report.description') }}
          <span class="text-gray-500 font-normal">({{ t('optional') }})</span>
        </label>
        <textarea 
          v-model="reportData.description"
          class="form-textarea w-full"
          rows="3"
          :placeholder="t('report.descriptionPlaceholder')"
          maxlength="500"
        ></textarea>
        <div class="text-xs text-gray-500 mt-1">
          {{ reportData.description.length }}/500
        </div>
      </div>

      <!-- Submit button -->
      <button 
        type="submit" 
        :disabled="submitting || !reportData.report_type"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="submitting" class="flex items-center justify-center gap-2">
          <div class="spinner"></div>
          {{ t('report.submitting') }}
        </span>
        <span v-else>
          {{ t('report.submit') }}
        </span>
      </button>
    </form>

    <!-- Info box -->
    <div class="mt-4 p-3 bg-gray-50 rounded border text-sm text-gray-600">
      <div class="flex items-start gap-2">
        <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 20C10.9 20 10 19.1 10 18C10 16.9 10.9 16 12 16C13.1 16 14 16.9 14 18C14 19.1 13.1 20 12 20ZM12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7Z"/>
        </svg>
        <div>
          <div class="font-medium mb-1">{{ t('report.infoTitle') }}</div>
          <div>{{ t('report.infoText') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { t } from '../i18n'

interface Props {
  pageUrl: string
}

const props = defineProps<Props>()

interface ReportData {
  report_type: string
  evidence_url: string
  description: string
}

const submitting = ref(false)

const reportData = reactive<ReportData>({
  report_type: '',
  evidence_url: '',
  description: ''
})

const emit = defineEmits<{
  'report-submitted': [data: any]
}>()

const submitReport = async () => {
  if (!reportData.report_type) return

  submitting.value = true
  
  try {
    const data = {
      page_url: props.pageUrl,
      report_type: reportData.report_type,
      evidence_url: reportData.evidence_url || null,
      description: reportData.description || null,
    }

    emit('report-submitted', data)

    // Reset form
    reportData.report_type = ''
    reportData.evidence_url = ''
    reportData.description = ''
  } catch (error) {
    console.error('Error submitting report:', error)
  } finally {
    submitting.value = false
  }
}
</script>
