import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function processNaturalLanguageQuery(query: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un asistente que ayuda a convertir consultas en lenguaje natural a criterios de búsqueda estructurados.
          Debes extraer: palabras clave, categorías, estados (vigente, próximo a vencer, vencido) y rangos de fechas.
          Responde en formato JSON con la siguiente estructura:
          {
            "keywords": ["palabra1", "palabra2"],
            "category": "nombre_categoria",
            "status": "vigente|proximo|vencido",
            "dateRange": "today|week|month|year"
          }`
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    // Verificar que el contenido existe y es válido
    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('La respuesta de OpenAI está vacía')
    }

    // Logging de la respuesta
    console.log('OpenAI Response:', {
      query,
      rawResponse: completion,
      parsedContent: JSON.parse(content)
    })

    return JSON.parse(content)
  } catch (error) {
    console.error('Error processing query:', {
      error,
      query,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}

// Definir la estructura esperada de la respuesta
export interface AISearchResponse {
  keywords?: string[]
  category?: string
  status?: 'active' | 'expiring' | 'expired'
  dateRange?: 'today' | 'week' | 'month' | 'year'
} 