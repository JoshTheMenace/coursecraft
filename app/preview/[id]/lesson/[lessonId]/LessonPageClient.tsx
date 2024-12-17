// app/preview/[id]/lesson/[lessonId]/LessonPageClient.tsx
'use client'

import { useCourse } from '../../CourseContextProvider';
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { PlayCircleIcon, PencilSquareIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { db } from '../../../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

type LessonContentItem = 
  | { type: 'text', data: string }
  | { type: 'image', src: string, alt: string }
  | { type: 'video', src: string, caption: string }

export default function LessonPageClient({
  params,
}: {
  params: {id:string, lessonId:string},
}) {
  const courseData = useCourse();

  if (!courseData) return <div>Error: No course data.</div>;

  const { id, lessonId } = params;
  const [moduleId, lessonIdPart] = lessonId.split('~');

  const foundModuleIndex = courseData.modules.findIndex((mod) => mod.id === moduleId);
  const foundModule = courseData.modules[foundModuleIndex];
  if (!foundModule) return <div>Module not found</div>;

  const foundLessonIndex = foundModule.lessons.findIndex((les: any) => les.id === lessonIdPart);
  const foundLesson = foundModule.lessons[foundLessonIndex];
  if (!foundLesson) return <div>Lesson not found</div>;

  const [isEditing, setIsEditing] = useState(false);
  const [lessonTitle, setLessonTitle] = useState(foundLesson.title);
  const [content, setContent] = useState<LessonContentItem[]>(foundLesson.content);

  useEffect(() => {
    setLessonTitle(foundLesson.title);
    setContent(foundLesson.content);
  }, [foundLesson]);

  const handleContentChange = (index: number, newValue: Partial<LessonContentItem>) => {
    setContent((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...newValue } as LessonContentItem;
      return updated;
    });
  };

  const handleSave = async () => {
    const updatedCourseData = { ...courseData };
    updatedCourseData.modules[foundModuleIndex].lessons[foundLessonIndex].title = lessonTitle;
    updatedCourseData.modules[foundModuleIndex].lessons[foundLessonIndex].content = content;

    const docRef = doc(db, 'courses', id);
    await updateDoc(docRef, updatedCourseData);

    setIsEditing(false);
  };

  // Determine next item (quiz or next lesson)
  const currentLessonIndex = foundLessonIndex;
  let nextHref: string | null = null;
  const nextLessonIndex = currentLessonIndex + 1;
  if (nextLessonIndex < foundModule.lessons.length) {
    const nextLesson = foundModule.lessons[nextLessonIndex];
    nextHref = `/preview/${id}/lesson/${moduleId}~${nextLesson.id}`;
  } else if (foundModule.quiz) {
    nextHref = `/preview/${id}/quiz/${moduleId}~${foundModule.quiz.id}`;
  } else if (foundModule.interactiveActivities && foundModule.interactiveActivities.length > 0) {
    const act = foundModule.interactiveActivities[0];
    nextHref = `/preview/${id}/activity/${moduleId}~${act.id}`;
  }

  const renderContent = (item: LessonContentItem, index: number) => {
    if (isEditing) {
      switch(item.type) {
        case 'text':
          return (
            <div key={index} className="mb-6">
              <label className="block mb-2 font-semibold">Text Content:</label>
              <textarea
                className="w-full border rounded p-2"
                value={item.data}
                onChange={(e) => handleContentChange(index, {data: e.target.value})}
              />
            </div>
          )
        case 'image':
          return (
            <div key={index} className="mb-6">
              <label className="block mb-2 font-semibold">Image URL:</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={item.src}
                onChange={(e) => handleContentChange(index, {src: e.target.value})}
              />
              <label className="block mb-2 font-semibold mt-2">Alt text:</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={item.alt}
                onChange={(e) => handleContentChange(index, {alt: e.target.value})}
              />
            </div>
          )
        case 'video':
          return (
            <div key={index} className="mb-6">
              <label className="block mb-2 font-semibold">Video URL:</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={item.src}
                onChange={(e) => handleContentChange(index, {src: e.target.value})}
              />
              <label className="block mb-2 font-semibold mt-2">Caption:</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={item.caption}
                onChange={(e) => handleContentChange(index, {caption: e.target.value})}
              />
            </div>
          )
      }
    } else {
      // View mode as before
      switch(item.type) {
        case 'text':
          return (
            <motion.div key={index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{type:'spring', stiffness:80, damping:20, delay:index * 0.05}} className="mb-6">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">{item.data}</p>
            </motion.div>
          )
        case 'image':
          return (
            <motion.div key={index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{type:'spring', stiffness:80, damping:20, delay:index * 0.05}} className="mb-6">
              <img src={item.src} alt={item.alt} className="rounded shadow w-full max-w-md" />
              <p className="text-gray-600 mt-2 text-sm italic">{item.alt}</p>
            </motion.div>
          )
        case 'video':
          return (
            <motion.div key={index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{type:'spring', stiffness:80, damping:20, delay:index * 0.05}} className="mb-6">
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
          )
      }
    }
  }

  const patternDataUrl = `data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><rect width='40' height='40' fill='%23ffffff'/><path d='M0 39.5 H40 M39.5 0 V40' stroke='%23ccc' stroke-width='0.25'/></svg>`;

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
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
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
            <h1 className="text-3xl font-extrabold" style={{color:'var(--color-primary)'}}>
              {lessonTitle}
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
  )
}
