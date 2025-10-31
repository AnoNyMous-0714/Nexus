/**
 * Registration page
 * Handles new user sign-up
 */
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Heart, Upload } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    age: "",
    gender: "",
    interestedIn: "",
    bio: "",
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        interestedIn: formData.interestedIn,
        bio: formData.bio,
        profilePicture,
      })
      router.push("/discover")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4">
            <Heart className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Join Nexus</h1>
          <p className="text-muted mt-2">Create your profile to get started</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-8 card-shadow">
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm font-medium mb-6 animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="input-focus bg-input/50 border-border h-11"
              />
            </div>

            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-foreground mb-2 block">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-focus bg-input/50 border-border h-11"
              />
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age" className="text-sm font-semibold text-foreground mb-2 block">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="120"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  className="input-focus bg-input/50 border-border h-11"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-sm font-semibold text-foreground mb-2 block">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger id="gender" className="input-focus bg-input/50 border-border h-11">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="interested" className="text-sm font-semibold text-foreground mb-2 block">
                Interested In
              </Label>
              <Select
                value={formData.interestedIn}
                onValueChange={(value) => setFormData({ ...formData, interestedIn: value })}
              >
                <SelectTrigger id="interested" className="input-focus bg-input/50 border-border h-11">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="male">Men</SelectItem>
                  <SelectItem value="female">Women</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="text-sm font-semibold text-foreground mb-2 block">
                About You
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself... (max 150 characters)"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 150) })}
                maxLength={150}
                className="input-focus bg-input/50 border-border resize-none h-24"
                rows={3}
              />
              <p className="text-xs text-muted mt-1">{formData.bio.length}/150</p>
            </div>

            {/* Profile Photo */}
            <div>
              <Label htmlFor="photo" className="text-sm font-semibold text-foreground mb-2 block">
                Profile Photo
              </Label>
              <div className="relative">
                <input id="photo" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <label
                  htmlFor="photo"
                  className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent hover:bg-accent/5 transition-all duration-300"
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-accent mx-auto mb-2" />
                      <p className="text-sm text-muted font-medium">Click to upload photo</p>
                      <p className="text-xs text-muted">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-foreground mb-2 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="input-focus bg-input/50 border-border h-11"
                />
              </div>
              <div>
                <Label htmlFor="confirm" className="text-sm font-semibold text-foreground mb-2 block">
                  Confirm
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="input-focus bg-input/50 border-border h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-secondary font-semibold py-3 h-12 btn-glow transition-all duration-300 mt-6"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </div>

        {/* Sign in link */}
        <div className="text-center mt-6">
          <p className="text-muted text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
