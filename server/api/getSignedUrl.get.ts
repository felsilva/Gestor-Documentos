import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
  endpoint: 'https://s3.us-east-005.backblazeb2.com',
  region: 'us-east-005',
  forcePathStyle: true,
  })

export default defineEventHandler(async (event) => {
  const { key } = getQuery(event)
  
  try {
    const command = new GetObjectCommand({
      Bucket: 'gestor-documentos',
      Key: key as string,
    })
    
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600
    })

    return { url: signedUrl }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
}) 