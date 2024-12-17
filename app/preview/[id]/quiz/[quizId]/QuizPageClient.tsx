// app/preview/[id]/quiz/[quizId]/QuizPageClient.tsx
'use client'

import { useCourse } from '../../CourseContextProvider';
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { QuestionMarkCircleIcon, PencilSquareIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { db } from '../../../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface Question {
  id: string
  prompt?: string
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

  const [moduleId, quizIdPart] = quizId.split('~');

  const foundModuleIndex = courseData.modules.findIndex(m => m.id === moduleId);
  const foundModule = courseData.modules[foundModuleIndex];
  if (!foundModule || !foundModule.quiz || foundModule.quiz.id !== quizIdPart) {
    return <div>Quiz not found</div>;
  }

  const quiz = foundModule.quiz;

  const [isEditing, setIsEditing] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(quiz.questions);

  useEffect(() => {
    setQuestions(quiz.questions);
  }, [quiz]);

  const handleQuestionChange = (qIdx: number, field: keyof Question, value: any) => {
    setQuestions(prev => {
      const updated = [...prev];
      (updated[qIdx] as any)[field] = value;
      return updated;
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const q = updated[qIdx];
      q.options[optIdx] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    const updatedCourseData = { ...courseData };
    updatedCourseData.modules[foundModuleIndex].quiz.questions = questions;

    const docRef = doc(db, 'courses', id);
    await updateDoc(docRef, updatedCourseData);

    setIsEditing(false);
  };

  const patternDataUrl = `data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><rect width='40' height='40' fill='%23ffffff'/><path d='M0 39.5 H40 M39.5 0 V40' stroke='%23ccc' stroke-width='0.25'/></svg>`;

  // Determine next (activity or finish)
  let nextHref: string;
  if (foundModule.interactiveActivities && foundModule.interactiveActivities.length > 0) {
    nextHref = `/preview/${id}/activity/${moduleId}~${foundModule.interactiveActivities[0].id}`;
  } else {
    nextHref = `/preview/${id}`;
  }

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
        {isEditing ? (
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              className="border rounded p-2 w-full mr-4"
              value={quiz.title || 'Quiz'}
              onChange={(e) => {
                const updatedCourseData = { ...courseData };
                updatedCourseData.modules[foundModuleIndex].quiz.title = e.target.value;
                // Not saving yet, just local state
                // For simplicity, handle title in local state too:
                updatedCourseData.modules[foundModuleIndex].quiz.title = e.target.value;
              }}
              placeholder="Quiz Title"
            />
            <button 
              onClick={handleSave} 
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircleIcon className="h-5 w-5"/>
              Save
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2 ml-2"
            >
              <XMarkIcon className="h-5 w-5"/>
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-extrabold mb-4" style={{color:'var(--color-primary)'}}>
              {quiz.title || 'Quiz'}
            </h1>
            <button 
              onClick={() => setIsEditing(true)} 
              className="inline-block px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-2"
            >
              <PencilSquareIcon className="h-5 w-5"/>
              Edit
            </button>
          </div>
        )}
        
        <p className="mb-6 text-gray-800">Answer the following questions:</p>

        {questions.map((q: Question, qIdx: number) => {
          const prompt = q.prompt || q.question;

          if (isEditing) {
            return (
              <motion.div
                key={q.id}
                className="p-4 bg-gray-50 rounded mb-4"
                initial={{opacity:0,y:10}}
                animate={{opacity:1,y:0}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-gray-600" />
                  <input
                    type="text"
                    className="border p-2 w-full"
                    value={prompt || ''}
                    onChange={(e) => handleQuestionChange(qIdx, 'prompt', e.target.value)}
                    placeholder="Question prompt"
                  />
                </div>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                      className="border p-2 w-full"
                      placeholder={`Option ${optIdx + 1}`}
                    />
                  </div>
                ))}
                <div className="mt-2">
                  <label className="font-semibold mr-2">Correct Answer Index:</label>
                  <input
                    type="number"
                    className="border p-1 w-16"
                    value={q.correctIndex}
                    onChange={(e) => handleQuestionChange(qIdx, 'correctIndex', Number(e.target.value))}
                  />
                </div>
              </motion.div>
            )
          } else {
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
          }
        })}

        <div className="text-right">
          <Link 
            href={nextHref} 
            className="inline-block px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700 mt-4"
          >
            Submit & Continue
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
