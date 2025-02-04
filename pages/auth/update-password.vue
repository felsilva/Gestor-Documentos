<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Actualizar contraseña
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handlePasswordUpdate">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="password" class="sr-only">Nueva contraseña</label>
            <input
              v-model="password"
              id="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Nueva contraseña"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="loading"
          >
            {{ loading ? 'Actualizando...' : 'Actualizar contraseña' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const loading = ref(false)
const password = ref('')

definePageMeta({
  layout: 'auth'
})

async function handlePasswordUpdate() {
  try {
    loading.value = true
    const { error } = await client.auth.updateUser({
      password: password.value
    })
    
    if (error) throw error
    
    alert('Contraseña actualizada correctamente')
    navigateTo('/auth/login')
  } catch (error: any) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script> 