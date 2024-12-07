'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

      <AnimatePresence>
        {generatedCourse && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }}
            className="mt-12 w-full max-w-3xl bg-white/70 rounded-xl shadow-xl p-8 space-y-6 backdrop-blur-sm border border-white/40"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-gray-800">
              Preview
            </motion.h2>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="space-y-2"
            >
              <motion.h3 
                variants={{ hidden: {opacity: 0, y:10}, visible: {opacity:1, y:0}}}
                className="text-xl font-bold text-gray-900"
              >
                {generatedCourse.title}
              </motion.h3>
              <motion.p 
                variants={{ hidden: {opacity: 0, y:10}, visible: {opacity:1, y:0}}}
                className="text-gray-700"
              >
                {generatedCourse.description}
              </motion.p>
              <motion.div
                className="border-t pt-4 space-y-2"
                variants={{ visible: { transition: { staggerChildren: 0.05 }}}}
              >
                {generatedCourse.lessons?.map((lesson: any, idx: number) => (
                  <motion.div 
                    key={idx} 
                    className="p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition"
                    variants={{ hidden: {opacity:0,y:5}, visible: {opacity:1,y:0}}}
                  >
                    <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                    <p className="text-gray-600 text-sm">{lesson.content}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              className="flex gap-4 pt-4"
              initial={{ opacity: 0, x:30 }}
              animate={{ opacity:1, x:0 }}
              transition={{ delay: 0.3, type:'spring', stiffness:70 }}
            >
              <motion.button
                onClick={handleDownloadFlutterCode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-transform"
              >
                Generate Flutter Code
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="px-4 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-700 transition-transform"
              >
                Edit Course
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
