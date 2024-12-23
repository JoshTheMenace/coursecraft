'use client';

import React, { createContext, ReactNode, useContext } from 'react';

/**
 * Define all sub-interfaces that match your new JSON structure.
 */
interface CourseTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string; 
  fontFamily: string;
}

interface SocialLinks {
  twitter?: string;
  linkedin?: string;
}

interface Instructor {
  name: string;
  bio: string;
  avatar?: string;
  socialLinks?: SocialLinks;
}

interface CoursePricing {
  isFree: boolean;
  cost: number;
  currency: string;
  discount: number;
}

interface CourseStats {
  views: number;
  likes: number;
  enrollments?: number;
  completions?: number;
  averageRating?: number;
  ratingsCount?: number;
}

interface CourseResource {
  type: string;       // e.g. 'pdf', 'video', ...
  title: string;
  url: string;
}

interface LessonContentItem {
  type: string;       // e.g. 'text', 'image', 'video'
  data?: string;      // text data
  src?: string;       // image URL
  alt?: string;       // alt text for images
}

interface Lesson {
  id: string;
  title: string;
  content: LessonContentItem[];
}

interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passingScore?: number;
  timeLimit?: number;
}

interface InteractiveActivityPair {
  value?: string;
  pair?: string;
}

interface InteractiveActivity {
  id: string;
  type: string;       // e.g. 'matching', 'drag-and-drop', ...
  instructions?: string;
  pairs?: InteractiveActivityPair[];
}

interface ModuleResource {
  type: string;       // e.g. 'pdf', 'video', ...
  title: string;
  url: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  learningObjectives?: string[];
  lessons: Lesson[];
  quiz?: Quiz;
  interactiveActivities?: InteractiveActivity[];
  resources?: ModuleResource[];
}

/**
 * The root CourseData interface that reflects your new JSON structure.
 */
export interface CourseData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  instructor?: Instructor;
  language?: string;
  level?: string;
  tags?: string[];
  dateCreated?: string;
  lastUpdated?: string;
  status?: string;
  version?: string;
  pricing?: CoursePricing;
  stats?: CourseStats;
  modules: Module[];
  resources?: CourseResource[];
  theme: CourseTheme;
}

/**
 * The context type simply holds the full courseData object.
 */
interface CourseContextType {
  courseData: CourseData;
}

/**
 * Create the CourseContext and default to null for initial state.
 */
const CourseContext = createContext<CourseContextType | null>(null);

export default function CourseContextProvider({
  children,
  courseData,
}: {
  children: ReactNode;
  courseData: CourseData;
}) {
  return (
    <CourseContext.Provider value={{ courseData }}>
      <div
        style={{
          '--color-primary': courseData.theme.primaryColor || '#000',
          '--color-bg': courseData.theme.secondaryColor || '#fff',
          '--font-family': courseData.theme.fontFamily || 'sans-serif',
        } as React.CSSProperties}
        className="w-full h-full overflow-y-auto"
      >
        {children}
      </div>
    </CourseContext.Provider>
  );
}

/**
 * A custom hook for any component to access the course data.
 * Ensures that it must be used within the CourseContextProvider.
 */
export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseContextProvider');
  }
  return context.courseData;
}
