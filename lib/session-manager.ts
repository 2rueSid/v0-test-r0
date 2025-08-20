import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export interface SessionInfo {
  user: User | null
  isAuthenticated: boolean
  sessionExpiry: Date | null
  lastActivity: Date | null
}

export async function getServerSession(): Promise<SessionInfo> {
  const supabase = await createClient()

  try {
    const {
      data: { user, session },
      error,
    } = await supabase.auth.getUser()

    if (error || !user || !session) {
      return {
        user: null,
        isAuthenticated: false,
        sessionExpiry: null,
        lastActivity: null,
      }
    }

    return {
      user,
      isAuthenticated: true,
      sessionExpiry: session.expires_at ? new Date(session.expires_at * 1000) : null,
      lastActivity: new Date(),
    }
  } catch (error) {
    console.error("Error getting server session:", error)
    return {
      user: null,
      isAuthenticated: false,
      sessionExpiry: null,
      lastActivity: null,
    }
  }
}

export async function refreshSession() {
  const supabase = createBrowserClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession()

    if (error) {
      console.error("Error refreshing session:", error)
      return false
    }

    return !!session
  } catch (error) {
    console.error("Error refreshing session:", error)
    return false
  }
}

export async function isSessionExpiringSoon(thresholdMinutes = 5): Promise<boolean> {
  const supabase = createBrowserClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.expires_at) return false

    const expiryTime = new Date(session.expires_at * 1000)
    const now = new Date()
    const thresholdTime = new Date(now.getTime() + thresholdMinutes * 60 * 1000)

    return expiryTime <= thresholdTime
  } catch (error) {
    console.error("Error checking session expiry:", error)
    return false
  }
}

export function getSessionTimeRemaining(): number | null {
  try {
    const supabase = createBrowserClient()
    const {
      data: { session },
    } = supabase.auth.getSession()

    if (!session?.expires_at) return null

    const expiryTime = new Date(session.expires_at * 1000)
    const now = new Date()

    return Math.max(0, expiryTime.getTime() - now.getTime())
  } catch (error) {
    console.error("Error getting session time remaining:", error)
    return null
  }
}
