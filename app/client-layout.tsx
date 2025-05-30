"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import BottomNavigation from "@/components/bottom-navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { AppHeader } from "@/components/app-header"
import { PageTransition } from "@/components/page-transition"
import { MeterProvider } from "@/context/meter-context"
import { NotificationProvider } from "@/context/notification-context"
import { DataProvider } from "@/context/data-context"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  // Check if the current path is an auth path or root path
  const isAuthPath =
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/forgot-password")

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <DataProvider>
            <MeterProvider>
              <NotificationProvider>
                <div className="flex flex-col min-h-screen max-w-md mx-auto">
                  {!isAuthPath && (
                    <AppHeader userName="Inioluwa Johansson" userImage="/placeholder.svg?height=40&width=40" />
                  )}
                  <main className={isAuthPath ? "flex-1" : "flex-1 pb-20 pt-32"}>{children}</main>
                  {!isAuthPath && <BottomNavigation />}
                  {pathname !== "/" && <PageTransition />}
                </div>
              </NotificationProvider>
            </MeterProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
