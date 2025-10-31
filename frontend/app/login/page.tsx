/**
 * Login page
 * Handles user authentication
 */
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Heart } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      setLoading(true)
      await login(email, password)
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
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted mt-2">Sign in to your Nexus account</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-8 card-shadow space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm font-medium animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-focus bg-input/50 border-border h-11"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-foreground mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-focus bg-input/50 border-border h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-secondary font-semibold py-3 h-12 btn-glow transition-all duration-300"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted">New to Nexus?</span>
            </div>
          </div>

          <Link href="/register" className="block">
            <Button
              variant="outline"
              className="w-full py-3 h-11 bg-transparent hover:bg-accent/5 border-border transition-all duration-300"
            >
              Create an Account
            </Button>
          </Link>
        </div>

        {/* Footer links */}
        <div className="text-center mt-6">
          <Link
            href="/forgot-password"
            className="text-sm text-accent hover:text-accent/80 font-semibold transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </main>
  )
}
