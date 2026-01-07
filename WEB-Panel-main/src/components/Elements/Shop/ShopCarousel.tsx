import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { Nullable } from '@/types/util';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import { motion } from 'motion/react';
import { useRouter } from '@/i18n/navigation';
import { FeaturedShopItem } from '@/types/shop';

interface ShopCarouselProps {
  featuredItems: Nullable<FeaturedShopItem[]>;
  className?: string;
}

function ShopCarousel({ featuredItems, className }: ShopCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: { activeIndex: number }) => {
    setActiveIndex(swiper.activeIndex);
  };

  const handleSlideClick = (product: FeaturedShopItem) => {
    router.push({ pathname: `/shop/${product.itemSlug}` });
  };

  return (
    <div className={cn('w-full', className)}>
      <Swiper
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        speed={1500}
        modules={[Autoplay, Navigation]}
        onSlideChange={handleSlideChange}
        className="grow-1">
        {featuredItems?.map((featuredItem, index) => (
          <SwiperSlide
            key={featuredItem.itemId}
            onClick={() => handleSlideClick(featuredItem)}
            className="border-shine-1 relative h-full w-full cursor-pointer overflow-hidden rounded-lg">
            {/* Overlay Image */}
            <div className={cn('relative aspect-[1184/727] max-h-[727px] w-full')}>
              <Image
                src={featuredItem.imageUrl}
                alt={featuredItem.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 h-3/8 w-full bg-gradient-to-t from-black from-0% to-transparent" />

            {/* Content */}
            <motion.div
              className={cn(
                'absolute bottom-3.5 left-3.5 w-65/100',
                'md:bottom-5 md:left-5',
                'lg:bottom-10 lg:left-14',
              )}
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: index === activeIndex ? 1 : 0,
                y: index === activeIndex ? 0 : 50,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}>
              <motion.h2
                className={cn(
                  'mb-2 font-serif text-base font-semibold',
                  'md:mb-3.5 md:text-3xl',
                  'lg:mb-6 lg:text-5xl',
                )}
                initial={{ opacity: 0, x: -30 }}
                animate={{
                  opacity: index === activeIndex ? 1 : 0,
                  x: index === activeIndex ? 0 : -30,
                }}
                transition={{ duration: 0.8, delay: 0.2 }}>
                {featuredItem.title}
              </motion.h2>

              <motion.p
                className={cn('text-2xs font-medium', 'md:text-lg', 'lg:text-xl')}
                initial={{ opacity: 0, x: -30 }}
                animate={{
                  opacity: index === activeIndex ? 1 : 0,
                  x: index === activeIndex ? 0 : -30,
                }}
                transition={{ duration: 0.8, delay: 0.4 }}>
                {featuredItem.description}
              </motion.p>
            </motion.div>
          </SwiperSlide>
        ))}
        {/* Carousel Indicator */}
        <div
          className={cn(
            'absolute right-3.5 bottom-3.5 z-20 flex space-x-2',
            'md:right-5 md:bottom-5',
            'lg:right-14 lg:bottom-10',
          )}>
          {featuredItems?.map((_, index) => (
            <motion.div
              key={index}
              className={`transition-all duration-300 ${
                index === activeIndex
                  ? 'h-1 w-14 rounded-xs bg-white'
                  : 'h-1 w-3 rounded-xs bg-white/50'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          ))}
        </div>
      </Swiper>
    </div>
  );
}

export default ShopCarousel;
