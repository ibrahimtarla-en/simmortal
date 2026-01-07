import { TimelineMemory } from '@/types/memorial';

export const mockMemories: TimelineMemory[] = [
  {
    date: '7 Sep 1937',
    title: 'Birth',
    description: 'Cüneyt Arkın was born in Eskişehir, Turkey.',
  },
  {
    date: '21 Mar 1957',
    title: 'First Film',
    description: 'Cüneyt Arkın made his film debut in "The Last Man".',
  },
  {
    date: '15 Aug 1980',
    title: 'Cultural Icon',
    description: 'Cüneyt Arkın became a cultural icon in Turkish cinema.',
  },
  {
    date: '1 Jan 2000',
    title: 'Legacy',
    description: 'Cüneyt Arkın was recognized for his contributions to Turkish cinema.',
  },
  {
    date: '28 Jan 2022',
    title: 'Death',
    description: 'Cüneyt Arkın passed away in Istanbul, Turkey.',
  },
];

const timelineTemplateEn = [
  {
    date: '15 Mar 1945',
    title: 'Birth',
    description: (name: string) => `${name} was born.`,
  },
  {
    date: '22 Jun 1963',
    title: 'Graduation',
    description: (name: string) => `${name} graduated from high school and began a new journey.`,
  },
  {
    date: '14 Feb 1970',
    title: 'Marriage',
    description: (name: string) => `${name} married the love of their life.`,
  },
  {
    date: '3 May 1972',
    title: 'First Child',
    description: (name: string) => `${name} became a parent with the birth of their first child.`,
  },
  {
    date: '10 Sep 1985',
    title: 'Career Achievement',
    description: (name: string) => `${name} achieved a significant milestone in their career.`,
  },
  {
    date: '25 Dec 1995',
    title: 'Family Reunion',
    description: (name: string) =>
      `${name} brought the whole family together for an unforgettable celebration.`,
  },
  {
    date: '18 Aug 2005',
    title: 'Retirement',
    description: (name: string) => `${name} retired after a long and successful career.`,
  },
  {
    date: '7 Apr 2015',
    title: 'Grandparent Joy',
    description: (name: string) => `${name} met their first grandchild and embraced a new role.`,
  },
  {
    date: '12 Oct 2024',
    title: 'Passing',
    description: (name: string) => `${name} peacefully passed away surrounded by loved ones.`,
  },
];

const timelineTemplateTr = [
  {
    date: '15 Mar 1945',
    title: 'Doğum',
    description: (name: string) => `${name} dünyaya geldi.`,
  },
  {
    date: '22 Jun 1963',
    title: 'Mezuniyet',
    description: (name: string) => `${name} liseden mezun oldu ve yeni bir yolculuğa başladı.`,
  },
  {
    date: '14 Feb 1970',
    title: 'Evlilik',
    description: (name: string) => `${name} hayatının aşkıyla evlendi.`,
  },
  {
    date: '3 May 1972',
    title: 'İlk Çocuk',
    description: (name: string) => `${name} ilk çocuğunun dünyaya gelmesiyle ebeveyn oldu.`,
  },
  {
    date: '10 Sep 1985',
    title: 'Kariyer Başarısı',
    description: (name: string) => `${name} kariyerinde önemli bir başarıya imza attı.`,
  },
  {
    date: '25 Dec 1995',
    title: 'Aile Bir Araya Geldi',
    description: (name: string) =>
      `${name} tüm aileyi unutulmaz bir kutlama için bir araya getirdi.`,
  },
  {
    date: '18 Aug 2005',
    title: 'Emeklilik',
    description: (name: string) => `${name} uzun ve başarılı bir kariyerin ardından emekli oldu.`,
  },
  {
    date: '7 Apr 2015',
    title: 'Torun Sevinci',
    description: (name: string) => `${name} ilk torunuyla tanıştı ve yeni bir rol üstlendi.`,
  },
  {
    date: '12 Oct 2024',
    title: 'Vefat',
    description: (name: string) => `${name} sevdiklerinin yanında huzur içinde aramızdan ayrıldı.`,
  },
];

export const getMockTimeline = (name?: string, locale?: string): TimelineMemory[] => {
  const template = locale === 'tr' ? timelineTemplateTr : timelineTemplateEn;

  return template.map((item) => ({
    date: item.date,
    title: item.title,
    description: item.description(name ?? 'John Doe'),
  }));
};
