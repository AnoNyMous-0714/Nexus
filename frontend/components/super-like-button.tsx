/**
 * Super Like Button Component
 * Allows users to send a special "super like" notification
 */
"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useState } from "react"

interface SuperLikeButtonProps {
  profileId: string
  profileName: string
  onSuperLike: () => Promise<void>
  disabled?: boolean
}

export function SuperLikeButton({ profileId, profileName, onSuperLike, disabled }: SuperLikeButtonProps) {
  const [isLiking, setIsLiking] = useState(false)

  const handleSuperLike = async () => {
    try {
      setIsLiking(true)
      await onSuperLike()
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <Button
      onClick={handleSuperLike}
      disabled={disabled || isLiking}
      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg flex items-center justify-center gap-2"
    >
      <Sparkles className="w-5 h-5" />
      {isLiking ? "Sending..." : "Super Like"}
    </Button>
  )
}
