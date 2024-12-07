"use client"

import './globals.css'
import { Inter } from 'next/font/google'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Stunning Course Generator',
//   description: 'Generate courses with a jaw-dropping UI',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  // Capture mouse move in the entire viewport
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // We'll use these values to shift a gradient
  const xMotion = useMotionValue(mouseX)
  const yMotion = useMotionValue(mouseY)

  useEffect(() => {
    xMotion.set(mouseX)
    yMotion.set(mouseY)
  }, [mouseX, mouseY])

  const gradientX = useTransform(xMotion, [0, window.innerWidth || 1], [0, 100])
  const gradientY = useTransform(yMotion, [0, window.innerHeight || 1], [0, 100])

  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden relative`}>
        {/* Animate the background using motion div */}
        <motion.div
          className="fixed top-0 left-0 w-full h-full z-[-1]"
          style={{
            background: `radial-gradient(at ${gradientX.get()}% ${gradientY.get()}%, #a78bfa, #6366f1)`,
          }}
          animate={{
            // animate hue rotation for a subtle shifting color effect over time
            filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {children}
      </body>
    </html>
  )
}
