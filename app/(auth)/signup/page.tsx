"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Check, User, Mail, Lock, UserPlus, ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthThemeToggle } from "@/components/auth-theme-toggle"
import { ErrorOverlay } from "@/components/error-overlay"
import * as API from "@/context/Api_Url"

export default function SignupPage() {
  const router = useRouter()
  const [lastName, setlastName] = useState("")
  const [firstName, setfirstName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showErrorOverlay, setShowErrorOverlay] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [message, setMessage] = useState("")

  // Form validation states
  const [lastNameError, setlastNameError] = useState("")
  const [firstNameError, setfirstNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  // Password validation states
  const [hasUppercase, setHasUppercase] = useState(false)
  const [hasLowercase, setHasLowercase] = useState(false)
  const [hasSpecialChar, setHasSpecialChar] = useState(false)
  const [hasMinLength, setHasMinLength] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  interface CreateUserDto {
    firstName: string
    lastName: string
    email: string
    password: string
  }

  interface CreateAdminRequest {
    createUserDto: CreateUserDto
  }

  // Method to show error overlay
  const displayErrorOverlay = (message: string) => {
    setErrorMessage(message)
    setShowErrorOverlay(true)
  }

  // Validate password as user types
  useEffect(() => {
    setHasUppercase(/[A-Z]/.test(password))
    setHasLowercase(/[a-z]/.test(password))
    setHasSpecialChar(/[0-9!@#$%^&*(),.?":{}|<>]/.test(password))
    setHasMinLength(password.length >= 6)

    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword)
      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match")
      } else {
        setConfirmPasswordError("")
      }
    }
  }, [password, confirmPassword])

  // Validation functions
  const validatefirstName = (value: string) => {
    if (!value.trim()) {
      setfirstNameError("Firstname is required")
      return false
    }
    setfirstNameError("")
    return true
  }
  const validatelastName = (value: string) => {
    if (!value.trim()) {
      setlastNameError("Lastname is required")
      return false
    }
    setlastNameError("")
    return true
  }

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

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required")
      return false
    }

    const isValid = hasUppercase && hasLowercase && hasSpecialChar && hasMinLength

    if (!isValid) {
      setPasswordError("Password does not meet all requirements")
      return false
    }

    setPasswordError("")
    return true
  }

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      setConfirmPasswordError("Please confirm your password")
      return false
    }

    if (value !== password) {
      setConfirmPasswordError("Passwords do not match")
      setPasswordsMatch(false)
      return false
    }

    setConfirmPasswordError("")
    setPasswordsMatch(true)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFormSubmitted(true)

    // Validate all fields
    const islastNameValid = validatelastName(lastName)
    const isfirstNameValid = validatefirstName(firstName)
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword)

    if (!islastNameValid || !isfirstNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      setError("Please fix the errors in the form")
      return
    }

    setIsLoading(true)

    try {
      const adminRequest: CreateAdminRequest = {
        createUserDto: {
          firstName,
          lastName,
          email,
          password,
        },
      }
      // Call API to create customer
      const response = await API.createCustomer(adminRequest)

      if (response.status) {
        // Success
        setTimeout(() => {
          setIsLoading(false)
          setShowSuccess(true)

          // Redirect after showing success animation
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        }, 1500)
      } else {
        setIsLoading(false)
        displayErrorOverlay(response.message)
      }
    } catch (err) {
      setIsLoading(false)
      displayErrorOverlay(err instanceof Error ? err.message : "Failed to create account. Please try again.")
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
                  <svg
                    className="h-10 w-10 text-green-500 dark:text-green-400 animate-[bounceIn_0.5s_ease-in-out_0.3s_both]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">Account Created!</h2>
              <p className="text-white dark:text-gray-200 mb-4">Your account has been successfully created.</p>
              <p className="text-white dark:text-gray-200 text-sm">Redirecting to login page...</p>
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
              <CardTitle className="text-2xl font-bold">Create an account!</CardTitle>
              <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Firstname</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="Jessica"
                      value={firstName}
                      onChange={(e) => {
                        setfirstName(e.target.value)
                        validatefirstName(e.target.value)
                      }}
                      className={`pl-10 ${firstNameError || (formSubmitted && !firstName) ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {firstNameError && <p className="text-sm text-red-500">{firstNameError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Lastname</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Owens"
                      value={lastName}
                      onChange={(e) => {
                        setlastName(e.target.value)
                        validatelastName(e.target.value)
                      }}
                      className={`pl-10 ${lastNameError || (formSubmitted && !lastName) ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {lastNameError && <p className="text-sm text-red-500">{lastNameError}</p>}
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                      }}
                      className={`pl-10 ${passwordError || (formSubmitted && !password) ? "border-red-500" : ""}`}
                      required
                    />
                  </div>

                  {/* Password requirements */}
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="font-medium text-muted-foreground">Password must:</p>
                    <div className="grid grid-cols-1 gap-1">
                      <div className="flex items-center">
                        {hasUppercase ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasUppercase ? "text-green-600" : "text-muted-foreground"}>
                          Contain at least one uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center">
                        {hasLowercase ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasLowercase ? "text-green-600" : "text-muted-foreground"}>
                          Contain at least one lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center">
                        {hasSpecialChar ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasSpecialChar ? "text-green-600" : "text-muted-foreground"}>
                          Contain at least one number or special character
                        </span>
                      </div>
                      <div className="flex items-center">
                        {hasMinLength ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasMinLength ? "text-green-600" : "text-muted-foreground"}>
                          Be at least 6 characters long
                        </span>
                      </div>
                    </div>
                  </div>

                  {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (password) {
                          validateConfirmPassword(e.target.value)
                        }
                      }}
                      className={`pl-10 ${confirmPasswordError || (formSubmitted && !confirmPassword) ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {/* Only show one error message for password matching */}
                  {confirmPasswordError && <p className="text-sm text-red-500">{confirmPasswordError}</p>}
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
                      Creating account...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create account
                    </>
                  )}
                </Button>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline inline-flex items-center">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Sign in
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
          title="Registration Failed"
          onClose={() => setShowErrorOverlay(false)}
        />
      </div>
    </div>
  )
}
