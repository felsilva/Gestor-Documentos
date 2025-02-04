<template>
  <div>
    <label class="block text-sm font-medium text-gray-900">Etiquetas</label>
    <p class="text-xs text-gray-500 mt-1">Agregue etiquetas para clasificar el documento</p>
    <div class="mt-1">
      <div class="flex flex-wrap gap-2 p-2 border rounded-md">
        <!-- Etiquetas existentes -->
        <span
          v-for="tag in modelValue"
          :key="tag"
          class="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm"
        >
          {{ tag }}
          <button
            type="button"
            @click="removeTag(tag)"
            class="text-indigo-600 hover:text-indigo-800"
          >
            ×
          </button>
        </span>

        <!-- Input para nuevas etiquetas -->
        <input
          v-model="newTag"
          type="text"
          placeholder="Agregar etiqueta"
          class="flex-1 min-w-[150px] border-0 p-0 focus:ring-0 text-sm"
          @keydown.enter.prevent="addTag"
          @keydown.tab.prevent="addTag"
          @keydown.comma.prevent="addTag"
        />
      </div>
    </div>
    
    <!-- Sugerencias de etiquetas populares -->
    <div v-if="suggestions.length > 0" class="mt-1 text-sm">
      <span class="text-gray-500">Sugerencias: </span>
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        type="button"
        @click="addSuggestion(suggestion)"
        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 mr-1 mb-1"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  suggestions?: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const newTag = ref('')

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !props.modelValue.includes(tag)) {
    emit('update:modelValue', [...props.modelValue, tag])
    newTag.value = ''
  }
}

function removeTag(tagToRemove: string) {
  emit('update:modelValue', props.modelValue.filter(tag => tag !== tagToRemove))
}

function addSuggestion(suggestion: string) {
  if (!props.modelValue.includes(suggestion)) {
    emit('update:modelValue', [...props.modelValue, suggestion])
  }
}

// Lista de sugerencias filtrada
const suggestions = computed(() => {
  return (props.suggestions || []).filter(
    suggestion => !props.modelValue.includes(suggestion)
  )
})
</script> 