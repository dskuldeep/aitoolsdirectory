import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || '',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || '',
  },
  forcePathStyle: true, // For S3-compatible services like MinIO, Supabase
})

const BUCKET = process.env.STORAGE_BUCKET || ''

export interface UploadOptions {
  folder?: string
  contentType?: string
  public?: boolean
}

export async function uploadFile(
  file: Buffer | Uint8Array,
  filename: string,
  options: UploadOptions = {}
): Promise<string> {
  const { folder = 'uploads', contentType = 'application/octet-stream', public: isPublic = true } = options

  const key = folder ? `${folder}/${filename}` : filename

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: isPublic ? 'public-read' : 'private',
  })

  await s3Client.send(command)

  // Return public URL
  if (isPublic && process.env.STORAGE_ENDPOINT) {
    const endpoint = process.env.STORAGE_ENDPOINT.replace(/\/$/, '')
    return `${endpoint}/${BUCKET}/${key}`
  }

  // For private files, return the key
  return key
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  await s3Client.send(command)
}

export async function getSignedFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export async function uploadImage(
  file: File | Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<string> {
  const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
  const contentType = file instanceof File ? file.type : options.contentType || 'image/jpeg'

  return uploadFile(buffer, filename, {
    ...options,
    folder: options.folder || 'images',
    contentType,
  })
}

