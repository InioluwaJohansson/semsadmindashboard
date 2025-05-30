"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  RefreshCw,
  Sun,
  Moon,
  PlusCircle,
  Key,
  Bell,
  Wifi,
  WifiOff,
  Check,
  AlertTriangle,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useMeter } from "@/context/meter-context"
import { useNotifications } from "@/context/notification-context"
import { NotificationOverlay } from "@/components/notification-overlay"
import * as API from "@/context/Api_Url"

interface CustomerResponse {
  firstName?: string
  lastName?: string
  userName?: string
  pictureUrl?: string
}

interface AppHeaderProps {
  userName?: string
  userImage?: string
}

// Update the AppHeader component to use the meter context
export function AppHeader({ userName = "Inioluwa Johansson", userImage }: AppHeaderProps) {
  // Update the destructuring of useMeter to include resetTimeframes
  const { meters, selectedMeter, usageData, setSelectedMeter, refreshData, resetTimeframes } = useMeter()
  const { unreadCount } = useNotifications()
  const [isAddMeterOpen, setIsAddMeterOpen] = useState(false)
  const [meterId, setMeterId] = useState("")
  const [meterKey, setMeterKey] = useState("")
  const { theme, setTheme } = useTheme()
  const [imageError, setImageError] = useState(false)
  const [formErrors, setFormErrors] = useState({
    meterId: "",
    meterKey: "",
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerResponse | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showOnlineStatus, setShowOnlineStatus] = useState(false)
  const [onlineStatusTimer, setOnlineStatusTimer] = useState<NodeJS.Timeout | null>(null)

  // Add these state variables inside the AppHeader component
  const [userNameState, setUserName] = useState("Inioluwa Johansson")
  const [userImageState, setUserImage] = useState(userImage || "")

  // Add these state variables after the existing state declarations
  const [showAddMeterSuccess, setShowAddMeterSuccess] = useState(false)
  const [showAddMeterError, setShowAddMeterError] = useState("")
  const [addMeterErrorMessage, setAddMeterErrorMessage] = useState("")

  // Add this code near the beginning of the AppHeader component
  useEffect(() => {
    // Expose the function to open the add meter dialog globally
    // @ts-ignore
    window.openAddMeterDialog = () => {
      setIsAddMeterOpen(true)
    }

    return () => {
      // Clean up when component unmounts
      // @ts-ignore
      delete window.openAddMeterDialog
    }
  }, [])

  // Update the startDataRequestForHeader function to properly fetch user data
  const startDataRequestForHeader = async () => {
    try {
      const userId = localStorage.getItem("id")
      if (userId) {
        const customer = await API.getCustomerById(Number.parseInt(userId))
        if (customer.status === true) {
          setCustomerData(customer.data)
          // Update user name and image if available
          if (customer.data.firstName && customer.data.lastName) {
            setUserName(`${customer.data.firstName} ${customer.data.lastName}`)
          } else if (customer.data.userName) {
            setUserName(customer.data.userName)
          }
          setUserImage(customer.data.pictureUrl)

          if (customer.data.pictureUrl) {
            setUserImage(customer.data.pictureUrl)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // Add this useEffect inside the AppHeader component
  useEffect(() => {
    // Fetch user data when component mounts
    startDataRequestForHeader()

    // Set up interval to refresh data every minute
    const intervalId = setInterval(() => {
      startDataRequestForHeader()
    }, 30000) // 60000 ms = 1 minute

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Handle online status change
    const handleOnline = () => {
      setIsOnline(true)
      setShowOnlineStatus(true)

      // Clear any existing timer
      if (onlineStatusTimer) {
        clearTimeout(onlineStatusTimer)
      }

      // Set timer to hide the online status after 3 seconds
      const timer = setTimeout(() => {
        setShowOnlineStatus(false)
      }, 3000)

      setOnlineStatusTimer(timer)
    }

    // Handle offline status change
    const handleOffline = () => {
      setIsOnline(false)
      setShowOnlineStatus(true)
    }

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      if (onlineStatusTimer) {
        clearTimeout(onlineStatusTimer)
      }
    }
  }, [onlineStatusTimer])

  // Get the initials for the avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  const initials = getInitials(userNameState)

  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshData()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 2000)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleAddMeter = () => {
    setIsAddMeterOpen(true)
  }

  const validateForm = () => {
    const errors = {
      meterId: "",
      meterKey: "",
    }

    let isValid = true

    if (!meterId.trim()) {
      errors.meterId = "Meter ID is required"
      isValid = false
    }

    if (!meterKey.trim()) {
      errors.meterKey = "Meter Key is required"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Replace the handleVerify function with this updated version
  const handleVerify = async () => {
    if (validateForm()) {
      setIsVerifying(true)

      try {
        const userId = localStorage.getItem("id")
        if (!userId) {
          throw new Error("User ID not found. Please log in again.")
        }

        const userIdNumber = Number.parseInt(userId, 10)

        // Format the data according to the required structure
        const meterData = {
          meterId: meterId,
          meterKey: meterKey,
          userId: userIdNumber,
        }

        // Call the API to attach meter to customer
        const response = await API.attachMeterToCustomer(meterId, meterKey, userIdNumber)

        setIsVerifying(false)

        if (response.status) {
          // Show success overlay
          setShowAddMeterSuccess(true)

          // Reset form
          setMeterId("")
          setMeterKey("")
          setFormErrors({
            meterId: "",
            meterKey: "",
          })

          // Close dialog and success overlay after delay
          setTimeout(() => {
            setIsAddMeterOpen(false)
            setShowAddMeterSuccess(false)

            // Refresh meter list
            refreshData()
          }, 2000)
        } else {
          // Show error overlay with message from API
          setAddMeterErrorMessage(response.message || "Failed to add meter")
          setShowAddMeterError(true)

          // Hide error overlay after delay
          setTimeout(() => {
            setShowAddMeterError(false)
          }, 3000)
        }
      } catch (error) {
        setIsVerifying(false)

        // Show error overlay
        setAddMeterErrorMessage(error instanceof Error ? error.message : "Failed to add meter")
        setShowAddMeterError(true)

        // Hide error overlay after delay
        setTimeout(() => {
          setShowAddMeterError(false)
        }, 3000)
      }
    }
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border max-w-md mx-auto">
      {showOnlineStatus && (
        <div
          className={`
      absolute left-1/2 transform -translate-x-1/2 top-2 
      flex items-center gap-2 px-3 py-1.5 rounded-md text-xs
      ${
        isOnline
          ? "border border-green-800 bg-green-50/80 backdrop-blur-sm shadow-[0_0_3px_rgba(0,100,0,0.3)]"
          : "border border-red-800 bg-red-50/80 backdrop-blur-sm shadow-[0_0_3px_rgba(200,0,0,0.3)]"
      }
      ${isOnline ? "animate-[zoomOut_0.5s_ease-in-out_3s_forwards]" : "animate-[popIn_0.5s_ease-in-out_forwards]"}
      z-[60]
    `}
        >
          {isOnline ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-green-800" />
              <span className="text-green-800">Connected!</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-red-800" />
              <span className="text-red-800">No internet!</span>
            </>
          )}
        </div>
      )}

      <div className="flex justify-between items-center p-4">
        <div className="text-left">
          <p className="text-sm text-muted-foreground">Welcome</p>
          <p className="font-medium">{userNameState}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleNotifications}
            aria-label="View notifications"
            className="relative"
            disabled={meters.length === 0}
          >
            <Bell className={`h-5 w-5 ${meters.length === 0 ? "text-muted-foreground" : ""}`} />
            {unreadCount > 0 && meters.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-sky-500 text-white text-xs flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>

          <Avatar className="h-10 w-10 border-2 border-primary">
            {userImageState ? (
              <AvatarImage src={userImageState} alt="Profile" />
            ) : (
              <AvatarFallback className="text-3x2">{initials}</AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>

      <div className="flex flex-row px-4 pb-3 gap-2">
        <div className="relative flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <span>{selectedMeter ? selectedMeter.name : "No meter selected"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedMeter ? selectedMeter.powerLeft : "0 kWh"}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[var(--trigger-width)]"
              style={{ "--trigger-width": "100%" } as any}
            >
              {meters && meters.length > 0 ? (
                meters.map((meter) => (
                  <DropdownMenuItem
                    key={meter.id}
                    onClick={() => {
                      // First trigger the page transition
                      // @ts-ignore
                      if (window.triggerPageTransition) window.triggerPageTransition()

                      // Set the selected meter immediately
                      setSelectedMeter(meter)

                      // Reset timeframes for metrics page
                      resetTimeframes()
                    }}
                    className="flex justify-between"
                  >
                    <span>{meter.name}</span>
                    <span className="text-sm text-muted-foreground">{meter.powerLeft}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No meters available</DropdownMenuItem>
              )}
              <Separator className="my-1" />
              <DropdownMenuItem onClick={handleAddMeter} className="text-primary flex items-center justify-center">
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Meter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh meter data"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Add Meter Dialog */}
      <Dialog open={isAddMeterOpen} onOpenChange={setIsAddMeterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Add Meter
            </DialogTitle>
            <DialogDescription>Enter your meter details to add a new meter to your account.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meter-id">Meter ID</Label>
              <Input
                id="meter-id"
                placeholder="e.g. EM-12345-ABCDE"
                value={meterId}
                onChange={(e) => {
                  setMeterId(e.target.value)
                  if (e.target.value.trim()) {
                    setFormErrors((prev) => ({ ...prev, meterId: "" }))
                  }
                }}
                className={formErrors.meterId ? "border-red-500" : ""}
                autoComplete="off"
              />
              {formErrors.meterId && <p className="text-sm text-red-500">{formErrors.meterId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meter-key">Meter Key</Label>
              <Input
                id="meter-key"
                placeholder="Enter your meter key"
                value={meterKey}
                onChange={(e) => {
                  setMeterKey(e.target.value)
                  if (e.target.value.trim()) {
                    setFormErrors((prev) => ({ ...prev, meterKey: "" }))
                  }
                }}
                className={formErrors.meterKey ? "border-red-500" : ""}
                autoComplete="off"
              />
              {formErrors.meterKey && <p className="text-sm text-red-500">{formErrors.meterKey}</p>}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleVerify} disabled={isVerifying} className="flex items-center gap-2">
              {isVerifying ? (
                <>
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
                  Verifying...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Verify
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Overlay */}
      <NotificationOverlay show={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Success Overlay for Add Meter */}
      {showAddMeterSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.3s_ease-in-out]">
          <div className="bg-transparent rounded-lg p-8 shadow-xl max-w-md w-full text-center animate-[slideUp_0.4s_ease-in-out]">
            <div className="mx-auto relative h-20 w-20 mb-4">
              <div className="absolute inset-0 rounded-full bg-green-100/20 dark:bg-green-900/20 animate-[scaleIn_0.5s_ease-in-out]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-500 dark:text-green-400 animate-[bounceIn_0.5s_ease-in-out_0.3s_both]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">Meter Added Successfully!</h2>
            <p className="text-white dark:text-gray-200 mb-4">Your meter has been added to your account.</p>
          </div>
        </div>
      )}

      {/* Error Overlay for Add Meter */}
      {showAddMeterError && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.3s_ease-in-out]">
          <div className="bg-transparent rounded-lg p-8 shadow-xl max-w-md w-full text-center animate-[slideUp_0.4s_ease-in-out]">
            <div className="mx-auto relative h-20 w-20 mb-4">
              <div className="absolute inset-0 rounded-full bg-red-100/20 dark:bg-red-900/20 animate-[scaleIn_0.5s_ease-in-out]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 animate-[bounceIn_0.5s_ease-in-out_0.3s_both]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-2">Error Adding Meter</h2>
            <p className="text-white dark:text-gray-200 mb-4">{addMeterErrorMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}
