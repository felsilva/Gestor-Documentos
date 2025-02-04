import type { Database } from '~/types/supabase'
import { serverSupabaseClient } from '#supabase/server'
import { scheduleDocumentNotifications } from '~/server/utils/notifications'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const client = await serverSupabaseClient<Database>(event)

    // 1. Crear el documento
    const { data: document, error } = await client
      .from('documents')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    // 2. Programar notificaciones
    if (document) {
      await scheduleDocumentNotifications(event, document)
    }

    return document
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
}) 