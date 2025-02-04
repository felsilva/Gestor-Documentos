<template>
  <div class="flex flex-wrap gap-1">
    <span
      v-for="tag in tags"
      :key="tag"
      :class="[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        getTagStyle(tag)
      ]"
    >
      {{ tag }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  tags: string[]
}>()

function getTagStyle(tag: string) {
  // Primero intentamos obtener un estilo basado en palabras clave
  const keywordStyles: Record<string, string> = {
    urgente: 'bg-red-100 text-red-800',
    importante: 'bg-yellow-100 text-yellow-800',
    'revisión pendiente': 'bg-orange-100 text-orange-800',
    borrador: 'bg-gray-100 text-gray-800',
    final: 'bg-green-100 text-green-800',
    finanzas: 'bg-blue-100 text-blue-800',
    legal: 'bg-purple-100 text-purple-800',
    rrhh: 'bg-pink-100 text-pink-800',
    marketing: 'bg-indigo-100 text-indigo-800',
    ventas: 'bg-cyan-100 text-cyan-800'
  }

  // Buscar coincidencia en palabras clave (ignorando mayúsculas/minúsculas)
  const lowercaseTag = tag.toLowerCase()
  for (const [keyword, style] of Object.entries(keywordStyles)) {
    if (lowercaseTag.includes(keyword)) {
      return style
    }
  }

  // Si no hay coincidencia, usar un color basado en el hash del string
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-cyan-100 text-cyan-800'
  ]
  
  // Generar un índice basado en el string
  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  // Usar el hash para seleccionar un color
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
</script> 