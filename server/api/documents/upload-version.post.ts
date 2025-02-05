import { createClient } from '@supabase/supabase-js'
import { uploadFile } from '~/utils/b2'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { file, documentId, comment } = body

  // Validar el archivo
  if (!file || !documentId) {
    throw createError({
      statusCode: 400,
      message: 'Se requiere un archivo y un ID de documento'
    })
  }

  try {
    // 1. Subir archivo a B2
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `versions/${documentId}/${fileName}`
    
    await uploadFile(filePath, file.data)

    // 2. Crear registro en Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        file_path: filePath,
        comment,
        created_by: event.context.user.id
      })
      .select()
      .single()

    if (versionError) throw versionError

    return {
      success: true,
      version: versionData
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
}) 