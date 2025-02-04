<template>
  <div class="w-full">
    <label class="block text-sm font-medium text-gray-900">{{ label }}</label>
    <p class="text-xs text-gray-500 mt-1">Seleccione o arrastre el archivo a subir</p>
    <div
      class="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 transition-colors duration-200 ease-in-out"
      :class="{ 
        'border-indigo-500 bg-indigo-50/50': isDragging,
        'hover:border-indigo-400 hover:bg-indigo-50/30': !selectedFile
      }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <div class="text-center">
        <div v-if="!selectedFile" class="flex flex-col items-center">
          <DocumentArrowUpIcon 
            class="mx-auto h-12 w-12 text-gray-400 transition-colors group-hover:text-indigo-500" 
            :class="{ 'text-indigo-500': isDragging }"
          />
          <div class="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 transition-colors"
            >
              <span>Subir un archivo</span>
              <input
                ref="fileInput"
                type="file"
                class="sr-only"
                @change="handleFileSelect"
                :accept="accept"
              />
            </label>
            <p class="pl-1">o arrastrar y soltar</p>
          </div>
          <p class="text-xs leading-5 text-gray-500 mt-2">{{ acceptText }}</p>
        </div>

        <div v-else class="flex flex-col items-center">
          <div class="flex items-center gap-2">
            <DocumentIcon class="h-8 w-8 text-indigo-600 transition-colors" />
            <div class="text-left">
              <p class="text-sm font-medium text-gray-900">
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatFileSize(selectedFile.size) }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="mt-4 text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
            @click="clearFile"
          >
            Eliminar archivo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentArrowUpIcon, DocumentIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  label?: string
  accept?: string
  acceptText?: string
  modelValue: File | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const selectedFile = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (!event.dataTransfer?.files.length) return
  
  selectedFile.value = event.dataTransfer.files[0]
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script> 