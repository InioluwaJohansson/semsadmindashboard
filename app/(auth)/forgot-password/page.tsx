"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Check, ArrowLeft, Mail, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthThemeToggle } from "@/components/auth-theme-toggle"
import { ErrorOverlay } from "@/components/error-overlay"
import * as API from "@/context/Api_Url"
import type { ForgotPasswordResponse } from "@/types"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showErrorOverlay, setShowErrorOverlay] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [userData, setUserData] = useState<ForgotPasswordResponse | null>(null)

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value.trim()) {
      setEmailError("Email is required")
      return false
    }
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  // Method to show error overlay
  const displayErrorOverlay = (message: string) => {
    setErrorMessage(message)
    setShowErrorOverlay(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setFormSubmitted(true)

    const isEmailValid = validateEmail(email)
    if (!isEmailValid) {
      return
    }

    setIsLoading(true)

    try {
      // Call API to send password reset email
      const response = await API.forgotPassword(email)
      console.log(response.status)
      console.log(response.message)
      if (response.status) {
        // Success
        setTimeout(() => {
          setIsLoading(false)
          setShowSuccess(true)
        }, 1500)
      } else {
        setIsLoading(false)
        displayErrorOverlay(response?.message || "Failed to send reset link")
      }
    } catch (err) {
      setIsLoading(false)
      displayErrorOverlay(err instanceof Error ? err.message : "Failed to send reset link. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        {showSuccess ? (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.3s_ease-in-out]">
            <div className="bg-transparent rounded-lg p-8 shadow-xl max-w-md w-full text-center animate-[slideUp_0.4s_ease-in-out]">
              <div className="mx-auto relative h-20 w-20 mb-4">
                <div className="absolute inset-0 rounded-full bg-green-100/20 dark:bg-green-900/20 animate-[scaleIn_0.5s_ease-in-out]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-500 dark:text-green-400 animate-[bounceIn_0.5s_ease-in-out_0.3s_both]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">Email Sent!</h2>
              <p className="text-white dark:text-gray-200 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the
                instructions.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => router.push("/login")} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Card className="shadow-lg animate-slide-up-once relative">
            <AuthThemeToggle />
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <span className="ml-2 text-2xl font-bold tracking-wider font-tesla">SEMS</span>
              </div>
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <CardDescription>Enter your email to receive a password reset link</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        validateEmail(e.target.value)
                      }}
                      className={`pl-10 ${emailError || (formSubmitted && !email) ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
                <div className="mt-4 text-center text-sm">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline inline-flex items-center">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Back to login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Error Overlay */}
        <ErrorOverlay
          show={showErrorOverlay}
          message={errorMessage}
          title="Reset Link Failed"
          onClose={() => setShowErrorOverlay(false)}
        />
      </div>
    </div>
  )
}
