'use client'

import { useCourse } from '../../CourseContextProvider';
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState } from 'react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

interface Question {
  id: string;
  prompt?: string;
  question?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title?: string;
  questions: Question[];
  passingScore?: number;
  timeLimit?: number;
}

export default function QuizPageClient({
  params,
}: {
  params: { id: string; quizId: string }
}) {
  // 1) Call all hooks right away, before any 'return'
  const courseData = useCourse();
  // const [showExplanations, setShowExplanations] = useState(false);

  // 2) Then do your checks/returns
  if (!courseData) {
    return <div>No course data.</div>;
  }

  const { id, quizId } = params;
  const [moduleId, quizIdPart] = quizId.split('_');

  const foundModule = courseData.modules.find((m) => m.id === moduleId);
  if (!foundModule || !foundModule.quiz || foundModule.quiz.id !== quizIdPart) {
    return <div>Quiz not found</div>;
  }

  const quiz: Quiz = foundModule.quiz;

  // 3) The rest of your component logic
  const patternDataUrl =
    "data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><rect width='40' height='40' fill='%23ffffff'/><path d='M0 39.5 H40 M39.5 0 V40' stroke='%23ccc' stroke-width='0.25'/></svg>";

  const nextHref =
    foundModule.interactiveActivities && foundModule.interactiveActivities.length > 0
      ? `/preview/${id}/activity/${moduleId}_${foundModule.interactiveActivities[0].id}`
      : `/preview/${id}`;

  return (
    <main
      className="min-h-screen p-8"
      style={{
        fontFamily: 'var(--font-family)',
        backgroundColor: 'var(--color-bg)',
        backgroundImage: `url("${patternDataUrl}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '40px 40px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        className="max-w-4xl mx-auto"
      >
        {/* Quiz Title */}
        <h1 className="text-3xl font-extrabold mb-4" style={{ color: 'var(--color-primary)' }}>
          {quiz.title || 'Quiz'}
        </h1>

        {/* Optional passingScore/timeLimit info */}
        <div className="mb-6 text-gray-800">
          {quiz.timeLimit ? (
            <p className="text-sm text-gray-700 mb-1">
              <strong>Time Limit:</strong> {quiz.timeLimit} seconds
            </p>
          ) : (
            <p className="text-sm text-gray-700 mb-1">
              <strong>Time Limit:</strong> None
            </p>
          )}
          {typeof quiz.passingScore === 'number' && (
            <p className="text-sm text-gray-700">
              <strong>Passing Score:</strong> {quiz.passingScore}%
            </p>
          )}
        </div>

        <p className="mb-6 text-gray-800">Answer the following questions:</p>

        {/* Render each question */}
        {quiz.questions.map((q: Question, qIdx: number) => {
          const prompt = q.prompt || q.question;
          return (
            <motion.div
              key={q.id}
              className="p-4 bg-gray-50 rounded mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <QuestionMarkCircleIcon className="h-6 w-6 text-gray-600" />
                <h2 className="font-semibold text-gray-900">
                  {prompt || `Question ${qIdx + 1}`}
                </h2>
              </div>
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name={q.id}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="text-gray-700">{opt}</span>
                </div>
              ))}
              {/* Show the explanation if showExplanations is true and question.explanation is set */}
              {/* {showExplanations && q.explanation && (
                <div className="mt-2 p-2 border-l-4 border-blue-400 bg-blue-50 text-blue-900 text-sm">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )} */}
            </motion.div>
          );
        })}

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2">
          {/* Example button to show/hide explanations (optional) */}
          {/* <button
            onClick={() => setShowExplanations(!showExplanations)}
            className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
          >
            {showExplanations ? 'Hide Explanations' : 'Show Explanations'}
          </button> */}

          <Link
            href={nextHref}
            className="inline-block px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700"
          >
            {foundModule.interactiveActivities && foundModule.interactiveActivities.length > 0
              ? 'Submit & Continue to Activity'
              : 'Finish'}
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
