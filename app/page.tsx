'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [generatedCourse, setGeneratedCourse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<number|null>(null)
  const [selectedLesson, setSelectedLesson] = useState<{moduleIndex: number, lessonIndex: number}|null>(null)

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
    setSelectedModule(null)
    setSelectedLesson(null)
  }

  const closeOverlay = () => {
    setOverlayOpen(false)
    setSelectedModule(null)
    setSelectedLesson(null)
  }

  const goBack = () => {
    if (selectedLesson !== null) {
      setSelectedLesson(null)
    } else if (selectedModule !== null) {
      setSelectedModule(null)
    } else {
      // close overlay
      closeOverlay()
    }
  }

  // Extract the currently viewed lesson content if any
  let currentLesson: any = null
  if (selectedLesson && generatedCourse) {
    const { moduleIndex, lessonIndex } = selectedLesson
    currentLesson = generatedCourse.modules[moduleIndex].lessons[lessonIndex]
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

      {/* Overlay for course content */}
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
                  {selectedLesson
                    ? currentLesson?.title
                    : selectedModule !== null
                    ? generatedCourse.modules[selectedModule].title
                    : generatedCourse?.title || 'Course'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={goBack}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  {selectedLesson || selectedModule !== null ? 'Back' : 'Close'}
                </motion.button>
              </div>

              <div className="relative flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                  {/* Course Home View */}
                  {selectedModule === null && selectedLesson === null && (
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
                              onClick={() => setSelectedModule(mIdx)}
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

                  {/* Module View */}
                  {selectedModule !== null && selectedLesson === null && (
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
                              onClick={() => setSelectedLesson({moduleIndex: selectedModule, lessonIndex: lIdx})}
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

                  {/* Lesson View */}
                  {selectedLesson !== null && (
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
                        <p className="text-gray-700 whitespace-pre-line">
                          {currentLesson?.content}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Quiz</h3>
                        <p className="text-gray-700">Try answering these questions:</p>
                        <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                          <li>Question 1: Explain the main concept covered in this lesson.</li>
                          <li>Question 2: Provide an example scenario where this applies.</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Interactive Activity</h3>
                        <p className="text-gray-700">Imagine a scenario and drag-and-drop elements to form a solution. (Placeholder)</p>
                        <div className="mt-4 p-4 bg-gray-50 border-dashed border-2 border-gray-300 text-gray-500 italic rounded">
                          Interactive activity placeholder area
                        </div>
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
