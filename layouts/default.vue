<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-xl font-semibold text-gray-900">
          Gestor de Documentos
        </NuxtLink>
        <div class="flex items-center gap-4">
          <NotificationBell />
          <div class="h-6 w-px bg-gray-200"></div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ user?.email }}</span>
            <button 
              @click="handleLogout" 
              class="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex h-[calc(100vh-64px)]">
      <Sidebar
        v-model:filters="sidebarFilters"
        class="hidden lg:block"
      />
      <main class="flex-1 overflow-y-auto py-6">
        <slot />
      </main>
    </div>

    <ClientOnly>
      <Toast />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import Toast from '~/components/Toast.vue'
import Sidebar from '~/components/Sidebar.vue'
import type { SidebarFilters } from '~/types/sidebar'

const user = useSupabaseUser()
const client = useSupabaseClient()

const sidebarFilters = ref<SidebarFilters>({ tags: [] })

// Propagar los filtros del sidebar a través del provide/inject
provide('sidebarFilters', toRef(sidebarFilters))

async function handleLogout() {
  try {
    const { error } = await client.auth.signOut()
    if (error) throw error
    navigateTo('/auth/login')
  } catch (error: any) {
    alert(error.message)
  }
}
</script>