import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-manager"

export async function GET() {
  try {
    const sessionInfo = await getServerSession()

    return NextResponse.json({
      isAuthenticated: sessionInfo.isAuthenticated,
      user: sessionInfo.user
        ? {
            id: sessionInfo.user.id,
            email: sessionInfo.user.email,
            email_confirmed_at: sessionInfo.user.email_confirmed_at,
            created_at: sessionInfo.user.created_at,
          }
        : null,
      sessionExpiry: sessionInfo.sessionExpiry,
      lastActivity: sessionInfo.lastActivity,
    })
  } catch (error) {
    console.error("Error getting session info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
