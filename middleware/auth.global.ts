export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Permitir acceso a rutas de autenticación
  if (to.path.startsWith('/auth')) {
    return
  }

  // Redirigir a login si no hay usuario
  if (!user.value) {
    return navigateTo('/auth/login')
  }
}) 