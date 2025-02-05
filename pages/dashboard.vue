<template>
  <div class="py-6">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
    </div>
    <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div class="py-4">
        <StatsSummary
          :total-documents="stats.totalDocuments"
          :pending-documents="stats.pendingDocuments"
          :archived-documents="stats.archivedDocuments"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DocumentStats {
  totalDocuments: number
  pendingDocuments: number
  archivedDocuments: number
}

const user = useSupabaseUser()

const stats = ref({
  totalDocuments: 0,
  pendingDocuments: 0,
  archivedDocuments: 0
})

// Cargar estadísticas
onMounted(async () => {
  if (!user.value) return

  try {
    const response = await $fetch<DocumentStats>('/api/documents/stats')
    stats.value = response
  } catch (error) {
    console.error('Error loading stats:', error)
  }
})
</script>