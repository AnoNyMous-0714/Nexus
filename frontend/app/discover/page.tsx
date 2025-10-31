/**
 * Discovery page with enhanced swipe mechanics and profile modal
 */
"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, X, Settings, Moon, Sun, Zap, Flame } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ProfileModal } from "@/components/profile-modal"
import { useNotifications } from "@/hooks/use-notifications"

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

export default function DiscoverPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { sendNotification, requestPermission, permissionStatus } = useNotifications()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [superLikesLeft, setSuperLikesLeft] = useState(1)

  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 100,
    maxDistance: 50,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (token) {
      fetchProfiles()
    }
  }, [token, filters])

  useEffect(() => {
    if (permissionStatus === "default") {
      const timer = setTimeout(() => {
        requestPermission()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [permissionStatus, requestPermission])

  const fetchProfiles = async () => {
    try {
      setLoadingProfiles(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/discover?ageMin=${filters.ageMin}&ageMax=${filters.ageMax}&maxDistance=${filters.maxDistance}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (response.ok) {
        const data = await response.json()
        setProfiles(data)
        setCurrentIndex(0)
      }
    } catch (err) {
      setError("Failed to load profiles")
    } finally {
      setLoadingProfiles(false)
    }
  }

  const handleLike = useCallback(async () => {
    if (currentIndex >= profiles.length || isAnimating) return

    try {
      setIsAnimating(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/matches/like/${profiles[currentIndex]._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await response.json()
      if (data.matched) {
        sendNotification(`It's a match! 💝`, `You and ${profiles[currentIndex].name} liked each other!`, "match")
      }
      setShowProfileModal(false)
      // Use setTimeout to ensure animation completes before state change
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsAnimating(false)
      }, 500)
    } catch (err) {
      setError("Failed to like profile")
      setIsAnimating(false)
    }
  }, [currentIndex, profiles, token, sendNotification])

  const handleDislike = useCallback(async () => {
    if (currentIndex >= profiles.length || isAnimating) return

    try {
      setIsAnimating(true)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/dislike/${profiles[currentIndex]._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowProfileModal(false)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsAnimating(false)
      }, 500)
    } catch (err) {
      setError("Failed to skip profile")
      setIsAnimating(false)
    }
  }, [currentIndex, profiles, token])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAnimating) return
    isDraggingRef.current = true
    dragStartX.current = e.clientX
    dragStartY.current = e.clientY
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false

    const deltaX = e.clientX - dragStartX.current
    const deltaY = Math.abs(e.clientY - dragStartY.current)

    // Require at least 60px horizontal swipe with minimal vertical movement
    if (Math.abs(deltaX) > 60 && deltaY < 40) {
      if (deltaX > 0) {
        handleLike()
      } else {
        handleDislike()
      }
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isAnimating) return
    isDraggingRef.current = true
    dragStartX.current = e.touches[0].clientX
    dragStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false

    const deltaX = e.changedTouches[0].clientX - dragStartX.current
    const deltaY = Math.abs(e.changedTouches[0].clientY - dragStartY.current)

    if (Math.abs(deltaX) > 60 && deltaY < 40) {
      if (deltaX > 0) {
        handleLike()
      } else {
        handleDislike()
      }
    }
  }

  const handleSuperLike = useCallback(async () => {
    if (superLikesLeft <= 0 || isAnimating) return

    try {
      setIsAnimating(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/matches/super-like/${profiles[currentIndex]._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await response.json()
      if (data.matched) {
        sendNotification(`Super Match! 🌟`, `${profiles[currentIndex].name} super liked you back!`, "match")
      } else {
        sendNotification(`Super Like Sent 🌟`, `${profiles[currentIndex].name} will see your super like!`, "like")
      }
      setSuperLikesLeft((prev) => prev - 1)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsAnimating(false)
      }, 500)
    } catch (err) {
      setError("Failed to super like profile")
      setIsAnimating(false)
    }
  }, [currentIndex, profiles, token, superLikesLeft, sendNotification])

  if (loading || loadingProfiles) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Heart className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-muted">Loading profiles...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const currentProfile = profiles[currentIndex]

  return (
    <main className="min-h-screen bg-background">
      {/* ... existing header code ... */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">Nexus</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/matches" className="text-foreground hover:text-accent transition flex items-center gap-1">
              <Heart className="w-4 h-4" />
              Matches
            </Link>
            <Link href="/profile" className="text-foreground hover:text-accent transition">
              Profile
            </Link>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-accent/10 rounded-lg transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-accent/10 rounded-lg transition"
              title="Filters"
            >
              <Settings className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      {/* ... existing filters panel ... */}
      {showFilters && (
        <div className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h3 className="font-semibold text-foreground mb-4">Discovery Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ageMin">Min Age: {filters.ageMin}</Label>
                <Input
                  id="ageMin"
                  type="range"
                  min="18"
                  max="100"
                  value={filters.ageMin}
                  onChange={(e) => setFilters({ ...filters, ageMin: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="ageMax">Max Age: {filters.ageMax}</Label>
                <Input
                  id="ageMax"
                  type="range"
                  min="18"
                  max="100"
                  value={filters.ageMax}
                  onChange={(e) => setFilters({ ...filters, ageMax: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="distance">Max Distance: {filters.maxDistance}km</Label>
                <Input
                  id="distance"
                  type="range"
                  min="1"
                  max="200"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({ ...filters, maxDistance: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-200 p-4 rounded-lg mb-6">{error}</div>
        )}

        {currentIndex >= profiles.length ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No more profiles</h2>
            <p className="text-muted mb-6">Check back later for more matches!</p>
            <Button onClick={fetchProfiles} className="bg-accent hover:bg-accent/90 text-secondary">
              Refresh Profiles
            </Button>
          </div>
        ) : currentProfile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div
                ref={cardRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                  setSelectedProfile(currentProfile)
                  setShowProfileModal(true)
                }}
                className={`bg-card rounded-2xl overflow-hidden shadow-lg border border-border cursor-pointer hover:shadow-xl transition-shadow ${
                  isAnimating ? "opacity-50" : ""
                }`}
              >
                {currentProfile.profilePicture ? (
                  <img
                    src={currentProfile.profilePicture || "/placeholder.svg"}
                    alt={currentProfile.name}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-accent/10 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-accent/30" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <p className="text-muted mb-2 line-clamp-2">{currentProfile.bio}</p>
                  <p className="text-xs text-muted">Click card to view more details • Swipe left/right</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 justify-center">
              <Button
                onClick={handleDislike}
                disabled={isAnimating}
                variant="outline"
                className="w-full py-6 text-lg flex items-center justify-center gap-2 bg-transparent hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                Skip
              </Button>
              <Button
                onClick={handleLike}
                disabled={isAnimating}
                className="w-full bg-accent hover:bg-accent/90 text-secondary py-6 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Heart className="w-5 h-5" />
                Like
              </Button>
              <Button
                onClick={handleSuperLike}
                disabled={isAnimating || superLikesLeft === 0}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white py-6 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Flame className="w-5 h-5" />
                Super Like ({superLikesLeft})
              </Button>
              <div className="text-xs text-muted text-center pt-2">
                <Zap className="w-3 h-3 inline mr-1" />
                Or drag left/right to swipe
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        profile={selectedProfile}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLike={handleLike}
        onSkip={handleDislike}
        onSuperLike={handleSuperLike}
        superLikesLeft={superLikesLeft}
        showActions={true}
      />
    </main>
  )
}
