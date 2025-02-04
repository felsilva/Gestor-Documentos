<template>
  <div class="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-900">Filtros</h3>
      <button
        v-if="hasFilters"
        @click="clearFilters"
        class="text-sm text-gray-500 hover:text-gray-700"
      >
        Limpiar filtros
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Búsqueda -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Búsqueda</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Buscar por título..."
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <!-- Categoría -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Categoría</label>
        <select
          v-model="filters.category"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Todas</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Estado -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Estado</label>
        <select
          v-model="filters.status"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Todos</option>
          <option value="active">Vigentes</option>
          <option value="expiring">Próximos a vencer</option>
          <option value="expired">Vencidos</option>
        </select>
      </div>

      <!-- Fecha -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Fecha</label>
        <select
          v-model="filters.date"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Todas</option>
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="year">Este año</option>
        </select>
      </div>
    </div>

    <!-- Búsqueda inteligente -->
    <div class="col-span-full">
      <label class="block text-sm font-medium text-gray-700">Búsqueda inteligente</label>
      <div class="mt-1 flex gap-2">
        <div class="relative flex-1">
          <input
            v-model="naturalLanguageQuery"
            type="text"
            placeholder="Ejemplo: 'documentos vencidos de la categoría finanzas del mes pasado'"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10"
            @keyup.enter="processQuery"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <SparklesIcon 
              class="h-5 w-5 text-gray-400"
              :class="{ 'animate-pulse': isProcessing }"
            />
          </div>
        </div>
        <button
          type="button"
          :disabled="isProcessing || !naturalLanguageQuery"
          @click="processQuery"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      <p class="mt-1 text-xs text-gray-500">
        Realice búsquedas usando lenguaje natural
      </p>
    </div>

    <!-- Chips de filtros activos -->
    <div v-if="hasFilters" class="flex flex-wrap gap-2">
      <div
        v-for="(value, key) in activeFilters"
        :key="key"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm"
      >
        <span>{{ formatFilterLabel(key, value) }}</span>
        <button
          type="button"
          @click="removeFilter(key)"
          class="p-0.5 hover:bg-indigo-100 rounded-full"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SparklesIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { Database } from '~/types/supabase'
import type { AISearchResponse } from '~/utils/openai'

interface Filters {
  search: string
  category: string
  status: string
  date: string
}

const client = useSupabaseClient<Database>()
const categories = ref<Database['public']['Tables']['categories']['Row'][]>([])
const filters = ref<Filters>({
  search: '',
  category: '',
  status: '',
  date: ''
})

const emit = defineEmits<{
  'update:filters': [filters: Filters]
}>()

const naturalLanguageQuery = ref('')
const isProcessing = ref(false)
const toast = useToast()

// Cargar categorías
onMounted(async () => {
  const { data } = await client.from('categories').select('*').order('name')
  if (data) categories.value = data
})

// Computar si hay filtros activos
const hasFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '')
})

// Limpiar filtros
function clearFilters() {
  filters.value = {
    search: '',
    category: '',
    status: '',
    date: ''
  }
}

// Emitir cambios en los filtros
watch(filters, (newFilters) => {
  emit('update:filters', newFilters)
}, { deep: true })

async function processQuery() {
  if (!naturalLanguageQuery.value) return

  isProcessing.value = true
  try {
    const response = await $fetch('/api/search/process-query', {
      method: 'POST',
      body: { query: naturalLanguageQuery.value }
    })

    // Actualizar filtros basados en la respuesta de la IA
    filters.value = {
      ...filters.value,
      ...mapAIResponseToFilters(response)
    }

    toast.add({
      title: 'Búsqueda procesada',
      description: 'Los filtros han sido actualizados según tu consulta',
      icon: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: 'No se pudo procesar la búsqueda',
      icon: 'error'
    })
  } finally {
    isProcessing.value = false
  }
}

function mapAIResponseToFilters(aiResponse: AISearchResponse) {
  const mappedFilters: Partial<Filters> = {}

  if (aiResponse.keywords) {
    mappedFilters.search = aiResponse.keywords.join(' ')
  }
  if (aiResponse.category) {
    mappedFilters.category = aiResponse.category
  }
  if (aiResponse.status) {
    mappedFilters.status = aiResponse.status
  }
  if (aiResponse.dateRange) {
    mappedFilters.date = aiResponse.dateRange
  }

  // Logging de la transformación de filtros
  console.log('AI Response Mapping:', {
    aiResponse,
    mappedFilters,
    timestamp: new Date().toISOString()
  })

  return mappedFilters
}

const activeFilters = computed(() => {
  return Object.entries(filters.value)
    .filter(([_, value]) => value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
})

function formatFilterLabel(key: string, value: string) {
  switch (key) {
    case 'search':
      return `Búsqueda: ${value}`
    case 'category':
      return `Categoría: ${categories.value.find(c => c.id === value)?.name || value}`
    case 'status':
      return `Estado: ${formatStatus(value)}`
    case 'date':
      return `Fecha: ${formatDate(value)}`
    default:
      return `${key}: ${value}`
  }
}

function formatStatus(status: string) {
  const statusMap: Record<string, string> = {
    active: 'Vigentes',
    expiring: 'Próximos a vencer',
    expired: 'Vencidos'
  }
  return statusMap[status] || status
}

function formatDate(date: string) {
  const dateMap: Record<string, string> = {
    today: 'Hoy',
    week: 'Esta semana',
    month: 'Este mes',
    year: 'Este año'
  }
  return dateMap[date] || date
}

function removeFilter(key: keyof Filters) {
  filters.value[key] = ''
}
</script> 