'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';

export function BackgroundAnimation() {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [windowWidth, setWindowWidth] = useState(1)
  const [windowHeight, setWindowHeight] = useState(1)

  const pathname = usePathname();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('resize', handleResize)
      handleResize()
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  const xMotion = useMotionValue(mouseX)
  const yMotion = useMotionValue(mouseY)

  useEffect(() => {
    xMotion.set(mouseX)
    yMotion.set(mouseY)
  }, [mouseX, mouseY, xMotion, yMotion])

  const gradientX = useTransform(xMotion, [0, windowWidth], [0, 100])
  const gradientY = useTransform(yMotion, [0, windowHeight], [0, 100])


  if (pathname === '/') {
    return (
      <motion.div
        className="fixed top-0 left-0 w-full h-full z-[-1]"
        style={{
          background: `radial-gradient(at ${gradientX.get()}% ${gradientY.get()}%, #a78bfa, #6366f1)`,
        }}
        animate={{
          filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    )
  }
  return null;
}
