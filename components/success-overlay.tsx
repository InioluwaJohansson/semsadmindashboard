"use client"

import { useEffect } from "react"
import { Check } from "lucide-react"

interface SuccessOverlayProps {
  show: boolean
  message: string
  onClose: () => void
}

export function SuccessOverlay({ show, message, onClose }: SuccessOverlayProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.3s_ease-in-out]">
      <div className="bg-transparent rounded-lg p-8 shadow-xl max-w-md w-full text-center animate-[slideUp_0.4s_ease-in-out]">
        <div className="mx-auto relative h-20 w-20 mb-4">
          <div className="absolute inset-0 rounded-full bg-green-100/20 dark:bg-green-900/20 animate-[scaleIn_0.5s_ease-in-out]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-500 dark:text-green-400 animate-[bounceIn_0.5s_ease-in-out_0.3s_both]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">{message}</h2>
        <p className="text-white dark:text-gray-200 mb-4">Your changes have been saved successfully.</p>
      </div>
    </div>
  )
}
