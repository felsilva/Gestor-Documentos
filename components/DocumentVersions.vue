<template>
  <Modal @close="$emit('close')">
    <template #title>
      Versiones del documento
    </template>
    <template #content>
      <div class="space-y-4">
        <!-- Lista de versiones -->
        <div class="space-y-2">
          <div v-for="version in versions" :key="version.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div class="text-sm font-medium text-gray-900">
                Versión {{ version.version_number }}
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(version.created_at) }}
              </div>
              <div v-if="version.comment" class="text-sm text-gray-600 mt-1">
                {{ version.comment }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a
                :href="versionUrls[version.id] || '#'"
                target="_blank"
                class="text-sm text-indigo-600 hover:text-indigo-500"
                :class="{ 'opacity-50 cursor-not-allowed': !versionUrls[version.id] }"
              >
                Descargar
              </a>
              <button
                @click="restoreVersion(version)"
                class="text-sm text-gray-600 hover:text-gray-500"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>

        <!-- Subir nueva versión -->
        <div class="border-t pt-4">
          <h3 class="text-sm font-medium text-gray-900">Subir nueva versión</h3>
          <form @submit.prevent="handleUpload" class="mt-2 space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Archivo</label>
              <input
                ref="fileInput"
                type="file"
                required
                class="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Comentario</label>
              <textarea
                v-model="comment"
                rows="2"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                :disabled="loading"
              >
                {{ loading ? 'Subiendo...' : 'Subir versión' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase'
import { getSignedFileUrl } from '~/utils/b2'

interface Version {
  id: string
  document_id: string
  version_number: number
  file_path: string
  file_url?: string
  created_at: string
  created_by: string
  comment?: string
}

const props = defineProps<{
  documentId: string
}>()

const emit = defineEmits<{
  close: []
  versionRestored: []
}>()

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toast = useToast()
const loading = ref(false)
const versions = ref<Version[]>([])
const versionUrls = ref<{ [key: string]: string }>({})
const comment = ref('')
const fileInput = ref<HTMLInputElement>()

// Cargar versiones
async function loadVersions() {
  const { data, error } = await client
    .from('document_versions')
    .select('*')
    .eq('document_id', props.documentId)
    .order('version_number', { ascending: false })

  if (error) throw error
  versions.value = data
}

// Actualizar URLs firmadas
async function updateSignedUrls() {
  for (const version of versions.value) {
    try {
      versionUrls.value[version.id] = await getSignedFileUrl(version.file_path)
    } catch (error) {
      console.error(`Error updating URL for version ${version.id}:`, error)
      versionUrls.value[version.id] = ''
    }
  }
}

// Actualizar URLs cuando cambien las versiones
watch(() => versions.value, updateSignedUrls)

// Subir nueva versión
async function handleUpload() {
  if (!fileInput.value?.files?.length) return

  loading.value = true
  try {
    const file = fileInput.value.files[0]
    const nextVersion = versions.value.length ? versions.value[0].version_number + 1 : 1
    const filePath = `versions/${props.documentId}/${nextVersion}/${file.name}`

    // 1. Subir archivo
    const { error: uploadError } = await client.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 2. Crear registro de versión
    const { error: dbError } = await client
      .from('document_versions')
      .insert({
        document_id: props.documentId,
        version_number: nextVersion,
        file_path: filePath,
        created_by: user.value?.id,
        comment: comment.value
      })

    if (dbError) throw dbError

    toast.add({
      title: 'Versión creada',
      description: 'La nueva versión se ha subido correctamente',
      icon: 'success'
    })

    await loadVersions()
    comment.value = ''
    if (fileInput.value) fileInput.value.value = ''
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Restaurar versión
async function restoreVersion(version: Version) {
  if (!confirm('¿Está seguro de restaurar esta versión?')) return

  loading.value = true
  try {
    const { error } = await client
      .from('documents')
      .update({
        file_path: version.file_path,
        file_url: version.file_url
      })
      .eq('id', props.documentId)

    if (error) throw error

    toast.add({
      title: 'Versión restaurada',
      description: 'El documento se ha restaurado a la versión seleccionada',
      icon: 'success'
    })

    emit('versionRestored')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

// Cargar versiones al montar
onMounted(() => {
  loadVersions()
})
</script> 