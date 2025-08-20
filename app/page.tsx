import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-gray-900">Secure File Platform</h1>
        <p className="text-lg text-gray-600">
          Upload, manage, and share your files securely with JWT-based authentication
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
