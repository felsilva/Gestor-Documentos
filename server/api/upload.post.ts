import B2 from 'backblaze-b2'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!
})

// Mantener el cliente S3 solo para URLs firmadas
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
  endpoint: 'https://s3.us-east-005.backblazeb2.com',
  region: 'us-east-005',
  forcePathStyle: true
})

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData) throw new Error('No form data received')
    
    const file = formData.find(f => f.name === 'file')
    const fileName = formData.find(f => f.name === 'fileName')?.data.toString()
    const type = formData.find(f => f.name === 'type')?.data.toString()

    if (!file || !fileName || !file.data) {
      throw new Error('Missing required fields: file or fileName')
    }

    console.log('Received file upload request:', { 
      fileName, 
      fileSize: file.data.length,
      type
    })

    // Autenticar con B2
    await b2.authorize()

    // Obtener URL y token de upload
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID!
    })

    // Subir el archivo
    const response = await b2.uploadFile({
      uploadUrl: uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: fileName,
      data: file.data,
      contentType: type || 'application/octet-stream'
    })

    console.log('Upload completed successfully')
    
    // Generar URL firmada usando S3
    const command = new GetObjectCommand({
      Bucket: 'gestor-documentos',
      Key: fileName,
    })
    
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600
    })

    return {
      url: signedUrl,
      key: fileName
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    throw createError({
      statusCode: 500,
      message: `Upload failed: ${error.message}`
    })
  }
}) 