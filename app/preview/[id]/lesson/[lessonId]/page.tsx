import LessonPageClient from './LessonPageClient';
import { getCourseData } from '../../page';

function isImageContent(
  item: { type: string; src?: string; alt?: string }
): item is { type: 'image'; src: string; alt: string } {
  return (
    item.type === 'image' &&
    typeof item.src === 'string' &&
    typeof item.alt === 'string'
  );
}

function isVideoContent(
  item: { type: string; src?: string; caption?: string }
): item is { type: 'video'; src: string; caption: string } {
  return (
    item.type === 'video' &&
    typeof item.src === 'string' &&
    typeof item.caption === 'string'
  );
}

type Module = {
  id: string;
  title: string;
  description: string;
  lessons: { id: string; title: string; content: any[] }[];
  quiz?: { id: string; questions: any[] };
  interactiveActivities?: { id: string; type: string; instructions: string; pairs: any[] }[];
};


export default async function LessonPage({
  params: unresolvedParams,
}: {
  params: { id: string; lessonId: string };
}) {
  const params = await Promise.resolve(unresolvedParams);
  const { id, lessonId } = params;

  console.log('Params:', params);

  const courseData = await getCourseData(id);

  // Parse the lessonId (e.g., "module1_lesson1" -> moduleId: "module1", lessonId: "lesson1")
  const [moduleId, lessonIdPart] = lessonId.split('_');

  if (!moduleId || !lessonIdPart) {
    throw new Error(`Invalid lessonId format: ${lessonId}`);
  }

  // Find the target module
  const foundModule = courseData.modules.find((module) => module.id === moduleId) as Module | undefined;
  
  if (!foundModule) {
    throw new Error(`Module with ID ${moduleId} not found in course ${id}`);
  }

  // Find the target lesson within the module
  const foundLesson = foundModule.lessons.find((lesson) => lesson.id === lessonIdPart);

  if (!foundLesson) {
    throw new Error(`Lesson with ID ${lessonIdPart} not found in module ${moduleId}`);
  }

  // Transform lesson content to match LessonContentItem type
  const transformedContent = foundLesson.content.map((item) => {
    if (item.type === 'text' && typeof item.data === 'string') {
      return { type: 'text', data: item.data } as const;
    }
    if (isImageContent(item)) {
      return { type: 'image', src: item.src, alt: item.alt } as const;
    }
    if (isVideoContent(item)) {
      return { type: 'video', src: item.src, caption: item.caption } as const;
    }
    throw new Error(`Invalid content item: ${JSON.stringify(item)}`);
  });
  console.log('Found:', foundModule);
  console.log('FoundQUIZ:', foundModule.quiz);

  const currentIndex = foundModule.lessons.findIndex((lesson) => lesson.id === lessonIdPart);

  type ModuleItem = 
  | { type: 'lesson'; id: string }
  | { type: 'quiz'; id: string }
  | { type: 'activity'; id: string };

  const nextItem: ModuleItem | null =
  currentIndex >= 0 && currentIndex + 1 < foundModule.lessons.length
    ? { type: 'lesson', id: `${moduleId}_${foundModule.lessons[currentIndex + 1].id}` }
    : foundModule.quiz
    ? { type: 'quiz', id: `${moduleId}_${foundModule.quiz.id}` }
    : foundModule.interactiveActivities && foundModule.interactiveActivities.length > 0
    ? { type: 'activity', id: `${moduleId}_${foundModule.interactiveActivities[0].id}` }
    : null;


  return (
    <LessonPageClient
      params={params}
      theme={courseData.theme}
      lesson={{
        title: foundLesson.title,
        content: transformedContent,
      }}
      quizId={foundModule.quiz?.id || null}
      nextItem={nextItem}
    />
  );
}
