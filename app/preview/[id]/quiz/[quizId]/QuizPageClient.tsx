// app/preview/[id]/quiz/[quizId]/QuizPageClient.tsx
'use client'

import { useCourse } from '../../CourseContextProvider';
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

interface Question {
  id: string
  prompt?: string // Adjust if needed: if original uses `prompt` or `question`
  question?: string
  options: string[]
  correctIndex: number
}

export default function QuizPageClient({
  params,
}: {
  params: {id:string, quizId:string}
}) {
  const courseData = useCourse();
  if (!courseData) return <div>No course data.</div>;

  const { id, quizId } = params;

  // quizId might be "module1_quiz1"
  const [moduleId, quizIdPart] = quizId.split('~');

  const foundModule = courseData.modules.find(m => m.id === moduleId);
  if (!foundModule || !foundModule.quiz || foundModule.quiz.id !== quizIdPart) {
    return <div>Quiz not found</div>;
  }

  const quiz = foundModule.quiz;

  const patternDataUrl = `data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><rect width='40' height='40' fill='%23ffffff'/><path d='M0 39.5 H40 M39.5 0 V40' stroke='%23ccc' stroke-width='0.25'/></svg>`;

  return (
    <main className="min-h-screen p-8" style={{
      fontFamily:'var(--font-family)',
      backgroundColor: 'var(--color-bg)',
        backgroundImage: `url("${patternDataUrl}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '40px 40px',
       }}>
      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{type:'spring',stiffness:80,damping:20}}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-extrabold mb-4" style={{color:'var(--color-primary)'}}>
          {quiz.title || 'Quiz'}
        </h1>
        <p className="mb-6 text-gray-800">Answer the following questions:</p>
        {quiz.questions.map((q: Question, qIdx: number) => {
          const prompt = q.prompt || q.question; // handle whichever field your JSON uses
          return (
            <motion.div
              key={q.id}
              className="p-4 bg-gray-50 rounded mb-4"
              initial={{opacity:0,y:10}}
              animate={{opacity:1,y:0}}
            >
              <div className="flex items-center gap-2 mb-2">
                <QuestionMarkCircleIcon className="h-6 w-6 text-gray-600" />
                <h2 className="font-semibold text-gray-900">{prompt}</h2>
              </div>
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <input type="radio" name={q.id} className="form-radio h-4 w-4 text-indigo-600"/>
                  <span className="text-gray-700">{opt}</span>
                </div>
              ))}
            </motion.div>
          )
        })}

        {/* Next might be activity or back to course */}
        {foundModule.interactiveActivities && foundModule.interactiveActivities.length > 0 ? (
          <div className="text-right">
            <Link 
              href={`/preview/${id}/activity/${moduleId}_${foundModule.interactiveActivities[0].id}`} 
              className="inline-block px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700 mt-4"
            >
              Submit & Continue to Activity
            </Link>
          </div>
        ) : (
          <div className="text-right">
            <Link 
              href={`/preview/${id}`} 
              className="inline-block px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700 mt-4"
            >
              Finish
            </Link>
          </div>
        )}
      </motion.div>
    </main>
  )
}
