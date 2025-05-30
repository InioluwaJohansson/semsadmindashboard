"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  BellRing,
  Smartphone,
  Mail,
  LogOut,
  Zap,
  AlertTriangle,
  Image,
  Save,
  SettingsIcon,
  UserCircle,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { PhoneInput } from "@/components/phone-input"
import { useMeter } from "@/context/meter-context"
import { LoadingOverlay } from "@/components/loading-overlay"
import { SuccessOverlay } from "@/components/success-overlay"
import { ErrorOverlay } from "@/components/error-overlay"
import * as API from "@/context/Api_Url"
import { useData } from "@/context/data-context"

// List of Nigerian states
const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
]

export default function SettingsPage() {
  // Add a ref for scrolling to top
  const topRef = useRef(null)

  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { selectedMeter, customerData } = useMeter()
  const { refreshData } = useData()
  // Add state variables for hidden fields at the top of the component
  const [userId, setUserId] = useState<number | null>(null)
  const [meterId, setMeterId] = useState<number | null>(null)

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string>(selectedMeter?.state || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pictureFile, setPictureFile] = useState<File | null>(null)
  const [fullName, setFullName] = useState(`${customerData.firstName} ${customerData.lastName}` || "Inioluwa Johansson")
  const [userName, setUserName] = useState(customerData.userName || "user_name") // Updated name
  const [email, setEmail] = useState(customerData.email || "inioluwa.makinde@gmail.com")
  const [countryCode, setCountryCode] = useState(customerData.phoneNumber.split(" ")[0] || "+234")
  const [phoneNumber, setPhoneNumber] = useState(customerData.phoneNumber.split(" ")[1] || "812 345 6789")
  const [threshold, setThreshold] = useState(selectedMeter?.threshold || "300")
  const [region, setRegion] = useState(selectedMeter?.region || "")
  const [city, setCity] = useState(selectedMeter?.city || "")
  const [street, setStreet] = useState(selectedMeter?.street || "")
  const [numberline, setNumberline] = useState(selectedMeter?.numberLine || "")

  // First, add state variables for the toggle switches at the top of the component
  const [peakUsageAlerts, setPeakUsageAlerts] = useState(customerData.getNotificationDto.peakUsageAlerts || false)
  const [usageThresholdAlerts, setUsageThresholdAlerts] = useState(
    customerData.getNotificationDto.usageThresholdAlerts || true,
  )
  const [usageAlerts, setUsageAlerts] = useState(customerData.getNotificationDto.usageAlerts || true)
  const [billingNotifications, setBillingNotifications] = useState(
    customerData.getNotificationDto.billingNotifications || true,
  )
  const [pushNotifications, setPushNotifications] = useState(customerData.getNotificationDto.pushNotifications || true)

  // Form validation states
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [nameError, setNameError] = useState("")
  const [userNameError, setUserNameError] = useState("")
  const [thresholdError, setThresholdError] = useState("")
  const [regionError, setRegionError] = useState("")
  const [cityError, setCityError] = useState("")
  const [streetError, setStreetError] = useState("")
  const [numberlineError, setNumberlineError] = useState("")
  const [stateError, setStateError] = useState("")

  // Loading and success states
  const [isAccountLoading, setIsAccountLoading] = useState(false)
  const [isMeterLoading, setIsMeterLoading] = useState(false)
  const [showAccountSuccess, setShowAccountSuccess] = useState(false)
  const [showMeterSuccess, setShowMeterSuccess] = useState(false)

  // Error overlay states
  const [showAccountError, setShowAccountError] = useState(false)
  const [accountErrorMessage, setAccountErrorMessage] = useState("")
  const [showMeterError, setShowMeterError] = useState(false)
  const [meterErrorMessage, setMeterErrorMessage] = useState("")

  // Check if there's no selected meter
  const noMeterSelected = !selectedMeter

  // Add useEffect to set the user ID and meter ID when component mounts

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPictureFile(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        // Make sure we're setting a string value
        const result = reader.result
        if (typeof result === "string") {
          
          setProfileImage(result)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  // Update useEffect to properly handle the profile image from API
  useEffect(() => {
    setFullName(`${customerData.firstName} ${customerData.lastName}`)
    setEmail(customerData.email)
    setCountryCode(customerData.phoneNumber.split(" ")[0])
    setPhoneNumber(customerData.phoneNumber.split(" ")[1])
    setUserName(customerData.userName)
    setUsageThresholdAlerts(customerData.getNotificationDto.usageThresholdAlerts)
    setPeakUsageAlerts(customerData.getNotificationDto.peakUsageAlerts)
    setPushNotifications(customerData.getNotificationDto.pushNotifications)
    setBillingNotifications(customerData.getNotificationDto.billingNotifications)
    setPushNotifications(customerData.getNotificationDto.pushNotifications)
    setUsageAlerts(customerData.getNotificationDto.usageAlerts)

    // Set profile image if available from API
    if (customerData.pictureUrl && customerData.pictureUrl !== "") {
      setProfileImage(customerData.pictureUrl)
    }else{
    setProfileImage(null)
    }

    // Get user ID from localStorage
    const storedUserId = localStorage.getItem("id")
    if (storedUserId) {
      setUserId(Number.parseInt(storedUserId, 10))
    }

    // Set meter ID from selected meter
    if (selectedMeter && selectedMeter.id) {
      setMeterId(selectedMeter.id)
    }
  }, [selectedMeter])

  // Update useEffect that runs when selected meter changes to also update meter ID
  useEffect(() => {
    if (selectedMeter) {
      setSelectedState(selectedMeter.state || "")
      setThreshold(selectedMeter.threshold || "300")
      setRegion(selectedMeter.region || "")
      setCity(selectedMeter.city || "")
      setStreet(selectedMeter.street || "")
      setNumberline(selectedMeter.numberLine || "")

      // Update meter ID when selected meter changes
      if (selectedMeter.id) {
        setMeterId(selectedMeter.id)
      }
    }
  }, [selectedMeter])

  // Get the initials for the avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  const initials = getInitials(fullName)

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("Email is required")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9\s\-()]{10,15}$/
    if (!phone) {
      setPhoneError("Phone number is required")
      return false
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError("Please enter a valid phone number")
      return false
    }
    setPhoneError("")
    return true
  }

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError("Name is required")
      return false
    }
    setNameError("")
    return true
  }

  const validateUserName = (name: string) => {
    if (!name.trim()) {
      setUserNameError("Name is required")
      return false
    }
    setUserNameError("")
    return true
  }

  const validateThreshold = (threshold: string) => {
    const thresholdNum = Number(threshold)
    if (!threshold) {
      setThresholdError("Base Load is required")
      return false
    }
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      setThresholdError("Please enter a valid positive number")
      return false
    }
    setThresholdError("")
    return true
  }

  const validateRequiredField = (
    value: string,
    setError: React.Dispatch<React.SetStateAction<string>>,
    fieldName: string,
  ) => {
    if (!value.trim()) {
      setError(`${fieldName} is required`)
      return false
    }
    setError("")
    return true
  }

  const validateState = () => {
    if (!selectedState) {
      setStateError("Please select a state")
      return false
    }
    setStateError("")
    return true
  }

  // Method to show account error overlay
  const showAccountErrorOverlay = (message: string) => {
    setAccountErrorMessage(message)
    setShowAccountError(true)
  }

  // Method to show meter error overlay
  const showMeterErrorOverlay = (message: string) => {
    setMeterErrorMessage(message)
    setShowMeterError(true)
  }

  const convertImageToBase64 = (pictureFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      // `reader.result` contains the Base64 string representation of the image
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    // Read the file as a Base64 string
    reader.readAsDataURL(pictureFile);
  });
};


  // Then update the handleAccountInfoSubmit function to include these toggle states
  const handleAccountInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isEmailValid = validateEmail(email)
    const isPhoneValid = validatePhone(phoneNumber)
    const isNameValid = validateName(fullName)
    const isUserNameValid = validateUserName(userName)

    if (isEmailValid && isPhoneValid && isNameValid && isUserNameValid) {
      // Show loading overlay
      setIsAccountLoading(true)

      try {
        if (!userId) {
          throw new Error("User ID not found. Please log in again.")
        }
        const base64Image = await convertImageToBase64(pictureFile);
        console.log(base64Image)
        const updateUserData = {
          id: userId,
          firstName: fullName.split(" ")[0],
          lastName: fullName.split(" ")[1],
          userName: userName,
          email: email,
          phoneNumber: countryCode + " " + phoneNumber.replace(/\s+/g, ""),
          picture: base64Image, // Use existing picture URL or empty string
          peakUsageAlerts: peakUsageAlerts,
          usageThresholdAlerts: usageThresholdAlerts,
          usageAlerts: usageAlerts,
          billingNotifications: billingNotifications,
          pushNotifications: pushNotifications,
          
        }

        // Send directly to API
        const response = await API.updateCustomer(updateUserData)

        if (response.status) {
          setIsAccountLoading(false)
          setShowAccountSuccess(true)

          // Refresh data after successful update
          refreshData()
        } else {
          throw new Error(response.message || "Failed to update account information")
        }
      } catch (err) {
        setIsAccountLoading(false)
        showAccountErrorOverlay(err instanceof Error ? err.message : "Failed to update account information")
      }
    }
  }

  // Replace the handleMeterInfoSubmit function with this async version
  const handleMeterInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isThresholdValid = validateThreshold(threshold)
    const isRegionValid = validateRequiredField(region, setRegionError, "Region")
    const isCityValid = validateRequiredField(city, setCityError, "City")
    const isStreetValid = validateRequiredField(street, setStreetError, "Street")
    const isNumberlineValid = validateRequiredField(numberline, setNumberlineError, "Number Line")
    const isStateValid = validateState()

    if (isThresholdValid && isRegionValid && isCityValid && isStreetValid && isNumberlineValid && isStateValid) {
      // Show loading overlay
      setIsMeterLoading(true)

      try {
        if (!userId || !meterId) {
          throw new Error("User ID or Meter ID not found. Please refresh the page.")
        }

        // Prepare the data for API
        const meterData = {
          meterId: meterId,
          userId: userId,
          baseLoad: Number.parseInt(threshold, 10),
          updateAddressDto: {
            id: 0,
            numberLine: numberline,
            street: street,
            city: city,
            region: region,
            state: selectedState,
            country: "Nigeria",
          },
        }
        // Call the API to update meter information
        const response = await API.updateMeter(meterData)

        if (response.status) {
          console.log(response)
          setIsMeterLoading(false)
          setShowMeterSuccess(true)

          // Refresh meter data
          refreshData()
        } else {
          throw new Error(response.message || "Failed to update meter information")
        }
      } catch (err) {
        setIsMeterLoading(false)
        showMeterErrorOverlay(err instanceof Error ? err.message : "Failed to update meter information")
      }
    }
  }

  // Input change handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (e.target.value) {
      validateEmail(e.target.value)
    } else {
      setEmailError("")
    }
  }

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value)
    if (value) {
      validatePhone(value)
    } else {
      setPhoneError("")
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)
    if (e.target.value) {
      validateName(e.target.value)
    } else {
      setNameError("")
    }
  }

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value)
    if (e.target.value) {
      validateUserName(e.target.value)
    } else {
      setUserNameError("")
    }
  }

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem("id")
    localStorage.removeItem("username")
    router.push("/login")
  }

  return (
    <div className="p-4 pt-1 space-y-3 pb-[3px]">
      {/* Add an ID for scrolling to top */}
      <div id="top" ref={topRef}></div>

      {/* Update the heading in the settings page */}
      <div className="flex items-center gap-2 mb-1">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            <CardTitle>Account Information</CardTitle>
          </div>
          <CardDescription>Manage your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAccountInfoSubmit} autoComplete="off">
            <div className="flex flex-col items-center mb-4">
              <div className="profile-picture mb-4">
                <Avatar className="h-24 w-24">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt="Profile" />
                  ) : (
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  )}
                </Avatar>
              </div>
              <Button type="button" variant="outline" onClick={triggerFileInput} className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Add Picture
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={handleNameChange}
                required
                className={nameError ? "border-red-500" : ""}
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">User Name</Label>
              <Input
                id="userName"
                value={userName}
                onChange={handleUserNameChange}
                required
                className={userNameError ? "border-red-500" : ""}
              />
              {userNameError && <p className="text-sm text-red-500">{userNameError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <PhoneInput
                value={phoneNumber}
                onChange={handlePhoneChange}
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
                error={phoneError}
              />
              {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
            </div>

            {/* Replace the Electricity Preferences Card with: */}
            <div className="flex flex-col mt-3 mb-2 space-y-3">
              <div className="space-y-3 p-0 flex flex-col align-items-start">
                <CardTitle>Electricity Preferences</CardTitle>
                <CardDescription>Customize your electricity monitoring</CardDescription>
              </div>
              <div className="space-y-3 flex flex-col">
                <div className="flex justify-between flex-row">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <Label htmlFor="peak-alerts">Peak Usage Alerts</Label>
                  </div>
                  <Switch id="peak-alerts" checked={peakUsageAlerts} onCheckedChange={setPeakUsageAlerts} />
                </div>

                <div className="flex flex-row justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <Label htmlFor="threshold-alerts">Usage Threshold Alerts</Label>
                  </div>
                  <Switch
                    id="threshold-alerts"
                    checked={usageThresholdAlerts}
                    onCheckedChange={setUsageThresholdAlerts}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col mt-5 space-y-3">
              <div className="space-y-3 p-0 flex flex-col align-items-start">
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive alerts</CardDescription>
              </div>
              <div className="space-y-3 flex flex-col">
                <div className="flex justify-between flex-row">
                  <div className="flex items-center space-x-2">
                    <BellRing className="h-4 w-4" />
                    <Label htmlFor="usage-alerts">Usage Alerts</Label>
                  </div>
                  <Switch id="usage-alerts" checked={usageAlerts} onCheckedChange={setUsageAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="billing-notifications">Billing Notifications</Label>
                  </div>
                  <Switch
                    id="billing-notifications"
                    checked={billingNotifications}
                    onCheckedChange={setBillingNotifications}
                  />
                </div>
                <div className="flex justify-between flex-row">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                  <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
            <input type="hidden" name="userId" value={userId || ""} />
          </form>
        </CardContent>
      </Card>

      {noMeterSelected ? (
        <Card id="meter-information">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Meter Information</CardTitle>
            </div>
            <CardDescription>Manage your meter and location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-lg border border-dashed">
              <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
              <h3 className="text-lg font-medium mb-1">No Meter Selected</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Please select a meter from the dropdown menu at the top of the screen to view and edit meter settings.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card id="meter-information">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Meter Information</CardTitle>
            </div>
            <CardDescription>Manage your meter and location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleMeterInfoSubmit} autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="meter-id">Meter ID</Label>
                <Input id="meter-id" value={selectedMeter.name} readOnly className="bg-muted cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Base Load (kWh)</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={threshold}
                  onChange={(e) => {
                    setThreshold(e.target.value)
                    validateThreshold(e.target.value)
                  }}
                  required
                  min="1"
                  className={thresholdError ? "border-red-500" : ""}
                />
                {thresholdError && <p className="text-sm text-red-500">{thresholdError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={selectedState}
                  onValueChange={(value) => {
                    setSelectedState(value)
                    setStateError("")
                  }}
                >
                  <SelectTrigger id="state" className={stateError ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {stateError && <p className="text-sm text-red-500">{stateError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="Enter your region"
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value)
                    validateRequiredField(e.target.value, setRegionError, "Region")
                  }}
                  required
                  className={regionError ? "border-red-500" : ""}
                />
                {regionError && <p className="text-sm text-red-500">{regionError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value)
                    validateRequiredField(e.target.value, setCityError, "City")
                  }}
                  required
                  className={cityError ? "border-red-500" : ""}
                />
                {cityError && <p className="text-sm text-red-500">{cityError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  placeholder="Enter your street"
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value)
                    validateRequiredField(e.target.value, setStreetError, "Street")
                  }}
                  required
                  className={streetError ? "border-red-500" : ""}
                />
                {streetError && <p className="text-sm text-red-500">{streetError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberline">Number Line</Label>
                <Input
                  id="numberline"
                  placeholder="Enter your house/building number"
                  value={numberline}
                  onChange={(e) => {
                    // Only allow integer values
                    const value = e.target.value.replace(/\D/g, "")
                    setNumberline(value)
                    validateRequiredField(value, setNumberlineError, "Number Line")
                  }}
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={numberlineError ? "border-red-500" : ""}
                />
                {numberlineError && <p className="text-sm text-red-500">{numberlineError}</p>}
              </div>

              <div className="flex justify-end mt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
              <input type="hidden" name="userId" value={userId || ""} />
              <input type="hidden" name="meterId" value={meterId || ""} />
            </form>
          </CardContent>
        </Card>
      )}

      <Button variant="destructive" className="w-full mt-6" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>

      {/* Loading Overlays */}
      <LoadingOverlay show={isAccountLoading || isMeterLoading} />

      {/* Success Overlays */}
      <SuccessOverlay
        show={showAccountSuccess}
        message="Account Information Updated Successfully"
        onClose={() => setShowAccountSuccess(false)}
      />

      <SuccessOverlay
        show={showMeterSuccess}
        message="Meter Information Updated Successfully"
        onClose={() => setShowMeterSuccess(false)}
      />

      {/* Error Overlays */}
      <ErrorOverlay
        show={showAccountError}
        message={accountErrorMessage}
        title="Update Failed"
        onClose={() => setShowAccountError(false)}
      />

      <ErrorOverlay
        show={showMeterError}
        message={meterErrorMessage}
        title="Update Failed"
        onClose={() => setShowMeterError(false)}
      />
    </div>
  )
}
