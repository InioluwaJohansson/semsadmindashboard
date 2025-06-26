"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Zap, ShoppingCart, Check, History } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useMeter } from "@/context/meter-context"
import { ErrorOverlay } from "@/components/error-overlay"
import { useData } from "@/context/data-context"
import * as API from "@/context/Api_Url"

// Define the API endpoint for purchasing units
const PURCHASE_UNITS_API = API.PURCHASE_UNITS_URL

// Define the interface for the purchase units request
interface PurchaseUnitsRequest {
  meterId: string
  userId: number
  units: number
  paymentDetails: {
    cardNumber: string
    expiryDate: string
    cvv: string
  }
}

export default function BillingPage() {
  // Add a ref for scrolling to top
  const topRef = useRef(null)
  const { refreshData } = useData()

  // Get data directly from the meter context without renaming
  const { selectedMeter, billingHistory, currentBilling } = useMeter()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [units, setUnits] = useState<number>(0)
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState({
    units: "",
    cardNumber: "",
    validThru: "",
    cvv: "",
  })
  const [cardNumber, setCardNumber] = useState("")
  const [validThru, setValidThru] = useState("")
  const [cvv, setCvv] = useState("")

  // Error overlay state
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Unit price state
  const [unitPrice, setUnitPrice] = useState<number>(0.47)
  const [baseCharge, setBaseCharge] = useState<number>(0)
  const [taxes, setTaxes] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate total amount whenever units change
  useEffect(() => {
    if (unitPrice && baseCharge && taxes) {
      const unitCost = units * unitPrice
      const taxAmount = (unitCost * taxes) / 100
      setTotalAmount(unitCost + taxAmount + baseCharge)
    }
  }, [units, unitPrice, baseCharge, taxes])

  // Fetch unit price data
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setIsLoading(true)
        const priceData = await API.getPrices()
        if (priceData && priceData.data) {
          setUnitPrice(priceData.data.rate || 0.47)
          setBaseCharge(priceData.data.baseCharge || 0)
          setTaxes(priceData.data.taxes || 0)
          console.log()
        }
      } catch (err) {
        console.error("Failed to fetch unit price data:", err)
        // Use default values if API fails
        setUnitPrice(0.47)
        setBaseCharge(0)
        setTaxes(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceData()

    /*const intervalId = setInterval(() => {
      fetchPriceData()
    }, 60000) // 10000 ms = 10 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)*/
  }, [])

  function formatAmount(value: number | string): string {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-US");
  }
  // Validate form fields
  const validateForm = () => {
    const errors = {
      units: "",
      cardNumber: "",
      validThru: "",
      cvv: "",
    }

    let isValid = true

    // Validate units
    if (!units || units <= 0) {
      errors.units = "Please enter a valid number of units"
      isValid = false
    }

    // Validate card number (16 digits)
    if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
      errors.cardNumber = "Please enter a valid 16-digit card number"
      isValid = false
    }

    // Validate expiry date (MM/YY format)
    if (!validThru || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(validThru)) {
      errors.validThru = "Please enter a valid date (MM/YY)"
      isValid = false
    }

    // Validate CVV (3-4 digits)
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      errors.cvv = "Please enter a valid CVV"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Method to show error overlay
  const displayErrorOverlay = (message: string) => {
    setErrorMessage(message)
    setShowError(true)
  }

  // Handle form submission - Updated to be asynchronous
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsProcessing(true)

      try {
        // Get user ID from localStorage
        const userId = localStorage.getItem("id")
        if (!userId) {
          throw new Error("User ID not found. Please log in again.")
        }

        // Prepare the request data
        const requestData: PurchaseUnitsRequest = {
          meterId: selectedMeter.id,
          userId: Number.parseInt(userId, 10),
          units: units,
          paymentDetails: {
            cardNumber: cardNumber,
            expiryDate: validThru,
            cvv: cvv,
          },
        }

        // Make the API call
        const response = await API.createMeterUnitAllocation(selectedMeter.id,units)
        if(response.status){
          setIsProcessing(false)
          setIsSuccess(true)

          // Refresh data to update billing history
          refreshData()
        }
        // Check if the response is successful
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to purchase units")
        }

        // Process successful response


        // Show success state
        

        // After showing success message, close dialog and reset form
        setTimeout(() => {
          setIsSuccess(false)
          setIsDialogOpen(false)

          // Reset form
          setUnits(0)
          setCardNumber("")
          setValidThru("")
          setCvv("")
        }, 2000)
      } catch (err) {
        setIsProcessing(false)

        // For demo purposes, show success anyway (remove in production)
        if (process.env.NODE_ENV === "development") {
          setIsSuccess(true)
          setTimeout(() => {
            setIsSuccess(false)
            setIsDialogOpen(false)
            setUnits(0)
            setCardNumber("")
            setValidThru("")
            setCvv("")
          }, 2000)
          return
        }

        displayErrorOverlay(err instanceof Error ? err.message : "Payment processing failed. Please try again.")
      }
    }
  }

  const handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setUnits(value)
    if (value > 0) {
      setFormErrors((prev) => ({ ...prev, units: "" }))
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16)
    setCardNumber(value)
    if (/^\d{16}$/.test(value)) {
      setFormErrors((prev) => ({ ...prev, cardNumber: "" }))
    }
  }

  const handleValidThruChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")

    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4)
    }

    setValidThru(value)
    if (/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
      setFormErrors((prev) => ({ ...prev, validThru: "" }))
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setCvv(value)
    if (/^\d{3,4}$/.test(value)) {
      setFormErrors((prev) => ({ ...prev, cvv: "" }))
    }
  }

  // Show loading state if data is loading
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[60vh]">
        <div className="flex space-x-2 mb-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-4 w-4 rounded-full bg-primary animate-pulse opacity-0"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: "1s",
                animationIterationCount: "infinite",
              }}
            />
          ))}
        </div>
        <p className="text-lg font-medium">Loading billing data...</p>
      </div>
    )
  }

  // Show Buy Units button if no billing data is available
  if (!currentBilling || !billingHistory || billingHistory.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold mb-2">No Billing Data Available</h2>
          <p className="text-muted-foreground mb-6 sm">
            You haven't purchased any units yet. Get started by buying your first units.
          </p>
          <div className="flex align-center justify-center">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2 px-3 py-4 text-sm"
              size="sm"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Buy Units
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Purchase electricity units to power your meter and track your consumption.
          </p>
        </div>

        {/* Buy Units Dialog - Include the dialog here too */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!isProcessing && !isSuccess) {
              setIsDialogOpen(open)
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="flex space-x-2 mb-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn("h-4 w-4 rounded-full bg-primary", "animate-pulse", "opacity-0")}
                      style={{
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: "1.5s",
                        animationIterationCount: "infinite",
                      }}
                    />
                  ))}
                </div>
                <p className="text-lg font-medium">Processing</p>
              </div>
            )}

            {isSuccess && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="relative h-16 w-16 mb-2">
                  <svg
                    className="animate-[spin_2s_ease-in-out_1]"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-green-500"
                      strokeDasharray="283"
                      strokeDashoffset="0"
                      style={{
                        animation: "circle-animation 1s ease-in-out forwards",
                      }}
                    />
                  </svg>
                  <Check
                    className="absolute inset-0 m-auto h-8 w-8 text-green-500 opacity-0"
                    style={{
                      animation: "check-animation 1s ease-in-out 1s forwards",
                    }}
                  />
                </div>
                <p className="text-lg font-medium text-green-500">Payment Successful</p>
              </div>
            )}

            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Buy Units
              </DialogTitle>
              <DialogDescription>Enter your payment details to purchase electricity units.</DialogDescription>
            </DialogHeader>

            <form autoComplete="off">
              <div className="grid gap-4 py-4">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Price per unit</span>
                    <span className="text-sm font-medium">₦{unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Base Charge</span>
                    <span className="text-sm font-medium">₦{formatAmount(baseCharge.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Taxes</span>
                    <span className="text-sm">{taxes}%</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Amount</span>
                    <span className="text-sm font-bold">₦{formatAmount(totalAmount.toFixed(2))}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">No of Units</Label>
                  <Input
                    id="units"
                    type="number"
                    placeholder="Enter number of units"
                    value={units || ""}
                    onChange={handleUnitsChange}
                    required
                    min="1"
                    className={formErrors.units ? "border-red-500" : ""}
                    autoComplete="off"
                  />
                  {formErrors.units && <p className="text-sm text-red-500">{formErrors.units}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    required
                    className={formErrors.cardNumber ? "border-red-500" : ""}
                    autoComplete="off"
                  />
                  {formErrors.cardNumber && <p className="text-sm text-red-500">{formErrors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valid-thru">Valid Thru</Label>
                    <Input
                      id="valid-thru"
                      placeholder="MM/YY"
                      value={validThru}
                      onChange={handleValidThruChange}
                      required
                      className={formErrors.validThru ? "border-red-500" : ""}
                      autoComplete="off"
                    />
                    {formErrors.validThru && <p className="text-sm text-red-500">{formErrors.validThru}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="password"
                      placeholder="123"
                      value={cvv}
                      onChange={handleCvvChange}
                      required
                      className={formErrors.cvv ? "border-red-500" : ""}
                      autoComplete="off"
                    />
                    {formErrors.cvv && <p className="text-sm text-red-500">{formErrors.cvv}</p>}
                  </div>
                </div>

                {/* Add hidden fields for meter ID and user ID */}
                <input type="hidden" name="meterId" value={selectedMeter.id} />
                <input type="hidden" name="userId" value={localStorage.getItem("id") || ""} />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  onClick={handleSubmit}
                  disabled={isProcessing || isSuccess}
                >
                  <CreditCard className="h-4 w-4" />
                  Proceed
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="p-4 pt-0 space-y-3 pb-[3px]">
      {/* Add an ID for scrolling to top */}
      <div id="top" ref={topRef}></div>

      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold" id="electricity-billing">
          Electricity Billing
        </h2>
      </div>

      <Card className="bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Current Active Unit</CardTitle>
              <CardDescription>Paid on {currentBilling?.date}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
              Paid
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{currentBilling?.amount}</div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total Units</span>
              <span className="text-sm font-medium">{currentBilling?.units}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Rate per kWh</span>
              <span className="text-sm">{formatAmount(currentBilling?.rate)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Base charge</span>
              <span className="text-sm">{formatAmount(currentBilling?.baseCharge)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-medium">{formatAmount(currentBilling?.amount)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Buy Units
          </Button>
        </CardFooter>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Billing History</h2>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {billingHistory.length > 0 ? (
              billingHistory.map((bill, i) => (
                <Link href={`/billing/${bill.id}`} key={i} className="block">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                    <div>
                      <div className="font-medium">{bill.date}</div>
                      <div className="text-sm text-muted-foreground">#{bill.invoiceNumber}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">{bill.consumption}</div>
                      <div className="font-medium">{formatAmount(bill.amount)}</div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">No billing history available</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Energy Saving Tips</CardTitle>
          <CardDescription>Reduce your electricity bill</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Use LED bulbs instead of incandescent lighting",
            "Unplug electronics when not in use to avoid phantom power",
            "Consider upgrading to energy-efficient appliances",
          ].map((tip, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Buy Units Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isProcessing && !isSuccess) {
            setIsDialogOpen(open)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="flex space-x-2 mb-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn("h-4 w-4 rounded-full bg-primary", "animate-pulse", "opacity-0")}
                    style={{
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: "1.5s",
                      animationIterationCount: "infinite",
                    }}
                  />
                ))}
              </div>
              <p className="text-lg font-medium">Processing</p>
            </div>
          )}

          {isSuccess && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="relative h-16 w-16 mb-2">
                <svg
                  className="animate-[spin_2s_ease-in-out_1]"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-green-500"
                    strokeDasharray="283"
                    strokeDashoffset="0"
                    style={{
                      animation: "circle-animation 1s ease-in-out forwards",
                    }}
                  />
                </svg>
                <Check
                  className="absolute inset-0 m-auto h-8 w-8 text-green-500 opacity-0"
                  style={{
                    animation: "check-animation 1s ease-in-out 1s forwards",
                  }}
                />
              </div>
              <p className="text-lg font-medium text-green-500">Payment Successful</p>
            </div>
          )}

          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Buy Units
            </DialogTitle>
            <DialogDescription>Enter your payment details to purchase electricity units.</DialogDescription>
          </DialogHeader>

          <form autoComplete="off">
            <div className="grid gap-4 py-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Price per unit</span>
                  <span className="text-sm font-medium">₦{formatAmount(unitPrice.toFixed(2))}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Base Charge</span>
                  <span className="text-sm font-medium">₦{formatAmount(baseCharge.toFixed(2))}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Taxes</span>
                  <span className="text-sm">{taxes}%</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Amount</span>
                  <span className="text-sm font-bold">₦{formatAmount(totalAmount.toFixed(2))}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="units">No of Units</Label>
                <Input
                  id="units"
                  type="number"
                  placeholder="Enter number of units"
                  value={units || ""}
                  onChange={handleUnitsChange}
                  required
                  min="1"
                  className={formErrors.units ? "border-red-500" : ""}
                  autoComplete="off"
                />
                {formErrors.units && <p className="text-sm text-red-500">{formErrors.units}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                  className={formErrors.cardNumber ? "border-red-500" : ""}
                  autoComplete="off"
                />
                {formErrors.cardNumber && <p className="text-sm text-red-500">{formErrors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid-thru">Valid Thru</Label>
                  <Input
                    id="valid-thru"
                    placeholder="MM/YY"
                    value={validThru}
                    onChange={handleValidThruChange}
                    required
                    className={formErrors.validThru ? "border-red-500" : ""}
                    autoComplete="off"
                  />
                  {formErrors.validThru && <p className="text-sm text-red-500">{formErrors.validThru}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    required
                    className={formErrors.cvv ? "border-red-500" : ""}
                    autoComplete="off"
                  />
                  {formErrors.cvv && <p className="text-sm text-red-500">{formErrors.cvv}</p>}
                </div>
              </div>

              {/* Add hidden fields for meter ID and user ID */}
              <input type="hidden" name="meterId" value={selectedMeter.id} />
              <input type="hidden" name="userId" value={localStorage.getItem("id") || ""} />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                onClick={handleSubmit}
                disabled={isProcessing || isSuccess}
              >
                <CreditCard className="h-4 w-4" />
                Proceed
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Error Overlay */}
      <ErrorOverlay
        show={showError}
        message={errorMessage}
        title="Payment Failed"
        onClose={() => setShowError(false)}
      />
    </div>
  )
}
