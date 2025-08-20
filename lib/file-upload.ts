import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client, S3_BUCKET_NAME } from "./aws-config"
import { createClient } from "./supabase/server"
import { v4 as uuidv4 } from "uuid"

export interface FileUploadData {
  filename: string
  fileSize: number
  mimeType: string
  userId: string
}

export async function generatePresignedUploadUrl(data: FileUploadData) {
  const fileExtension = data.filename.split(".").pop()
  const uniqueFilename = `${uuidv4()}.${fileExtension}`
  const s3Key = `uploads/${data.userId}/${uniqueFilename}`

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
    Conditions: [
      ["content-length-range", 0, 100 * 1024 * 1024], // Max 100MB
      ["starts-with", "$Content-Type", data.mimeType],
    ],
    Fields: {
      "Content-Type": data.mimeType,
    },
    Expires: 600, // 10 minutes
  })

  return {
    uploadUrl: url,
    fields,
    s3Key,
    uniqueFilename,
  }
}

export async function generatePresignedDownloadUrl(s3Key: string) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
}

export async function deleteFileFromS3(s3Key: string) {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
  })

  await s3Client.send(command)
}

export async function saveFileToDatabase(data: {
  userId: string
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string
  s3Key: string
}) {
  const supabase = await createClient()

  const { data: fileRecord, error } = await supabase
    .from("files")
    .insert({
      user_id: data.userId,
      filename: data.filename,
      original_filename: data.originalFilename,
      file_size: data.fileSize,
      mime_type: data.mimeType,
      s3_key: data.s3Key,
      s3_bucket: S3_BUCKET_NAME,
      upload_status: "completed",
    })
    .select()
    .single()

  if (error) throw error
  return fileRecord
}

export async function getUserFiles(userId: string) {
  const supabase = await createClient()

  const { data: files, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return files
}

export async function deleteUserFile(fileId: string, userId: string) {
  const supabase = await createClient()

  // First get the file to get the S3 key
  const { data: file, error: fetchError } = await supabase
    .from("files")
    .select("s3_key")
    .eq("id", fileId)
    .eq("user_id", userId)
    .single()

  if (fetchError) throw fetchError

  // Delete from S3
  await deleteFileFromS3(file.s3_key)

  // Delete from database
  const { error: deleteError } = await supabase.from("files").delete().eq("id", fileId).eq("user_id", userId)

  if (deleteError) throw deleteError
}
