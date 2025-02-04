<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Recuperar Contraseña
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ingresa tu correo electrónico y te enviaremos las instrucciones
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
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
          <button type="submit" class="btn-primary w-full">
            Enviar instrucciones
          </button>
        </div>
        <div class="text-center">
          <NuxtLink to="/login" class="text-primary-600 hover:text-primary-500">
            Volver al inicio de sesión
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const email = ref('')

const handleResetPassword = () => {
  // TODO: Implement password reset logic
  alert('Se han enviado las instrucciones a tu correo electrónico')
  navigateTo('/login')
}
</script>