"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function SessionTimeoutWarning() {
  const { sessionTimeRemaining, refreshUserSession, isAuthenticated } = useSession()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    if (!isAuthenticated || !sessionTimeRemaining) {
      setShowWarning(false)
      return
    }

    // Show warning if less than 5 minutes remaining
    const fiveMinutes = 5 * 60 * 1000
    const shouldShow = sessionTimeRemaining <= fiveMinutes && sessionTimeRemaining > 0

    setShowWarning(shouldShow)

    if (shouldShow) {
      const minutes = Math.floor(sessionTimeRemaining / (60 * 1000))
      const seconds = Math.floor((sessionTimeRemaining % (60 * 1000)) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    }
  }, [sessionTimeRemaining, isAuthenticated])

  const handleExtendSession = async () => {
    await refreshUserSession()
    setShowWarning(false)
  }

  if (!showWarning) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-800">Session Expiring</CardTitle>
          </div>
          <CardDescription className="text-orange-700">Your session will expire in {timeLeft}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleExtendSession} className="bg-orange-600 hover:bg-orange-700">
              Extend Session
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowWarning(false)}>
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
