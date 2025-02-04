import type { Database } from '~/types/supabase'
import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

type Document = Database['public']['Tables']['documents']['Row']

export async function createNotification(event: H3Event, {
  documentId,
  userId,
  type,
  message,
  scheduledFor
}: {
  documentId: string
  userId: string
  type: 'deadline' | 'renewal' | 'review'
  message: string
  scheduledFor: Date
}) {
  const client = await serverSupabaseClient<Database>(event)

  return await client
    .from('notifications')
    .insert({
      document_id: documentId,
      user_id: userId,
      type,
      message,
      scheduled_for: scheduledFor.toISOString()
    })
}

export async function scheduleDocumentNotifications(event: H3Event, document: Document) {
  const deadlineDate = new Date(document.deadline)
  const today = new Date()
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Notificación 7 días antes
  if (daysUntilDeadline > 7) {
    const sevenDaysBefore = new Date(deadlineDate)
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7)
    
    await createNotification(event, {
      documentId: document.id,
      userId: document.user_id,
      type: 'deadline',
      message: `El documento "${document.title}" vencerá en 7 días`,
      scheduledFor: sevenDaysBefore
    })
  }

  // Notificación 3 días antes
  if (daysUntilDeadline > 3) {
    const threeDaysBefore = new Date(deadlineDate)
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3)
    
    await createNotification(event, {
      documentId: document.id,
      userId: document.user_id,
      type: 'deadline',
      message: `El documento "${document.title}" vencerá en 3 días`,
      scheduledFor: threeDaysBefore
    })
  }

  // Notificación 1 día antes
  if (daysUntilDeadline > 1) {
    const oneDayBefore = new Date(deadlineDate)
    oneDayBefore.setDate(oneDayBefore.getDate() - 1)
    
    await createNotification(event, {
      documentId: document.id,
      userId: document.user_id,
      type: 'deadline',
      message: `El documento "${document.title}" vencerá mañana`,
      scheduledFor: oneDayBefore
    })
  }

  // Notificación el día del vencimiento
  await createNotification(event, {
    documentId: document.id,
    userId: document.user_id,
    type: 'deadline',
    message: `El documento "${document.title}" vence hoy`,
    scheduledFor: deadlineDate
  })
} 