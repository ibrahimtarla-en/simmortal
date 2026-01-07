import { MemorialFrame, MemorialTribute } from '@/types/memorial';
import { StaticImageData } from 'next/image';

//* Frames *//
import DefaultFrame from '@/assets/frame/default.png';
import AurelianSovereign from '@/assets/frame/aurelian-sovereign.png';
import BaroqueArgentum from '@/assets/frame/baroque-argentum.png';
import BaroqueRoyale from '@/assets/frame/baroque-royale.png';
import ChromelineElegance from '@/assets/frame/chromeline-elegance.png';
import FrostedSovereign from '@/assets/frame/frosted-sovereign.png';
import GoldenHeritage from '@/assets/frame/golden-heritage.png';
import ImperialGildedCrest from '@/assets/frame/imperial-gilded-crest.png';
import MajesticAureate from '@/assets/frame/majestic-aureate.png';
import SilverNocturne from '@/assets/frame/silver-nocturne.png';
import SovereignSilverleaf from '@/assets/frame/sovereign-silverleaf.png';

//* Frame Bases *//
import BaseOne from '@/assets/frame/base-1.png';
import BaseTwo from '@/assets/frame/base-2.png';
import BaseThree from '@/assets/frame/base-3.png';

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

export function getFrame(frame: MemorialFrame): StaticImageData {
  switch (frame) {
    case 'aurelian-sovereign':
      return AurelianSovereign;
    case 'baroque-argentum':
      return BaroqueArgentum;
    case 'baroque-royale':
      return BaroqueRoyale;
    case 'chromeline-elegance':
      return ChromelineElegance;
    case 'frosted-sovereign':
      return FrostedSovereign;
    case 'golden-heritage':
      return GoldenHeritage;
    case 'imperial-gilded-crest':
      return ImperialGildedCrest;
    case 'majestic-aureate':
      return MajesticAureate;
    case 'silver-nocturne':
      return SilverNocturne;
    case 'sovereign-silverleaf':
      return SovereignSilverleaf;
    default:
      return DefaultFrame;
  }
}

export function getFrameBase(frame: MemorialFrame): StaticImageData {
  switch (frame) {
    case 'golden-heritage':
    case 'imperial-gilded-crest':
    case 'majestic-aureate':
    case 'baroque-royale':
    case 'aurelian-sovereign':
      return BaseTwo;
    case 'silver-nocturne':
    case 'baroque-argentum':
    case 'sovereign-silverleaf':
    case 'chromeline-elegance':
    case 'frosted-sovereign':
      return BaseThree;
    case 'default':
      return BaseOne;
    default:
      return BaseOne;
  }
}

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
