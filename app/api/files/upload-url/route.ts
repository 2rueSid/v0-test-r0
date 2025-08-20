import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generatePresignedUploadUrl } from "@/lib/file-upload"

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

    const { filename, fileSize, mimeType } = await request.json()

    if (!filename || !fileSize || !mimeType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const uploadData = await generatePresignedUploadUrl({
      filename,
      fileSize,
      mimeType,
      userId: user.id,
    })

    return NextResponse.json(uploadData)
  } catch (error) {
    console.error("Error generating upload URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
