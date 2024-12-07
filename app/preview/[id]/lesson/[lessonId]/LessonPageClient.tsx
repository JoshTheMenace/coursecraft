'use client'

import { ThemeProvider } from '@/app/ThemeProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'
import { PlayCircleIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

type LessonContentItem =
  | { type: 'text'; data: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; src: string; caption: string };

type ModuleItem = { type: 'lesson'; id: string } | { type: 'quiz'; id: string } | { type: 'activity'; id: string };

export default function LessonPageClient({
  params,
  theme,
  lesson,
  quizId,
  nextItem,
}: {
  params: { id: string; lessonId: string };
  theme: { primaryColor: string; secondaryColor: string; fontFamily: string };
  lesson: { title: string; content: LessonContentItem[] };
  quizId: string | null;
  nextItem: ModuleItem | null;
}) {
  const renderContent = (item: LessonContentItem, index: number) => {
    switch (item.type) {
      case 'text':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: index * 0.05 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="h-6 w-6 text-gray-500" />
              <span className="font-semibold text-gray-900">Text Content</span>
            </div>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">{item.data}</p>
          </motion.div>
        );
      case 'image':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: index * 0.05 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <PhotoIcon className="h-6 w-6 text-gray-500" />
              <span className="font-semibold text-gray-900">Image</span>
            </div>
            <img src={item.src} alt={item.alt} className="rounded shadow w-full max-w-md" />
            <p className="text-gray-600 mt-2 text-sm italic">{item.alt}</p>
          </motion.div>
        );
      case 'video':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: index * 0.05 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <PlayCircleIcon className="h-6 w-6 text-gray-500" />
              <span className="font-semibold text-gray-900">Video</span>
            </div>
            <video controls className="w-full max-w-md rounded shadow">
              <source src={item.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="text-gray-600 mt-2 text-sm italic">{item.caption}</p>
          </motion.div>
        );
    }
  };

  const getNextItemLink = () => {
    if (!nextItem) {
      return `/preview/${params.id}`;
    }
    const nextItemType = nextItem.type;
    const nextItemId = nextItem.id;
    return `/preview/${params.id}/${nextItemType}/${nextItemId}`;
  };

  const getNextItemLabel = () => {
    if (!nextItem) {
      return 'Back to Course Home';
    }
    if (nextItem.type === 'lesson') {
      return 'Next: Lesson';
    }
    if (nextItem.type === 'quiz') {
      return 'Next: Quiz';
    }
    if (nextItem.type === 'activity') {
      return 'Next: Interactive Activity';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <main
        className="min-h-screen p-8"
        style={{ fontFamily: 'var(--font-family)', backgroundColor: 'var(--color-bg)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-extrabold mb-8" style={{ color: 'var(--color-primary)' }}>
            {lesson.title}
          </h1>

          {/* Render lesson content */}
          <div className="space-y-6">{lesson.content.map((item, i) => renderContent(item, i))}</div>

          <div className="text-right mt-8">
            <Link
              href={getNextItemLink()}
              className="inline-block px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {getNextItemLabel()}
            </Link>
          </div>
        </motion.div>
      </main>
    </ThemeProvider>
  );
}
