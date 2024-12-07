'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [generatedCourse, setGeneratedCourse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

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

  const openPreview = () => {
    // In a real scenario, you would have a generated ID from Firebase.
    const courseId = 'abc123'
    window.open(`/preview/${courseId}`, '_blank')
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
              onClick={openPreview}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-700 transition-transform"
            >
              Open Full Course in New Tab
            </motion.button>
          </div>
        </motion.div>
      )}
    </main>
  )
}
