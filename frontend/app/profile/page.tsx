/**
 * Enhanced User profile page with completion status
 */
"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Upload, LogOut, ArrowLeft, Copy, Check } from "lucide-react"
import Link from "next/link"
import { ProfileCompletion } from "@/components/profile-completion"

export default function ProfilePage() {
  const { user, token, logout, updateProfile, loading } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    age: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    } else if (user) {
      setFormData({
        name: user.name,
        bio: user.bio,
        age: user.age.toString(),
      })
      if (user.profilePicture) {
        setProfilePicture(user.profilePicture)
      }
    }
  }, [user, loading, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        age: Number.parseInt(formData.age),
        profilePicture,
      })
      setEditing(false)
    } catch (err) {
      console.error("Failed to save profile:", err)
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user?._id || "")
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Heart className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse-subtle" />
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-2 text-foreground hover:text-accent transition">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
          <Button
            onClick={logout}
            variant="ghost"
            className="flex items-center gap-2 text-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileCompletion name={user.name} bio={user.bio} profilePicture={user.profilePicture} />

        <div className="bg-card rounded-2xl border border-border overflow-hidden card-shadow mt-8 animate-fade-in">
          {/* Profile Picture */}
          <div className="relative h-80 overflow-hidden group">
            {profilePicture ? (
              <img
                src={profilePicture || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                <Heart className="w-16 h-16 text-accent/30" />
              </div>
            )}
            {editing && (
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Change photo</p>
                </div>
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="p-8">
            {!editing ? (
              <>
                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <h2 className="text-4xl font-bold text-foreground">
                      {user.name}, {user.age}
                    </h2>
                  </div>
                  <p className="text-muted capitalize text-lg">{user.gender}</p>
                </div>

                <div className="mb-8 pb-8 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">About You</h3>
                  <p className="text-foreground text-lg leading-relaxed">{user.bio || "No bio added yet"}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-border">
                  <div>
                    <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Email</p>
                    <p className="text-foreground font-medium text-sm">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Interested In</p>
                    <p className="text-foreground font-medium capitalize text-sm">{user.interestedIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-2">User ID</p>
                    <button
                      onClick={copyToClipboard}
                      className="text-accent hover:text-accent/80 font-medium text-sm flex items-center gap-1 transition"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy ID
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => setEditing(true)}
                  className="w-full bg-accent hover:bg-accent/90 text-secondary font-semibold py-3 h-12 btn-glow"
                >
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground mb-2 block">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-focus bg-input/50 border-border h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age" className="text-sm font-semibold text-foreground mb-2 block">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="input-focus bg-input/50 border-border h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-semibold text-foreground mb-2 block">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      maxLength={150}
                      rows={4}
                      className="input-focus bg-input/50 border-border resize-none"
                    />
                    <p className="text-xs text-muted mt-2">{formData.bio.length}/150</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-accent hover:bg-accent/90 text-secondary font-semibold py-3 h-12 btn-glow"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={() => setEditing(false)}
                      variant="outline"
                      className="flex-1 py-3 h-11 bg-transparent hover:bg-accent/5 border-border transition-all"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
