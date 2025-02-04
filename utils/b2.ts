import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const getS3Config = () => ({
  credentials: {
    accessKeyId: process.env.B2_KEY_ID as string,
    secretAccessKey: process.env.B2_APPLICATION_KEY as string,
  },
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  region: 'us-east-005',
  forcePathStyle: true,
})

export const s3Client = new S3Client(getS3Config())

interface UploadResponse {
  url: string
  key: string
}

export async function uploadFileToB2(file: File, fileName: string) {
  try {
    console.log('Starting file upload...', { 
      fileName,
      fileSize: file.size,
      fileType: file.type
    })

    // Crear FormData para enviar el archivo
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', fileName)
    formData.append('type', file.type)

    const response = await $fetch<UploadResponse>('/api/upload', {
      method: 'POST',
      body: formData
    })

    return response
  } catch (error) {
    console.error('Error uploading file:', {
      error,
      fileName,
      fileSize: file.size,
      fileType: file.type
    })
    throw error
  }
}

// Función para obtener una nueva URL firmada
export async function getSignedFileUrl(key: string) {
  try {
    const response = await $fetch<{ url: string }>('/api/getSignedUrl', {
      params: { key }
    })
    return response.url
  } catch (error) {
    console.error('Error getting signed URL:', error)
    throw error
  }
}

export async function deleteFileFromB2(filePath: string) {
  try {
    // Usar el cliente S3 con la configuración correcta
    const client = new S3Client(getS3Config())
    
    await client.send(new DeleteObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME as string,
      Key: filePath
    }))
  } catch (error: any) {
    console.error('Error deleting file from B2:', error)
    throw new Error('Error al eliminar el archivo')
  }
} 