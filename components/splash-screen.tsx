"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SplashScreen() {
  const router = useRouter()
  const [showBorderAnimation, setShowBorderAnimation] = useState(false)
  const [startZoomOut, setStartZoomOut] = useState(false)

  useEffect(() => {
    // Start border animation after 3 seconds
    const borderAnimationTimer = setTimeout(() => {
      setShowBorderAnimation(true)
    }, 3000)

    // Start zoom out animation after 9 seconds (1 second before redirect)
    const zoomOutTimer = setTimeout(() => {
      setStartZoomOut(true)
    }, 9000)

    // Redirect to login page after 10 seconds
    const redirectTimer = setTimeout(() => {
      router.push("/login")
    }, 10000)

    // Clean up timers
    return () => {
      clearTimeout(borderAnimationTimer)
      clearTimeout(zoomOutTimer)
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <div className={`fixed inset-0 bg-black overflow-hidden ${startZoomOut ? "animate-zoom-out" : "animate-zoom-in"}`}>
      {/* SEMS text with border animation - reduced font size */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h3
          className={`text-white text-5xl font-bold font-tesla tracking-widest relative ${showBorderAnimation ? "animate-border-transition" : ""}`}
        >
          SEMS
        </h3>
      </div>
    </div>
  )
}
