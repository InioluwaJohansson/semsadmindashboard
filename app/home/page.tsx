"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Zap,
  Battery,
  BatteryCharging,
  BatteryMedium,
  CreditCard,
  BarChart2,
  Info,
  ArrowRight,
  Activity,
  AlertCircle,
  PlusCircle,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useMeter } from "@/context/meter-context"
import * as API from "@/context/Api_Url"
import { Button } from "@/components/ui/button"

interface CustomerResponse {
  // Define the structure of CustomerResponse here based on your API response
  // Example:
  id: string
  name: string
  email: string
  status: boolean
}

export default function HomePage() {
  const router = useRouter()
  const { selectedMeter, usageData } = useMeter()
  const [isLoadActive, setIsLoadActive] = useState(selectedMeter?.status)
  const [isMeterActive, setIsMeterActive] = useState(selectedMeter?.isPowerActive)
  const [showBanner, setShowBanner] = useState(true)
  const [customerData, setCustomerData] = useState<CustomerResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Add loading state
  const [isToggling, setIsToggling] = useState(false)
  const meterId = selectedMeter ? Number.parseInt(selectedMeter.id, 10) : 0

  // Check if user is logged in
  useEffect(() => {
    if (localStorage.getItem("id") == null && localStorage.getItem("userName") == null) {
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }
  }, [router])

  // Update meter status when selectedMeter changes
  useEffect(() => {
    if (selectedMeter) {
      setIsMeterActive(selectedMeter.isPowerActive)
      setIsLoadActive(selectedMeter.status)
    }
  }, [selectedMeter])

  // Show loading overlay when component mounts
  useEffect(() => {
    // Trigger page transition when component mounts
    if (window.triggerPageTransition) {
      window.triggerPageTransition()
    }

    // Hide loading after a delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Handle navigation with transition
  const handleNavigation = (path: string) => {
    // Trigger the transition overlay
    // @ts-ignore
    if (window.triggerPageTransition) window.triggerPageTransition()

    // Navigate after a small delay to ensure transition shows
    setTimeout(() => {
      router.push(path)
    }, 100)
  }

  // Get the appropriate meter status text
  const getMeterStatusText = () => {
    if (isMeterActive) {
      return "Meter Load Is Active"
    } else {
      return "Meter Load Is InActive"
    }
  }

  // Handle no data scenario
  if (!selectedMeter) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
        <p className="text-lg font-medium">No meter selected</p>
        <p className="text-sm text-muted-foreground">Please add a meter to view data</p>
        <Button
          onClick={() => {
            // Call the global function to open the add meter dialog
            // @ts-ignore
            if (window.openAddMeterDialog) window.openAddMeterDialog()
          }}
          className="mt-4 flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Meter
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 pb-[3px]">
      {/* Current Usage Card - Now below Low Units Warning */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Current Usage
              </CardTitle>
              <CardDescription>Today&apos;s consumption</CardDescription>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center">
              Live
              <span className="h-2 w-2 rounded-full bg-green-500 ml-2 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.7)]"></span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!usageData ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground font-medium">No usage data available</p>
              <p className="text-sm text-muted-foreground">Usage data will appear here when available</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Zap className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Consumption</div>
                    <div className="text-2xl font-bold">{usageData.baseLoad + usageData.peakLoad}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                  <Battery className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-xs text-muted-foreground">Base Load</span>
                  <span className="font-medium">{usageData.baseLoad}</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                  <BatteryMedium className="h-5 w-5 text-orange-500 mb-1" />
                  <span className="text-xs text-muted-foreground">Peak Load</span>
                  <span className="font-medium">{usageData.peakLoad}</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                  <BatteryCharging className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-xs text-muted-foreground">Off-Peak</span>
                  <span className="font-medium">{usageData.offPeakLoad}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Meter Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              Active Power
              <span
                className={`h-2 w-2 rounded-full ml-2 ${selectedMeter.isPowerActive ? "bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.7)]" : "bg-secondary"}`}
              ></span>
            </div>

            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              Meter Active
              <span
                className={`h-2 w-2 rounded-full ml-2 ${
                  selectedMeter.status
                    ? "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.7)]"
                    : "bg-gray-400"
                }`}
              ></span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Label htmlFor="meter-active" className="font-medium text-lg">
              Activate Meter
            </Label>
            <Switch
              id="meter-active"
              checked={isLoadActive}
              //disabled={isToggling}
              onCheckedChange={async () => {
                try {
                  //setIsToggling(true)

                  // Call API to update meter status
                  const response = await API.updateMeterStatus(meterId)

                  if (response.status == true) {
                    if (response.message == "On") setIsLoadActive(true)
                    if (response.message == "Off") setIsLoadActive(false)
                  } else {
                    // If API call fails, revert the switch to its previous state
                    console.error("Failed to update meter status:", response?.message || "Unknown error")
                  }
                } catch (error) {
                  console.error("Error updating meter status:", error)
                } finally {
                  setIsToggling(false)
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reduced gap and added Meter Actions heading - FURTHER REDUCED GAP */}
      <div className="h-0"></div>
      <div className="flex items-center gap-2 px-1 mt-2">
        <Activity className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold">Meter Actions</h3>
      </div>

      {/* New Cards Section */}
      <div className="grid grid-cols-1 gap-4">
        {/* Payments Card */}
        <Card
          className="hover:bg-muted/20 transition-colors cursor-pointer"
          onClick={() => handleNavigation("/billing#electricity-billing")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Payments</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  View your billing history and purchase electricity units.
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Meter Metrics Card */}
        <Card
          className="hover:bg-muted/20 transition-colors cursor-pointer"
          onClick={() => handleNavigation("/metrics#electricity-metrics")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Meter Metrics</h3>
                </div>
                <p className="text-sm text-muted-foreground">Monitor your electricity consumption in real-time.</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Meter Information Card */}
        <Card
          className="hover:bg-muted/20 transition-colors cursor-pointer"
          onClick={() => handleNavigation("/settings#meter-information")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Meter Information</h3>
                </div>
                <p className="text-sm text-muted-foreground">View and update your meter details and preferences.</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
