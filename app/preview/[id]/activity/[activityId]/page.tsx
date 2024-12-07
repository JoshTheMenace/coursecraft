import ActivityPageClient from './ActivityPageClient';
import { getCourseData } from '../../page';

export default async function ActivityPage({
  params: unresolvedParams,
}: {
  params: { id: string; activityId: string };
}) {
  const params = await Promise.resolve(unresolvedParams);
  const { id, activityId } = params;

  // Parse the activityId (e.g., "module2_activity1" -> moduleId: "module2", activityId: "activity1")
  const [moduleId, activityIdPart] = activityId.split('_');

  if (!moduleId || !activityIdPart) {
    throw new Error(`Invalid activityId format: ${activityId}`);
  }

  const courseData = await getCourseData(id);

  // Find the target module
  const foundModule = courseData.modules.find((module) => module.id === moduleId);

  if (!foundModule) {
    throw new Error(`Module with ID ${moduleId} not found in course ${id}`);
  }

  // Find the target activity within the module
  const foundActivity = foundModule.interactiveActivities?.find(
    (activity) => activity.id === activityIdPart
  );

  if (!foundActivity) {
    throw new Error(`Activity with ID ${activityIdPart} not found in module ${moduleId}`);
  }

  const transformedActivity = {
    ...foundActivity,
    pairs: foundActivity.pairs.map((pair: { value: string; pair: string }) => ({
      element: pair.value,
      purpose: pair.pair,
    })),
  };

  return (
    <ActivityPageClient
      params={params}
      theme={courseData.theme}
      activity={transformedActivity}
    />
  );
}
