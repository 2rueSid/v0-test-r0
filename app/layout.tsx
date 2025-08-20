import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { SessionTimeoutWarning } from "@/components/session-timeout-warning"
import { createClient } from "@/lib/supabase/server"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Secure File Platform",
  description: "Upload, manage, and securely store your files",
    generator: 'v0.app'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get initial user session for SSR
  let initialUser = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    initialUser = user
  } catch (error) {
    console.error("Error getting initial user:", error)
  }

  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider initialUser={initialUser}>
          {children}
          <SessionTimeoutWarning />
        </SessionProvider>
      </body>
    </html>
  )
}
