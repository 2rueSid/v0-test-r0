import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { deleteUserFile, generatePresignedDownloadUrl } from "@/lib/file-upload"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await deleteUserFile(fileId, user.id)
    return NextResponse.json({ message: "File deleted successfully" })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get file info from database
    const { data: file, error } = await supabase
      .from("files")
      .select("s3_key, original_filename")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const downloadUrl = await generatePresignedDownloadUrl(file.s3_key)
    return NextResponse.json({ downloadUrl, filename: file.original_filename })
  } catch (error) {
    console.error("Error generating download URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
