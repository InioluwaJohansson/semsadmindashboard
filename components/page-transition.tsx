"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export function PageTransition() {
  const pathname = usePathname()
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [prevPathname, setPrevPathname] = useState("")

  // Track if transition was triggered by specific navigation
  const [isSpecificTransition, setIsSpecificTransition] = useState(false)

  useEffect(() => {
    // Only show transition when pathname changes and it's not the first load
    if (prevPathname && prevPathname !== pathname) {
      // Check if we're navigating to specific pages or sections
      const isTargetedNavigation =
        pathname === "/billing" || pathname === "/metrics" || pathname === "/settings" || pathname.includes("#")

      // Don't show transition when navigating to home page
      if ((isTargetedNavigation || isSpecificTransition) && pathname !== "/") {
        setIsTransitioning(true)

        // Hide transition after 500ms (reduced from 1 second)
        const timer = setTimeout(() => {
          setIsTransitioning(false)
          setIsSpecificTransition(false)
        }, 500)

        return () => clearTimeout(timer)
      }
    }

    // Update previous pathname
    setPrevPathname(pathname)
  }, [pathname, prevPathname, isSpecificTransition])

  // Method to trigger transition programmatically
  const triggerTransition = () => {
    setIsSpecificTransition(true)
    setIsTransitioning(true)

    // Ensure the transition is cleared after a maximum time
    // This is a safety mechanism to prevent it from getting stuck
    setTimeout(() => {
      setIsTransitioning(false)
      setIsSpecificTransition(false)
    }, 1000)
  }

  // Expose the trigger method to the window object
  useEffect(() => {
    // @ts-ignore
    window.triggerPageTransition = triggerTransition

    return () => {
      // @ts-ignore
      delete window.triggerPageTransition
    }
  }, [])

  if (!isTransitioning) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
      <div className="flex space-x-2 mb-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-4 w-4 rounded-full bg-primary animate-pulse opacity-0"
            style={{
              animationDelay: `${i * 0.3}s`, // Adjusted for faster animation
              animationDuration: "1s", // Adjusted for faster animation
              animationIterationCount: "infinite",
            }}
          />
        ))}
      </div>
      <p className="text-lg font-medium">Loading...</p>
    </div>
  )
}
