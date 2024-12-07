import LessonPageClient from './LessonPageClient';

export default async function LessonPage({
  params: unresolvedParams,
}: {
  params: { id: string; lessonId: string };
}) {
  // Await the resolution of params (if dynamic)
  const params = await Promise.resolve(unresolvedParams);

  // Return the client component with resolved params
  return <LessonPageClient params={params} />;
}
