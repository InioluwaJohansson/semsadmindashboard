"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { format, subMonths } from "date-fns"
import { CalendarIcon, Download, BarChart2, AlertCircle } from "lucide-react"
import { useMeter } from "@/context/meter-context"
import { useRouter } from "next/navigation"
import * as api from "@/context/Api_Url"
// Define the data structure as requested
interface MeterReading {
  id: number
  voltageValue: number
  currentValue: number
  consumptionValue: number
  electricityCost: number
  timeValue: Date
}

// API endpoint for meter readings

// Function to fetch meter readings from API
const fetchMeterReadings = async (meterId: number): Promise<MeterReading[] | null> => {
  try {
    // In a real app, you would call your API with the meter ID
    // For now, we'll simulate an API call with a delay
    const response = await api.MeterUnitsData(meterId)
    console.log(response.data)
    if(response.status){
      var transformedMeterUnits = response.data.map((x) => {
        return {
          id: x.id,
          voltageValue: x.voltageValue,
          currentValue: x.currentValue,
          consumptionValue: x.consumptionValue,
          electricityCost: x.electricityCost,
          timeValue: x.timeValue,
        };
      });

      return transformedMeterUnits || null
    }
    // if (!response.ok) throw new Error(`Failed to fetch meter readings: ${response.status}`)
    // return await response.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // For demo purposes, generate random data
    return generateRandomMeterReadings(meterId)
  } catch (error) {
    console.error("Error fetching meter readings:", error)
    return null
  }
}

// Update the filterAndAggregateData function to handle the new timeframe values
const filterAndAggregateData = (readings: MeterReading[], timeframe: string) => {
  if (!readings || readings.length === 0) {
    return []
  }

  // Sort readings by time
  const sortedReadings = [...readings].sort((a, b) => a.timeValue.getTime() - b.timeValue.getTime())

  // Filter data based on timeframe
  const now = new Date()
  let filteredReadings: MeterReading[] = []

  switch (timeframe) {
    case "10s":
      // Last 10 minutes with 10-second intervals
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 10 * 60 * 1000))
      break
    case "1m":
      // Last hour with 1-minute intervals
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 60 * 60 * 1000))
      break
    case "5m":
      // Last 5 hours with 5-minute intervals
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 5 * 60 * 60 * 1000))
      break
    case "15m":
      // Last 15 hours with 15-minute intervals
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 15 * 60 * 60 * 1000))
      break
    case "1h":
      // Last 24 hours with 1-hour intervals
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 24 * 60 * 60 * 1000))
      break
    case "6h":
      // Last 6 days with 6-hour intervals
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))
      break
    case "12h":
      // Last 12 days with 12-hour intervals
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000))
      break
    case "1d":
      // Last 30 days with 1-day intervals
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
      break
    case "1w":
      // Last 12 weeks with 1-week intervals
      filteredReadings = sortedReadings.filter(
        (r) => r.timeValue >= new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000),
      )
      break
    case "1M":
      // Last month
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
      break
    case "6M":
      // Last 6 months
      filteredReadings = sortedReadings.filter(
        (r) => r.timeValue >= new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      )
      break
    default:
      filteredReadings = sortedReadings.filter((r) => r.timeValue >= new Date(now.getTime() - 60 * 60 * 1000))
  }

  // Aggregate data based on timeframe
  return aggregateData(filteredReadings, timeframe)
}

// Function to aggregate data based on timeframe
const aggregateData = (readings: MeterReading[], timeframe: string) => {
  if (!readings || readings.length === 0) {
    return []
  }

  const result: any[] = []
  const timeGroups: Record<
    string,
    {
      voltageSum: number
      currentSum: number
      consumptionSum: number
      costSum: number
      count: number
      firstTime: Date
    }
  > = {}

  // Group data based on timeframe
  readings.forEach((reading) => {
    const date = reading.timeValue
    let key: string

    switch (timeframe) {
      case "10s":
        key = format(date, "HH:mm:ss")
        break
      case "1m":
        key = format(date, "HH:mm")
        break
      case "5m":
        key = format(date, "HH:mm")
        break
      case "15m":
        key = format(date, "HH:mm")
        break
      case "1h":
        key = format(date, "HH:00")
        break
      case "6h":
        key = format(date, "dd MMM HH:00")
        break
      case "12h":
        key = format(date, "dd MMM HH:00")
        break
      case "1d":
        key = format(date, "dd MMM")
        break
      case "1w":
        key = `Week ${Math.floor(date.getDate() / 7) + 1}, ${format(date, "MMM")}`
        break
      case "1M":
        key = format(date, "MMM yyyy")
        break
      case "6M":
        key = format(date, "MMM yyyy")
        break
      default:
        key = format(date, "HH:mm")
    }

    if (!timeGroups[key]) {
      timeGroups[key] = {
        voltageSum: 0,
        currentSum: 0,
        consumptionSum: 0,
        costSum: 0,
        count: 0,
        firstTime: new Date(date),
      }
    }

    timeGroups[key].voltageSum += reading.voltageValue
    timeGroups[key].currentSum += reading.currentValue
    timeGroups[key].consumptionSum += reading.consumptionValue
    timeGroups[key].costSum += reading.electricityCost
    timeGroups[key].count++
  })

  // Convert grouped data to array format
  Object.entries(timeGroups).forEach(([key, group]) => {
    result.push({
      time: key,
      voltage: group.voltageSum / group.count, // Average voltage
      current: group.currentSum / group.count, // Average current
      consumption: group.consumptionSum, // Sum of consumption
      cost: group.costSum, // Sum of cost
      timestamp: group.firstTime, // Keep the timestamp for sorting
    })
  })

  // Sort by timestamp
  result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  return result
}

// Time frame options with full labels for charts - Updated with 1m and 6m
const timeFrameOptions = [
  { value: "10s", label: "10s", fullLabel: "10 seconds" },
  { value: "1m", label: "1m", fullLabel: "1 minute" },
  { value: "5m", label: "5m", fullLabel: "5 minutes" },
  { value: "15m", label: "15m", fullLabel: "15 minutes" },
  { value: "1h", label: "1h", fullLabel: "1 hour" },
  { value: "6h", label: "6h", fullLabel: "6 hours" },
  { value: "12h", label: "12h", fullLabel: "12 hours" },
  { value: "1d", label: "1d", fullLabel: "1 day" },
  { value: "1w", label: "1w", fullLabel: "1 week" },
  { value: "1M", label: "1M", fullLabel: "1 month" },
  { value: "6M", label: "6M", fullLabel: "6 months" },
]

// Time frame options for download - Updated with 1m and 6m
const downloadTimeFrameOptions = [
  { value: "15m", label: "15m", fullLabel: "15 minutes" },
  { value: "1h", label: "1h", fullLabel: "1 hour" },
  { value: "6h", label: "6h", fullLabel: "6 hours" },
  { value: "12h", label: "12h", fullLabel: "12 hours" },
  { value: "1d", label: "1d", fullLabel: "1 day" },
  { value: "1w", label: "1w", fullLabel: "1 week" },
  { value: "1M", label: "1M", fullLabel: "1 month" },
  { value: "6M", label: "6M", fullLabel: "6 months" },
]

// Helper function to get full label for time frame
const getFullTimeFrameLabel = (timeFrame) => {
  const option = timeFrameOptions.find((opt) => opt.value === timeFrame)
  return option ? option.fullLabel : timeFrame
}

// Function to generate dummy data for download
const generateDummyDataForDownload = (metricType, startDate, endDate, timeFrame, meterId) => {
  const data = []
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Default to 1 week ago
  const end = endDate ? new Date(endDate) : new Date() // Default to now

  // Generate random readings for the date range
  const readings = generateRandomMeterReadings(meterId)

  // Filter by date range
  const filteredReadings = readings.filter((reading) => reading.timeValue >= start && reading.timeValue <= end)

  // Aggregate data
  const aggregatedData = aggregateData(filteredReadings, timeFrame)

  // Format for download
  aggregatedData.forEach((item) => {
    const formattedDate = format(item.timestamp, "yyyy-MM-dd HH:mm:ss")

    if (metricType === "consumption") {
      data.push({
        timestamp: formattedDate,
        consumption: item.consumption.toFixed(2) + " kWh",
        voltage: item.voltage.toFixed(1) + " V",
        current: item.current.toFixed(2) + " A",
      })
    } else {
      // cost
      data.push({
        timestamp: formattedDate,
        cost: "₦" + item.cost.toFixed(2),
        rate: "₦0.47/kWh",
        consumption: item.consumption.toFixed(2) + " kWh",
      })
    }
  })

  return data
}

// Function to convert data to CSV and download
const downloadCSV = (data, fileName, metricType, startDate, endDate, timeFrame, meterId, onSuccess) => {
  // Create title and description
  const title = `${metricType === "consumption" ? "Electricity Consumption" : "Electricity Cost"} Report`
  const description = `Data for meter ${meterId} from ${format(startDate, "MMM d, yyyy")} to ${format(endDate, "yyyy-MM-dd")} with ${getFullTimeFrameLabel(timeFrame)} resolution.`

  // Start with metadata
  let csvContent = `${title}
${description}

`

  // Check if data is empty
  if (!data || data.length === 0) {
    csvContent += "No data available for the selected period."

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Generate file name with date
    const today = format(new Date(), "yyyy-MM-dd")
    const fullFileName = `${fileName}_${today}.csv`

    // Download the file
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute("download", fullFileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    if (onSuccess) onSuccess()

    return
  }

  // Get headers from the first object
  const headers = Object.keys(data[0])

  // Add header row
  csvContent += headers.join(",") + "\n"

  // Add data rows
  data.forEach((item) => {
    const row = headers
      .map((header) => {
        // Wrap values with commas in quotes
        const value = item[header]
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value
      })
      .join(",")
    csvContent += row + "\n"
  })

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Generate file name with date
  const today = format(new Date(), "yyyy-MM-dd")
  const fullFileName = `${fileName}_${today}.csv`

  // Create download link
  const link = document.createElement("a")

  // Check if the browser supports the download attribute
  if (navigator.msSaveBlob) {
    // IE10+
    navigator.msSaveBlob(blob, fullFileName)
    if (onSuccess) onSuccess()
  } else {
    // Other browsers
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute("download", fullFileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    if (onSuccess) onSuccess()
  }
}

// Horizontal time frame selector component for charts
function TimeFrameSelector({ value, onChange, options = timeFrameOptions }) {
  const scrollRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [visibleOptions, setVisibleOptions] = useState([])

  // Find the index of the selected option
  const selectedIndex = options.findIndex((opt) => opt.value === value)

  // Update visible options when value changes or hover state changes
  useEffect(() => {
    if (isHovered) {
      // Show all options when hovered
      setVisibleOptions(options)
    } else {
      // Show the selected option and adjacent options when not hovered
      const startIndex = Math.max(0, selectedIndex - 1)
      const endIndex = Math.min(options.length - 1, selectedIndex + 1)

      // Create a new array with just the visible options
      const newVisibleOptions = []
      for (let i = startIndex; i <= endIndex; i++) {
        newVisibleOptions.push(options[i])
      }

      setVisibleOptions(newVisibleOptions)
    }
  }, [isHovered, selectedIndex, options, value])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div
      ref={scrollRef}
      className="flex space-x-1 overflow-x-auto scrollbar-hide pb-1 pr-1 max-w-[120px] transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative" }}
    >
      {visibleOptions.map((option) => (
        <Button
          key={option.value}
          data-value={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          className={cn(
            "px-2 py-1 h-7 text-xs whitespace-nowrap flex-shrink-0",
            value === option.value ? "bg-primary text-primary-foreground" : "bg-background",
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

// Download time frame selector component (separate from chart time frame selector)
function DownloadTimeFrameSelector({ value, onChange, options = downloadTimeFrameOptions }) {
  const scrollRef = useRef(null)

  return (
    <div ref={scrollRef} className="flex flex-wrap gap-1 overflow-x-auto scrollbar-hide pb-1">
      {options.map((option) => (
        <Button
          key={option.value}
          data-value={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          className={cn(
            "px-2 py-1 h-7 text-xs whitespace-nowrap flex-shrink-0",
            value === option.value ? "bg-primary text-primary-foreground" : "bg-background",
          )}
          onClick={() => onChange(option.value)}
        >
          {option.fullLabel}
        </Button>
      ))}
    </div>
  )
}

// Graph header component with horizontal time frame selector
function GraphHeader({ title, description, timeFrame, onTimeFrameChange, options }) {
  return (
    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <TimeFrameSelector value={timeFrame} onChange={onTimeFrameChange} options={options} />
    </div>
  )
}

// Scrollable chart component with enhanced horizontal scrolling
function ScrollableChart({ children, className }) {
  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Handle mouse events for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  // Auto-scroll to the end when component mounts or data changes
  useEffect(() => {
    if (scrollRef.current) {
      // Scroll to the end with a small delay to ensure rendering is complete
      setTimeout(() => {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
      }, 100)
    }
  }, [children])

  return (
    <div
      ref={scrollRef}
      className={`overflow-x-auto scrollbar-hide ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="min-w-full" style={{ width: "200%" }}>
        {children}
      </div>
    </div>
  )
}

// Date picker component
function DatePickerWithPreview({ date, setDate, label }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// No data component
function NoDataDisplay() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] w-full bg-muted/20 rounded-md border border-dashed">
      <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
      <p className="text-muted-foreground font-medium">No data available</p>
      <p className="text-sm text-muted-foreground">There is no data to display for the selected timeframe</p>
    </div>
  )
}

// Memoized chart component to prevent unnecessary re-renders
const MemoizedLineChart = React.memo(
  ({ data, dataKey, color, domain }: { data: any[]; dataKey: string; color: string; domain?: [number, number] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={domain} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          activeDot={{ r: 6 }}
          isAnimationActive={false} // Disable animation for smoother updates
        />
      </LineChart>
    </ResponsiveContainer>
  ),
)

// Memoized bar chart component
const MemoizedBarChart = React.memo(({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
    </BarChart>
  </ResponsiveContainer>
))

// Download Success Overlay component
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
            {/* Excel File Icon */}
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
              <rect x="8" y="12" width="8" height="2"></rect>
              <rect x="8" y="16" width="8" height="2"></rect>
              <path d="M10 8H8"></path>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">Download Successful!</h2>
        <p className="text-white dark:text-gray-200 mb-4">Your CSV file has been downloaded successfully.</p>
      </div>
    </div>
  )
}

// Add this at the beginning of the MetricsPage component
export default function MetricsPage() {
  // Declare topRef using useRef
  const topRef = useRef(null)

  // Get the selected meter from context
  const { selectedMeter, meters } = useMeter()
  const router = useRouter()

  // Redirect to home if there are no meters
  useEffect(() => {
    if (meters.length === 0) {
      router.push("/home")
    }
  }, [meters, router])

  // State for time frames - set default to 10s
  const [consumptionTimeFrame, setConsumptionTimeFrame] = useState("10s")
  const [voltageTimeFrame, setVoltageTimeFrame] = useState("10s")
  const [currentTimeFrame, setCurrentTimeFrame] = useState("10s")
  const [costTimeFrame, setCostTimeFrame] = useState("10s")

  // State for meter readings data
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([])
  const [consumptionData, setConsumptionData] = useState<any[]>([])
  const [voltageData, setVoltageData] = useState<any[]>([])
  const [currentData, setCurrentData] = useState<any[]>([])
  const [costData, setCostData] = useState<any[]>([])

  // Loading states
  const [isLoadingConsumption, setIsLoadingConsumption] = useState(true)
  const [isLoadingVoltage, setIsLoadingVoltage] = useState(true)
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true)
  const [isLoadingCost, setIsLoadingCost] = useState(true)

  // Error states
  const [consumptionError, setConsumptionError] = useState<string | null>(null)
  const [voltageError, setVoltageError] = useState<string | null>(null)
  const [currentError, setCurrentError] = useState<string | null>(null)
  const [costError, setCostError] = useState<string | null>(null)

  // State for download metrics
  const [metricType, setMetricType] = useState("consumption")
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 1 week ago
  const [endDate, setEndDate] = useState(new Date()) // Today
  const [downloadTimeFrame, setDownloadTimeFrame] = useState("1d")

  // State for download success overlay
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)

  // Function to fetch all meter readings data
  const fetchAllMeterReadings = async () => {
    if (!selectedMeter) return

    try {
      const readings = await fetchMeterReadings(selectedMeter.id)
      if (readings) {
        setMeterReadings(readings)

        // Update all charts with the new data
        updateChartData(readings)
      }
    } catch (error) {
      console.error("Error fetching meter readings:", error)
    }
  }

  // Function to update all chart data based on the current timeframes
  const updateChartData = (readings: MeterReading[]) => {
    if (!readings || readings.length === 0) return

    // Update consumption data
    //setIsLoadingConsumption(true)
    try {
      const aggregatedConsumptionData = filterAndAggregateData(readings, consumptionTimeFrame)
      setConsumptionData(aggregatedConsumptionData)
      setConsumptionError(null)
    } catch (error) {
      console.error("Error processing consumption data:", error)
      setConsumptionError("Failed to process consumption data")
      setConsumptionData([])
    } finally {
      setIsLoadingConsumption(false)
    }

    // Update voltage data
    //setIsLoadingVoltage(true)
    try {
      const aggregatedVoltageData = filterAndAggregateData(readings, voltageTimeFrame)
      setVoltageData(aggregatedVoltageData)
      setVoltageError(null)
    } catch (error) {
      console.error("Error processing voltage data:", error)
      setVoltageError("Failed to process voltage data")
      setVoltageData([])
    } finally {
      setIsLoadingVoltage(false)
    }

    // Update current data
    //setIsLoadingCurrent(true)
    try {
      const aggregatedCurrentData = filterAndAggregateData(readings, currentTimeFrame)
      setCurrentData(aggregatedCurrentData)
      setCurrentError(null)
    } catch (error) {
      console.error("Error processing current data:", error)
      setCurrentError("Failed to process current data")
      setCurrentData([])
    } finally {
      setIsLoadingCurrent(false)
    }

    // Update cost data
    //setIsLoadingCost(true)
    try {
      const aggregatedCostData = filterAndAggregateData(readings, costTimeFrame)
      setCostData(aggregatedCostData)
      setCostError(null)
    } catch (error) {
      console.error("Error processing cost data:", error)
      setCostError("Failed to process cost data")
      setCostData([])
    } finally {
      setIsLoadingCost(false)
    }
  }

  // Initial data fetch when component mounts or selected meter changes
  useEffect(() => {
    if (selectedMeter) {
      fetchAllMeterReadings()
    }
  }, [selectedMeter])

  // Set up polling to fetch data every 10 seconds
  useEffect(() => {
    if (!selectedMeter) return

    // Initial fetch
    fetchAllMeterReadings()

    // Set up interval for polling
    // const intervalId = setInterval(() => {
    //   fetchAllMeterReadings()
    // }, 10000) // 10 seconds

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [selectedMeter])

  // Update chart data when timeframes change
  useEffect(() => {
    if (meterReadings.length > 0) {
      updateChartData(meterReadings)
    }
  }, [consumptionTimeFrame, voltageTimeFrame, currentTimeFrame, costTimeFrame])

  // Add this useEffect to listen for the reset-timeframes event
  useEffect(() => {
    // Listen for the reset-timeframes event
    const handleResetTimeframes = () => {
      setConsumptionTimeFrame("10s")
      setVoltageTimeFrame("10s")
      setCurrentTimeFrame("10s")
      setCostTimeFrame("10s")
    }

    window.addEventListener("reset-timeframes", handleResetTimeframes)

    return () => {
      window.removeEventListener("reset-timeframes", handleResetTimeframes)
    }
  }, [])

  // Add this useEffect to scroll charts to the end when data is loaded
  useEffect(() => {
    if (!isLoadingConsumption && !isLoadingVoltage && !isLoadingCurrent && !isLoadingCost) {
      // Small delay to ensure charts are rendered
      setTimeout(() => {
        const chartContainers = document.querySelectorAll(".scrollbar-hide")
        chartContainers.forEach((container) => {
          if (container instanceof HTMLElement) {
            container.scrollLeft = container.scrollWidth
          }
        })
      }, 100)
    }
  }, [
    isLoadingConsumption,
    isLoadingVoltage,
    isLoadingCurrent,
    isLoadingCost,
    consumptionData,
    voltageData,
    currentData,
    costData,
  ])

  // Handle download
  const handleDownload = () => {
    const data = generateDummyDataForDownload(metricType, startDate, endDate, downloadTimeFrame, selectedMeter.id)
    const fileName = `${metricType === "consumption" ? "Electricity_Consumption" : "Electricity_Cost"}_${downloadTimeFrame}`
    downloadCSV(data, fileName, metricType, startDate, endDate, downloadTimeFrame, selectedMeter.name, () => {
      setShowSuccessOverlay(true)
    })
  }

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center h-[200px] w-full">
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
      <p className="text-lg font-medium">Loading data...</p>
    </div>
  )

  // Error indicator component
  const ErrorIndicator = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-[200px] w-full bg-red-50 dark:bg-red-900/20 rounded-md border border-dashed border-red-300 dark:border-red-700">
      <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
      <p className="text-red-700 dark:text-red-400 font-medium">Error loading data</p>
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
    </div>
  )

  return (
    <div className="p-4 pt-0 space-y-3 pb-0">
      {/* Add an ID for scrolling to top */}
      <div id="top" ref={topRef}></div>

      {/* Update the heading in the metrics page */}
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold" id="electricity-metrics">
          Electricity Metrics
        </h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <GraphHeader
            title="Electricity Consumption"
            description="kWh usage over time"
            timeFrame={consumptionTimeFrame}
            onTimeFrameChange={setConsumptionTimeFrame}
            options={timeFrameOptions}
          />
          {isLoadingConsumption ? (
            <LoadingIndicator />
          ) : consumptionError ? (
            <ErrorIndicator message={consumptionError} />
          ) : consumptionData.length === 0 ? (
            <NoDataDisplay />
          ) : (
            <ScrollableChart className="h-[250px]">
              <ChartContainer
                config={{
                  consumption: {
                    label: "Consumption (kWh)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[250px] w-full"
              >
                <MemoizedLineChart data={consumptionData} dataKey="consumption" color="var(--color-consumption)" />
              </ChartContainer>
            </ScrollableChart>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <GraphHeader
            title="Voltage"
            description="Voltage (V) over time"
            timeFrame={voltageTimeFrame}
            onTimeFrameChange={setVoltageTimeFrame}
            options={timeFrameOptions}
          />
          {isLoadingVoltage ? (
            <LoadingIndicator />
          ) : voltageError ? (
            <ErrorIndicator message={voltageError} />
          ) : voltageData.length === 0 ? (
            <NoDataDisplay />
          ) : (
            <ScrollableChart className="h-[250px]">
              <ChartContainer
                config={{
                  voltage: {
                    label: "Voltage (V)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[250px] w-full"
              >
                <MemoizedLineChart
                  data={voltageData}
                  dataKey="voltage"
                  color="var(--color-voltage)"
                  domain={[220, 240]}
                />
              </ChartContainer>
            </ScrollableChart>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <GraphHeader
            title="Current"
            description="Current (A) over time"
            timeFrame={currentTimeFrame}
            onTimeFrameChange={setCurrentTimeFrame}
            options={timeFrameOptions}
          />
          {isLoadingCurrent ? (
            <LoadingIndicator />
          ) : currentError ? (
            <ErrorIndicator message={currentError} />
          ) : currentData.length === 0 ? (
            <NoDataDisplay />
          ) : (
            <ScrollableChart className="h-[250px]">
              <ChartContainer
                config={{
                  current: {
                    label: "Current (A)",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[250px] w-full"
              >
                <MemoizedLineChart data={currentData} dataKey="current" color="var(--color-current)" />
              </ChartContainer>
            </ScrollableChart>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <GraphHeader
            title="Electricity Cost"
            description="Cost in naira over time"
            timeFrame={costTimeFrame}
            onTimeFrameChange={setCostTimeFrame}
            options={timeFrameOptions}
          />
          {isLoadingCost ? (
            <LoadingIndicator />
          ) : costError ? (
            <ErrorIndicator message={costError} />
          ) : costData.length === 0 ? (
            <NoDataDisplay />
          ) : (
            <ScrollableChart className="h-[250px]">
              <ChartContainer
                config={{
                  cost: {
                    label: "Cost (₦)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[250px] w-full"
              >
                <MemoizedBarChart data={costData} dataKey="cost" color="var(--color-cost)" />
              </ChartContainer>
            </ScrollableChart>
          )}
        </CardContent>
      </Card>

      {/* Download Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Download Metrics</CardTitle>
          <CardDescription>Export electricity metrics data as CSV files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Metric Type</Label>
            <RadioGroup value={metricType} onValueChange={setMetricType} className="flex flex-row space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="consumption" id="consumption" />
                <Label htmlFor="consumption">Electricity Consumption</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cost" id="cost" />
                <Label htmlFor="cost">Electricity Cost</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePickerWithPreview date={startDate} setDate={setStartDate} label="Start Date" />
            <DatePickerWithPreview date={endDate} setDate={setEndDate} label="End Date" />
          </div>

          <div className="space-y-2">
            <Label>Select Time Frame</Label>
            <div className="border rounded-md p-3">
              <DownloadTimeFrameSelector
                value={downloadTimeFrame}
                onChange={setDownloadTimeFrame}
                options={downloadTimeFrameOptions}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {metricType === "consumption" ? "Consumption" : "Cost"} data from {format(startDate, "MMM d, yyyy")} to{" "}
                {format(endDate, "MMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                Time resolution: {getFullTimeFrameLabel(downloadTimeFrame)}
              </p>
            </div>
            <Button onClick={handleDownload} className="flex items-center gap-2 ml-4">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Download Success Overlay */}
      <DownloadSuccessOverlay show={showSuccessOverlay} onClose={() => setShowSuccessOverlay(false)} />
    </div>
  )
}
