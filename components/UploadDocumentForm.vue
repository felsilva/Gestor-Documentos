<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Subir Nuevo Documento</h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="file" class="block text-sm font-medium text-gray-700">Archivo</label>
        <input
          type="file"
          id="file"
          ref="fileInput"
          required
          class="mt-1 input-field"
          @change="handleFileChange"
        />
      </div>
      <div>
        <label for="deadline" class="block text-sm font-medium text-gray-700">Fecha límite</label>
        <input
          type="date"
          id="deadline"
          v-model="deadline"
          required
          class="mt-1 input-field"
          :min="minDate"
        />
      </div>
      <div>
        <button
          type="submit"
          class="btn-primary w-full flex justify-center items-center"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="mr-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isLoading ? 'Subiendo...' : 'Subir Documento' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const isLoading = ref(false)
const deadline = ref('')
const fileInput = ref(null)
const selectedFile = ref(null)

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const handleSubmit = async () => {
  if (!selectedFile.value || !deadline.value) return
  
  isLoading.value = true
  try {
    // TODO: Implement file upload logic
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulated delay
    
    // Reset form
    selectedFile.value = null
    deadline.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    // Emit success event
    emit('upload-success')
  } catch (error) {
    console.error('Error uploading document:', error)
  } finally {
    isLoading.value = false
  }
}

const emit = defineEmits(['upload-success'])
</script>