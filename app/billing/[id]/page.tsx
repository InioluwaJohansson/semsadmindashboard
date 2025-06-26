"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Zap, Calendar, Clock, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useMeter } from "@/context/meter-context"
import * as api from "@/context/Api_Url"

// Download Success Overlay component with PDF animation
function DownloadSuccessOverlay({ show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 1000) // Reduced from 2s to 1s for faster feedback

      return () => clearTimeout(timer) // Clean up the timer
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.3s_ease-in-out]">
      <div className="bg-transparent rounded-lg p-8 shadow-xl max-w-md w-full text-center animate-[slideUp_0.4s_ease-in-out]">
        <div className="mx-auto relative h-20 w-20 mb-4">
          <div className="absolute inset-0 rounded-full bg-green-100/20 dark:bg-green-900/20 animate-[scaleIn_0.5s_ease-in-out]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* PDF Document Icon */}
            <svg
              className="h-10 w-10 text-green-500 dark:text-green-400 animate-[bounceIn_0.5s_ease-in-out_0.3s_both]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M9 15h6"></path>
              <path d="M9 11h6"></path>
              <path d="M9 19h6"></path>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">Download Successful!</h2>
        <p className="text-white dark:text-gray-200 mb-4">Your PDF has been downloaded successfully.</p>
      </div>
    </div>
  )
}

export default function BillingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { billingHistory, selectedMeter } = useMeter()
  const [billing, setBilling] = useState<any>(null)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  
  useEffect(() => {
    // Find the billing data with the matching ID
    const foundBilling = billingHistory.find((bill) => bill.id === params.id)
    if (foundBilling) {
      setBilling(foundBilling)
    }
  }, [params.id, billingHistory])

  if (!billing) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[60vh]">
        <p>Loading billing details...</p>
      </div>
    )
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  // Handle PDF download
  const handleDownloadPDF = async () => {
    // Create a new PDF document
    const doc = new jsPDF()
    var user = await api.getCustomerById(localStorage.getItem("userId").ToInt)
    // Update the PDF generation to use Naira
    // User details
    const userName = user.firstName + " " + user.lastName
    const userEmail = user.email
    const userPhone = user.phoneNumber
    const meterId = selectedMeter.name
    const userAddress = `${selectedMeter.numberLine} ${selectedMeter.street}, ${selectedMeter.city}, ${selectedMeter.state}, Nigeria`

    // Add company logo/header
    doc.setFillColor(52, 52, 219) // Blue header
    doc.rect(0, 0, 210, 40, "F")

    // Add title
    doc.setFontSize(22)
    doc.setTextColor(255, 255, 255)
    doc.text("Smart Electric Metering System (SEMS)", 105, 20, { align: "center" })
    doc.setFontSize(14)
    doc.text("#" + billing.invoiceNumber, 105, 30, { align: "center" })

    // Add billing information
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text("Billing Details", 20, 50)

    doc.setFontSize(10)
    doc.text("Date: " + billing.date, 20, 60)
    doc.text("Time: " + "10:30 AM", 20, 65) // Assuming a time
    doc.text("Meter ID: " + meterId, 20, 70)

    doc.text("Customer Information", 120, 60)
    doc.text("Name: " + userName, 120, 65)
    doc.text("Email: " + userEmail, 120, 70)
    doc.text("Phone: " + userPhone, 120, 75)
    doc.text("Address: " + userAddress, 120, 80)

    // Add consumption details
    doc.setFillColor(240, 240, 240)
    doc.rect(14, 90, 182, 10, "F")
    doc.setFontSize(11)
    doc.setFont(undefined, "bold")
    doc.text("Consumption Details", 20, 97)
    doc.setFont(undefined, "normal")

    const taxes = `#${billing.taxes}`
    const baseCharge = `#${billing.baseCharge}`
    const ratePerKwh = `#${billing.ratePerKwh}`
    const totalAmount = `#${billing.amount}`
    // Create a table for consumption details
    const consumptionBody = [
      ["Total Consumption", billing.consumption],
      ["Rate per kWh", ratePerKwh],
      ["Base Charge", baseCharge],
      ["Taxes", taxes],
      ["Total Amount", totalAmount],
    ]

    // Use autoTable directly instead of doc.autoTable
    autoTable(doc, {
      startY: 105,
      head: [["Description", "Value"]],
      body: consumptionBody,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
    })

    // Get the final Y position after the first table
    const finalY1 = (doc as any).lastAutoTable.finalY || 150

    // Add usage breakdown
    doc.setFillColor(240, 240, 240)
    doc.rect(14, finalY1 + 10, 182, 10, "F")
    doc.setFontSize(11)
    doc.setFont(undefined, "bold")
    doc.text("Usage Breakdown", 20, finalY1 + 17)
    doc.setFont(undefined, "normal")

    const usageBody = billing.usageBreakdown.map((item) => [item.category, item.value + " kWh", item.percentage + "%"])

    // Use autoTable directly again
    autoTable(doc, {
      startY: finalY1 + 25,
      head: [["Category", "Consumption", "Percentage"]],
      body: usageBody,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
    })

    // Add footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text("Thank you for using Smart Electric Metering System.", 105, pageHeight - 30, { align: "center" })
    doc.text("For any inquiries, please contact support@smartelectricmeter.com", 105, pageHeight - 25, {
      align: "center",
    })
    doc.text("© 2025 Smart Electric Metering System. All rights reserved.", 105, pageHeight - 20, { align: "center" })

    // Save the PDF
    doc.save(`${selectedMeter.name}-${billing.invoiceNumber}.pdf`)

    // Show success overlay
    setShowSuccessOverlay(true)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center mb-4 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">Billing Details</h2>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle> #{billing.invoiceNumber}</CardTitle>
              <CardDescription>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {billing.date}
                  <Clock className="h-4 w-4 ml-3 mr-1" />
                  {billing.time || "10:30 AM"}
                </div>
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
              {billing.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div className="text-3xl font-bold">{formatCurrency(billing.amount)}</div>
            <div>
              <Button variant="outline" className="flex" onClick={handleDownloadPDF}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total Consumption</span>
              <span className="text-sm font-medium">{billing.consumption}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Rate per kWh</span>
              <span className="text-sm">{formatCurrency(billing.ratePerKwh)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Base charge</span>
              <span className="text-sm">{formatCurrency(billing.baseCharge)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Taxes</span>
              <span className="text-sm">{billing.taxes}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-medium">{formatCurrency(billing.amount)}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Usage Breakdown</h3>
            <div className="space-y-3">
              {billing.usageBreakdown.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">{item.value.toFixed(2)} kWh</span>
                    <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                    <span className="text-sm">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Success Overlay */}
      <DownloadSuccessOverlay show={showSuccessOverlay} onClose={() => setShowSuccessOverlay(false)} />
    </div>
  )
}
