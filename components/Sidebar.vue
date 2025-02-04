<template>
  <div class="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
    <div class="h-full flex flex-col">
      <!-- Sección de carpetas -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-medium text-gray-900">Carpetas</h2>
          <button
            @click="showNewFolderModal = true"
            class="text-sm text-indigo-600 hover:text-indigo-900"
          >
            <PlusIcon class="h-4 w-4" />
          </button>
        </div>
        <nav class="space-y-1">
          <a
            v-for="folder in folders"
            :key="folder.id"
            :class="[
              activeFolder === folder.id
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            ]"
            @click="selectFolder(folder.id)"
          >
            <FolderIcon class="mr-3 h-5 w-5 flex-shrink-0" />
            {{ folder.name }}
            <span
              v-if="folder.count"
              :class="[
                activeFolder === folder.id ? 'bg-indigo-100' : 'bg-gray-100',
                'ml-auto inline-block py-0.5 px-2 text-xs rounded-full'
              ]"
            >
              {{ folder.count }}
            </span>
          </a>
        </nav>
      </div>

      <!-- Sección de etiquetas -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-medium text-gray-900">Etiquetas</h2>
          <button
            @click="showNewTagModal = true"
            class="text-sm text-indigo-600 hover:text-indigo-900"
          >
            <PlusIcon class="h-4 w-4" />
          </button>
        </div>
        <div class="space-y-2">
          <button
            v-for="tag in tags"
            :key="tag.id"
            :class="[
              selectedTags.includes(tag.id)
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50',
              'group flex items-center w-full px-2 py-1 text-sm font-medium rounded-md'
            ]"
            @click="toggleTag(tag.id)"
          >
            <div 
              class="mr-3 h-4 w-4 rounded-full flex-shrink-0"
              :class="getTagColorClass(tag.color)"
            />
            {{ tag.name }}
            <span
              v-if="tag.count"
              :class="[
                selectedTags.includes(tag.id) ? 'bg-indigo-100' : 'bg-gray-100',
                'ml-auto inline-block py-0.5 px-2 text-xs rounded-full'
              ]"
            >
              {{ tag.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- Filtros rápidos -->
      <div class="p-4">
        <h2 class="text-sm font-medium text-gray-900 mb-2">Filtros rápidos</h2>
        <div class="space-y-1">
          <button
            v-for="filter in quickFilters"
            :key="filter.id"
            :class="[
              activeFilter === filter.id
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50',
              'group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md'
            ]"
            @click="selectQuickFilter(filter.id)"
          >
            <component :is="filter.icon" class="mr-3 h-5 w-5 flex-shrink-0" />
            {{ filter.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para nueva carpeta -->
    <Modal v-if="showNewFolderModal" @close="showNewFolderModal = false">
      <template #title>Nueva carpeta</template>
      <template #content>
        <form @submit.prevent="createFolder" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              v-model="newFolder.name"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div class="flex justify-end gap-x-3">
            <button
              type="button"
              @click="showNewFolderModal = false"
              class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Crear
            </button>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Modal para nueva etiqueta -->
    <Modal v-if="showNewTagModal" @close="showNewTagModal = false">
      <template #title>Nueva etiqueta</template>
      <template #content>
        <form @submit.prevent="createTag" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              v-model="newTag.name"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Color</label>
            <div class="mt-1 flex gap-2">
              <button
                v-for="(_, color) in tagColors"
                :key="color"
                type="button"
                @click="newTag.color = color"
                :class="[
                  'w-8 h-8 rounded-full ring-2 ring-offset-2',
                  newTag.color === color ? 'ring-black' : 'ring-transparent',
                  tagColors[color].bg
                ]"
              />
            </div>
          </div>
          <div class="flex justify-end gap-x-3">
            <button
              type="button"
              @click="showNewTagModal = false"
              class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Crear
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import Modal from '~/components/Modal.vue'
import {
  FolderIcon,
  TagIcon,
  ClockIcon,
  StarIcon,
  ExclamationCircleIcon,
  ArchiveBoxIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import type { Database } from '~/types/supabase'

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toast = useToast()

// Estado
const folders = ref<Array<{ id: string; name: string; count?: number }>>([])
const tags = ref<Array<{ id: string; name: string; color: string; count?: number }>>([])
const activeFolder = ref('')
const selectedTags = ref<string[]>([])
const activeFilter = ref('')
const showNewFolderModal = ref(false)
const showNewTagModal = ref(false)
const newFolder = ref({ name: '' })
const newTag = ref({ name: '', color: 'blue' })

// Filtros rápidos predefinidos
const quickFilters = [
  { id: 'recent', name: 'Recientes', icon: ClockIcon },
  { id: 'important', name: 'Importantes', icon: StarIcon },
  { id: 'expiring', name: 'Próximos a vencer', icon: ExclamationCircleIcon },
  { id: 'archived', name: 'Archivados', icon: ArchiveBoxIcon }
]

// Emits
const emit = defineEmits<{
  'update:filters': [{ folder?: string; tags?: string[]; quickFilter?: string }]
}>()

// Métodos
function selectFolder(folderId: string) {
  activeFolder.value = folderId
  updateFilters()
}

function toggleTag(tagId: string) {
  const index = selectedTags.value.indexOf(tagId)
  if (index === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(index, 1)
  }
  updateFilters()
}

function selectQuickFilter(filterId: string) {
  activeFilter.value = filterId
  updateFilters()
}

function updateFilters() {
  emit('update:filters', {
    folder: activeFolder.value,
    tags: selectedTags.value,
    quickFilter: activeFilter.value
  })
}

// Cargar datos
async function loadFolders() {
  const { data, error } = await client.from('folders').select('*')
  if (error) {
    toast.add({
      title: 'Error',
      description: 'No se pudieron cargar las carpetas',
      icon: 'error'
    })
    return
  }
  folders.value = data
}

async function loadTags() {
  const { data, error } = await client.from('tags').select('*')
  if (error) {
    toast.add({
      title: 'Error',
      description: 'No se pudieron cargar las etiquetas',
      icon: 'error'
    })
    return
  }
  tags.value = data
}

// Crear nueva carpeta
async function createFolder() {
  try {
    const { error } = await client.from('folders').insert({
      name: newFolder.value.name,
      user_id: user.value?.id
    })

    if (error) throw error

    await loadFolders()
    showNewFolderModal.value = false
    newFolder.value.name = ''

    toast.add({
      title: 'Carpeta creada',
      description: 'La carpeta se ha creado correctamente',
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

// Crear nueva etiqueta
async function createTag() {
  try {
    const { error } = await client.from('tags').insert({
      name: newTag.value.name,
      color: newTag.value.color,
      user_id: user.value?.id
    })

    if (error) throw error

    await loadTags()
    showNewTagModal.value = false
    newTag.value = { name: '', color: 'blue' }

    toast.add({
      title: 'Etiqueta creada',
      description: 'La etiqueta se ha creado correctamente',
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

// Cargar datos al montar el componente
onMounted(() => {
  loadFolders()
  loadTags()
})

const tagColors = {
  red: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    hover: 'hover:bg-red-50',
    selected: 'bg-red-50'
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-50',
    selected: 'bg-blue-50'
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-green-600',
    hover: 'hover:bg-green-50',
    selected: 'bg-green-50'
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    hover: 'hover:bg-yellow-50',
    selected: 'bg-yellow-50'
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    hover: 'hover:bg-purple-50',
    selected: 'bg-purple-50'
  }
}

function getTagColorClass(color: string) {
  return tagColors[color as keyof typeof tagColors]?.bg || 'bg-gray-500'
}
</script> 