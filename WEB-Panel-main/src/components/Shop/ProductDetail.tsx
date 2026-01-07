'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import Button from '../Elements/Button/Button';
import Trash from '@/assets/icons/trash.svg';
import Plus from '@/assets/icons/plus.svg';
import Minus from '@/assets/icons/minus.svg';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { ShopItem, ShopItemStatus } from '@/types/shop';
import { useUserStore } from '@/store';
import { useLoadingModal } from '@/hooks/useLoadingModal';
import { joinWaitlistForItem } from '@/services/server/shop';

interface ProductDetailProps {
  item: ShopItem;
}

function ProductDetail({ item }: ProductDetailProps) {
  const t = useTranslations('Shop');
  const tCommon = useTranslations('Common');
  const { user } = useUserStore();
  const pathname = usePathname();
  const [productQuantity, setProductQuantity] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    item.images.length > 0 ? item.images[0] : null,
  );
  const router = useRouter();
  const { showLoading, hideLoading } = useLoadingModal();

  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
  };

  const handleAddToCartAndCheckout = () => {
    if (productQuantity > 0) {
      router.push(`/shop/${item.slug}/purchase?quantity=${productQuantity}`);
      return;
    }
    setProductQuantity(1);
  };

  const handleIncreaseQuantity = () => {
    setProductQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setProductQuantity((prev) => Math.max(prev - 1, 0));
  };

  const handleJoinWaitlist = async () => {
    if (!user) {
      router.push(`/login?redirect_to=${encodeURIComponent(pathname)}`);
      return;
    }
    try {
      showLoading();
      await joinWaitlistForItem(item.id);
      router.refresh();
    } catch {
    } finally {
      hideLoading();
    }
  };

  console.log(item);

  return (
    <div
      className={cn(
        'relative container flex w-full flex-col px-4',
        'md:px-8',
        'lg:flex-row lg:space-x-16 lg:px-32 lg:py-20',
      )}>
      <div className={cn('my-10 flex w-full flex-col items-center space-y-6', 'lg:my-0 lg:w-9/10')}>
        {/* Highlighted Image */}
        <div
          className={cn(
            'border-shine-1 relative aspect-[734/526] w-full overflow-hidden rounded-lg',
          )}>
          {selectedImage && (
            <Image src={selectedImage} alt={item.name} fill className="object-cover" />
          )}
        </div>
        <div className="grid w-full grid-cols-4 gap-6">
          {/* Thumbnail Images */}
          {item.images.map((image, index) => (
            <div
              key={index}
              onClick={() => handleImageSelect(image)}
              className={cn(
                'border-shine-1 relative aspect-[734/526] w-full cursor-pointer overflow-hidden rounded-lg',
              )}>
              <Image src={image} alt={item.name} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      {/* Product Info */}
      <div className={cn('flex w-full flex-col gap-9', 'md:mb-32')}>
        <h1 className={cn('text-5xl font-medium', 'lg:text-3xl')}>{item.name}</h1>
        <p className={cn('text-lg font-light text-white', 'lg:text-sm')}>{item.description}</p>
        <div
          className={cn(
            'flex w-full flex-row items-center justify-between',
            'gap-9 lg:flex-col lg:items-start',
          )}>
          {item.status === ShopItemStatus.COMING_SOON && (
            <div
              className={cn(
                'flex w-full flex-col items-center justify-center gap-9',
                'md:items-start',
              )}>
              <div className={cn('text-sm font-normal text-zinc-500', 'md:text-lg', 'lg:text-sm')}>
                {t('comingSoon')}
              </div>
              <Button
                disabled={item.userInWaitlist}
                onClick={() => {
                  if (!user) {
                    router.push(`/login?redirect_to=${encodeURIComponent(pathname)}`);
                    return;
                  }
                  handleJoinWaitlist();
                }}>
                {item.userInWaitlist ? t('alreadyInWaitlist') : t('joinWaitlist')}
              </Button>
            </div>
          )}
          {/* Price Info Checkout*/}
          {item.status === ShopItemStatus.AVAILABLE && (
            <>
              <span className="text-3xl font-semibold">{item.displayPrice}</span>
              <div className="flex flex-row items-center space-x-4">
                {productQuantity > 0 && (
                  <div className="flex flex-row items-center space-x-3">
                    <Button
                      icon={productQuantity > 1 ? <Minus /> : <Trash />}
                      onClick={handleDecreaseQuantity}
                    />
                    <span className="text-base font-medium">{productQuantity}</span>
                    <Button icon={<Plus />} onClick={handleIncreaseQuantity} />
                  </div>
                )}

                <Button onClick={handleAddToCartAndCheckout}>
                  <span className={cn('text-sm font-medium')}>
                    {productQuantity > 0 ? tCommon('continue') : t('addToCart')}
                  </span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
