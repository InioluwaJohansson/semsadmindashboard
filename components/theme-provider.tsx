"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface ThemeContextProps {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setTheme: () => {},
})

export const ThemeProvider = ({
  children,
  defaultTheme = "light",
  enableSystem = true,
  attribute = "class",
}: {
  children: React.ReactNode
  defaultTheme?: "light" | "dark"
  enableSystem?: boolean
  attribute?: string
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null

    // First check system preference if enabled
    if (enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

      // Then check stored preference, if any
      if (storedTheme) {
        setTheme(storedTheme)
        root.classList.remove("light", "dark")
        root.classList.add(storedTheme)
      } else {
        // Use system preference if no stored preference
        setTheme(systemTheme)
        root.classList.remove("light", "dark")
        root.classList.add(systemTheme)
      }
    } else if (storedTheme) {
      // If system preference is disabled, use stored preference if available
      setTheme(storedTheme)
      root.classList.remove("light", "dark")
      root.classList.add(storedTheme)
    } else {
      // Otherwise use default theme
      root.classList.remove("light", "dark")
      root.classList.add(defaultTheme)
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      if (enableSystem && !localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light"
        setTheme(newTheme)
        root.classList.remove("light", "dark")
        root.classList.add(newTheme)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [defaultTheme, enableSystem])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
