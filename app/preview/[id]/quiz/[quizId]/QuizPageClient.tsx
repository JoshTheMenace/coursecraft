// app/preview/[id]/quiz/[quizId]/QuizPageClient.tsx
'use client'

import { ThemeProvider } from '@/app/ThemeProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

interface Question {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

export default function QuizPageClient({
  params,
  theme,
  quiz
}: {
  params: {id:string, quizId:string}
  theme: {primaryColor:string, secondaryColor:string, fontFamily:string}
  quiz: {
    // title: string,
    questions: Question[],
    nextActivityId?: string
  }
}) {

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
            {quiz.title}
          </h1> */}
          <p className="mb-6 text-gray-800">Answer the following questions:</p>
          {quiz.questions.map((q, qIdx) => (
            <motion.div
              key={q.id}
              className="p-4 bg-gray-50 rounded mb-4"
              initial={{opacity:0,y:10}}
              animate={{opacity:1,y:0}}
            >
              <div className="flex items-center gap-2 mb-2">
                <QuestionMarkCircleIcon className="h-6 w-6 text-gray-600" />
                <h2 className="font-semibold text-gray-900">{q.prompt}</h2>
              </div>
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <input type="radio" name={q.id} className="form-radio h-4 w-4 text-indigo-600"/>
                  <span className="text-gray-700">{opt}</span>
                </div>
              ))}
            </motion.div>
          ))}

          <div className="text-right">
            <Link 
              href={quiz.nextActivityId ? `/preview/${params.id}/activity/${quiz.nextActivityId}` : `/preview/${params.id}`}
              className="inline-block px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700 mt-4"
            >
              Submit & Continue
            </Link>
          </div>
        </motion.div>
      </main>
    </ThemeProvider>
  )
}
