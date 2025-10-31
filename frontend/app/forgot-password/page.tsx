/**
 * Forgot password page - Fixed to work with token-based reset
 * Allows users to reset their password via email verification
 */
"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "password">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [token, setToken] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setToken(data.resetToken)
      setSuccess("Check your email for the reset link. For testing, use the token below.")
      setStep("password")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          token: token,
          newPassword: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      setSuccess("Password reset successful! Redirecting to login...")
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-accent mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted mt-2">We'll help you recover your account</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <form onSubmit={step === "email" ? handleRequestReset : handleResetPassword} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-200 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-200 p-3 rounded-lg text-sm border border-green-200 dark:border-green-800">
                {success}
              </div>
            )}

            {/* Step 1: Email */}
            {step === "email" && (
              <>
                <div>
                  <Label htmlFor="email" className="text-foreground font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1 bg-input border-border text-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 text-secondary font-semibold py-6"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </>
            )}

            {/* Step 2: New Password */}
            {step === "password" && (
              <>
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
                  <p className="text-sm text-muted">
                    <span className="font-semibold">Reset Token:</span> {token}
                  </p>
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground font-semibold">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="mt-1 bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground font-semibold">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="mt-1 bg-input border-border text-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 text-secondary font-semibold py-6"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </>
            )}
          </form>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/login"
            className="flex items-center gap-1 text-accent hover:text-accent/90 font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  )
}
