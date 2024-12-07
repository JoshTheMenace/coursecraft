import QuizPageClient from './QuizPageClient';

export default async function QuizPage({
  params: unresolvedParams,
}: {
  params: { id: string; quizId: string };
}) {
  // Await the resolution of params (if dynamic)
  const params = await Promise.resolve(unresolvedParams);

  // Return the client component with resolved params
  return <QuizPageClient params={params} />;
}
