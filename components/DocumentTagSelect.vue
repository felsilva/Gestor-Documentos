<template>
  <div class="space-y-2">
    <div class="flex flex-wrap gap-2">
      <span
        v-for="tag in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 px-2 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md"
      >
        {{ tag }}
        <button
          type="button"
          @click="removeTag(tag)"
          class="text-indigo-500 hover:text-indigo-600"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </span>
    </div>
    <div class="relative">
      <input
        v-model="newTag"
        @keydown.enter.prevent="addTag"
        type="text"
        placeholder="Agregar etiqueta..."
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
      <button
        v-if="newTag"
        type="button"
        @click="addTag"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
      >
        <PlusIcon class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon, PlusIcon } from '@heroicons/vue/20/solid'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const newTag = ref('')

function addTag() {
  if (!newTag.value.trim()) return
  
  const updatedTags = [...new Set([...props.modelValue, newTag.value.trim()])]
  emit('update:modelValue', updatedTags)
  newTag.value = ''
}

function removeTag(tagToRemove: string) {
  const updatedTags = props.modelValue.filter(tag => tag !== tagToRemove)
  emit('update:modelValue', updatedTags)
}
</script> 