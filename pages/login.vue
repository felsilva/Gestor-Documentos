<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="sr-only">Correo electrónico</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="input-field"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Contraseña</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="input-field"
              placeholder="Contraseña"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <NuxtLink to="/forgot-password" class="text-primary-600 hover:text-primary-500">
              ¿Olvidaste tu contraseña?
            </NuxtLink>
          </div>
        </div>

        <div>
          <button type="submit" class="btn-primary w-full">
            Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = () => {
  // TODO: Implement proper authentication logic
  router.push('/dashboard')
}
</script>