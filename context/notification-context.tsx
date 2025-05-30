"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useMeter } from "@/context/meter-context"
import * as API from "@/context/Api_Url"

export interface Notification {
  id: string
  title: string
  message: string
  type: "1" | "2" | "3" | "error"
  date: Date
  read: boolean
  meterId?: string
}

interface NotificationContextType {
  notifications: Record<string, Notification[]>
  unreadCount: number
  currentMeterNotifications: Notification[]
  currentMeterUnreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  getNotificationsForMeter: (meterId: string) => Notification[]
  fetchNotificationsForMeter: (meterId: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { selectedMeter } = useMeter()
  const [notifications, setNotifications] = useState<Record<string, Notification[]>>({})

  // Add this function to fetch notifications for a specific meter
  const fetchNotificationsForMeter = async (meterId: string) => {
    try {
      // Fetch notifications from API
      const response = await API.getMeterPrompts(Number.parseInt(meterId, 10))
      if (response.data.status == true) {
        // Transform API data to match our Notification interface
        const transformedNotifications = response.data.data.map((notification) => ({
          id: notification.id.toString(),
          title: notification.title || "Notification",
          message: notification.description || "",
          type: mapNotificationType(notification.type),
          date: new Date(notification.date || Date.now()),
          read: false,
          meterId: meterId,
        }))
        // Update notifications state
        setNotifications((prev) => ({
          ...prev,
          [meterId]: transformedNotifications,
        }))
      } else {
        // If API fails or returns no data, use sample data
        const sampleNotifications = generateSampleNotifications(meterId)
        setNotifications((prev) => ({
          ...prev,
          [meterId]: sampleNotifications,
        }))
      }
    } catch (error) {
      console.error(`Error fetching notifications for meter ${meterId}:`, error)

      // Set fallback data if API fails
      setNotifications((prev) => ({
        ...prev,
        [meterId]: null,
      }))
    }
  }

  // Helper function to map API notification type to our type
  const mapNotificationType = (type: number): 1 | 2 | 3 | "error" => {
    switch (type) {
      case 1:
        return "Payment Successful"
      case 2:
        return "Unit Critical"
      case 3:
        return "Voltage Overload"
      case 4:
        return "error"
      default:
        return "error"
    }
  }

  // Generate sample notifications for a meter (used as fallback)
  const generateSampleNotifications = (meterId: string): Notification[] => {
    return [
      {
        id: `${meterId}-1`,
        title: "Low Units Warning",
        message: `Meter ${meterId} has only 450 kWh units left. Consider purchasing more units soon.`,
        type: "warning",
        date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        meterId: meterId,
      },
      {
        id: `${meterId}-3`,
        title: "Bill Payment Successful",
        message: `Your payment of ₦78.42 for meter ${meterId} was successfully processed.`,
        type: "success",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        meterId: meterId,
      },
    ]
  }

  // Update the unreadCount calculation to count unread notifications for the current meter
  const currentMeterNotifications = notifications[selectedMeter?.id] || []
  const currentMeterUnreadCount = currentMeterNotifications.filter((n) => !n.read).length
  const unreadCount = Object.values(notifications)
    .flat()
    .filter((n) => !n.read).length

  // Add this useEffect to fetch notifications when selected meter changes
  useEffect(() => {
    if (selectedMeter && selectedMeter.id) {
      // Only fetch if we don't already have notifications for this meter
      if (!notifications[selectedMeter.id]) {
        fetchNotificationsForMeter(selectedMeter.id)
      }
    }
  }, [selectedMeter, notifications])

  // Add this useEffect to set up periodic refresh of notifications
  /*useEffect(() => {
    // Set up interval to refresh notifications every minute
    const intervalId = setInterval(() => {
      if (selectedMeter && selectedMeter.id) {
        fetchNotificationsForMeter(selectedMeter.id)
      }
    }, 60000) // 60000 ms = 1 minute

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [selectedMeter])*/

  const addNotification = (notification: Omit<Notification, "id" | "date" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date(),
      read: false,
      meterId: notification.meterId || selectedMeter.id,
    }

    setNotifications((prev) => {
      const meterId = notification.meterId || selectedMeter.id
      return {
        ...prev,
        [meterId]: [newNotification, ...(prev[meterId] || [])],
      }
    })
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updatedNotifications = Object.entries(prev).reduce(
        (acc, [meterId, notifications]) => {
          acc[meterId] = notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification,
          )
          return acc
        },
        {} as Record<string, Notification[]>,
      )
      return updatedNotifications
    })
  }

  // Update the markAllAsRead function to make an API call
  const markAllAsRead = async () => {
    try {
      if (selectedMeter && selectedMeter.id) {
        // Call API to update meter prompts (mark all as read)
        const response = await API.updateMeterPrompts(Number.parseInt(selectedMeter.id, 10))

        // Update UI state regardless of API response to ensure good UX
        setNotifications((prev) => {
          const updatedNotifications = Object.entries(prev).reduce(
            (acc, [meterId, notifications]) => {
              acc[meterId] = notifications.map((notification) => ({ ...notification, read: true }))
              return acc
            },
            {} as Record<string, Notification[]>,
          )
          return updatedNotifications
        })

        // Log success or failure
        if (response && response.status) {
          console.log("Successfully marked all notifications as read")
        } else {
          console.warn("API call to mark notifications as read failed, but UI was updated")
        }
      } else {
        // If no meter is selected, just update the UI
        setNotifications((prev) => {
          const updatedNotifications = Object.entries(prev).reduce(
            (acc, [meterId, notifications]) => {
              acc[meterId] = notifications.map((notification) => ({ ...notification, read: true }))
              return acc
            },
            {} as Record<string, Notification[]>,
          )
          return updatedNotifications
        })
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)

      // Still update UI even if API call fails
      setNotifications((prev) => {
        const updatedNotifications = Object.entries(prev).reduce(
          (acc, [meterId, notifications]) => {
            acc[meterId] = notifications.map((notification) => ({ ...notification, read: true }))
            return acc
          },
          {} as Record<string, Notification[]>,
        )
        return updatedNotifications
      })
    }
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => {
      const updatedNotifications = Object.entries(prev).reduce(
        (acc, [meterId, notifications]) => {
          acc[meterId] = notifications.filter((notification) => notification.id !== id)
          return acc
        },
        {} as Record<string, Notification[]>,
      )
      return updatedNotifications
    })
  }

  const clearAllNotifications = () => {
    setNotifications({})
  }

  const getNotificationsForMeter = (meterId: string) => {
    return notifications[meterId] || []
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        currentMeterNotifications,
        unreadCount,
        currentMeterUnreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        fetchNotificationsForMeter,
        getNotificationsForMeter,
        isLoading: false,
        error: null,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
