import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  // Verificar autenticación
  const user = event.context.user
  if (!user) {
    // Devolver estadísticas vacías si no hay usuario
    return {
      totalDocuments: 0,
      pendingDocuments: 0,
      archivedDocuments: 0
    }
  }

  console.log('Creating Supabase client...')
  const client = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  try {
    console.log('Getting total documents count...')
    // Obtener total de documentos
    const { count: totalCount, error: totalError } = await client
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (totalError) {
      console.error('Error getting total count:', totalError)
      throw totalError
    }

    console.log('Getting pending documents count...')
    // Obtener documentos pendientes (próximos a vencer en 7 días)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const { count: pendingCount, error: pendingError } = await client
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lte('deadline', sevenDaysFromNow.toISOString())
      .gt('deadline', new Date().toISOString())
      .eq('is_archived', false)

    if (pendingError) {
      console.error('Error getting pending count:', pendingError)
      throw pendingError
    }

    console.log('Getting archived documents count...')
    // Obtener documentos archivados
    const { count: archivedCount, error: archivedError } = await client
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_archived', true)

    if (archivedError) {
      console.error('Error getting archived count:', archivedError)
      throw archivedError
    }

    // Verificar que los valores no sean null
    const stats = {
      totalDocuments: totalCount ?? 0,
      pendingDocuments: pendingCount ?? 0,
      archivedDocuments: archivedCount ?? 0
    }

    console.log('Final stats:', stats)
    return stats

  } catch (error: any) {
    console.error('Error in /api/documents/stats:', error)
    
    // Mejorar el mensaje de error
    const errorMessage = error.message || 'Error al obtener estadísticas'
    const details = error.details || error.hint || ''
    const stack = error.stack || ''
    
    console.error('Full error details:', {
      message: errorMessage,
      details,
      stack,
      error
    })
    
    throw createError({
      statusCode: 500,
      message: `${errorMessage}${details ? ` - ${details}` : ''}`,
      cause: error,
      stack: error.stack
    })
  }
}) 