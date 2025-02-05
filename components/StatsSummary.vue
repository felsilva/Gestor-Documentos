<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="stat in stats"
      :key="stat.name"
      class="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
    >
      <dt>
        <div class="absolute rounded-md bg-indigo-500 p-3">
          <component :is="stat.icon" class="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <p class="ml-16 truncate text-sm font-medium text-gray-500">{{ stat.name }}</p>
      </dt>
      <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
        <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
        <div class="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
          <div class="text-sm">
            <NuxtLink
              :to="stat.href"
              class="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Ver detalles
            </NuxtLink>
          </div>
        </div>
      </dd>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DocumentTextIcon,
  ClockIcon,
  ArchiveBoxIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  totalDocuments: number
  pendingDocuments: number
  archivedDocuments: number
}>()

const stats = computed(() => [
  {
    name: 'Total documentos',
    value: props.totalDocuments,
    icon: DocumentTextIcon,
    href: '/'
  },
  {
    name: 'Documentos pendientes',
    value: props.pendingDocuments,
    icon: ClockIcon,
    href: '/'
  },
  {
    name: 'Documentos archivados',
    value: props.archivedDocuments,
    icon: ArchiveBoxIcon,
    href: '/'
  }
])
</script>