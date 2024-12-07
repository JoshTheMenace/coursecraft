import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import CourseContextProvider from './CourseContextProvider'; // Import the client component for context

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

async function fetchCourseData(courseId: string): Promise<CourseData> {
  const courseRef = doc(db, 'courses', courseId);
  const courseSnap = await getDoc(courseRef);

  if (!courseSnap.exists()) {
    throw new Error(`Course with ID ${courseId} not found.`);
  }

  const courseData = courseSnap.data();

  // Manually add the `id` field to match `CourseData`
  return {
    id: courseId,
    ...courseData,
  } as CourseData;
}

export default async function Layout({
  children,
  params: unresolvedParams,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const params = await Promise.resolve(unresolvedParams); // Await resolution of params
  const courseData = await fetchCourseData(params.id);

  return (
    <CourseContextProvider courseData={courseData}>
      {children}
    </CourseContextProvider>
  );
}
