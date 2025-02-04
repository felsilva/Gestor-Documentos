import { ref } from 'vue'

export interface Toast {
  id: string
  title: string
  description?: string
  icon?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useToast = () => {
  // Usar useState de Nuxt para manejar el estado
  const toasts = useState<Toast[]>('toasts', () => [])

  function add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(2)
    const duration = toast.duration || 3000

    toasts.value.push({
      id,
      ...toast
    })

    setTimeout(() => {
      remove(id)
    }, duration)
  }

  function remove(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    add,
    remove
  }
} 