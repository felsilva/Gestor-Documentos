<template>
  <Modal @close="$emit('close')">
    <template #title>
      Editar Documento
    </template>
    <template #content>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Título</label>
          <input
            v-model="form.title"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            v-model="form.category"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Fecha límite</label>
          <input
            v-model="form.deadline"
            type="date"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Etiquetas</label>
          <DocumentTagSelect v-model="form.tags" />
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            :disabled="loading"
          >
            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import type { Document } from '~/types'
import type { Database } from '~/types/supabase'
import Modal from '~/components/Modal.vue'
import DocumentTagSelect from './DocumentTagSelect.vue'

interface Category {
  id: string
  name: string
}

const props = defineProps<{
  document: Document
}>()

const emit = defineEmits<{
  close: []
  updated: [document: Document]
}>()

const client = useSupabaseClient<Database>()
const toast = useToast()
const loading = ref(false)
const categories = ref<Category[]>([])

const form = ref({
  title: props.document.title,
  category: props.document.category,
  deadline: props.document.deadline,
  description: props.document.description || '',
  tags: props.document.tags
})

// Cargar categorías
onMounted(async () => {
  const { data } = await client.from('categories').select('*')
  if (data) {
    categories.value = data
  }
})

async function handleSubmit() {
  loading.value = true
  try {
    const { data, error } = await client
      .from('documents')
      .update({
        title: form.value.title,
        category: form.value.category,
        deadline: form.value.deadline,
        description: form.value.description,
        tags: form.value.tags
      })
      .eq('id', props.document.id)
      .select()
      .single()

    if (error) throw error

    toast.add({
      title: 'Documento actualizado',
      description: 'Los cambios se han guardado correctamente',
      icon: 'success'
    })

    emit('updated', data as Document)
    emit('close')
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
</script> 