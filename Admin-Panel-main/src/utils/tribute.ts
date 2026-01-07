//* Tributes *//
import AmethystTranquility from '@/assets/tribute/amethyst-tranquility.png';
import BlossomOfGrace from '@/assets/tribute/blossom-of-grace.png';
import CrimsonDevotion from '@/assets/tribute/crimson-devotion.png';
import FlamesOfRemembrance from '@/assets/tribute/flames-of-remembrance.png';
import FrostlightHarmony from '@/assets/tribute/frostlight-harmony.png';
import GoldenSerenity from '@/assets/tribute/golden-serenity.png';
import LunarSerenity from '@/assets/tribute/lunar-serenity.png';
import MidnightSerenity from '@/assets/tribute/midnight-serenity.png';
import OceanOfLight from '@/assets/tribute/ocean-of-light.png';
import RoyalSunrise from '@/assets/tribute/royal-sunrise.png';
import CelestialBloom from '@/assets/tribute/celestial-bloom.png';
import MidnightElegy from '@/assets/tribute/midnight-elegy.png';
import { MemorialTribute } from '@/types/memorial';

export function getTribute(tribute: Exclude<MemorialTribute, 'default'>) {
  switch (tribute) {
    case 'amethyst-tranquility':
      return AmethystTranquility;
    case 'blossom-of-grace':
      return BlossomOfGrace;
    case 'crimson-devotion':
      return CrimsonDevotion;
    case 'flames-of-remembrance':
      return FlamesOfRemembrance;
    case 'frostlight-harmony':
      return FrostlightHarmony;
    case 'golden-serenity':
      return GoldenSerenity;
    case 'lunar-serenity':
      return LunarSerenity;
    case 'midnight-serenity':
      return MidnightSerenity;
    case 'ocean-of-light':
      return OceanOfLight;
    case 'royal-sunrise':
      return RoyalSunrise;
    case 'celestial-bloom':
      return CelestialBloom;
    case 'midnight-elegy':
      return MidnightElegy;
  }
}
