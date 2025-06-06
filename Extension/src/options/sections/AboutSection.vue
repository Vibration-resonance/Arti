<template>
  <div class="space-y-8">
    <!-- Extension Info Header -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('about.title') }}</h1>
          <p class="text-sm text-gray-500">{{ t('about.version', { version: extensionVersion }) }}</p>
        </div>
      </div>
      <p class="mt-4 text-gray-700">{{ t('about.description') }}</p>
    </div>

    <!-- Features Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="feature in features" :key="feature.key" class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="feature.bgColor">
            <component :is="feature.icon" class="w-5 h-5" :class="feature.iconColor" />
          </div>
          <h3 class="font-semibold text-gray-900">{{ t(`about.features.${feature.key}.title`) }}</h3>
        </div>
        <p class="text-sm text-gray-600">{{ t(`about.features.${feature.key}.description`) }}</p>
      </div>
    </div>

    <!-- How It Works -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('about.howItWorks.title') }}</h2>
      <div class="space-y-4">
        <div v-for="(step, index) in howItWorksSteps" :key="step.key" class="flex items-start space-x-4">
          <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {{ index + 1 }}
          </div>
          <div>
            <h3 class="font-medium text-gray-900">{{ t(`about.howItWorks.steps.${step.key}.title`) }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ t(`about.howItWorks.steps.${step.key}.description`) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Team & Credits -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('about.team.title') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="member in teamMembers" :key="member.name" class="text-center">
          <div class="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span class="text-lg font-semibold text-gray-600">{{ member.initials }}</span>
          </div>
          <h3 class="font-medium text-gray-900">{{ member.name }}</h3>
          <p class="text-sm text-gray-500">{{ t(`about.team.roles.${member.role}`) }}</p>
        </div>
      </div>
    </div>

    <!-- Links & Resources -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Useful Links -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('about.links.title') }}</h2>
        <div class="space-y-3">
          <a v-for="link in usefulLinks" :key="link.key" 
             :href="link.url" 
             target="_blank" 
             rel="noopener noreferrer"
             class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <component :is="link.icon" class="w-5 h-5 text-gray-400" />
            <span class="text-gray-700">{{ t(`about.links.items.${link.key}`) }}</span>
            <svg class="w-4 h-4 text-gray-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
              <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Support -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('about.support.title') }}</h2>
        <div class="space-y-3">
          <div v-for="support in supportOptions" :key="support.key" class="flex items-start space-x-3">
            <component :is="support.icon" class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h3 class="font-medium text-gray-900">{{ t(`about.support.options.${support.key}.title`) }}</h3>
              <p class="text-sm text-gray-600">{{ t(`about.support.options.${support.key}.description`) }}</p>
              <a v-if="support.url" 
                 :href="support.url" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mt-1">
                {{ t(`about.support.options.${support.key}.action`) }}
                <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Privacy & Legal -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('about.legal.title') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="legal in legalItems" :key="legal.key">
          <h3 class="font-medium text-gray-900 mb-2">{{ t(`about.legal.items.${legal.key}.title`) }}</h3>
          <p class="text-sm text-gray-600 mb-3">{{ t(`about.legal.items.${legal.key}.description`) }}</p>
          <a :href="legal.url" 
             target="_blank" 
             rel="noopener noreferrer"
             class="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
            {{ t('about.legal.readMore') }}
            <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Version History -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('about.changelog.title') }}</h2>
      <div class="space-y-4 max-h-64 overflow-y-auto">
        <div v-for="version in changelog" :key="version.version" class="border-l-2 border-gray-200 pl-4">
          <div class="flex items-center space-x-2 mb-1">
            <span class="font-semibold text-gray-900">v{{ version.version }}</span>
            <span class="text-sm text-gray-500">{{ formatDate(version.date) }}</span>
            <span v-if="version.isLatest" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              {{ t('about.changelog.latest') }}
            </span>
          </div>
          <ul class="space-y-1">
            <li v-for="change in version.changes" :key="change" class="text-sm text-gray-600">
              • {{ t(`about.changelog.versions.${version.version}.${change}`) }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center text-sm text-gray-500 py-4 border-t border-gray-200">
      <p>{{ t('about.footer.copyright', { year: currentYear }) }}</p>
      <p class="mt-1">{{ t('about.footer.buildInfo', { build: buildInfo }) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { t } from '../../i18n'

// Extension info
const extensionVersion = ref('1.0.0')
const buildInfo = ref('dev-build')
const currentYear = new Date().getFullYear()

// Features data
const features = [
  {
    key: 'detection',
    icon: 'SearchIcon',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    key: 'community',
    icon: 'UsersIcon', 
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    key: 'realtime',
    icon: 'LightningBoltIcon',
    bgColor: 'bg-yellow-100', 
    iconColor: 'text-yellow-600'
  },
  {
    key: 'privacy',
    icon: 'ShieldCheckIcon',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    key: 'leaderboard',
    icon: 'TrophyIcon',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    key: 'multilingual',
    icon: 'GlobeIcon',
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  }
]

// How it works steps
const howItWorksSteps = [
  { key: 'browse' },
  { key: 'detect' },
  { key: 'vote' },
  { key: 'learn' }
]

// Team members
const teamMembers = [
  { name: 'Alex Johnson', role: 'founder', initials: 'AJ' },
  { name: 'Sarah Chen', role: 'developer', initials: 'SC' },
  { name: 'Mike Rodriguez', role: 'designer', initials: 'MR' }
]

// Useful links
const usefulLinks = [
  {
    key: 'website',
    url: 'https://arti-ai-detector.com',
    icon: 'GlobeIcon'
  },
  {
    key: 'github',
    url: 'https://github.com/arti-ai-detector/extension',
    icon: 'CodeIcon'
  },
  {
    key: 'documentation',
    url: 'https://docs.arti-ai-detector.com',
    icon: 'BookOpenIcon'
  },
  {
    key: 'blog',
    url: 'https://blog.arti-ai-detector.com',
    icon: 'NewspaperIcon'
  }
]

// Support options
const supportOptions = [
  {
    key: 'faq',
    icon: 'QuestionMarkCircleIcon',
    url: 'https://help.arti-ai-detector.com/faq'
  },
  {
    key: 'contact',
    icon: 'MailIcon',
    url: 'mailto:support@arti-ai-detector.com'
  },
  {
    key: 'community',
    icon: 'ChatIcon',
    url: 'https://discord.gg/arti-ai-detector'
  }
]

// Legal items
const legalItems = [
  {
    key: 'privacy',
    url: 'https://arti-ai-detector.com/privacy'
  },
  {
    key: 'terms',
    url: 'https://arti-ai-detector.com/terms'
  },
  {
    key: 'licenses',
    url: 'https://arti-ai-detector.com/licenses'
  }
]

// Changelog data
const changelog = [
  {
    version: '1.0.0',
    date: new Date('2024-01-15'),
    isLatest: true,
    changes: ['initialRelease', 'communityVoting', 'realTimeDetection']
  },
  {
    version: '0.9.0',
    date: new Date('2023-12-20'),
    isLatest: false,
    changes: ['betaLaunch', 'leaderboardSystem', 'multiLanguage']
  },
  {
    version: '0.8.0',
    date: new Date('2023-12-01'),
    isLatest: false,
    changes: ['alphaRelease', 'basicDetection', 'userAccounts']
  }
]

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Load extension manifest data
onMounted(async () => {
  try {
    if (chrome?.runtime?.getManifest) {
      const manifest = chrome.runtime.getManifest()
      extensionVersion.value = manifest.version || '1.0.0'
      buildInfo.value = `${manifest.version || '1.0.0'}-${new Date().toISOString().split('T')[0]}`
    }
  } catch (error) {
    console.warn('Could not load extension manifest:', error)
  }
})

// Icon components (simplified SVG icons)
const SearchIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>`
}

const UsersIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>`
}

const LightningBoltIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg>`
}

const ShieldCheckIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`
}

const TrophyIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2L3 4v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V4l-7-2z" clip-rule="evenodd"/></svg>`
}

const GlobeIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/></svg>`
}

const CodeIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>`
}

const BookOpenIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>`
}

const NewspaperIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clip-rule="evenodd"/><path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"/></svg>`
}

const QuestionMarkCircleIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>`
}

const MailIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>`
}

const ChatIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/></svg>`
}
</script>
