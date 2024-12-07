'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ViewState = 'course-home' | 'module' | 'lesson' | 'quiz' | 'activity'

export default function Home() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [generatedCourse, setGeneratedCourse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [overlayOpen, setOverlayOpen] = useState(false)
  const [viewState, setViewState] = useState<ViewState>('course-home')
  const [selectedModule, setSelectedModule] = useState<number|null>(null)
  const [selectedLesson, setSelectedLesson] = useState<{moduleIndex: number, lessonIndex: number}|null>(null)

  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizScore, setQuizScore] = useState<number|null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    const res = await fetch('/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, description })
    })
    const data = await res.json()
    setGeneratedCourse(data.course)
    setLoading(false)
  }

  const handleDownloadFlutterCode = async () => {
    const res = await fetch('/flutter-code', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ course: generatedCourse })
    })
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'flutter_code.zip'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const openOverlay = () => {
    setOverlayOpen(true)
    setViewState('course-home')
    setSelectedModule(null)
    setSelectedLesson(null)
    setQuizScore(null)
    setQuizAnswers({})
  }

  const closeOverlay = () => {
    setOverlayOpen(false)
    setSelectedModule(null)
    setSelectedLesson(null)
    setViewState('course-home')
    setQuizScore(null)
    setQuizAnswers({})
  }

  const goBack = () => {
    if (viewState === 'activity') {
      setViewState('quiz')
      setQuizScore(null)
    } else if (viewState === 'quiz') {
      setViewState('lesson')
    } else if (viewState === 'lesson') {
      setSelectedLesson(null)
      setViewState('module')
    } else if (viewState === 'module') {
      setSelectedModule(null)
      setViewState('course-home')
    } else {
      closeOverlay()
    }
  }

  let currentLesson: any = null
  if (selectedLesson && generatedCourse) {
    const { moduleIndex, lessonIndex } = selectedLesson
    currentLesson = generatedCourse.modules[moduleIndex].lessons[lessonIndex]
  }

  // Navigate functions
  const selectModule = (mIdx: number) => {
    setSelectedModule(mIdx)
    setViewState('module')
  }

  const selectLesson = (mIdx: number, lIdx: number) => {
    setSelectedLesson({moduleIndex: mIdx, lessonIndex: lIdx})
    setViewState('lesson')
  }

  const goToQuiz = () => {
    setViewState('quiz')
    setQuizScore(null)
    setQuizAnswers({})
  }

  const goToActivity = () => {
    setViewState('activity')
  }

  const quizQuestions = [
    {
      id: 'q1',
      question: 'Which of the following best describes the main concept covered in this lesson?',
      options: [
        'A trivial detail with no real-world use',
        'A fundamental principle that underpins the entire topic',
        'An unrelated concept introduced for confusion',
        'A theoretical idea never applied in practice'
      ],
      correct: 1
    },
    {
      id: 'q2',
      question: 'Identify a scenario where the concept would be most effectively applied.',
      options: [
        'In an unrelated and opposite field',
        'In a scenario that precisely matches the concept’s domain',
        'In a scenario that completely ignores the concept’s constraints',
        'In a purely imaginary setting with no real data'
      ],
      correct: 1
    }
  ]

  const handleQuizAnswer = (qId: string, answerIndex: number) => {
    setQuizAnswers((prev) => ({...prev, [qId]: answerIndex.toString()}))
  }

  const submitQuiz = () => {
    let score = 0
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correct.toString()) {
        score++
      }
    })
    setQuizScore(score)
  }

  return (
    <main className="p-8 min-h-screen flex flex-col items-center justify-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className="w-full max-w-xl bg-white/60 rounded-xl shadow-2xl p-8 space-y-6 backdrop-blur-md border border-white/40"
      >
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 70 }}
          className="text-3xl font-extrabold text-gray-900 text-center drop-shadow-sm"
        >
          Create Your Dream Course
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 70 }}
          className="space-y-4"
        >
          <input
            className="w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
            placeholder="Course Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            className="w-full py-3 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
          >
            {loading ? 'Generating...' : 'Generate Course'}
          </motion.button>
        </motion.div>
      </motion.div>

      {generatedCourse && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }}
          className="mt-12 w-full max-w-3xl bg-white/70 rounded-xl shadow-xl p-8 space-y-6 backdrop-blur-sm border border-white/40"
        >
          <h2 className="text-2xl font-bold text-gray-800">Preview</h2>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{generatedCourse.title}</h3>
            <p className="text-gray-700">{generatedCourse.description}</p>
          </div>
          <div className="flex gap-4 pt-4">
            <motion.button
              onClick={handleDownloadFlutterCode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-transform"
            >
              Generate Flutter Code
            </motion.button>
            <motion.button
              onClick={openOverlay}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-700 transition-transform"
            >
              View Full Course
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Overlay for full course navigation */}
      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 20 }}
              className="relative w-full h-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl p-6 overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewState === 'course-home'
                    ? generatedCourse?.title 
                    : viewState === 'module'
                      ? generatedCourse.modules[selectedModule!].title
                      : viewState === 'lesson'
                        ? currentLesson?.title
                        : viewState === 'quiz'
                          ? "Quiz"
                          : "Interactive Activity"}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={goBack}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  {viewState === 'course-home' ? 'Close' : 'Back'}
                </motion.button>
              </div>

              <div className="relative flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                  {viewState === 'course-home' && (
                    <motion.div
                      key="courseHome"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Description</h3>
                        <p className="text-gray-700">{generatedCourse.description}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Modules</h3>
                        <div className="space-y-2">
                          {generatedCourse.modules?.map((m: any, mIdx: number) => (
                            <motion.div
                              key={mIdx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectModule(mIdx)}
                              className="cursor-pointer p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                              initial={{ opacity:0, y:10 }}
                              animate={{ opacity:1, y:0 }}
                            >
                              <h4 className="font-semibold text-gray-900">{m.title}</h4>
                              <p className="text-gray-600 text-sm">{m.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {viewState === 'module' && selectedModule !== null && (
                    <motion.div
                      key="moduleView"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Lessons</h3>
                        <p className="text-gray-700 mb-4">
                          {generatedCourse.modules[selectedModule].description}
                        </p>
                        <div className="space-y-2">
                          {generatedCourse.modules[selectedModule].lessons.map((l: any, lIdx: number) => (
                            <motion.div
                              key={lIdx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectLesson(selectedModule, lIdx)}
                              className="cursor-pointer p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                              initial={{ opacity:0, y:10 }}
                              animate={{ opacity:1, y:0 }}
                            >
                              <h4 className="font-semibold text-gray-900">{l.title}</h4>
                              <p className="text-gray-600 text-sm line-clamp-2 overflow-ellipsis">{l.content.substring(0,100)}...</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {viewState === 'lesson' && selectedLesson !== null && (
                    <motion.div
                      key="lessonView"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Lesson Content</h3>
                        <p className="text-gray-700 whitespace-pre-line">{currentLesson?.content}</p>
                      </div>
                      <div className="text-right">
                        <motion.button
                          whileHover={{ scale:1.05 }}
                          whileTap={{ scale:0.95 }}
                          onClick={goToQuiz}
                          className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                        >
                          Next: Take Quiz
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {viewState === 'quiz' && (
                    <motion.div
                      key="quizView"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-gray-800">Test Your Knowledge</h3>
                      <p className="text-gray-700">Select the best answers to these questions:</p>
                      <div className="space-y-4">
                        {quizQuestions.map((q) => (
                          <motion.div
                            key={q.id}
                            className="p-4 bg-gray-50 rounded-md"
                            initial={{opacity:0,y:10}}
                            animate={{opacity:1,y:0}}
                          >
                            <h4 className="font-semibold text-gray-900 mb-2">{q.question}</h4>
                            <div className="space-y-2">
                              {q.options.map((opt, i) => (
                                <label key={i} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={q.id}
                                    checked={quizAnswers[q.id] === i.toString()}
                                    onChange={() => handleQuizAnswer(q.id,i)}
                                    className="form-radio h-4 w-4 text-indigo-600"
                                  />
                                  <span className="text-gray-700">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="text-right">
                        {quizScore === null ? (
                          <motion.button
                            whileHover={{ scale:1.05 }}
                            whileTap={{ scale:0.95 }}
                            onClick={submitQuiz}
                            className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                          >
                            Submit Quiz
                          </motion.button>
                        ) : (
                          <>
                            <p className="text-gray-800 font-semibold">You scored {quizScore}/{quizQuestions.length}</p>
                            <motion.button
                              whileHover={{ scale:1.05 }}
                              whileTap={{ scale:0.95 }}
                              onClick={goToActivity}
                              className="mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                            >
                              Next: Interactive Activity
                            </motion.button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {viewState === 'activity' && (
                    <motion.div
                      key="activityView"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-gray-800">Interactive Activity</h3>
                      <p className="text-gray-700">
                        Engage with this interactive simulation. Imagine a scenario where you must apply what you’ve learned:
                      </p>
                      <p className="text-gray-700 mb-4">
                        Drag and drop elements into the correct sequence, try rearranging components to form a solution that aligns with the lesson concepts. For example, place "Step 1", "Step 2", and "Step 3" in the correct order.
                      </p>
                      {/* Placeholder activity area */}
                      <div className="w-full p-8 bg-gray-50 border-dashed border-2 border-gray-300 rounded text-gray-500 flex flex-col items-center">
                        <span className="mb-4 italic">Drag & Drop Activity Placeholder</span>
                        {/* Add a few draggable items (for concept) */}
                        <div className="flex gap-4">
                          <div className="p-2 bg-white shadow rounded cursor-move">Step 1</div>
                          <div className="p-2 bg-white shadow rounded cursor-move">Step 2</div>
                          <div className="p-2 bg-white shadow rounded cursor-move">Step 3</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <motion.button
                          whileHover={{ scale:1.05 }}
                          whileTap={{ scale:0.95 }}
                          onClick={() => {
                            // After activity, return to module view
                            setViewState('module')
                            setSelectedLesson(null)
                          }}
                          className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        >
                          Finish Activity
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
