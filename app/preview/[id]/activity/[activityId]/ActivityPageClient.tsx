// app/preview/[id]/activity/[activityId]/ActivityPageClient.tsx
'use client'

import { ThemeProvider } from '@/app/ThemeProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline'

interface MatchingPair {
  element: string
  purpose: string
}

interface Activity {
  // title: string,
  // description: string,
  id: string,
  type: string,
  instructions: string,
  pairs: MatchingPair[]
}

export default function ActivityPageClient({ params, theme, activity }: {
  params: {id:string, activityId:string}
  theme: { primaryColor: string, secondaryColor: string, fontFamily: string }
  activity: Activity
}) {
  
  // For now, just display pairs. In a real scenario, you'd implement drag-and-drop.
  return (
    <ThemeProvider theme={theme}>
      <main className="min-h-screen p-8" style={{fontFamily:'var(--font-family)', backgroundColor:'var(--color-bg)'}}>
        <motion.div
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{type:'spring',stiffness:80,damping:20}}
          className="max-w-4xl mx-auto"
        >
          {/* <h1 className="text-3xl font-extrabold mb-4" style={{color:'var(--color-primary)'}}>
            {activity.title}
          </h1>
          <p className="text-gray-800 mb-6 whitespace-pre-line">{activity.description}</p> */}

          <div className="mb-8 p-6 bg-gray-50 rounded shadow">
            <h2 className="text-xl font-semibold mb-2" style={{color:'var(--color-primary)'}}>Instructions</h2>
            <p className="text-gray-700 mb-4">{activity.instructions}</p>
            <div className="flex flex-wrap gap-4">
              {activity.pairs.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{opacity:0,y:10}}
                  animate={{opacity:1,y:0}}
                  className="bg-white p-4 rounded shadow flex flex-col items-center justify-center w-48"
                >
                  <ArrowsUpDownIcon className="h-6 w-6 text-gray-500 mb-2" />
                  <span className="font-semibold text-gray-900">{p.element}</span>
                  <span className="text-gray-600 text-sm">→ {p.purpose}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-right">
            <Link 
              href={`/preview/${params.id}`} 
              className="inline-block px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Finish Activity & Return to Course Home
            </Link>
          </div>
        </motion.div>
      </main>
    </ThemeProvider>
  )
}
