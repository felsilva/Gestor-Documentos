<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Encabezado -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-semibold text-gray-900">
          Subir Documento
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Complete el formulario para subir un nuevo documento al sistema
        </p>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftIcon class="h-5 w-5" />
          Volver
        </NuxtLink>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="mt-6 max-w-3xl mx-auto">
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <DocumentUploadForm @uploaded="handleUploaded" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/20/solid'
import DocumentUploadForm from '~/components/DocumentUploadForm.vue'
import { useToast } from '~/composables/useToast'

const toast = useToast()

function handleUploaded() {
  toast.add({
    title: 'Documento subido',
    description: 'El documento se ha subido correctamente',
    icon: 'success',
    duration: 3000 // 3 segundos
  })
  
  // Pequeño delay antes de la redirección
  setTimeout(() => {
    navigateTo('/')
  }, 500)
}
</script>

<style>
/* Asegurarse de que el formulario no se vea cortado en pantallas pequeñas */
@media (max-width: 640px) {
  .max-w-3xl {
    margin-left: auto;
    margin-right: auto;
  }
}
</style> 