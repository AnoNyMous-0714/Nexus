/**
 * Landing page
 * Shows login/register options for unauthenticated users
 */
"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/discover")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Heart className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse-subtle" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse-subtle" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-subtle"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Main content */}
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center mb-6 p-4 bg-accent/10 rounded-full">
            <Heart className="w-8 h-8 text-accent animate-bounce-soft" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">Find Your Perfect Match</h1>
          <p className="text-lg md:text-xl text-muted text-balance mb-2">Experience genuine connections with Nexus</p>
          <p className="text-muted text-sm">The dating app designed for meaningful relationships</p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-12">
          <Link href="/register" className="block">
            <Button className="w-full bg-accent hover:bg-accent/90 text-secondary font-semibold py-7 text-lg btn-glow transition-all duration-300 hover:shadow-2xl">
              Create Your Profile
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button
              variant="outline"
              className="w-full py-7 text-lg bg-card hover:bg-card/80 border-border hover:border-accent transition-all duration-300"
            >
              Already have an account? Sign In
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">10K+</p>
            <p className="text-sm text-muted">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">5K+</p>
            <p className="text-sm text-muted">Matches Daily</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">99%</p>
            <p className="text-sm text-muted">Satisfaction</p>
          </div>
        </div>
      </div>
    </main>
  )
}
