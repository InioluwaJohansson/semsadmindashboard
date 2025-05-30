"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, User, Lock, LogIn, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthThemeToggle } from "@/components/auth-theme-toggle"
import * as API from "@/context/Api_Url"
import type { LoginResponse } from "@/types"
import { ErrorOverlay } from "@/components/error-overlay"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false) // Add state for error overlay
  const [error, setError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [userData, setUserData] = useState<LoginResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState("Incorrect username/email or password")

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      setUsernameError("Username is required")
      return false
    }
    setUsernameError("")
    return true
  }

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required")
      return false
    }
    setPasswordError("")
    return true
  }

  // Method to show error overlay for incorrect credentials
  const showErrorOverlay = (message = "Incorrect username/email or password") => {
    setErrorMessage(message)
    setShowError(true)
    // Hide error overlay after 3 seconds
    setTimeout(() => {
      setShowError(false)
    }, 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setFormSubmitted(true)

    const isUsernameValid = validateUsername(username)
    const isPasswordValid = validatePassword(password)

    if (!isUsernameValid || !isPasswordValid) {
      return
    }
    setIsLoading(true)

    try {
      var user = await API.loginUser(username, password)
      if (user.status == true) {
        setUserData(user)
        localStorage.setItem("id", user.data.id)
        localStorage.setItem("userName", user.data.userName)
        console.log(localStorage.getItem("id"))

        // Simulate API call
        setTimeout(() => {
          setIsLoading(false)
          setShowSuccess(true)

          // Redirect after showing success animation
          setTimeout(() => {
            router.push("/home")
          }, 2000)
        }, 1500)
      } else {
        // Example of how to call the error overlay method
        // This is where you would handle incorrect credentials
        setIsLoading(false)
        showErrorOverlay(user.message || "Authentication failed")
      }
    } catch (error) {
      // Handle API errors
      setIsLoading(false)
      showErrorOverlay("Network error. Please try again.")
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
                  {/* Animated unlock icon */}
                  <svg
                    className="h-10 w-10 text-green-500 dark:text-green-400 animate-[bounceIn_0.5s_ease-in-out_0.3s_both]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">Login Successful!</h2>
              <p className="text-white dark:text-gray-200 mb-4">
                Welcome back, {userData?.data.firstName} {userData?.data.lastName}!
              </p>
              <p className="text-white dark:text-gray-200 text-sm">Redirecting to dashboard...</p>
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
              <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Username or Email address"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        validateUsername(e.target.value)
                      }}
                      className={`pl-10 ${usernameError || (formSubmitted && !username) ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        validatePassword(e.target.value)
                      }}
                      className={`pl-10 ${passwordError || (formSubmitted && !password) ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
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
                      Signing in...
                    </div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </>
                  )}
                </Button>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-primary hover:underline flex items-center justify-center inline-flex"
                  >
                    Sign up <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Error Overlay */}
        <ErrorOverlay
          show={showError}
          message={errorMessage}
          title="Authentication Failed"
          onClose={() => setShowError(false)}
        />
      </div>
    </div>
  )
}
