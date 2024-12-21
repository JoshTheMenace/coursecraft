// app/preview/[id]/CourseHomeClient.tsx
'use client'

import { useCourse } from './CourseContextProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link'
import { useState } from 'react'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'; // If using Next.js Image
import React from 'react';


export default function CourseHomeClient({ id }: { id: string }) {
  const courseData = useCourse();

  if (!courseData) {
    return <div>Error: No course data.</div>;
  }

  const { 
    title, 
    subtitle, 
    description, 
    instructor, 
    language, 
    level, 
    tags, 
    pricing, 
    stats, 
    resources, 
    modules 
  } = courseData;

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
      {/* Header */}
      <header className="py-4 px-8 flex items-center justify-between bg-white shadow-sm z-10 relative">
        <div className="flex items-center gap-2">
          <BookOpenIcon className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
          <span className="text-2xl font-bold" style={{color:'var(--color-primary)'}}>
            {title}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        initial={{opacity:0, y:20}}
        animate={{opacity:1, y:0}}
        transition={{type:'spring', stiffness:80, damping:20, delay:0.1}}
        className="flex-1 py-16 px-8 w-full md:w-3/4 lg:w-1/2 mx-auto overflow-y-auto relative"
      >
        <section className="mb-12">
          <h1 className="text-5xl font-extrabold mb-2" style={{color:'var(--color-primary)'}}>
            {title}
          </h1>
          {subtitle && <h2 className="text-2xl font-semibold text-gray-700 mb-4">{subtitle}</h2>}
          <p className="text-gray-700 text-lg leading-relaxed mb-6">{description}</p>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Instructor Info */}
          {instructor && (
            <div className="flex items-center gap-4 mb-6">
              {instructor.avatar && (
                // If using next/image, adjust as needed
                <img
                  src={instructor.avatar}
                  alt={`${instructor.name} avatar`}
                  className="w-16 h-16 rounded-full border"
                />
              )}
              <div>
                <h3 className="text-xl font-bold" style={{color:'var(--color-primary)'}}>
                  {instructor.name}
                </h3>
                <p className="text-gray-600 text-sm">{instructor.bio}</p>
                <div className="flex gap-2 mt-2">
                  {instructor.socialLinks?.twitter && (
                    <a 
                      href={instructor.socialLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Twitter
                    </a>
                  )}
                  {instructor.socialLinks?.linkedin && (
                    <a 
                      href={instructor.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Language and Level */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {language && (
              <div>
                <span className="font-semibold">Language: </span>
                <span className="text-gray-700">{language}</span>
              </div>
            )}
            {level && (
              <div>
                <span className="font-semibold">Level: </span>
                <span className="text-gray-700">{level}</span>
              </div>
            )}
          </div>

          {/* Pricing */}
          {pricing && (
            <div className="mb-6">
              {pricing.isFree ? (
                <span className="text-green-700 font-semibold">This course is free!</span>
              ) : (
                <div>
                  <span className="font-semibold">Price: </span>
                  <span className="text-gray-700">
                    {pricing.currency} {pricing.cost! - (pricing.discount || 0)}
                    {pricing.discount || 0 > 0 && (
                      <span className="line-through text-gray-500 ml-2">{pricing.currency} {pricing.cost}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-700">
              <div><strong>Views:</strong> {stats.views}</div>
              <div><strong>Likes:</strong> {stats.likes}</div>
              <div><strong>Enrollments:</strong> {stats.enrollments}</div>
              <div><strong>Completions:</strong> {stats.completions}</div>
              <div><strong>Rating:</strong> {stats.averageRating} ({stats.ratingsCount} ratings)</div>
            </div>
          )}

          {/* Additional Resources */}
          {resources && resources.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xl font-bold mb-4" style={{color:'var(--color-primary)'}}>Additional Resources</h4>
              <ul className="list-disc list-inside text-gray-700">
                {resources.map((r:any, idx: number) => (
                  <li key={idx}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {r.title} ({r.type.toUpperCase()})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
    <section className="mb-12">
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
            className="border border-gray-300 rounded-lg shadow-sm overflow-hidden"
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

                  {/* Learning Objectives */}
                  {m.learningObjectives && m.learningObjectives.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                        Learning Objectives
                      </h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {m.learningObjectives.map((obj: string, i: number) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lessons */}
                  {m.lessons && m.lessons.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Lessons
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {m.lessons.map((l: any) => (
                          <Link
                            key={l.id}
                            href={`/preview/${id}/lesson/${m.id}_${l.id}`}
                            className="block px-4 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow hover:bg-indigo-600 hover:shadow-md transition-all"
                          >
                            {l.title}
                          </Link>
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
                      <Link
                        href={`/preview/${id}/quiz/${m.id}_${m.quiz.id}`}
                        className="inline-block px-4 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow hover:bg-pink-600 hover:shadow-md transition-all"
                      >
                        Take the Quiz
                      </Link>
                    </div>
                  )}

                  {/* Interactive Activities */}
                  {m.interactiveActivities && m.interactiveActivities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Interactive Activities
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {m.interactiveActivities.map((act: any) => (
                          <Link
                            key={act.id}
                            href={`/preview/${id}/activity/${m.id}_${act.id}`}
                            className="block px-4 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 hover:shadow-md transition-all"
                          >
                            {act.type === 'matching' ? 'Matching Activity' : 'Activity'}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Module Resources */}
                  {m.resources && m.resources.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Module Resources
                      </h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {m.resources.map((r:any, idx:number) => (
                          <li key={idx}>
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {r.title} ({r.type.toUpperCase()})
                            </a>
                          </li>
                        ))}
                      </ul>
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
