import ActivityPageClient from './ActivityPageClient';

export default async function ActivityPage({
  params: unresolvedParams,
}: {
  params: { id: string; activityId: string };
}) {
  // Await the resolution of params (if dynamic)
  const params = await Promise.resolve(unresolvedParams);

  // Return the client component with resolved params
  return <ActivityPageClient params={params} />;
}
