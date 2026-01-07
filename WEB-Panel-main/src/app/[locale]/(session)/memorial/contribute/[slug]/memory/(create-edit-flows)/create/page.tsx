import { CreateEditMemory } from '@/components';
import { DynamicRouteParams } from '@/types/util';

async function CreateMemoryPage({ params }: DynamicRouteParams<{ slug: string }>) {
  const [{ slug }] = await Promise.all([params]);
  return <CreateEditMemory.About slug={slug} />;
}

export default CreateMemoryPage;
