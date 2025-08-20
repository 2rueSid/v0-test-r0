"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { refreshSession, isSessionExpiringSoon } from "@/lib/session-manager"
import type { User } from "@supabase/supabase-js"

interface SessionContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  sessionTimeRemaining: number | null
  refreshUserSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}

interface SessionProviderProps {
  children: ReactNode
  initialUser?: User | null
}

export function SessionProvider({ children, initialUser = null }: SessionProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(!initialUser)
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null)

  const supabase = createClient()

  const refreshUserSession = async () => {
    try {
      const success = await refreshSession()
      if (success) {
        const {
          data: { user: refreshedUser },
        } = await supabase.auth.getUser()
        setUser(refreshedUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user session:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setIsLoading(false)
      } catch (error) {
        console.error("Error getting initial session:", error)
        setUser(null)
        setIsLoading(false)
      }
    }

    if (!initialUser) {
      getInitialSession()
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Update last activity in database when user signs in
      if (event === "SIGNED_IN" && session?.user) {
        try {
          await supabase.from("users").update({ last_signed_in: new Date().toISOString() }).eq("id", session.user.id)
        } catch (error) {
          console.error("Error updating last sign in:", error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, initialUser])

  useEffect(() => {
    if (!user) return

    // Set up session monitoring
    const monitorSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.expires_at) {
          const expiryTime = new Date(session.expires_at * 1000)
          const now = new Date()
          const timeRemaining = Math.max(0, expiryTime.getTime() - now.getTime())
          setSessionTimeRemaining(timeRemaining)

          // Auto-refresh if session is expiring soon
          if (await isSessionExpiringSoon(5)) {
            await refreshUserSession()
          }
        }
      } catch (error) {
        console.error("Error monitoring session:", error)
      }
    }

    // Monitor session every minute
    const interval = setInterval(monitorSession, 60000)

    // Initial check
    monitorSession()

    return () => clearInterval(interval)
  }, [user, supabase])

  const value: SessionContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    sessionTimeRemaining,
    refreshUserSession,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
