import { redirect } from '@/i18n/navigation';
import { validateSubscriptionResult } from '@/services/server/memorial';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';

async function PremiumSubscriptionSuccessPage({
  searchParams,
}: DynamicRouteParams<{
  id: string;
}>) {
  const [{ session_id }, locale] = await Promise.all([searchParams, getLocale()]);

  const result = await validateSubscriptionResult(session_id as string, true);

  return redirect({ href: result.redirectUrl, locale });
}

export default PremiumSubscriptionSuccessPage;
