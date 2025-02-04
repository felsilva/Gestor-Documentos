<template>
  <div>
    <label class="block text-sm font-medium text-gray-900">Categoría</label>
    <p class="text-xs text-gray-500 mt-1">Seleccione o cree una nueva categoría</p>
    <div class="mt-2 relative">
      <select
        v-model="selectedCategory"
        required
        class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        @change="$emit('update:modelValue', selectedCategory)"
      >
        <option value="">Seleccionar categoría</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
      <button
        v-if="canCreate"
        type="button"
        @click="showCreateForm = true"
        class="absolute inset-y-0 right-0 flex items-center pr-2"
      >
        <PlusIcon class="h-5 w-5 text-gray-400 hover:text-gray-500" />
      </button>
    </div>

    <!-- Modal para crear nueva categoría -->
    <Modal v-if="showCreateForm" @close="showCreateForm = false">
      <template #title>Nueva Categoría</template>
      <template #content>
        <form @submit.prevent="createCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              v-model="newCategory.name"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              v-model="newCategory.description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <div class="flex justify-end gap-x-3">
            <button
              type="button"
              @click="showCreateForm = false"
              class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {{ loading ? 'Creando...' : 'Crear categoría' }}
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { Database } from '~/types/supabase'

defineProps<{
  modelValue: string
  canCreate?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const client = useSupabaseClient<Database>()
const selectedCategory = ref('')
const categories = ref<Database['public']['Tables']['categories']['Row'][]>([])
const showCreateForm = ref(false)
const loading = ref(false)
const newCategory = ref({
  name: '',
  description: ''
})

// Cargar categorías al montar el componente
onMounted(async () => {
  await loadCategories()
})

async function loadCategories() {
  const { data } = await client.from('categories').select('*').order('name')
  if (data) categories.value = data
}

async function createCategory() {
  loading.value = true
  try {
    const { error } = await client
      .from('categories')
      .insert(newCategory.value)

    if (error) throw error

    await loadCategories()
    showCreateForm.value = false
    newCategory.value = { name: '', description: '' }
  } catch (error: any) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script> 