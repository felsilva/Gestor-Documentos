import B2 from 'backblaze-b2'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Tipos según la documentación de B2
interface B2AuthorizeResponse {
  absoluteMinimumPartSize: number
  accountId: string
  allowed: {
    bucketId: string
    bucketName: string
    capabilities: string[]
    namePrefix: string
  }
  apiUrl: string
  authorizationToken: string
  downloadUrl: string
  recommendedPartSize: number
}

// Configuración de B2
const b2Client = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!
})

// Configuración de S3
const getS3Config = () => ({
  credentials: {
    accessKeyId: process.env.B2_KEY_ID as string,
    secretAccessKey: process.env.B2_APPLICATION_KEY as string,
  },
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  region: 'us-east-005',
  forcePathStyle: true,
})

// Cliente S3 para operaciones específicas
const s3Client = new S3Client(getS3Config())

export async function uploadFileToB2(file: File, fileName: string) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', fileName)
    formData.append('type', file.type)

    const response = await $fetch<{ url: string; key: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })

    return response
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export async function uploadFile(fileName: string, data: Buffer) {
  const authResponse = await b2Client.authorize()
  const response = await b2Client.getUploadUrl({
    bucketId: process.env.B2_BUCKET_ID!
  })

  return b2Client.uploadFile({
    uploadUrl: response.data.uploadUrl,
    uploadAuthToken: response.data.authorizationToken,
    fileName,
    data
  })
}

export async function getSignedFileUrl(fileName: string) {
  const authResponse = await b2Client.authorize() as unknown as { data: B2AuthorizeResponse }
  const downloadUrl = `${authResponse.data.downloadUrl}/file/${process.env.B2_BUCKET_NAME}/${fileName}`
  return downloadUrl
}

export async function deleteFileFromB2(filePath: string) {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME as string,
      Key: filePath
    }))
  } catch (error: any) {
    console.error('Error deleting file from B2:', error)
    throw new Error('Error al eliminar el archivo')
  }
} 