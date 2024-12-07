// app/preview/[id]/lesson/[lessonId]/LessonPageClient.tsx
'use client'

import { useCourse } from '../../CourseContextProvider';
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'
import { PlayCircleIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

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

  const [moduleId, lessonIdPart] = lessonId.split('_');

  const foundModule = courseData.modules.find((mod) => mod.id === moduleId);
  if (!foundModule) return <div>Module not found</div>;

  const foundLesson = foundModule.lessons.find((les: any) => les.id === lessonIdPart);
  if (!foundLesson) return <div>Lesson not found</div>;

  // Transform lesson content
  const transformedContent: LessonContentItem[] = foundLesson.content.map((item: any) => {
    if (item.type === 'text') {
      return { type: 'text', data: item.data };
    } else if (item.type === 'image') {
      return { type: 'image', src: item.src, alt: item.alt };
    } else if (item.type === 'video') {
      return { type: 'video', src: item.src, caption: item.caption };
    }
    throw new Error(`Unknown content type: ${item.type}`);
  });

  // Determine next item (quiz or next lesson)
  const currentIndex = foundModule.lessons.findIndex((les: any) => les.id === lessonIdPart);
  let nextHref: string | null = null;
  if (currentIndex >= 0 && currentIndex < foundModule.lessons.length - 1) {
    const nextLesson = foundModule.lessons[currentIndex + 1];
    nextHref = `/preview/${id}/lesson/${moduleId}_${nextLesson.id}`;
  } else if (foundModule.quiz) {
    nextHref = `/preview/${id}/quiz/${moduleId}_${foundModule.quiz.id}`;
  } else if (foundModule.interactiveActivities && foundModule.interactiveActivities.length > 0) {
    const act = foundModule.interactiveActivities[0];
    nextHref = `/preview/${id}/activity/${moduleId}_${act.id}`;
  }

  const renderContent = (item: LessonContentItem, index: number) => {
    switch(item.type) {
      case 'text':
        return (
          <motion.div key={index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{type:'spring', stiffness:80, damping:20, delay:index * 0.05}} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="h-6 w-6 text-gray-500" />
              <span className="font-semibold text-gray-900">Text Content</span>
            </div>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">{item.data}</p>
          </motion.div>
        )
      case 'image':
        return (
          <motion.div key={index} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{type:'spring', stiffness:80, damping:20, delay:index * 0.05}} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <PhotoIcon className="h-6 w-6 text-gray-500" />
              <span className="font-semibold text-gray-900">Image</span>
            </div>
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

  return (
    <main className="min-h-screen p-8" style={{fontFamily:'var(--font-family)', backgroundColor:'var(--color-bg)'}}>
      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{type:'spring',stiffness:80,damping:20}}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-extrabold mb-8" style={{color:'var(--color-primary)'}}>
          {foundLesson.title}
        </h1>

        <div className="space-y-6">
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
  )
}
