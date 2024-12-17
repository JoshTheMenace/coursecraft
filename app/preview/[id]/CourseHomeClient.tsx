// app/preview/[id]/CourseHomeClient.tsx
'use client'

import { useCourse } from './CourseContextProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link'
import { useState } from 'react'
import { BookOpenIcon, ClipboardDocumentIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline'


export default function CourseHomeClient({ id }: { id: string }) {
  const courseData = useCourse();

  if (!courseData) {
    return <div>Error: No course data.</div>;
  }

  const { title, description, modules } = courseData;

  // A subtle pattern as a data URL (SVG). It's a very faint grid pattern.
  // You can tweak colors for readability. We use var(--color-bg) for theme integration.
  const patternDataUrl = `data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><rect width='40' height='40' fill='%23ffffff'/><path d='M0 39.5 H40 M39.5 0 V40' stroke='%23ccc' stroke-width='0.25'/></svg>`;
  
  return (
    <main 
      className="min-h-screen flex flex-col overflow-y-auto relative"
      style={{
        fontFamily: 'var(--font-family)',
        backgroundColor: 'var(--color-bg)',
        backgroundImage: `url("${patternDataUrl}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '40px 40px',
      }}
    >
      <header className="py-4 px-8 flex items-center justify-between bg-white shadow-sm z-10 relative">
        <div className="flex items-center gap-2">
          <BookOpenIcon className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
          <span className="text-2xl font-bold" style={{color:'var(--color-primary)'}}>
            {title}
          </span>
        </div>
      </header>

      <motion.div
        initial={{opacity:0, y:20}}
        animate={{opacity:1, y:0}}
        transition={{type:'spring', stiffness:80, damping:20, delay:0.1}}
        className="flex-1 py-16 px-8 w-1/2 mx-auto overflow-y-auto relative"
      >
        <section className="mb-12">
          <h1 className="text-5xl font-extrabold mb-4" style={{color:'var(--color-primary)'}}>
            {title}
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">{description}</p>
        </section>

        <ModulesSection modules={modules} id={id} />
      </motion.div>
    </main>
  )
}





export function ModulesSection({ modules, id }: { modules: any[]; id: string }) {
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(null);

  const toggleModule = (index: number) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
        Modules
      </h2>
      <div className="space-y-4">
        {modules.map((m: any, mIdx: number) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.1 + mIdx * 0.05 }}
            className="border border-gray-300 rounded-lg shadow-sm overflow-hidden h-1/5"
          >
            {/* Module Header */}
            <div
              className="flex items-center justify-between px-6 py-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
              onClick={() => toggleModule(mIdx)}
            >
              <h3 className="font-semibold text-lg" style={{ color: 'var(--color-primary)' }}>
                {m.title}
              </h3>
              <span className="text-gray-500">
                {openModuleIndex === mIdx ? '▲' : '▼'}
              </span>
            </div>

            {/* Module Content */}
            <AnimatePresence>
              {openModuleIndex === mIdx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-4 bg-white"
                >
                  <p className="text-gray-700 mb-4 leading-relaxed">{m.description}</p>

                  {/* Lessons */}
                  {m.lessons && m.lessons.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Lessons
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {m.lessons.map((l: any) => (
                          <a
                            key={l.id}
                            href={`/preview/${id}/lesson/${m.id}~${l.id}`}
                            className="block px-4 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow hover:bg-indigo-600 hover:shadow-md transition-all"
                          >
                            {l.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quiz */}
                  {m.quiz && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Quiz
                      </h4>
                      <a
                        href={`/preview/${id}/quiz/${m.id}_${m.quiz.id}`}
                        className="inline-block px-4 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow hover:bg-pink-600 hover:shadow-md transition-all"
                      >
                        Take the Quiz
                      </a>
                    </div>
                  )}

                  {/* Interactive Activities */}
                  {m.interactiveActivities && m.interactiveActivities.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Interactive Activities
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {m.interactiveActivities.map((act: any) => (
                          <a
                            key={act.id}
                            href={`/preview/${id}/activity/${m.id}_${act.id}`}
                            className="block px-4 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 hover:shadow-md transition-all"
                          >
                            {act.type === 'matching' ? 'Matching Activity' : 'Activity'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
