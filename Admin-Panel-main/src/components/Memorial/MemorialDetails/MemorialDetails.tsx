'use client';
import { AdminMemorialDetails, MemorialStatus } from '@/types/memorial';
import Image from 'next/image';
import React from 'react';
import LogoIcon from '@/assets/brand/logo-icon.svg';
import { CheckCircle2Icon, CopyIcon, ExternalLinkIcon } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { Button } from '../../ui/button';
import { addFeaturedMemorial, removeFeaturedMemorial } from '@/services/server/memorial';
import { useRouter } from 'next/navigation';
import { getWebsiteDomain } from '@/services/env';

interface MemorialDetailsProps {
  memorial: AdminMemorialDetails;
}

function MemorialDetails({ memorial }: MemorialDetailsProps) {
  const router = useRouter();

  return (
    <section className="grid grid-cols-[200px_1fr] gap-20 py-10">
      <div className="flex flex-col gap-5">
        <div className="flex aspect-square items-center justify-center overflow-clip rounded-lg border-4 border-y-zinc-800">
          {memorial.imagePath && (
            <Image src={memorial.imagePath} alt="Memorial Image" width={200} height={200} />
          )}
          {!memorial.imagePath && <LogoIcon className="text-muted-foreground h-24 w-24" />}
        </div>
        <h2 className="font-serif font-bold">Memorial ID:</h2>
        <div className="flex items-center gap-2 text-xs">
          <CopyIcon
            className="h-5 w-5 cursor-pointer"
            onClick={() => navigator.clipboard.writeText(memorial.id)}
          />
          {memorial.id}
        </div>
        <h2 className="font-serif font-bold">Owner ID:</h2>
        <a
          href={`/users/${memorial.ownerId}`}
          className="flex items-center gap-2 text-xs cursor-pointer hover:opacity-70 underline">
          <ExternalLinkIcon className="h-5 w-5" />
          {memorial.ownerId}
        </a>
        <h2 className="font-serif font-bold">View Memorial:</h2>
        <a
          href={`${getWebsiteDomain()}/memorial/${memorial.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 cursor-pointer hover:opacity-70 text-xs">
          <ExternalLinkIcon className="h-5 w-5" />
          Open in new tab
        </a>
        <h2 className="font-serif font-bold">Total Revenue:</h2>
        <div className="text-sm font-semibold">${memorial.totalRevenue}</div>
        <h2 className="font-serif font-bold">Total Memories:</h2>
        <div className="text-sm">{memorial.totalMemories}</div>
        <h2 className="font-serif font-bold">Total Condolences:</h2>
        <div className="text-sm">{memorial.totalCondolences}</div>
        <h2 className="font-serif font-bold">Total Donations:</h2>
        <div className="text-sm">{memorial.totalDonations}</div>
        {memorial.status === MemorialStatus.PUBLISHED && !memorial.isFeatured && (
          <Button
            onClick={async () => {
              await addFeaturedMemorial(memorial.id);
              window.alert('Memorial has been featured.');
              router.refresh();
            }}
            variant="outline"
            size="sm"
            className="cursor-pointer bg-green-950 hover:bg-green-900">
            Feature Memorial
          </Button>
        )}
        {memorial.status === MemorialStatus.PUBLISHED && memorial.isFeatured && (
          <Button
            onClick={async () => {
              await removeFeaturedMemorial(memorial.id);
              window.alert('Memorial has been unfeatured.');
              router.refresh();
            }}
            variant="outline"
            size="sm"
            className="cursor-pointer bg-yellow-950 hover:bg-yellow-900">
            Unfeature Memorial
          </Button>
        )}
      </div>
      <div className="grid max-w-200 grow grid-cols-2 gap-8">
        <div>
          <div className="mb-2 font-serif text-lg">Name:</div>
          <div className="font-sans font-light">{memorial.name}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Slug:</div>
          <div className="font-sans font-light">{memorial.slug}</div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Date of Birth:</div>
          <div className="font-sans font-light">
            {memorial.dateOfBirth ? formatDate(memorial.dateOfBirth, 'DD MMM YYYY') : '-'}
          </div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Date of Death:</div>
          <div className="font-sans font-light">
            {memorial.dateOfDeath ? formatDate(memorial.dateOfDeath, 'DD MMM YYYY') : '-'}
          </div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Place of Birth:</div>
          <div className="font-sans font-light">{memorial.placeOfBirth || '-'}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Place of Death:</div>
          <div className="font-sans font-light">{memorial.placeOfDeath || '-'}</div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Origin Country:</div>
          <div className="font-sans font-light">{memorial.originCountry || '-'}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Created At:</div>
          <div className="font-sans font-light">{formatDate(memorial.createdAt, 'DD MMM YYYY')}</div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Frame:</div>
          <div className="font-sans font-light">{memorial.frame}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Tribute:</div>
          <div className="font-sans font-light">{memorial.tribute}</div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Featured:</div>
          <div className="font-sans font-light">
            {memorial.isFeatured ? <CheckCircle2Icon /> : '-'}
          </div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Premium:</div>
          <div className="font-sans font-light">
            {memorial.isPremium ? <CheckCircle2Icon /> : '-'}
          </div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Status:</div>
          <div className="font-sans font-light">
            <span
              className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                memorial.status === MemorialStatus.PUBLISHED
                  ? 'text-green-600 bg-green-100'
                  : memorial.status === MemorialStatus.DRAFT
                    ? 'text-yellow-600 bg-yellow-100'
                    : 'text-red-600 bg-red-100'
              }`}>
              {memorial.status.charAt(0).toUpperCase() + memorial.status.slice(1)}
            </span>
          </div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Simm Tag Design:</div>
          <div className="font-sans font-light">{memorial.simmTagDesign ?? '-'}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Total Views:</div>
          <div className="font-sans font-light">{memorial.stats?.views || 0}</div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Total Likes:</div>
          <div className="font-sans font-light">{memorial.stats?.likes || 0}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Memories:</div>
          <div className="font-sans font-light">{memorial.stats?.memories || 0}</div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Condolences:</div>
          <div className="font-sans font-light">{memorial.stats?.condolences || 0}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Flowers:</div>
          <div className="font-sans font-light">{memorial.stats?.flowers || 0}</div>
        </div>

        <div>
          <div className="mb-2 font-serif text-lg">Candles:</div>
          <div className="font-sans font-light">{memorial.stats?.candles || 0}</div>
        </div>
        <div>
          <div className="mb-2 font-serif text-lg">Trees:</div>
          <div className="font-sans font-light">{memorial.stats?.trees || 0}</div>
        </div>

        <div className="col-span-2">
          <div className="mb-2 font-serif text-lg">About:</div>
          <div className="font-sans font-light whitespace-pre-wrap">{memorial.about || '-'}</div>
        </div>
      </div>
    </section>
  );
}

export default MemorialDetails;
