//* Decorations *//
import AmetheraRose from '@/assets/decoration/amethera-rose.png';
import AmethystRavel from '@/assets/decoration/amethyst-ravel.png';
import AureliaBloom from '@/assets/decoration/aurelia-bloom.png';
import AzurePeonia from '@/assets/decoration/azure-peonia.png';
import CelestiaLily from '@/assets/decoration/celestia-lily.png';
import CircleOfSerenity from '@/assets/decoration/circle-of-serenity.png';
import CoraliaHibiscus from '@/assets/decoration/coralia-hibiscus.png';
import FrostariaBloom from '@/assets/decoration/frostaria-bloom.png';
import GoldenReverie from '@/assets/decoration/golden-reverie.png';
import IvoryWhisper from '@/assets/decoration/ivory-whisper.png';
import LunariaLily from '@/assets/decoration/lunaria-lily.png';
import NocturneCalla from '@/assets/decoration/nocturne-calla.png';
import RosaliaPeony from '@/assets/decoration/rosalia-peony.png';
import SeraphineCalla from '@/assets/decoration/seraphine-calla.png';
import SolariaBloom from '@/assets/decoration/solaria-bloom.png';
import SolarisHibiscus from '@/assets/decoration/solaris-hibiscus.png';
import SonataBloom from '@/assets/decoration/sonata-bloom.png';
import TrinityOfLight from '@/assets/decoration/trinity-of-light.png';
import VeloriaLisianthus from '@/assets/decoration/veloria-lisianthus.png';
import { MemorialDecoration, MemorialDonationWreath } from '@/types/memorial';
import { StaticImageData } from 'next/image';

//* Wreaths *//
import GoldEN from '@/assets/wreath/en/gold.png';
import RoseEN from '@/assets/wreath/en/rose.png';
import SilverEN from '@/assets/wreath/en/silver.png';
import PurpleEN from '@/assets/wreath/en/purple.png';
import GoldTR from '@/assets/wreath/tr/gold.png';
import RoseTR from '@/assets/wreath/tr/rose.png';
import SilverTR from '@/assets/wreath/tr/silver.png';
import PurpleTR from '@/assets/wreath/tr/purple.png';

export function getMemorialDecoration(
  decoration: Exclude<MemorialDecoration, 'no-decoration'>,
): StaticImageData {
  switch (decoration) {
    case 'amethera-rose':
      return AmetheraRose;
    case 'amethyst-ravel':
      return AmethystRavel;
    case 'aurelia-bloom':
      return AureliaBloom;
    case 'azure-peonia':
      return AzurePeonia;
    case 'celestia-lily':
      return CelestiaLily;
    case 'circle-of-serenity':
      return CircleOfSerenity;
    case 'coralia-hibiscus':
      return CoraliaHibiscus;
    case 'frostaria-bloom':
      return FrostariaBloom;
    case 'golden-reverie':
      return GoldenReverie;
    case 'ivory-whisper':
      return IvoryWhisper;
    case 'lunaria-lily':
      return LunariaLily;
    case 'nocturne-calla':
      return NocturneCalla;
    case 'rosalia-peony':
      return RosaliaPeony;
    case 'seraphine-calla':
      return SeraphineCalla;
    case 'solaria-bloom':
      return SolariaBloom;
    case 'solaris-hibiscus':
      return SolarisHibiscus;
    case 'sonata-bloom':
      return SonataBloom;
    case 'trinity-of-light':
      return TrinityOfLight;
    case 'veloria-lisianthus':
      return VeloriaLisianthus;
  }
}

export function getWreathImage(wreath: MemorialDonationWreath, locale: string): StaticImageData {
  switch (locale) {
    case 'tr':
      switch (wreath) {
        case 'gold':
          return GoldTR;
        case 'rose':
          return RoseTR;
        case 'silver':
          return SilverTR;
        case 'purple':
          return PurpleTR;
      }
    case 'en':
    default:
      switch (wreath) {
        case 'gold':
          return GoldEN;
        case 'rose':
          return RoseEN;
        case 'silver':
          return SilverEN;
        case 'purple':
          return PurpleEN;
      }
  }
}

export function getDonationItemCountFromWreath(wreath: MemorialDonationWreath): number {
  switch (wreath) {
    case 'silver':
      return 10;
    case 'rose':
      return 25;
    case 'gold':
      return 50;
    case 'purple':
      return 100;
  }
}
