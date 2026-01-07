import { Link } from '@/i18n/navigation';
import { cn } from '@/utils/cn';
import { getTranslations } from 'next-intl/server';
import React from 'react';

async function FAQPage() {
  const t = await getTranslations('FAQ');

  const sections = [
    {
      title: t('General.title'),
      items: [
        {
          question: t('General.whatIsSimmortals.question'),
          answer: t('General.whatIsSimmortals.answer'),
        },
        {
          question: t('General.whatIsMemorialPage.question'),
          answer: t('General.whatIsMemorialPage.answer'),
        },
        {
          question: t('General.whoCanUse.question'),
          answer: t('General.whoCanUse.answer'),
        },
        {
          question: t('General.howToCreate.question'),
          answer: t('General.howToCreate.answer'),
        },
        {
          question: t('General.isFree.question'),
          answer: t('General.isFree.answer'),
        },
      ],
    },
    {
      title: t('CreatingManaging.title'),
      items: [
        {
          question: t('CreatingManaging.whoCanContribute.question'),
          answer: t('CreatingManaging.whoCanContribute.answer'),
        },
        {
          question: t('CreatingManaging.howLongActive.question'),
          answer: t('CreatingManaging.howLongActive.answer'),
        },
        {
          question: t('CreatingManaging.arePublic.question'),
          answer: t('CreatingManaging.arePublic.answer'),
        },
      ],
    },
    {
      title: t('PrivacySafety.title'),
      items: [
        {
          question: t('PrivacySafety.howToReport.question'),
          answer: t('PrivacySafety.howToReport.answer'),
        },
        {
          question: t('PrivacySafety.whatHappensReported.question'),
          answer: t('PrivacySafety.whatHappensReported.answer'),
        },
        {
          question: t('PrivacySafety.howModerated.question'),
          answer: t('PrivacySafety.howModerated.answer'),
        },
      ],
    },
    {
      title: t('PaymentsPlans.title'),
      items: [
        {
          question: t('PaymentsPlans.premiumFeatures.question'),
          answer: t('PaymentsPlans.premiumFeatures.answer'),
        },
        {
          question: t('PaymentsPlans.howToPay.question'),
          answer: t('PaymentsPlans.howToPay.answer'),
        },
        {
          question: t('PaymentsPlans.howToCancel.question'),
          answer: t('PaymentsPlans.howToCancel.answer'),
        },
        {
          question: t('PaymentsPlans.whatHappensCancel.question'),
          answer: t('PaymentsPlans.whatHappensCancel.answer'),
        },
      ],
    },
    {
      title: t('TributesInteractions.title'),
      items: [
        {
          question: t('TributesInteractions.whatAreDigitalTributes.question'),
          answer: t('TributesInteractions.whatAreDigitalTributes.answer'),
        },
        {
          question: t('TributesInteractions.whoCanLeave.question'),
          answer: t('TributesInteractions.whoCanLeave.answer'),
        },
      ],
    },
    {
      title: t('KeyFeatures.title'),
      items: [
        {
          question: t('KeyFeatures.whatIsSimmTag.question'),
          answer: t('KeyFeatures.whatIsSimmTag.answer'),
        },
        {
          question: t('KeyFeatures.howToOrderSimmTag.question'),
          answer: t('KeyFeatures.howToOrderSimmTag.answer'),
        },
        {
          question: t('KeyFeatures.whatDoesQRDo.question'),
          answer: t('KeyFeatures.whatDoesQRDo.answer'),
        },
        {
          question: t('KeyFeatures.whatIsTimeline.question'),
          answer: t('KeyFeatures.whatIsTimeline.answer'),
        },
        {
          question: t('KeyFeatures.canShare.question'),
          answer: t('KeyFeatures.canShare.answer'),
        },
      ],
    },
    {
      title: t('Support.title'),
      items: [
        {
          question: t('Support.howToGetSupport.question'),
          answer: t.rich('Support.howToGetSupport.answer', {
            link: (chunks) => (
              <Link href="contact" className="underline" target="_blank">
                {chunks}
              </Link>
            ),
          }),
        },
        {
          question: t('Support.howToDeletePage.question'),
          answer: t('Support.howToDeletePage.answer'),
        },
        {
          question: t('Support.howToDeleteAccount.question'),
          answer: t('Support.howToDeleteAccount.answer'),
        },
      ],
    },
  ];

  return (
    <main className={cn('container flex flex-col gap-8 py-8', 'lg:gap-12 lg:py-12')}>
      <div>
        <h1 className="font-serif text-3xl font-medium">{t('title')}</h1>
      </div>
      <div className="flex flex-col gap-10">
        {sections.map((section, index) => (
          <FAQSection key={index} title={section.title} items={section.items} />
        ))}
      </div>
    </main>
  );
}

interface FAQItemProps {
  question: string | React.ReactNode;
  answer: string | React.ReactNode;
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <details className="group rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-left font-medium transition-colors hover:bg-zinc-800/50">
        <span className="text-lg font-semibold">{question}</span>
        <svg
          className="h-5 w-5 flex-shrink-0 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-5 pt-2 pb-4">
        <p className="text-base leading-relaxed whitespace-pre-line text-zinc-300">{answer}</p>
      </div>
    </details>
  );
}

interface FAQSectionProps {
  title: string;
  items: FAQItemProps[];
}

function FAQSection({ title, items }: FAQSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-medium">{title}</h2>
      <div className="space-y-3">
        {items.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
}

export default FAQPage;
