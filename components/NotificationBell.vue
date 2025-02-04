<template>
  <div class="relative">
    <!-- Botón de notificaciones -->
    <button
      type="button"
      class="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors"
      @click="isOpen = !isOpen"
    >
      <span class="sr-only">Ver notificaciones</span>
      <BellIcon class="h-6 w-6" />
      
      <!-- Indicador de notificaciones no leídas -->
      <div
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium text-white bg-red-500 rounded-full"
      >
        {{ unreadCount }}
      </div>
    </button>

    <!-- Panel de notificaciones -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
    >
      <div class="py-1" role="menu">
        <div class="px-4 py-2 text-sm text-gray-700 border-b">
          <div class="flex justify-between items-center">
            <h3 class="font-medium">Notificaciones</h3>
            <button
              v-if="hasUnread"
              @click="markAllAsRead"
              class="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Marcar todas como leídas
            </button>
          </div>
        </div>

        <!-- Lista de notificaciones -->
        <div class="max-h-96 overflow-y-auto">
          <template v-if="notifications.length">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="px-4 py-2 hover:bg-gray-100"
              :class="{ 'bg-indigo-50': !notification.read }"
            >
              <div class="flex items-start gap-x-3">
                <div class="flex-1">
                  <p class="text-sm text-gray-900">{{ notification.message }}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ formatDate(notification.created_at) }}
                  </p>
                </div>
                <button
                  v-if="!notification.read"
                  @click="markAsRead(notification.id)"
                  class="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Marcar como leída
                </button>
              </div>
            </div>
          </template>
          <div v-else class="px-4 py-2 text-sm text-gray-500">
            No hay notificaciones
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BellIcon } from '@heroicons/vue/24/outline'
import type { Database } from '~/types/supabase'

type Notification = Database['public']['Tables']['notifications']['Row']

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()

const isOpen = ref(false)
const notifications = ref<Notification[]>([])

// Computed properties
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)
const hasUnread = computed(() => unreadCount.value > 0)

// Cargar notificaciones al montar el componente
onMounted(async () => {
  await loadNotifications()
  // Suscribirse a nuevas notificaciones
  subscribeToNotifications()
})

async function loadNotifications() {
  if (!user.value) return

  const { data } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (data) {
    notifications.value = data
  }
}

function subscribeToNotifications() {
  if (!user.value) return

  client
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.value.id}`
      },
      () => {
        loadNotifications()
      }
    )
    .subscribe()
}

async function markAsRead(id: string) {
  const { error } = await client
    .from('notifications')
    .update({ read: true })
    .eq('id', id)

  if (!error) {
    await loadNotifications()
  }
}

async function markAllAsRead() {
  if (!user.value) return

  const { error } = await client
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.value.id)
    .eq('read', false)

  if (!error) {
    await loadNotifications()
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 