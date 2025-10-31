/**
 * Profile Completion Widget
 * Shows users their profile completion status
 */
"use client"

import { User } from "lucide-react"

interface ProfileCompletionProps {
  name?: string
  bio?: string
  profilePicture?: string
}

export function ProfileCompletion({ name, bio, profilePicture }: ProfileCompletionProps) {
  let completionPercentage = 0
  const requiredFields = 3

  if (name) completionPercentage += 33
  if (bio) completionPercentage += 33
  if (profilePicture) completionPercentage += 34

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">Profile Complete</span>
        </div>
        <span className="text-sm font-bold text-accent">{completionPercentage}%</span>
      </div>
      <div className="w-full bg-border rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-accent to-pink-500 h-full transition-all duration-500"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      {completionPercentage < 100 && (
        <p className="text-xs text-muted mt-2">
          {completionPercentage < 100 && "Complete your profile to get more matches!"}
        </p>
      )}
    </div>
  )
}
