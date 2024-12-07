'use client'

import { ThemeProvider } from '@/app/ThemeProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'
import { ArrowRightCircleIcon, PuzzlePieceIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

export default function CourseHomeClient({ course, theme, id }: { course: any; theme: any; id: string }) {
  return (
    <ThemeProvider theme={theme}>
      <main 
        className="min-h-screen flex flex-col"
        style={{
          fontFamily: 'var(--font-family)',
          background: `linear-gradient(to bottom right, var(--color-bg) 0%, #f4f4f4 100%)`
        }}
      >
        {/* Top Nav / Header */}
        <header className="py-4 px-8 flex items-center justify-between bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            <span className="text-2xl font-bold" style={{color:'var(--color-primary)'}}>
              {course.title}
            </span>
          </div>
        </header>

        <motion.div
          initial={{opacity:0, y:20}}
          animate={{opacity:1, y:0}}
          transition={{type:'spring', stiffness:80, damping:20, delay:0.1}}
          className="flex-1 py-16 px-8 max-w-5xl mx-auto"
        >
          {/* Course Intro Section */}
          <section className="mb-12">
            <h1 className="text-5xl font-extrabold mb-4" style={{color:'var(--color-primary)'}}>
              {course.title}
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed">{course.description}</p>
          </section>

          {/* Modules Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6" style={{color:'var(--color-primary)'}}>Modules</h2>
            <div className="space-y-6">
              {course.modules.map((m: any, mIdx: number) => (
                <motion.div
                  key={mIdx}
                  initial={{opacity:0,y:10}}
                  animate={{opacity:1,y:0}}
                  transition={{type:'spring', stiffness:80, damping:20, delay: 0.1 + mIdx * 0.05}}
                  className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4"
                  style={{borderColor:'var(--color-primary)'}}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-2xl" style={{color:'var(--color-primary)'}}>
                      {m.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{m.description}</p>

                  {/* Module Items: Lessons, Quizzes, Interactive Activities */}
                  <div className="space-y-4">
                    {/* Lessons */}
                    {m.lessons.map((l: any, lIdx: number) => (
                      <Link 
                        key={`lesson-${lIdx}`} 
                        href={`/preview/${id}/lesson/${m.id}_${l.id}`}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline group transition-colors"
                      >
                        <ArrowRightCircleIcon className="h-5 w-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                        <span className="text-lg">{`Lesson: ${l.title}`}</span>
                      </Link>
                    ))}
                    {/* Quiz */}
                    {m.quiz && (
                      <Link
                        key={`quiz-${m.quiz.id}`}
                        href={`/preview/${id}/quiz/${m.id}_${m.quiz.id}`}
                        className="flex items-center gap-2 text-green-600 hover:text-green-800 hover:underline group transition-colors"
                      >
                        <AcademicCapIcon className="h-5 w-5 text-green-400 group-hover:text-green-600 transition-colors" />
                        <span className="text-lg">{`Quiz: ${m.quiz.id}`}</span>
                      </Link>
                    )}
                    {/* Interactive Activities */}
                    {m.interactiveActivities && m.interactiveActivities.map((a: any, aIdx: number) => (
                      <Link
                        key={`activity-${aIdx}`}
                        href={`/preview/${id}/activity/${m.id}_${a.id}`}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 hover:underline group transition-colors"
                      >
                        <PuzzlePieceIcon className="h-5 w-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
                        <span className="text-lg">{`Activity: ${a.instructions}`}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </main>
    </ThemeProvider>
  );
}
