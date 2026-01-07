'use client';

import React from 'react';
import Logo from '@/assets/brand/logo.colored.svg';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { openCookieSettings } from '@/utils/cookie';
import Button from '../Elements/Button/Button';

function Footer() {
  const t = useTranslations('Footer');
  const tCommon = useTranslations('Common');
  const tCookie = useTranslations('CookieBanner');

  return (
    <footer className="container !mt-auto flex flex-col gap-10 px-4 py-9 text-center lg:px-8 lg:py-16 2xl:px-32 2xl:py-20">
      <div className="flex flex-col items-center gap-9">
        <Link className="h-6 2xl:h-8" href="/">
          <Logo />
        </Link>
        <div className="text- flex gap-5 text-sm 2xl:text-lg">
          <Link href="/memorial" className="font-semibold underline-offset-4 hover:underline">
            {tCommon('memorials')}
          </Link>
          <Link href="/about" className="font-semibold underline-offset-4 hover:underline">
            {tCommon('about')}
          </Link>
          <Link href="/faq" className="font-semibold underline-offset-4 hover:underline">
            {tCommon('faq')}
          </Link>
          <Link href="/contact" className="font-semibold underline-offset-4 hover:underline">
            {tCommon('contact')}
          </Link>
        </div>
      </div>
      <hr className="pt-2 text-white/15" />
      <div className="flex flex-col gap-6 text-xs lg:flex-row lg:justify-between 2xl:text-base">
        {t.rich('copyright', {
          year: () => new Date().getFullYear(),
        })}
        <div className="text-2xs flex flex-col justify-center gap-1 underline md:flex-row md:gap-6 2xl:text-sm">
          <Button
            variant="ghost"
            role="link"
            href={`/legal/gdpr-member.pdf`}
            className="p-0"
            size="small"
            target="_blank">
            {tCommon('privacyPolicy')}
          </Button>
          <Button
            variant="ghost"
            role="link"
            href={`/legal/terms-of-service.pdf`}
            className="p-0"
            size="small"
            target="_blank">
            {tCommon('termsOfService')}
          </Button>
          <Button
            variant="ghost"
            role="link"
            href={`/legal/community-guidelines.pdf`}
            className="p-0"
            size="small"
            target="_blank">
            {tCommon('communityGuidelines')}
          </Button>
          <Button
            variant="ghost"
            role="link"
            href={`/legal/gdpr-form.pdf`}
            target="_blank"
            className="p-0"
            size="small">
            {tCommon('gdprForm')}
          </Button>
          <Button
            variant="ghost"
            role="link"
            href={`/legal/gdpr.pdf`}
            target="_blank"
            className="p-0"
            size="small">
            {tCommon('gdpr')}
          </Button>
          <Button variant="ghost" onClick={openCookieSettings} className="p-0" size="small">
            {tCookie('cookieSettings')}
          </Button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
