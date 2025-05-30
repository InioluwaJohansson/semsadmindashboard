"use client"

import { Home, BarChart2, Receipt, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useMeter } from "@/context/meter-context"

const navItems = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
  },
  {
    name: "Metrics",
    href: "/metrics",
    icon: BarChart2,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: Receipt,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { meters } = useMeter()

  // Check if there are no meters
  const noMeters = meters.length === 0

  // Function to handle navigation with transition
  const handleNavigation = (path: string) => {
    // Skip transition if already on the page
    if (pathname === path) return

    // Skip navigation to metrics or billing if there are no meters
    if ((path === "/metrics" || path === "/billing") && noMeters) return

    // Trigger the transition overlay
    // @ts-ignore
    if (window.triggerPageTransition) window.triggerPageTransition()

    // Navigate after a small delay to ensure transition shows
    setTimeout(() => {
      router.push(path)
    }, 50)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border max-w-md mx-auto">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          // Disable metrics and billing buttons if there are no meters
          const isDisabled = (item.name === "Metrics" || item.name === "Billing") && noMeters

          return item.name === "Home" ? (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{item.name}</span>
            </Link>
          ) : (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
                isDisabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{item.name}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
