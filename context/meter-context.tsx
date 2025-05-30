"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as API from "@/context/Api_Url"

//Define User Data
interface CustomerData {
  id: number
  customerId: string
  firstName: string
  lastName: string
  userName: string
  email: string
  phoneNumber: string
  pictureUrl: string
  getNotificationDto: {
    id: 0
    peakUsageAlerts: boolean
    usageThresholdAlerts: boolean
    usageAlerts: boolean
    billingNotifications: boolean
    pushNotifications: boolean
  }
}
// Define meter data types
export interface MeterData {
  id: string
  name: string
  powerLeft: string
  status?: boolean
  location: string
  threshold: string
  region: string
  city: string
  state: string
  street: string
  numberLine: string
  isPowerActive?: boolean
  isLoadActive?: boolean
  baseLoad?: number
  peakLoad?: number
  offPeakLoad?: number
  getMeterUnitAllocationsDto?: Array<{
    id: string
    meterId: string
    allocatedUnits: number
    consumedUnits: number
    baseLoad: number
    peakLoad: number
    offPeakLoad: number
    unitAllocationStatus: string
    getTransactionDto: {
      date: string
      time: string
      transactionId: string
      rate: number
      baseCharge: number
      taxes: number
      total: number
    }
  }>
}

export interface BillingData {
  id: string
  date: string
  amount: string
  consumption: string
  status: string
  invoiceNumber: string
  paymentMethod: string
  billingPeriod: string
  ratePerKwh: string
  baseCharge: string
  taxes: string
  usageBreakdown: Array<{ category: string; value: number; percentage: number }>
}

export interface CurrentBillingData {
  amount: string
  units: string
  rate: string
  baseCharge: string
  date: string
}

export interface UsageData {
  baseLoad: string
  peakLoad: string
  offPeakLoad: string
  totalConsumption: string
  comparisonPercentage: number
  comparisonDirection: "up" | "down"
}

export interface MeterContextType {
  meters: MeterData[]
  selectedMeter: MeterData | null
  customerData: CustomerData
  setSelectedMeter: (meter: MeterData) => void
  billingHistory: BillingData[]
  currentBilling: CurrentBillingData | null
  usageData: UsageData | null
  isRefreshing: boolean
  refreshData: () => void
  resetTimeframes: () => void
}

const customerDataWhenNull = {
  id: 0,
  customerId: "",
  firstName: "",
  lastName: "",
  userName: "",
  email: "",
  phoneNumber: "",
  pictureUrl: "",
  getNotificationDto: {
    id: 0,
    peakUsageAlerts: false,
    usageThresholdAlerts: false,
    usageAlerts: false,
    billingNotifications: false,
    pushNotifications: false,
  },
}

// Create the context
const MeterContext = createContext<MeterContextType | undefined>(undefined)

export function MeterProvider({ children }: { children: React.ReactNode }) {
  // State for meters and selected meter
  const [meters, setMeters] = useState<MeterData[]>([])
  const [selectedMeter, setSelectedMeter] = useState<MeterData | null>(null)
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null)

  // Other state variables
  const [billingHistory, setBillingHistory] = useState<BillingData[]>([])
  const [currentBilling, setCurrentBilling] = useState<CurrentBillingData | null>(null)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [customerData, setCustomerData] = useState<CustomerData>(customerDataWhenNull)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to fetch customerData from API
  const fetchCustomerDataFromAPI = async () => {
    try {
      const userId = localStorage.getItem("id")
      if (!userId) return

      // Fetch customer from API
      const response = await API.getCustomerById(Number.parseInt(userId, 10))
      if (response.status) {
        // Transform API data to match our MeterData interface
        const customer = response.data
        const transformedCustomer = {
          id: Number.parseInt(customer.id, 10),
          customerId: customer.cuustomerId,
          firstName: customer.firstName,
          lastName: customer.lastName,
          userName: customer.userName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          pictureUrl: customer.pictureUrl,
          getNotificationDto: {
            id: Number.parseInt(customer.getNotificationDto, 10),
            peakUsageAlerts: customer.getNotificationDto.peakUsageAlerts,
            usageThresholdAlerts: customer.getNotificationDto.usageThresholdAlerts,
            usageAlerts: customer.getNotificationDto.usageAlerts,
            billingNotifications: customer.getNotificationDto.billingNotifications,
            pushNotifications: customer.getNotificationDto.pushNotifications,
          },
        }
        setCustomerData(transformedCustomer)
      } else {
        // If API fails or returns no data, use empty data
        console.warn("API returned no customer data")
        setCustomerData(customerDataWhenNull)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      // Use empty data as fallback
      setCustomerData(customerDataWhenNull)
    }
  }

  // Function to fetch meters from API - FIXED to preserve selected meter
  const fetchMetersFromAPI = async () => {
    try {
      const userId = localStorage.getItem("id")
      if (!userId) return

      // Store the current selected meter ID before fetching
      const currentSelectedMeterId = selectedMeterId

      // Fetch meters from API
      const response = await API.getMetersByUserId(Number.parseInt(userId, 10))

      if (response && response.data && Array.isArray(response.data)) {
        // Transform API data to match our MeterData interface
        const transformedMeters = response.data.map((meter: any) => ({
          id: meter.id.toString(),
          name: meter.meterId,
          powerLeft: `${meter.totalUnits - meter.consumedUnits} kWh`,
          status: meter.activeLoad,
          location: "Nigeria", // Default value if not provided by API
          threshold: meter.baseLoad.toString(),
          region: meter.getAddressDto?.region || "",
          city: meter.getAddressDto?.city || "",
          state: meter.getAddressDto?.state || "",
          street: meter.getAddressDto?.street || "",
          numberLine: meter.getAddressDto?.numberLine || "",
          isPowerActive: meter.isActive,
          isLoadActive: meter.activeLoad,
          baseLoad: meter.baseLoad || 0,
          peakLoad: meter.peakLoad || 0,
          offPeakLoad: meter.offPeakLoad || 0,
          getMeterUnitAllocationsDto:
            meter.getMeterUnitAllocationsDto?.map((meterUnit: any) => ({
              id: meterUnit.id.toString(),
              meterId: meterUnit.meterId,
              allocatedUnits: meterUnit.allocatedUnits,
              consumedUnits: meterUnit.consumedUnits,
              baseLoad: meterUnit.baseLoad,
              peakLoad: meterUnit.peakLoad,
              offPeakLoad: meterUnit.offPeakLoad,
              unitAllocationStatus: meterUnit.unitAllocationStatus,
              getTransactionDto: {
                date: meterUnit.getTransactionDto?.date || "",
                time: meterUnit.getTransactionDto?.time || "",
                transactionId: meterUnit.getTransactionDto?.transactionId || "",
                rate: meterUnit.getTransactionDto?.rate || 0,
                baseCharge: meterUnit.getTransactionDto?.baseCharge || 0,
                taxes: meterUnit.getTransactionDto?.taxes || 0,
                total: meterUnit.getTransactionDto?.total || 0,
              },
            })) || [],
        }))

        // Update meters state
        setMeters(transformedMeters)

        // If there's a selected meter ID, find and select that meter in the new data
        if (currentSelectedMeterId && transformedMeters.length > 0) {
          const updatedSelectedMeter = transformedMeters.find((meter) => meter.id === currentSelectedMeterId)

          if (updatedSelectedMeter) {
            // Update the selected meter with the new data while preserving the ID
            setSelectedMeter(updatedSelectedMeter)
          }
          // Only set to first meter if no meter is currently selected
          else if (!selectedMeter) {
            setSelectedMeter(transformedMeters[0])
            setSelectedMeterId(transformedMeters[0].id)
          }
        }
        // If no meter was previously selected and we have meters, select the first one
        else if (transformedMeters.length > 0 && !selectedMeter) {
          setSelectedMeter(transformedMeters[0])
          setSelectedMeterId(transformedMeters[0].id)
        }
      } else {
        // If API fails or returns no data, use empty array
        console.warn("API returned no meter data")

        // Only update meters if we don't have any
        if (meters.length === 0) {
          setMeters([])
          setSelectedMeter(null)
          setSelectedMeterId(null)
        }
      }
    } catch (error) {
      console.error("Error fetching meters:", error)

      // Only update meters if we don't have any
      if (meters.length === 0) {
        setMeters([])
        setSelectedMeter(null)
        setSelectedMeterId(null)
      }
    }
  }

  // New function to fetch billing history from API
  const fetchBillingHistoryFromAPI = async (meterId: string) => {
    try {
      // Call your API endpoint to get billing history
      const response = await API.getMeterUnitAllocationById(Number.parseInt(meterId, 10))

      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Transform API data to match our BillingData interface
        const transformedBillingHistory = response.data.map((bill: any) => ({
          id: bill.id.toString(),
          date: new Date(bill.getTransactionDto.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          amount: `₦${bill.getTransactionDto.total.toFixed(2)}`,
          consumption: `${bill.allocatedUnits} kWh`,
          status: bill.unitAllocationStatus,
          invoiceNumber: bill.getTransactionDto.transactionId,
          paymentMethod: "MasterCard",
          billingPeriod: new Date(bill.getTransactionDto.time).toLocaleTimeString("en-US"),
          ratePerKwh: `₦${bill.getTransactionDto.rate.toFixed(2)}`,
          baseCharge: `₦${bill.getTransactionDto.baseCharge.toFixed(2)}`,
          taxes: `₦${bill.getTransactionDto.taxes.toFixed(2)}`,
          usageBreakdown: [
            {
              category: "Base Load",
              value: bill.baseLoad,
              percentage: ((100 * bill.baseLoad) / (bill.baseLoad + bill.peakLoad + bill.offPeakLoad)).toFixed(2),
            },
            {
              category: "Peak Load",
              value: bill.peakLoad,
              percentage: ((100 * bill.peakLoad) / (bill.baseLoad + bill.peakLoad + bill.offPeakLoad)).toFixed(2),
            },
            {
              category: "Off-Peak",
              value: bill.offPeakLoad,
              percentage: ((100 * bill.offPeakLoad) / (bill.baseLoad + bill.peakLoad + bill.offPeakLoad)).toFixed(2),
            },
          ],
        }))
        return transformedBillingHistory
      } else {
        // If API fails, return empty array
        console.warn("API returned no billing history data")
        return []
      }
    } catch (error) {
      console.error("Error fetching billing history:", error)
      // Return empty array
      return []
    }
  }

  // New function to fetch current billing from API
  const fetchCurrentBillingFromAPI = async (meterId: string) => {
    try {
      // Call your API endpoint to get current billing
      const response = await API.getMeterUnitAllocationById(Number.parseInt(meterId, 10))

      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Transform API data to match our CurrentBillingData interface
        let dataToUse
        const activeList = response.data
          .filter((item: any) => item.unitAllocationStatus === "Active")
          .sort((a: any, b: any) => b.id - a.id)
        const pendingList = response.data
          .filter((item: any) => item.unitAllocationStatus === "Pending")
          .sort((a: any, b: any) => b.id - a.id)
        const inActiveList = response.data
          .filter((item: any) => item.unitAllocationStatus === "Inactive")
          .sort((a: any, b: any) => b.id - a.id)

        if (activeList && activeList.length > 0) dataToUse = activeList[0]
        else if (pendingList && pendingList.length > 0) dataToUse = pendingList[0]
        else if (inActiveList && inActiveList.length > 0) dataToUse = inActiveList[0]
        else return null // No data found

        const generatedData = {
          amount: `₦${dataToUse.getTransactionDto.total.toFixed(2)}`,
          units: `${dataToUse.allocatedUnits} kWh`,
          rate: `₦${dataToUse.getTransactionDto.rate.toFixed(2)}`,
          baseCharge: `₦${dataToUse.getTransactionDto.baseCharge.toFixed(2)}`,
          date: new Date(dataToUse.getTransactionDto.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        }
        return generatedData
      } else {
        // If API fails, return null
        console.warn("API returned no current billing data")
        return null
      }
    } catch (error) {
      console.error("Error fetching current billing:", error)
      // Return null
      return null
    }
  }

  // New function to fetch usage data from API
  const fetchUsageDataFromAPI = async (meterId: string) => {
    try {
      // Call your API endpoint to get meter usage data
      const response = await API.getMeterById(Number.parseInt(meterId, 10))

      if (response && response.data) {
        const meterData = response.data
        let baseLoadData = 0,
          peakLoadData = 0,
          offPeakLoadData = 0,
          totalConsumptionData = 0

        // Find the active allocation if it exists
        if (
          meterData.getMeterUnitAllocationsDto &&
          Array.isArray(meterData.getMeterUnitAllocationsDto) &&
          meterData.getMeterUnitAllocationsDto.length > 0
        ) {
          const activeList = meterData.getMeterUnitAllocationsDto
            .filter((item: any) => item.unitAllocationStatus === "Active")
            .sort((a: any, b: any) => b.id - a.id)

          const pendingList = meterData.getMeterUnitAllocationsDto
            .filter((item: any) => item.unitAllocationStatus === "Pending")
            .sort((a: any, b: any) => b.id - a.id)

          const inActiveList = meterData.getMeterUnitAllocationsDto
            .filter((item: any) => item.unitAllocationStatus === "Inactive")
            .sort((a: any, b: any) => b.id - a.id)

          if (activeList && activeList.length > 0) {
            const arrlist = activeList[0]
            baseLoadData = arrlist.baseLoad
            peakLoadData = arrlist.peakLoad
            offPeakLoadData = arrlist.offPeakLoad
            totalConsumptionData = arrlist.consumedUnits
          } else if (pendingList && pendingList.length > 0) {
            const penlist = pendingList[0]
            baseLoadData = penlist.baseLoad
            peakLoadData = penlist.peakLoad
            offPeakLoadData = penlist.offPeakLoad
            totalConsumptionData = penlist.consumedUnits
          } else if (inActiveList && inActiveList.length > 0) {
            const arrlist = inActiveList[0]
            baseLoadData = arrlist.baseLoad
            peakLoadData = arrlist.peakLoad
            offPeakLoadData = arrlist.offPeakLoad
            totalConsumptionData = arrlist.consumedUnits
          }
        }

        // If no data was found, return null
        if (baseLoadData === 0 && peakLoadData === 0 && offPeakLoadData === 0 && totalConsumptionData === 0) {
          return null
        }

        // Calculate comparison percentage safely
        const totalLoad = baseLoadData + peakLoadData + offPeakLoadData
        const comparisonPercentage =
          totalLoad > 0 ? Math.round(((peakLoadData + offPeakLoadData) / totalLoad) * 100) : 0

        return {
          totalConsumption: `${totalConsumptionData.toFixed(2)} kWh`,
          baseLoad: `${baseLoadData.toFixed(1)} kWh`,
          peakLoad: `${peakLoadData.toFixed(1)} kWh`,
          offPeakLoad: `${offPeakLoadData.toFixed(1)} kWh`,
          comparisonPercentage: comparisonPercentage,
          comparisonDirection: comparisonPercentage > 50 ? "up" : "down",
        }
      } else {
        // If API fails, return null
        console.warn("API returned no usage data")
        return null
      }
    } catch (error) {
      console.error("Error fetching usage data:", error)
      // Return null
      return null
    }
  }

  // Update the refreshData function to use all API functions
  const refreshData = async () => {
    setIsRefreshing(true)

    try {
      // Fetch meters from API - this will preserve the selected meter
      await fetchMetersFromAPI()

      // Also update billing history and usage data for the selected meter
      if (selectedMeter) {
        const billingData = await fetchBillingHistoryFromAPI(selectedMeter.id)
        setBillingHistory(billingData)

        const currentBillingData = await fetchCurrentBillingFromAPI(selectedMeter.id)
        setCurrentBilling(currentBillingData)

        const usageDataResult = await fetchUsageDataFromAPI(selectedMeter.id)
        setUsageData(usageDataResult)

        var userId = Number.parseInt(localStorage.getItem("id"))
        const customerDataResult = await fetchCustomerDataFromAPI(userId)
        setCustomerData(customerDataResult)
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Modified setSelectedMeter function to also update selectedMeterId
  const handleSetSelectedMeter = (meter: MeterData) => {
    setSelectedMeter(meter)
    setSelectedMeterId(meter.id)

    // When a meter is selected, fetch its specific data
    const fetchMeterSpecificData = async () => {
      if (meter) {
        try {
          const billingData = await fetchBillingHistoryFromAPI(meter.id)
          setBillingHistory(billingData)

          const currentBillingData = await fetchCurrentBillingFromAPI(meter.id)
          setCurrentBilling(currentBillingData)

          const usageDataResult = await fetchUsageDataFromAPI(meter.id)
          setUsageData(usageDataResult)
        } catch (error) {
          console.error("Error fetching meter-specific data:", error)
        }
      }
    }

    fetchMeterSpecificData()
  }

  useEffect(() => {
    fetchCustomerDataFromAPI()
    const intervalId = setInterval(() => {
      fetchCustomerDataFromAPI()
    }, 30000) // 60000 ms = 1 minute

    return () => clearInterval(intervalId)
  }, [])

  // Add this useEffect to fetch meters when component mounts and set up periodic refresh
  useEffect(() => {
    // Initial fetch
    fetchMetersFromAPI()

    // Set up interval to refresh data every minute
    const intervalId = setInterval(() => {
      // Only refresh meters data, not the selected meter
      const refreshDataWithoutChangingSelectedMeter = async () => {
        try {
          const userId = localStorage.getItem("id")
          if (!userId) return

          // Store the current selected meter ID before fetching
          const currentSelectedMeterId = selectedMeterId

          // Fetch meters from API
          const response = await API.getMetersByUserId(Number.parseInt(userId, 10))

          if (response && response.data && Array.isArray(response.data)) {
            // Transform API data to match our MeterData interface
            const transformedMeters = response.data.map((meter: any) => ({
              id: meter.id.toString(),
              name: meter.meterId,
              powerLeft: `${meter.totalUnits - meter.consumedUnits} kWh`,
              status: meter.activeLoad,
              location: "Nigeria", // Default value if not provided by API
              threshold: meter.baseLoad.toString(),
              region: meter.getAddressDto?.region || "",
              city: meter.getAddressDto?.city || "",
              state: meter.getAddressDto?.state || "",
              street: meter.getAddressDto?.street || "",
              numberLine: meter.getAddressDto.numberLine || "",
              isPowerActive: meter.isActive,
              isLoadActive: meter.activeLoad,
              baseLoad: meter.baseLoad || 0,
              peakLoad: meter.peakLoad || 0,
              offPeakLoad: meter.offPeakLoad || 0,
              getMeterUnitAllocationsDto:
                meter.getMeterUnitAllocationsDto?.map((meterUnit: any) => ({
                  id: meterUnit.id.toString(),
                  meterId: meterUnit.meterId,
                  allocatedUnits: meterUnit.allocatedUnits,
                  consumedUnits: meterUnit.consumedUnits,
                  baseLoad: meterUnit.baseLoad,
                  peakLoad: meterUnit.peakLoad,
                  offPeakLoad: meterUnit.offPeakLoad,
                  unitAllocationStatus: meterUnit.unitAllocationStatus,
                  getTransactionDto: {
                    date: meterUnit.getTransactionDto?.date || "",
                    time: meterUnit.getTransactionDto?.time || "",
                    transactionId: meterUnit.getTransactionDto?.transactionId || "",
                    rate: meterUnit.getTransactionDto?.rate || 0,
                    baseCharge: meterUnit.getTransactionDto?.baseCharge || 0,
                    taxes: meterUnit.getTransactionDto?.taxes || 0,
                    total: meterUnit.getTransactionDto?.total || 0,
                  },
                })) || [],
            }))

            // Update meters state
            setMeters(transformedMeters)

            // If there's a selected meter ID, find and update that meter in the new data
            if (currentSelectedMeterId && transformedMeters.length > 0) {
              const updatedSelectedMeter = transformedMeters.find((meter) => meter.id === currentSelectedMeterId)

              if (updatedSelectedMeter) {
                // Update the selected meter with the new data while preserving the ID
                setSelectedMeter(updatedSelectedMeter)

                // Also update the meter-specific data
                const billingData = await fetchBillingHistoryFromAPI(updatedSelectedMeter.id)
                setBillingHistory(billingData)

                const currentBillingData = await fetchCurrentBillingFromAPI(updatedSelectedMeter.id)
                setCurrentBilling(currentBillingData)

                const usageDataResult = await fetchUsageDataFromAPI(updatedSelectedMeter.id)
                setUsageData(usageDataResult)

                /*var userId = Number.parseInt(localStorage.getItem("id"))
                const customerDataResult = await fetchCustomerDataFromAPI(userId)
                setCustomerData(customerDataResult)*/
              }
            }
          }
        } catch (error) {
          console.error("Error in automatic refresh:", error)
        }
      }
      
      refreshDataWithoutChangingSelectedMeter()
    }, 30000) // 60000 ms = 1 minute

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [selectedMeterId]) // Add selectedMeterId as dependency to ensure we always have the latest value

  // Update data when selected meter changes
  useEffect(() => {
    const updateMeterData = async () => {
      if (selectedMeter) {
        try {
          // Fetch all data in parallel
          const [billingData, currentBillingData, usageDataResult] = await Promise.all([
            fetchBillingHistoryFromAPI(selectedMeter.id),
            fetchCurrentBillingFromAPI(selectedMeter.id),
            fetchUsageDataFromAPI(selectedMeter.id),
          ])
          setBillingHistory(billingData)
          setCurrentBilling(currentBillingData)
          setUsageData(usageDataResult)
        } catch (error) {
          console.error("Error updating meter data:", error)
          // Use empty data if API calls fail
          setBillingHistory([])
          setCurrentBilling(null)
          setUsageData(null)
        }
      }
    }

    updateMeterData()
  }, [selectedMeter])

  const resetTimeframes = () => {
    // This function will be called when a meter is selected
    // It will be used to reset timeframes in the metrics page
    // The actual implementation will be in the metrics page
    // We're just providing the function through context

    // Dispatch a custom event that the metrics page can listen for
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("reset-timeframes"))
    }
  }

  return (
    <MeterContext.Provider
      value={{
        meters: meters,
        selectedMeter: selectedMeter,
        setSelectedMeter: handleSetSelectedMeter,
        customerData,
        billingHistory,
        currentBilling,
        usageData,
        isRefreshing,
        refreshData,
        resetTimeframes,
      }}
    >
      {children}
    </MeterContext.Provider>
  )
}

// Custom hook to use the meter context
export function useMeter() {
  const context = useContext(MeterContext)
  if (context === undefined) {
    throw new Error("useMeter must be used within a MeterProvider")
  }
  return context
}
