interface LoadingOverlayProps {
  show: boolean
}

export function LoadingOverlay({ show }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
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
      <p className="text-lg font-medium">Saving changes...</p>
    </div>
  )
}
