import type { User } from "@supabase/supabase-js"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserProfileData {
  id: string
  first_name: string
  last_name: string
  email: string
  last_signed_in: string | null
  created_at: string
  updated_at: string
}

interface UserProfileProps {
  user: User
  userProfile: UserProfileData | null
}

export function UserProfile({ user, userProfile }: UserProfileProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U"
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg font-semibold">
            {getInitials(userProfile?.first_name, userProfile?.last_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">
            {userProfile?.first_name && userProfile?.last_name
              ? `${userProfile.first_name} ${userProfile.last_name}`
              : "User"}
          </h3>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{userProfile?.first_name || "Not provided"}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{userProfile?.last_name || "Not provided"}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.email}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Last Signed In</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{formatDate(userProfile?.last_signed_in)}</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="pt-4 border-t">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Account Created</label>
            <p className="text-sm text-gray-900">{formatDate(user.created_at)}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Profile Updated</label>
            <p className="text-sm text-gray-900">{formatDate(userProfile?.updated_at || null)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
