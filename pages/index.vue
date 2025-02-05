<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-semibold text-gray-900">
          Documentos
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Gestione sus documentos y fechas límite
        </p>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <NuxtLink
          to="/upload"
          class="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          <PlusIcon class="h-5 w-5" />
          Subir documento
        </NuxtLink>
      </div>
    </div>

    <div class="mt-6">
      <StatsSummary :stats="stats" />
    </div>

    <div class="mt-6">
      <DocumentFilters
        v-model:filters="filters"
        class="mt-6"
      />
    </div>

    <div class="mt-8">
      <DocumentTable 
        :documents="filteredDocuments" 
        @delete="handleDeleteDocument"
        @update="handleUpdateDocument"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase'
import type { Document } from '~/types'
import type { SidebarFilters } from '~/types/sidebar'
import { PlusIcon } from '@heroicons/vue/20/solid'
import { inject } from 'vue'

const client = useSupabaseClient<Database>()
const documents = ref<Document[]>([])
const stats = ref({
  totalDocuments: 0,
  activeAlerts: 0
})

interface Filters {
  search: string
  category: string
  status: string
  date: string
}

const filters = ref<Filters>({
  search: '',
  category: '',
  status: '',
  date: ''
})

const sidebarFilters = inject<Ref<SidebarFilters>>('sidebarFilters', ref({ tags: [] }))

// Filtrar documentos
const filteredDocuments = computed(() => {
  return documents.value.filter((doc: Document) => {
    // Filtro de búsqueda
    if (filters.value.search && !doc.title.toLowerCase().includes(filters.value.search.toLowerCase())) {
      return false
    }

    // Filtro de categoría
    if (filters.value.category && doc.category !== filters.value.category) {
      return false
    }

    // Filtro de estado
    const daysUntilDeadline = getDaysUntilDeadline(doc.deadline)
    if (filters.value.status) {
      switch (filters.value.status) {
        case 'active':
          if (daysUntilDeadline <= 7) return false
          break
        case 'expiring':
          if (daysUntilDeadline > 7 || daysUntilDeadline < 0) return false
          break
        case 'expired':
          if (daysUntilDeadline >= 0) return false
          break
      }
    }

    // Filtro de fecha
    if (filters.value.date) {
      const uploadDate = new Date(doc.upload_date)
      const today = new Date()
      switch (filters.value.date) {
        case 'today':
          if (uploadDate.toDateString() !== today.toDateString()) return false
          break
        case 'week':
          const weekAgo = new Date(today.setDate(today.getDate() - 7))
          if (uploadDate < weekAgo) return false
          break
        case 'month':
          if (uploadDate.getMonth() !== today.getMonth() || 
              uploadDate.getFullYear() !== today.getFullYear()) return false
          break
        case 'year':
          if (uploadDate.getFullYear() !== today.getFullYear()) return false
          break
      }
    }

    // Filtros del sidebar
    if (sidebarFilters?.value?.folder && doc.folder_id !== sidebarFilters.value.folder) {
      return false
    }

    if (sidebarFilters?.value?.tags?.length) {
      const documentTags = doc.tags || []
      if (!sidebarFilters.value.tags.some(tag => documentTags.includes(tag))) {
        return false
      }
    }

    if (sidebarFilters?.value?.quickFilter) {
      switch (sidebarFilters.value.quickFilter) {
        case 'recent':
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          return new Date(doc.upload_date) > oneWeekAgo
        case 'important':
          return doc.is_important || false
        case 'expiring':
          return daysUntilDeadline > 0 && daysUntilDeadline <= 7
        case 'archived':
          return doc.is_archived || false
        default:
          return true
      }
    }

    return true
  })
})

// Cargar documentos
async function loadDocuments() {
  try {
    const { data, error } = await client
      .from('documents')
      .select('*')
      .order('upload_date', { ascending: false })

    if (error) throw error
    documents.value = data as Document[]

    // Actualizar estadísticas
    stats.value.totalDocuments = data.length
    stats.value.activeAlerts = data.filter(doc => {
      const daysUntilDeadline = getDaysUntilDeadline(doc.deadline)
      return daysUntilDeadline <= 7
    }).length
  } catch (error: any) {
    alert(error.message)
  }
}

// Eliminar documento
async function handleDeleteDocument(id: string) {
  try {
    const { error } = await client
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) throw error
    await loadDocuments()
  } catch (error: any) {
    alert(error.message)
  }
}

function getDaysUntilDeadline(deadline: string) {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Cargar documentos al montar el componente
onMounted(() => {
  loadDocuments()
})

async function handleUpdateDocument(updatedDoc: Document) {
  const index = documents.value.findIndex(doc => doc.id === updatedDoc.id)
  if (index !== -1) {
    documents.value[index] = updatedDoc
  }
}
</script>