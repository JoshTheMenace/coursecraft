import QuizPageClient from './QuizPageClient';
import { getCourseData } from '../../page';

export default async function QuizPage({ params: unresolvedParams }: { params: { id: string; quizId: string } }) {
  const params = await Promise.resolve(unresolvedParams);
  const { id, quizId } = params;

  console.log('Params:', params);

  // Parse the quizId (e.g., "module1_quiz1" -> moduleId: "module1", quizId: "quiz1")
  const [moduleId, quizIdPart] = quizId.split('_');

  if (!moduleId || !quizIdPart) {
    throw new Error(`Invalid quizId format: ${quizId}`);
  }

  const courseData = await getCourseData(id);

  // Find the target module
  const foundModule = courseData.modules.find((module) => module.id === moduleId);

  if (!foundModule) {
    throw new Error(`Module with ID ${moduleId} not found in course ${id}`);
  }

  // Find the quiz in the module
  const foundQuiz = foundModule.quiz;

  if (!foundQuiz || foundQuiz.id !== quizIdPart) {
    throw new Error(`Quiz with ID ${quizIdPart} not found in module ${moduleId}`);
  }

  return <QuizPageClient params={params} theme={courseData.theme} quiz={foundQuiz} />;
}
