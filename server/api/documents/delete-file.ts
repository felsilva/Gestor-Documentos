import { deleteFileFromB2 } from '~/utils/b2'

export default defineEventHandler(async (event) => {
  try {
    const { filePath } = await readBody(event)
    if (!filePath) {
      throw createError({
        statusCode: 400,
        message: 'No se proporcionó la ruta del archivo'
      })
    }

    await deleteFileFromB2(filePath)
    return { success: true }
  } catch (error: any) {
    console.error('Error in delete-file endpoint:', error)
    throw createError({
      statusCode: 500,
      message: 'Error al eliminar el archivo: ' + error.message
    })
  }
}) 