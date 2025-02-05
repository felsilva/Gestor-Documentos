import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Obtener el token de la cookie de sesión
  const cookie = getCookie(event, 'sb-access-token')
  if (!cookie) {
    return // No hay token, continuar sin usuario
  }

  try {
    // Crear cliente de Supabase con tipos correctos
    const supabase = createClient<Database>(
      config.public.supabaseUrl as string,
      config.public.supabaseKey as string
    )

    // Obtener la sesión actual
    const { data: { user }, error } = await supabase.auth.getUser(cookie)

    if (error || !user) {
      console.error('Error getting user:', error)
      return
    }

    // Guardar el usuario en el contexto
    event.context.user = user
  } catch (error) {
    console.error('Auth middleware error:', error)
  }
}) 