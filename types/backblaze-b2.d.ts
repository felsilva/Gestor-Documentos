declare module 'backblaze-b2' {
  export default class B2 {
    constructor(options: {
      applicationKeyId: string
      applicationKey: string
    })

    authorize(): Promise<void>

    getUploadUrl(options: {
      bucketId: string
    }): Promise<{
      data: {
        uploadUrl: string
        authorizationToken: string
      }
    }>

    uploadFile(options: {
      uploadUrl: string
      uploadAuthToken: string
      fileName: string
      data: Buffer | Uint8Array
      contentType?: string
    }): Promise<{
      data: {
        fileId: string
        fileName: string
        contentLength: number
        contentType: string
        contentSha1: string
        fileInfo: Record<string, string>
      }
    }>
  }
} 