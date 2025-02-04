<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <dt class="text-sm font-medium text-gray-500 truncate">
          Total Documentos
        </dt>
        <dd class="mt-1 text-3xl font-semibold text-gray-900">
          {{ stats.totalDocuments }}
        </dd>
      </div>
    </div>
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <dt class="text-sm font-medium text-gray-500 truncate">
          Alertas Activas
        </dt>
        <dd class="mt-1 text-3xl font-semibold text-gray-900">
          {{ stats.activeAlerts }}
        </dd>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Stats {
  totalDocuments: number
  activeAlerts: number
}

defineProps<{
  stats: Stats
}>()
</script>