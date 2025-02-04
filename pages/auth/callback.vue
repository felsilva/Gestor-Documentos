<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-gray-600">Verificando...</p>
  </div>
</template>

<script setup lang="ts">
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
const client = useSupabaseClient()

// Manejar el callback de autenticación
client.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
  if (event === 'SIGNED_IN') {
    navigateTo('/')
  }
})
</script> 