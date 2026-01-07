'use client';
import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/date';
import { Memory, Condolence, Donation, AssetType } from '@/types/memorial';

type ContributionPreviewProps =
  | {
      type: 'memory';
      contribution: Memory;
      onClose: () => void;
    }
  | {
      type: 'condolence';
      contribution: Condolence;
      onClose: () => void;
    }
  | {
      type: 'donation';
      contribution: Donation;
      onClose: () => void;
    };

function ContributionPreview({ type, contribution, onClose }: ContributionPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-zinc-900 p-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={onClose}
          aria-label="Close">
          <X className="h-5 w-5" />
        </Button>

        <h2 className="mb-6 text-2xl font-bold">
          {type === 'memory' && 'Memory Preview'}
          {type === 'condolence' && 'Condolence Preview'}
          {type === 'donation' && 'Donation Preview'}
        </h2>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
              <span className="text-lg font-bold">
                {contribution.author.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="font-semibold">
                {contribution.author.name || 'Anonymous'}
                {contribution.author.verified && (
                  <span className="ml-1 text-blue-500">✓</span>
                )}
              </p>
              <p className="text-sm text-zinc-400">
                {formatDate(
                  typeof contribution.createdAt === 'string'
                    ? contribution.createdAt
                    : contribution.createdAt.toISOString(),
                  'DD MMM YYYY HH:mm',
                )}
              </p>
            </div>
          </div>

          {/* Content based on type */}
          {type === 'memory' && (
            <>
              {'assetPath' in contribution && contribution.assetPath && (
                <div className="overflow-hidden rounded-lg bg-black">
                  {contribution.assetType === AssetType.VIDEO ? (
                    <video
                      src={contribution.assetPath}
                      controls
                      className="h-auto w-full"
                      style={{ maxHeight: '500px' }}>
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={contribution.assetPath}
                      alt="Memory media"
                      width={600}
                      height={400}
                      className="h-auto w-full object-cover"
                    />
                  )}
                </div>
              )}
              <div className="rounded-lg bg-zinc-800 p-4">
                <p className="whitespace-pre-wrap">{contribution.content}</p>
              </div>
              <div className="text-sm text-zinc-400">Total Likes: {contribution.totalLikes}</div>
            </>
          )}

          {type === 'condolence' && (
            <>
              <div className="rounded-lg bg-zinc-800 p-4">
                <p className="whitespace-pre-wrap">{contribution.content}</p>
              </div>
              <div className="text-sm text-zinc-400">Total Likes: {contribution.totalLikes}</div>
              {contribution.decoration && (
                <div className="text-sm text-zinc-400">
                  Decoration: <span className="capitalize">{contribution.decoration}</span>
                </div>
              )}
            </>
          )}

          {type === 'donation' && (
            <>
              <div className="rounded-lg bg-zinc-800 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-lg font-semibold">Wreath:</span>
                  <span className="capitalize text-lg">{contribution.wreath}</span>
                </div>
                <div className="text-sm text-zinc-400">Total Likes: {contribution.totalLikes}</div>
              </div>
            </>
          )}

          {/* User ID */}
          <div className="text-xs text-zinc-500">
            User ID: {contribution.author.id} | Contribution ID: {contribution.id}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContributionPreview;
