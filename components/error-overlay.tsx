import { AlertTriangle } from "lucide-react"

interface ErrorOverlayProps {
  show: boolean
  message: string
  title?: string
  onClose?: () => void
}

export function ErrorOverlay({ show, message, title = "Error", onClose }: ErrorOverlayProps) {
  if (!show) return null

  // Auto-close after 3 seconds if onClose is provided
  if (onClose) {
    setTimeout(() => {
      onClose()
    }, 3000)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.3s_ease-in-out]">
      <div className="bg-transparent rounded-lg p-8 shadow-xl max-w-md w-full text-center animate-[slideUp_0.4s_ease-in-out]">
        <div className="mx-auto relative h-20 w-20 mb-4">
          <div className="absolute inset-0 rounded-full bg-red-100/20 dark:bg-red-900/20 animate-[scaleIn_0.5s_ease-in-out]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 animate-[bounceIn_0.5s_ease-in-out_0.3s_both]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-2">{title}</h2>
        <p className="text-white dark:text-gray-200 mb-4">{message}</p>
      </div>
    </div>
  )
}
