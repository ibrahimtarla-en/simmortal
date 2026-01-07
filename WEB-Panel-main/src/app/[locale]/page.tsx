import { FeaturesCarousel, Hero } from '@/components';
import CursorEffect from '@/components/CursorEffect/CursorEffect';
import HomeVideoSections from '@/components/HomePage/HomeVideoSections/HomeVideoSections';

export default async function Home() {
  return (
    <main className="container">
      <Hero />
      <CursorEffect />
      <FeaturesCarousel />
      <HomeVideoSections />
    </main>
  );
}
