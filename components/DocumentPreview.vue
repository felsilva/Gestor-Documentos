<template>
  <Modal size="xl" @close="$emit('close')">
    <template #title>
      Vista previa: {{ document.title }}
    </template>
    <template #content>
      <div class="h-[80vh] bg-gray-100 rounded-lg overflow-hidden">
        <!-- PDF Preview -->
        <div v-if="isPDF" class="h-full">
          <iframe
            :src="documentUrl"
            class="w-full h-full"
            type="application/pdf"
          />
        </div>

        <!-- Image Preview -->
        <div v-else-if="isImage" class="h-full flex items-center justify-center">
          <img
            :src="documentUrl"
            :alt="document.title"
            class="max-h-full max-w-full object-contain"
          />
        </div>

        <!-- Office Documents Preview -->
        <div v-else-if="isOffice" class="h-full">
          <iframe
            :src="`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`"
            class="w-full h-full"
          />
        </div>

        <!-- Unsupported Format -->
        <div v-else class="h-full flex items-center justify-center">
          <div class="text-center">
            <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">
              Vista previa no disponible
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Este tipo de archivo no soporta vista previa
            </p>
            <div class="mt-6">
              <a
                :href="documentUrl"
                target="_blank"
                class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Descargar archivo
                <ArrowDownTrayIcon class="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { DocumentIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import type { Document } from '~/types'
import Modal from './Modal.vue'

const props = defineProps<{
  document: Document
  documentUrl: string
}>()

defineEmits<{
  close: []
}>()

const isPDF = computed(() => {
  return props.document.metadata?.fileType === 'application/pdf'
})

const isImage = computed(() => {
  return props.document.metadata?.fileType?.startsWith('image/')
})

const isOffice = computed(() => {
  const officeTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
  return officeTypes.includes(props.document.metadata?.fileType)
})
</script> 