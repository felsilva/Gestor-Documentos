<template>
  <div class="overflow-hidden bg-white shadow-sm ring-1 ring-gray-300 sm:rounded-lg">
    <table class="min-w-full divide-y divide-gray-200 table-fixed">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Documento
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Categoría
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Etiquetas
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha de subida
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha límite
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Estado
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col">
              <a 
                @click.prevent="handlePreview(doc)"
                :href="getDocumentUrl(doc.id)"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                :class="{ 'opacity-50 cursor-not-allowed': !hasValidUrl(doc.id) }"
              >
                {{ doc.title }}
              </a>
              <span class="text-xs text-gray-500">
                {{ formatFileSize(doc.metadata?.fileSize) }} | {{ doc.metadata?.fileType || 'Desconocido' }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ getCategoryName(doc.category) }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <DocumentTags :tags="doc.tags" />
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">{{ formatDate(doc.upload_date) }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">{{ formatDate(doc.deadline) }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span :class="getStatusClass(doc)">
              {{ getStatusText(doc) }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button 
              @click="handleEdit(doc)" 
              class="text-indigo-600 hover:text-indigo-500 transition-colors mr-4"
            >
              Editar
            </button>
            <button 
              @click="handleVersions(doc)" 
              class="text-gray-600 hover:text-gray-500 transition-colors mr-4"
            >
              Versiones
            </button>
            <button 
              @click="handleDelete(doc.id)" 
              class="text-red-600 hover:text-red-500 transition-colors"
            >
              Eliminar
            </button>
          </td>
        </tr>
        <tr v-if="documents.length === 0">
          <td colspan="7" class="px-6 py-8 text-center text-sm text-gray-500">
            No hay documentos disponibles
          </td>
        </tr>
      </tbody>
    </table>
    <DocumentEdit
      v-if="showEditModal && selectedDocument"
      :document="selectedDocument"
      @close="showEditModal = false"
      @updated="$emit('update', $event)"
    />
    <DocumentVersions
      v-if="showVersionsModal && selectedVersionDocument"
      :document-id="selectedVersionDocument.id"
      @close="showVersionsModal = false"
      @version-restored="$emit('update', selectedVersionDocument)"
    />
    <DocumentPreview
      v-if="showPreviewModal && selectedPreviewDocument"
      :document="selectedPreviewDocument"
      :document-url="getDocumentUrl(selectedPreviewDocument.id)"
      @close="showPreviewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'
import { getSignedFileUrl } from '~/utils/b2'
import DocumentTags from '~/components/DocumentTags.vue'
import type { Database } from '~/types/supabase'
import DocumentEdit from '~/components/DocumentEdit.vue'
import DocumentVersions from '~/components/DocumentVersions.vue'
import DocumentPreview from '~/components/DocumentPreview.vue'

interface DocumentUrlMap {
  [key: string]: string
}

const props = defineProps<{
  documents: Document[]
}>()

const emit = defineEmits<{
  delete: [id: string],
  update: [document: Document]
}>()
const client = useSupabaseClient<Database>()
const documentUrls = ref<DocumentUrlMap>({})
const toast = useToast()
interface Category {
  id: string
  name: string
}
const categories = ref<Record<string, Category>>({})
const intervalRef = ref<NodeJS.Timeout>()
const showEditModal = ref(false)
const selectedDocument = ref<Document | null>(null)
const showVersionsModal = ref(false)
const selectedVersionDocument = ref<Document | null>(null)
const showPreviewModal = ref(false)
const selectedPreviewDocument = ref<Document | null>(null)

// Actualizar URLs firmadas
async function updateSignedUrls() {
  const newUrls: DocumentUrlMap = {}
  for (const doc of props.documents) {
    try {
      const url = await getSignedFileUrl(doc.file_path)
      newUrls[doc.id] = url
    } catch (error) {
      console.error(`Error updating URL for document ${doc.id}:`, error)
      newUrls[doc.id] = ''
    }
  }
  documentUrls.value = newUrls
}

// Actualizar URLs cada 45 minutos
onMounted(async () => {
  await updateSignedUrls()
  intervalRef.value = setInterval(updateSignedUrls, 45 * 60 * 1000)
  const { data } = await client.from('categories').select('id, name')
  if (data) {
    categories.value = data.reduce((acc, cat) => ({
      ...acc,
      [cat.id]: cat
    }), {})
  }
})

// Limpiar el intervalo cuando el componente se desmonta
onUnmounted(() => {
  if (intervalRef.value) {
    clearInterval(intervalRef.value)
  }
})

// Actualizar URLs cuando cambien los documentos
watch(() => props.documents, updateSignedUrls)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function getCategoryName(categoryId: string) {
  return categories.value[categoryId]?.name || 'Sin categoría'
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '0 Bytes'
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getStatusClass(doc: Document) {
  const daysUntilDeadline = getDaysUntilDeadline(doc.deadline)
  if (daysUntilDeadline < 0) return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'
  if (daysUntilDeadline <= 7) return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'
  return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'
}

function getStatusText(doc: Document) {
  const daysUntilDeadline = getDaysUntilDeadline(doc.deadline)
  if (daysUntilDeadline < 0) return 'Vencido'
  if (daysUntilDeadline <= 7) return 'Próximo a vencer'
  return 'Vigente'
}

function getDaysUntilDeadline(deadline: string) {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

async function handleDelete(id: string) {
  if (!confirm('¿Está seguro de eliminar este documento?')) return

  try {
    // 1. Eliminar el archivo de B2
    const document = props.documents.find(doc => doc.id === id)
    if (document) {
      await $fetch('/api/documents/delete-file', {
        method: 'POST',
        body: { filePath: document.file_path }
      })
    }

    // 2. Eliminar el registro de la base de datos
    const { error } = await client
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) throw error

    // 3. Emitir evento de eliminación
    emit('delete', id)

    // 4. Mostrar notificación
    toast.add({
      title: 'Documento eliminado',
      description: 'El documento se ha eliminado correctamente',
      icon: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      icon: 'error'
    })
  }
}

function handleEdit(doc: Document) {
  selectedDocument.value = doc
  showEditModal.value = true
}

function handleVersions(doc: Document) {
  selectedVersionDocument.value = doc
  showVersionsModal.value = true
}

function handlePreview(doc: Document) {
  if (hasValidUrl(doc.id)) {
    selectedPreviewDocument.value = doc
    showPreviewModal.value = true
  }
}

function getDocumentUrl(id: string): string {
  return documentUrls.value[id] ?? '#'
}

function hasValidUrl(id: string): boolean {
  return !!documentUrls.value[id]
}
</script>