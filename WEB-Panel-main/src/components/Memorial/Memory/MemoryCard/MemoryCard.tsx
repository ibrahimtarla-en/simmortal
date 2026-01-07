'use client';
import { likeMemory, unlikeMemory } from '@/services/server/memory';
import BaseMemoryCard from './BaseMemoryCard';
import { useMemoryAsset } from '@/hooks/useMemoryAsset';
import { useState } from 'react';
import { Memory } from '@/types/memory';
import { useUserStore } from '@/store';
import { useRouter } from '@/i18n/navigation';
import { exists } from '@/utils/exists';
import { PublishedMemorial } from '@/types/memorial';

interface MemoryCardProps {
  memory: Memory;
  previewMode?: boolean;
  onClick?: () => void;
  onLike?: () => void;
  onUnlike?: () => void;
  onDelete?: () => void;
  showVideoControls?: boolean;
  showMemorialInfo?: boolean;
  memorial?: PublishedMemorial;
}

function MemoryCard({
  memory,
  previewMode,
  onClick,
  onLike,
  onUnlike,
  onDelete,
  showVideoControls = false,
  showMemorialInfo = false,
  memorial,
}: MemoryCardProps) {
  const { withAsset, withoutAsset } = useMemoryAsset(memory);
  const [isLiked, setIsLiked] = useState(memory.isLikedByUser);
  const [totalLikes, setTotalLikes] = useState(memory.totalLikes);
  const { user } = useUserStore();
  const router = useRouter();

  const handleLike = async () => {
    if (!exists(user)) {
      router.push('/login');
      return;
    }
    setIsLiked(true);
    setTotalLikes((prev) => prev + 1);
    onLike?.();
    if (previewMode) return;
    await likeMemory(memory.memorialSlug, memory.id);
  };

  const handleUnlike = async () => {
    if (!exists(user)) {
      router.push('/login');
      return;
    }
    setIsLiked(false);
    setTotalLikes((prev) => (prev > 0 ? prev - 1 : 0));
    onUnlike?.();
    if (previewMode) return;
    await unlikeMemory(memory.memorialSlug, memory.id);
  };

  return (
    <>
      {withAsset && (
        <BaseMemoryCard
          id={memory.id}
          date={withAsset.date}
          author={withAsset.author}
          content={withAsset.content}
          tribute={withAsset.assetDecoration || 'default'}
          assetPath={withAsset.assetPath}
          assetType={withAsset.assetType}
          donationCount={withAsset.donationCount}
          totalLikes={totalLikes}
          isLikedByUser={isLiked}
          handleLike={handleLike}
          handleUnlike={handleUnlike}
          createdAt={withAsset.createdAt}
          previewMode={previewMode}
          onClick={onClick}
          memorialSlug={withAsset.memorialSlug}
          onDelete={onDelete}
          showVideoControls={showVideoControls}
          showMemorialInfo={showMemorialInfo}
          memorial={memorial}
        />
      )}
      {withoutAsset && (
        <BaseMemoryCard
          id={memory.id}
          date={withoutAsset.date}
          author={withoutAsset.author}
          content={withoutAsset.content}
          decoration={withoutAsset.decoration || 'no-decoration'}
          donationCount={withoutAsset.donationCount}
          totalLikes={totalLikes}
          isLikedByUser={isLiked}
          handleLike={handleLike}
          handleUnlike={handleUnlike}
          createdAt={withoutAsset.createdAt}
          previewMode={previewMode}
          onClick={onClick}
          memorialSlug={withoutAsset.memorialSlug}
          onDelete={onDelete}
          showVideoControls={showVideoControls}
          showMemorialInfo={showMemorialInfo}
          memorial={memorial}
        />
      )}
    </>
  );
}

export default MemoryCard;
