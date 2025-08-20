import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { saveFileToDatabase } from "@/lib/file-upload"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename, originalFilename, fileSize, mimeType, s3Key } = await request.json()

    if (!filename || !originalFilename || !fileSize || !mimeType || !s3Key) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const fileRecord = await saveFileToDatabase({
      userId: user.id,
      filename,
      originalFilename,
      fileSize,
      mimeType,
      s3Key,
    })

    return NextResponse.json({ file: fileRecord })
  } catch (error) {
    console.error("Error completing upload:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
