"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Upload, File } from "lucide-react"

interface FileUploadProps {
  onUploadComplete: () => void
}

interface UploadingFile {
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
  error?: string
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  const uploadFile = async (file: File) => {
    const fileId = Math.random().toString(36).substring(7)

    setUploadingFiles((prev) => [
      ...prev,
      {
        file,
        progress: 0,
        status: "uploading",
      },
    ])

    try {
      // Get presigned upload URL
      const uploadUrlResponse = await fetch("/api/files/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      })

      if (!uploadUrlResponse.ok) {
        throw new Error("Failed to get upload URL")
      }

      const { uploadUrl, fields, s3Key, uniqueFilename } = await uploadUrlResponse.json()

      // Upload file to S3
      const formData = new FormData()
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
      formData.append("file", file)

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file")
      }

      // Update progress to 90%
      setUploadingFiles((prev) => prev.map((f) => (f.file === file ? { ...f, progress: 90 } : f)))

      // Complete upload by saving to database
      const completeResponse = await fetch("/api/files/complete-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uniqueFilename,
          originalFilename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          s3Key,
        }),
      })

      if (!completeResponse.ok) {
        throw new Error("Failed to complete upload")
      }

      // Update to completed
      setUploadingFiles((prev) => prev.map((f) => (f.file === file ? { ...f, progress: 100, status: "completed" } : f)))

      // Remove from list after 2 seconds
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.file !== file))
        onUploadComplete()
      }, 2000)
    } catch (error) {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f,
        ),
      )
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(uploadFile)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const removeUploadingFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-gray-500">Maximum file size: 100MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium truncate">{uploadingFile.file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeUploadingFile(uploadingFile.file)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {uploadingFile.status === "uploading" && <Progress value={uploadingFile.progress} className="h-2" />}

                {uploadingFile.status === "completed" && (
                  <div className="text-sm text-green-600">Upload completed!</div>
                )}

                {uploadingFile.status === "error" && (
                  <div className="text-sm text-red-600">Error: {uploadingFile.error}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
