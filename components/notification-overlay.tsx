"use client"
import { Bell, X, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/context/notification-context"
import { useMeter } from "@/context/meter-context"
import React from "react"

interface NotificationOverlayProps {
  show: boolean
  onClose: () => void
}

export function NotificationOverlay({ show, onClose }: NotificationOverlayProps) {
  const {
    currentMeterNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    fetchNotificationsForMeter,
    isLoading,
    error,
  } = useNotifications()

  const { selectedMeter } = useMeter()

  // Refresh notifications when the overlay is shown
  React.useEffect(() => {
    if (show && selectedMeter && selectedMeter.id) {
      const intervalId = setInterval(() => {
        //fetchMetersFromAPI()
        fetchNotificationsForMeter(selectedMeter.id)
      }, 30000)

      // Add cleanup function to clear the interval
      return () => clearInterval(intervalId)
    }
  }, [show, selectedMeter, fetchNotificationsForMeter])

  if (!show) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "Unit Critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "Payment Successful":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "Voltage Overload":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
    }
  }

  const getTimeAgo = (date: Date) => {
    // Simple function to format time ago without external dependency
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffHour = Math.round(diffMin / 60)
    const diffDay = Math.round(diffHour / 24)

    if (diffSec < 60) return `${diffSec} seconds ago`
    if (diffMin < 60) return `${diffMin} minutes ago`
    if (diffHour < 24) return `${diffHour} hours ago`
    return `${diffDay} days ago`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md animate-[slideUp_0.3s_ease-in-out]">
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CardDescription>Notifications for {selectedMeter ? selectedMeter.name : "your meter"}</CardDescription>
          </CardHeader>

          <CardContent className="max-h-[60vh] overflow-y-auto scrollbar-thin">
            {currentMeterNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No notifications for this meter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentMeterNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${notification.read ? "bg-background" : "bg-primary/5 border-primary/20"}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {getIcon(notification.type)}
                        <h4 className="font-medium">{notification.title}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">{getTimeAgo(notification.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-4">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
