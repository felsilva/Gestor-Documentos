<template>
  <form @submit.prevent="handleSubmit" class="max-w-4xl mx-auto space-y-8 bg-white rounded-xl shadow-sm p-6">
    <!-- Encabezado del formulario -->
    <div class="border-b border-gray-200 pb-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900">Información del documento</h3>
      <p class="mt-1 text-sm text-gray-500">
        Complete la información necesaria para subir un nuevo documento.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <!-- Título y Categoría -->
      <div class="space-y-6 sm:border-r sm:pr-8">
        <div>
          <label class="block text-sm font-medium text-gray-900">Título</label>
          <p class="text-xs text-gray-500 mt-1">Nombre descriptivo del documento</p>
          <input
            v-model="title"
            type="text"
            required
            placeholder="Nombre del documento"
            class="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <!-- Categoría -->
        <ClientOnly>
          <CategorySelect
            v-model="category"
            :can-create="true"
          />
        </ClientOnly>
      </div>

      <!-- Etiquetas y Fecha límite -->
      <div class="space-y-6 sm:pl-8">
        <TagInput
          v-model="tags"
          :suggestions="tagSuggestions"
        />

        <div>
          <label class="block text-sm font-medium text-gray-900">Fecha límite</label>
          <p class="text-xs text-gray-500 mt-1">Fecha de vencimiento del documento</p>
          <div class="mt-1 flex items-center gap-2">
            <input
              v-model="deadline"
              type="date"
              required
              :min="today"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
            />
            <span class="text-sm text-gray-500 whitespace-nowrap">
              {{ formatDeadline(deadline) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Descripción -->
    <div>
      <label class="block text-sm font-medium text-gray-900">Descripción</label>
      <p class="text-xs text-gray-500 mt-1">Breve descripción del contenido del documento</p>
      <textarea
        v-model="description"
        rows="3"
        placeholder="Descripción del documento"
        class="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      ></textarea>
    </div>

    <!-- Archivo -->
    <FileDropzone
      v-model="selectedFile"
      label="Archivo"
      accept=".pdf,.doc,.docx,.xls,.xlsx"
      accept-text="PDF, Word o Excel hasta 10MB"
    />

    <div class="flex justify-end gap-x-3 pt-8 border-t border-gray-200">
      <NuxtLink
        to="/"
        class="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
      >
        Cancelar
      </NuxtLink>
      <button
        type="submit"
        :disabled="loading"
        class="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
      >
        {{ loading ? 'Subiendo...' : 'Subir documento' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import CategorySelect from './CategorySelect.vue'
import TagInput from './TagInput.vue'
import type { Database } from '~/types/supabase'

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()

const title = ref('')
const category = ref('')
const tags = ref<string[]>([])
const description = ref('')
const deadline = ref('')
const selectedFile = ref<File | null>(null)
const loading = ref(false)

// Sugerencias de etiquetas comunes
const tagSuggestions = ref([
  'Urgente',
  'Revisión pendiente',
  'Importante',
  'Borrador',
  'Final'
])

const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

function formatDeadline(date: string) {
  if (!date) return ''
  const formattedDate = new Date(date).toLocaleDateString('es', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  return `Vence el ${formattedDate}`
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
  }
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const emit = defineEmits(['uploaded'])

async function handleSubmit() {
  if (!selectedFile.value || !user.value) return

  loading.value = true
  try {
    const fileExt = selectedFile.value.name.split('.').pop()
    const fileName = `${user.value.id}/${Math.random().toString(36).substring(2)}.${fileExt}`

    const { url, key } = await uploadFileToB2(selectedFile.value, fileName)

    const newDocument = {
      title: title.value,
      file_path: key,
      file_url: url,
      deadline: deadline.value,
      category: category.value,
      tags: tags.value,
      description: description.value,
      user_id: user.value.id,
      metadata: {
        fileType: selectedFile.value.type,
        fileSize: selectedFile.value.size,
        lastModified: new Date(selectedFile.value.lastModified).toISOString()
      }
    }

    const { error: dbError } = await $fetch('/api/documents/create', {
      method: 'POST',
      body: newDocument
    })

    if (dbError) throw dbError

    emit('uploaded')
    navigateTo('/')
  } catch (error: any) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script> 