'use client';
import React, { useState } from 'react';
import {
  Condolence,
  CondolenceWithMemorialInfo,
  isCondolanceWithMemorialInfo,
} from '@/types/condolence';
import { likeCondolence, unlikeCondolence } from '@/services/server/condolence';
import BaseCondolenceCard from './BaseCondolenceCard';
import { useUserStore } from '@/store';
import { useRouter } from '@/i18n/navigation';
import { exists } from '@/utils/exists';

interface CondolenceCardProps {
  condolence: Condolence | CondolenceWithMemorialInfo;
  className?: string;
  previewMode?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  showMemorialInfo?: boolean;
}

function CondolenceCard({
  condolence,
  className,
  previewMode,
  onLike,
  onUnlike,
  onClick,
  onDelete,
  showMemorialInfo,
}: CondolenceCardProps) {
  const [isLiked, setIsLiked] = useState(condolence.isLikedByUser);
  const [totalLikes, setTotalLikes] = useState(condolence.totalLikes);
  const { user } = useUserStore();
  const router = useRouter();

  const handleLike = async () => {
    if (!exists(user)) {
      router.push('/login');
      return;
    }
    setIsLiked(true);
    if (!condolence.memorialSlug) return;
    setTotalLikes((prev) => prev + 1);
    onLike?.();
    if (previewMode) return;
    await likeCondolence(condolence.memorialSlug, condolence.id);
  };

  const handleUnlike = async () => {
    if (!exists(user)) {
      router.push('/login');
      return;
    }
    setIsLiked(false);
    if (!condolence.memorialSlug) return;
    setTotalLikes((prev) => (prev > 0 ? prev - 1 : 0));
    onUnlike?.();
    if (previewMode) return;

    await unlikeCondolence(condolence.memorialSlug, condolence.id);
  };

  return (
    <BaseCondolenceCard
      id={condolence.id}
      content={condolence.content || ''}
      decoration={condolence.decoration || undefined}
      author={condolence.author}
      date={condolence.createdAt}
      totalLikes={totalLikes}
      isLikedByUser={isLiked}
      handleLike={handleLike}
      handleUnlike={handleUnlike}
      className={className}
      isPreview={previewMode}
      onClick={onClick}
      memorialSlug={condolence.memorialSlug}
      onDelete={onDelete}
      showMemorialInfo={showMemorialInfo}
      memorial={isCondolanceWithMemorialInfo(condolence) ? condolence.memorial : undefined}
    />
  );
}

export default CondolenceCard;
