// 'use client'

// import { createContext, useContext, useState, ReactNode } from 'react'

// interface Theme {
//   primaryColor: string
//   secondaryColor: string
//   fontFamily: string
// }

// interface CourseData {
//   id: string
//   title: string
//   description: string
//   modules: any[]
// }

// interface ThemeProviderProps {
//   theme: Theme
//   initialCourseData?: CourseData | null
//   children: ReactNode
// }

// interface ThemeContextType {
//   theme: Theme
//   courseData: CourseData | null
//   setCourseData: (data: CourseData | null) => void
// }

// const ThemeContext = createContext<ThemeContextType | null>(null)

// export function ThemeProvider({ theme, initialCourseData = null, children }: ThemeProviderProps) {
//   const [courseData, setCourseData] = useState<CourseData | null>(initialCourseData)

//   return (
//     <ThemeContext.Provider value={{ theme, courseData, setCourseData }}>
//       <div
//         style={{
//           '--color-primary': theme.primaryColor,
//           '--color-bg': theme.secondaryColor,
//           '--font-family': theme.fontFamily,
//         } as React.CSSProperties}
//         className="w-full h-full"
//       >
//         {children}
//       </div>
//     </ThemeContext.Provider>
//   )
// }

// export function useTheme() {
//   const context = useContext(ThemeContext)
//   if (!context) throw new Error('useTheme must be used within a ThemeProvider')
//   return context
// }
