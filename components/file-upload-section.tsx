"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { FileList } from "@/components/file-list"

export function FileUploadSection() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="mt-6 space-y-6">
      {/* File Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>Securely upload your files to the cloud storage</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onUploadComplete={handleUploadComplete} />
        </CardContent>
      </Card>

      {/* File List Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Files</CardTitle>
          <CardDescription>Manage your uploaded files</CardDescription>
        </CardHeader>
        <CardContent>
          <FileList refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </div>
  )
}
