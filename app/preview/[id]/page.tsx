import CourseHomeClient from './CourseHomeClient';

export default async function CourseHome({ params: unresolvedParams }: { params: { id: string } }) {
  const params = await Promise.resolve(unresolvedParams); // Await resolution of params
  return <CourseHomeClient id={params.id} />;
}
