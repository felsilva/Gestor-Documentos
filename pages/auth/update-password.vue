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
              class="block w-full appearance-none rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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