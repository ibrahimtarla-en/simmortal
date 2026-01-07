import { ProductDetail } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getProduct } from '@/services/server/shop';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';

async function ProductDetailPage({ params }: DynamicRouteParams<{ slug: string }>) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const product = await getProduct(slug, locale);
  if (!product) {
    return redirect({ href: '/shop', locale });
  }
  return <ProductDetail item={product} />;
}

export default ProductDetailPage;
