import { processNaturalLanguageQuery, type AISearchResponse } from '~/utils/openai'

export default defineEventHandler(async (event) => {
  try {
    const { query } = await readBody(event)
    if (!query) {
      throw createError({
        statusCode: 400,
        message: 'No se proporcionó una consulta'
      })
    }

    const searchCriteria: AISearchResponse = await processNaturalLanguageQuery(query)
    
    // Logging de los criterios de búsqueda procesados
    console.log('Search Criteria:', {
      query,
      criteria: searchCriteria,
      timestamp: new Date().toISOString()
    })

    return searchCriteria
  } catch (error: any) {
    console.error('Search Processing Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    throw createError({
      statusCode: 500,
      message: 'Error al procesar la búsqueda: ' + error.message
    })
  }
}) 