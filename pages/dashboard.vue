<template>
  <div class="py-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p class="mt-2 text-gray-600">Gestiona tus documentos</p>
      </div>
      <button
        @click="showUploadForm = true"
        class="btn-primary"
      >
        Subir Documento
      </button>
    </div>

    <!-- Stats Summary -->
    <StatsSummary
      :total-documents="documents.length"
      :active-alerts="activeAlerts"
    />

    <!-- Upload Form Dialog -->
    <div v-if="showUploadForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium">Subir Documento</h2>
            <button @click="showUploadForm = false" class="text-gray-400 hover:text-gray-500">
              <span class="sr-only">Cerrar</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <UploadDocumentForm @upload-success="handleUploadSuccess" />
        </div>
      </div>
    </div>

    <!-- Document Table -->
    <DocumentTable />
  </div>
</template>

<script setup>
const showUploadForm = ref(false)
const documents = ref([])
const activeAlerts = computed(() => {
  return documents.value.filter(doc => {
    const daysUntilDeadline = Math.ceil((new Date(doc.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    return daysUntilDeadline <= 7
  }).length
})

const handleUploadSuccess = () => {
  showUploadForm.value = false
  // TODO: Refresh documents list
}
</script>