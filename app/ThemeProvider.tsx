'use client'

import { createContext, useContext } from 'react'

interface Theme {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
}

const ThemeContext = createContext<Theme | null>(null)

export function ThemeProvider({ theme, children }: {theme: Theme, children: React.ReactNode}) {
  return (
    <ThemeContext.Provider value={theme}>
      <div 
        style={{
          '--color-primary': theme.primaryColor,
          '--color-bg': theme.secondaryColor,
          '--font-family': theme.fontFamily
        } as React.CSSProperties}
        className="w-full h-full"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const theme = useContext(ThemeContext)
  if (!theme) throw new Error("useTheme must be used within a ThemeProvider")
  return theme
}
