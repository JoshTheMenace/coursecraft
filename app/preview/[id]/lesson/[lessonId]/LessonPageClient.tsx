// app/preview/[id]/lesson/[lessonId]/LessonPageClient.tsx
'use client'

import { useCourse } from '../../CourseContextProvider';
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { PlayCircleIcon, PencilSquareIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { db } from '../../../../../firebase' 
import { doc, updateDoc } from 'firebase/firestore'

type LessonContentItem = 
  | { type: 'text'; data: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; src: string; caption: string }

export default function LessonPageClient({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const courseData = useCourse();
  // 1) If there's no course data, bail early.
  if (!courseData) return <div>Error: No course data.</div>;

  const { id, lessonId } = params;

  // 2) Extract module & lesson IDs from "moduleId_lessonId"
  const [moduleId, lessonIdPart] = lessonId.split('~');

  // 3) Find the module and lesson
  const foundModuleIndex = courseData.modules.findIndex((mod) => mod.id === moduleId);
  const foundModule = courseData.modules[foundModuleIndex];
  if (!foundModule) return <div>Module not found.</div>;

  const foundLessonIndex = foundModule.lessons?.findIndex((les) => les.id === lessonIdPart) ?? -1;
  const foundLesson = foundModule.lessons && foundModule.lessons[foundLessonIndex];
  if (!foundLesson) return <div>Lesson not found.</div>;

  // 4) Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [lessonTitle, setLessonTitle] = useState(foundLesson.title);
  const [content, setContent] = useState<LessonContentItem[]>([]);

  // Initialize local content state from foundLesson
  useEffect(() => {
    // Map the content to match LessonContentItem strictly, with fallbacks:
    const initialContent: LessonContentItem[] = (foundLesson.content || []).map((item) => {
      switch (item.type) {
        case 'text':
          return { type: 'text', data: item.data ?? '' }
        case 'image':
          return { type: 'image', src: item.src ?? '', alt: item.alt ?? '' }
        default:
          throw new Error(`Unknown content type: ${item.type}`);
      }
    });
    setContent(initialContent);
    setLessonTitle(foundLesson.title);
  }, [foundLesson]);

  // 5) Handler for saving to Firestore
  const handleSave = async () => {
    try {
      // Clone course data so we can mutate
      const updatedCourseData = JSON.parse(JSON.stringify(courseData));
      // Update the specific lesson
      updatedCourseData.modules[foundModuleIndex].lessons[foundLessonIndex].title = lessonTitle;
      updatedCourseData.modules[foundModuleIndex].lessons[foundLessonIndex].content = content;

      // Save to Firestore
      const docRef = doc(db, 'courses', courseData.id);
      await updateDoc(docRef, updatedCourseData);

      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  // 6) Handler for editing a content item
  const updateContentItem = (index: number, newItem: Partial<LessonContentItem>) => {
    setContent((prev) => {
      const updated = [...prev];
      // Merge the existing item with the new fields
      updated[index] = { ...updated[index], ...newItem } as LessonContentItem;
      return updated;
    });
  };

  // 7) Figure out "Next" link
  const currentLessonIndex = foundModule.lessons.findIndex((les) => les.id === lessonIdPart);
  let nextHref: string | null = null;
  if (currentLessonIndex >= 0 && currentLessonIndex < foundModule.lessons.length - 1) {
    const nextLesson = foundModule.lessons[currentLessonIndex + 1];
    nextHref = `/preview/${id}/lesson/${moduleId}_${nextLesson.id}`;
  } else if (foundModule.quiz) {
    nextHref = `/preview/${id}/quiz/${moduleId}_${foundModule.quiz.id}`;
  } else if (foundModule.interactiveActivities && foundModule.interactiveActivities.length > 0) {
    const act = foundModule.interactiveActivities[0];
    nextHref = `/preview/${id}/activity/${moduleId}_${act.id}`;
  }

  // 8) Render content in either "view" or "edit" mode
  const renderContent = (item: LessonContentItem, index: number) => {
    if (!isEditing) {
      // View mode
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
              <img src={item.src == "" ? undefined : item.src} alt={item.alt} className="rounded shadow w-full max-w-md" />
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
    } else {
      // Edit mode
      switch (item.type) {
        case 'text':
          return (
            <div key={index} className="mb-6 border border-gray-300 p-4 rounded">
              <label className="block mb-2 font-semibold">Text Content:</label>
              <textarea
                className="w-full border rounded p-2"
                rows={4}
                value={item.data}
                onChange={(e) => updateContentItem(index, { data: e.target.value })}
              />
            </div>
          );
        case 'image':
          return (
            <div key={index} className="mb-6 border border-gray-300 p-4 rounded">
              <label className="block mb-2 font-semibold">Image URL:</label>
              <input
                className="w-full border rounded p-2"
                type="text"
                value={item.src}
                onChange={(e) => updateContentItem(index, { src: e.target.value })}
              />
              <label className="block mt-2 font-semibold">Alt text:</label>
              <input
                className="w-full border rounded p-2"
                type="text"
                value={item.alt}
                onChange={(e) => updateContentItem(index, { alt: e.target.value })}
              />
            </div>
          );
        case 'video':
          return (
            <div key={index} className="mb-6 border border-gray-300 p-4 rounded">
              <label className="block mb-2 font-semibold">Video URL:</label>
              <input
                className="w-full border rounded p-2"
                type="text"
                value={item.src}
                onChange={(e) => updateContentItem(index, { src: e.target.value })}
              />
              <label className="block mt-2 font-semibold">Caption:</label>
              <input
                className="w-full border rounded p-2"
                type="text"
                value={item.caption}
                onChange={(e) => updateContentItem(index, { caption: e.target.value })}
              />
            </div>
          );
      }
    }
    return null;
  };

  // 9) Pattern for background
  const patternDataUrl =
    "data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><rect width='40' height='40' fill='%23ffffff'/><path d='M0 39.5 H40 M39.5 0 V40' stroke='%23ccc' stroke-width='0.25'/></svg>";

  // 10) Render
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
        {/* Title row: either an input or a heading */}
        {isEditing ? (
          <div className="flex justify-between items-center mb-6">
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 mr-4"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                // reset states to original if you want to discard changes:
                setLessonTitle(foundLesson.title);
                const initialContent: LessonContentItem[] = (foundLesson.content || []).map((item) => {
                  switch (item.type) {
                    case 'text':
                      return { type: 'text', data: item.data ?? '' }
                    case 'image':
                      return { type: 'image', src: item.src ?? '', alt: item.alt ?? '' }
                    default:
                      throw new Error(`Unknown content type: ${item.type}`);
                  }
                });
                setContent(initialContent);
              }}
              className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2 ml-2"
            >
              <XMarkIcon className="h-5 w-5" />
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-6">
            <h1
              className="text-3xl font-extrabold"
              style={{ color: 'var(--color-primary)' }}
            >
              {lessonTitle}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-block px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-2"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Edit
            </button>
          </div>
        )}

        <div className="space-y-6 shadow-lg p-4">
          {content.map((item, i) => renderContent(item, i))}
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
