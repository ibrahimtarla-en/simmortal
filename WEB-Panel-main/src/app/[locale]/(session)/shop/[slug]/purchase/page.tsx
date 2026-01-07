import { Purchase } from '@/components';
import { redirect } from '@/i18n/navigation';
import { getPublishedMemorialById } from '@/services/server/memorial';
import { getOrderById, getProduct } from '@/services/server/shop';
import { PublishedMemorial } from '@/types/memorial';
import { Order, OrderStatus } from '@/types/shop';
import { DynamicRouteParams } from '@/types/util';
import { getLocale } from 'next-intl/server';

async function ProductDetailPage({ params, searchParams }: DynamicRouteParams<{ slug: string }>) {
  const [{ slug }, queryParams, locale] = await Promise.all([params, searchParams, getLocale()]);
  const quantity = parseInt(queryParams?.quantity as string, 10);
  const orderId = queryParams?.order_id as string;
  if (!quantity) {
    return redirect({ href: `/shop/${slug}`, locale });
  }
  const product = await getProduct(slug, locale);
  if (!product) {
    return redirect({ href: '/shop', locale });
  }
  let order: Order | null = null;
  let memorial: PublishedMemorial | null = null;

  if (orderId) {
    // Only check incomplete orders, users should not be able to modify finalized orders
    order = await getOrderById(orderId, OrderStatus.CREATED);
    if (order?.memorialId) {
      memorial = await getPublishedMemorialById(order.memorialId);
    }
  }
  return (
    <main className="container">
      <Purchase
        product={product}
        quantity={order?.quantity ?? quantity}
        order={order}
        memorial={memorial}
      />
    </main>
  );
}

export default ProductDetailPage;
