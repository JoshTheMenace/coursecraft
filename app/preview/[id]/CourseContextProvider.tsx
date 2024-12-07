'use client';

import React, { createContext, ReactNode, useContext } from 'react';

interface CourseData {
  id: string;
  title: string;
  description: string;
  modules: any[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

interface CourseContextType {
  courseData: CourseData;
}

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

// Export a hook to use the course data
export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseContextProvider');
  }
  return context.courseData;
}
