/**
 * Profile modal component - Enhanced with super like support
 * Shows detailed user profile information in a modal
 */
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Flame } from "lucide-react"

interface Profile {
  _id: string
  name: string
  age: number
  bio: string
  profilePicture?: string
  gender: string
  interestedIn: string
  distance?: number
}

interface ProfileModalProps {
  profile: Profile | null
  isOpen: boolean
  onClose: () => void
  onLike?: () => void
  onSkip?: () => void
  onSuperLike?: () => void
  superLikesLeft?: number
  showActions?: boolean
}

export function ProfileModal({
  profile,
  isOpen,
  onClose,
  onLike,
  onSkip,
  onSuperLike,
  superLikesLeft = 0,
  showActions = true,
}: ProfileModalProps) {
  if (!profile) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl">
        {/* Profile Image */}
        {profile.profilePicture ? (
          <img
            src={profile.profilePicture || "/placeholder.svg"}
            alt={profile.name}
            className="w-full h-96 object-cover rounded-lg mb-4"
          />
        ) : (
          <div className="w-full h-96 bg-accent/10 flex items-center justify-center rounded-lg mb-4">
            <Heart className="w-16 h-16 text-accent/30" />
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">
            {profile.name}, {profile.age}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-base text-muted">
            <span className="capitalize">{profile.gender}</span>
            {profile.distance && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.distance}km away
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Bio */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">About</h3>
            <p className="text-foreground/80">{profile.bio || "No bio added"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted mb-1">Interested In</p>
              <p className="font-medium capitalize text-foreground">{profile.interestedIn}</p>
            </div>
          </div>

          {/* Action Buttons - Fixed to be visible and solid */}
          {showActions && (
            <div className="flex gap-3 pt-4">
              {onSkip && (
                <Button
                  onClick={() => {
                    onSkip()
                    onClose()
                  }}
                  variant="outline"
                  className="flex-1 bg-white dark:bg-slate-800 border-border hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Skip
                </Button>
              )}
              {onLike && (
                <Button
                  onClick={() => {
                    onLike()
                    onClose()
                  }}
                  className="flex-1 bg-accent hover:bg-accent/90 text-secondary"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </Button>
              )}
              {onSuperLike && superLikesLeft !== undefined && (
                <Button
                  onClick={() => {
                    onSuperLike()
                    onClose()
                  }}
                  disabled={superLikesLeft === 0}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white disabled:opacity-50"
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Super ({superLikesLeft})
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
