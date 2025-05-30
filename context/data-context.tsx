"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface DataContextType {
  refreshData: () => void
  isRefreshing: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = () => {
    setIsRefreshing(true)

    // Simulate a refresh delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)

    // You can add actual data refresh logic here
    // For example, refetch data from APIs
  }

  return <DataContext.Provider value={{ refreshData, isRefreshing }}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
