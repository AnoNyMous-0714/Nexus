/**
 * Matches page with profile modal feature
 */
"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProfileModal } from "@/components/profile-modal"

interface Match {
  _id: string
  user1: {
    _id: string
    name: string
    age: number
    profilePicture?: string
    bio: string
    gender: string
    interestedIn: string
  }
  user2: {
    _id: string
    name: string
    age: number
    profilePicture?: string
    bio: string
    gender: string
    interestedIn: string
  }
  matchedAt: string
}

export default function MatchesPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [error, setError] = useState("")
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (token) {
      fetchMatches()
    }
  }, [token])

  const fetchMatches = async () => {
    try {
      setLoadingMatches(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
      }
    } catch (err) {
      setError("Failed to load matches")
    } finally {
      setLoadingMatches(false)
    }
  }

  const handleUnmatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to unmatch?")) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${matchId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setMatches(matches.filter((m) => m._id !== matchId))
      }
    } catch (err) {
      setError("Failed to unmatch")
    }
  }

  const getOtherUser = (match: Match) => {
    return match.user1._id === user?._id ? match.user2 : match.user1
  }

  if (loading || loadingMatches) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Heart className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse-subtle" />
          <p className="text-muted">Loading matches...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-2 text-foreground hover:text-accent transition">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Your Matches</h1>
            <p className="text-sm text-muted">
              {matches.length} connection{matches.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 animate-slide-up">{error}</div>
        )}

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center p-4 bg-accent/10 rounded-full mb-4">
              <Heart className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No matches yet</h2>
            <p className="text-muted mb-8">Start swiping to find your perfect match!</p>
            <Link href="/discover">
              <Button className="bg-accent hover:bg-accent/90 text-secondary btn-glow">Back to Discovery</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const otherUser = getOtherUser(match)
              return (
                <div
                  key={match._id}
                  className="bg-card rounded-2xl border border-border overflow-hidden card-shadow hover:shadow-2xl transition-all duration-300 group animate-scale-in"
                >
                  {/* Profile Picture - Clickable */}
                  <div
                    onClick={() => {
                      setSelectedProfile(otherUser)
                      setShowProfileModal(true)
                    }}
                    className="cursor-pointer relative overflow-hidden h-64 group"
                  >
                    {otherUser.profilePicture ? (
                      <img
                        src={otherUser.profilePicture || "/placeholder.svg"}
                        alt={otherUser.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-accent/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Match Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-foreground">
                        {otherUser.name}, {otherUser.age}
                      </h3>
                      <p className="text-sm text-muted mt-1">
                        Matched {new Date(match.matchedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-foreground mt-2 line-clamp-2">{otherUser.bio}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/chat/${match._id}`} className="flex-1">
                        <Button className="w-full bg-accent hover:bg-accent/90 text-secondary flex items-center justify-center gap-2 btn-glow">
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleUnmatch(match._id)}
                        variant="outline"
                        className="px-4 bg-transparent hover:bg-red-50 dark:hover:bg-red-950 border-border hover:border-red-500 transition-all duration-300"
                        title="Unmatch"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal profile={selectedProfile} isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </main>
  )
}
