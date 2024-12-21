// app/preview/[id]/lesson/[lessonId]/LessonPageClient.tsx
'use client'

import { useCourse } from '../../CourseContextProvider';
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'
import { PlayCircleIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

/**
 * Extend or import these interfaces from CourseContextProvider if desired,
 * but the core logic below remains the same.
 */
type LessonContentItem = 
  | { type: 'text', data: string }
  | { type: 'image', src: string, alt: string }
  | { type: 'video', src: string, caption: string }

export default function LessonPageClient({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const courseData = useCourse();
  if (!courseData) return <div>Error: No course data.</div>;

  const { id, lessonId } = params;
  // Split out module vs lesson IDs from "moduleId_lessonId"
  const [moduleId, lessonIdPart] = lessonId.split('_');

  // Find the module in the course data
  const foundModule = courseData.modules.find((mod) => mod.id === moduleId);
  if (!foundModule) return <div>Module not found.</div>;

  // Find the lesson within that module
  const foundLesson = foundModule.lessons?.find((les) => les.id === lessonIdPart);
  if (!foundLesson) return <div>Lesson not found.</div>;

  // Transform the lesson content into our typed array
  const transformedContent: LessonContentItem[] = (foundLesson.content || []).map((item) => {
    switch (item.type) {
      case 'text':
        return {
          type: 'text',
          data: item.data ?? '',
        }
      case 'image':
        return {
          type: 'image',
          src: item.src ?? '',
          alt: item.alt ?? '',
        }
      default:
        throw new Error(`Unknown content type: ${item.type}`);
    }
  });
  

  /**
   * Determine the "Next" link:
   * 1. If there's another lesson in this module, link to it.
   * 2. Else if there's a quiz in this module, link to the quiz.
   * 3. Else if there's an interactive activity, link to that.
   * 4. Otherwise, no next link.
   */
  const currentLessonIndex = foundModule.lessons.findIndex((les) => les.id === lessonIdPart);
  let nextHref: string | null = null;

  if (currentLessonIndex >= 0 && currentLessonIndex < foundModule.lessons.length - 1) {
    // Next lesson in the same module
    const nextLesson = foundModule.lessons[currentLessonIndex + 1];
    nextHref = `/preview/${id}/lesson/${moduleId}_${nextLesson.id}`;
  } else if (foundModule.quiz) {
    // Jump to quiz
    nextHref = `/preview/${id}/quiz/${moduleId}_${foundModule.quiz.id}`;
  } else if (foundModule.interactiveActivities && foundModule.interactiveActivities.length > 0) {
    // Jump to first activity
    const act = foundModule.interactiveActivities[0];
    nextHref = `/preview/${id}/activity/${moduleId}_${act.id}`;
  }

  /**
   * Render function for each content item
   */
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
      default:
        return null; // Should never reach here because of our earlier checks
    }
  };

  const patternDataUrl =
    "data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><rect width='40' height='40' fill='%23ffffff'/><path d='M0 39.5 H40 M39.5 0 V40' stroke='%23ccc' stroke-width='0.25'/></svg>";

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
        <h1 className="text-3xl font-extrabold mb-8" style={{ color: 'var(--color-primary)' }}>
          {foundLesson.title}
        </h1>

        <div className="space-y-6 shadow-lg p-4">
          {transformedContent.map((item, i) => renderContent(item, i))}
        </div>

        <div className="text-right mt-8">
          {nextHref && (
            <Link
              href={nextHref}
              className="inline-block px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Next
            </Link>
          )}
        </div>
      </motion.div>
    </main>
  );
}
