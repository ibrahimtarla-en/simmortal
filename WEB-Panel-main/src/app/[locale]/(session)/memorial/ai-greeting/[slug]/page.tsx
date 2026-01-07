import AiGreetingCreator from '@/components/AiGreeting/AiGreetingCreator';
import { redirect } from '@/i18n/navigation';
import { getAiMemorialGreeting, getPublishedMemorialBySlug } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';

async function VoiceClonePage({ params }: DynamicRouteParams<{ slug: string }>) {
  const disabled = true; // Temporarily disable AI Greetings
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);

  if (disabled) {
    return redirect({ href: `/memorial/${slug}`, locale });
  }

  const memorial = await getPublishedMemorialBySlug(slug);

  if (!memorial) {
    return redirect({ href: `/memorial/${slug}`, locale });
  }
  const greeting = await getAiMemorialGreeting(memorial.id);
  console.log(greeting);
  return (
    <main className="container">
      <AiGreetingCreator memorial={memorial} greeting={greeting} />
    </main>
  );
}

export default VoiceClonePage;
