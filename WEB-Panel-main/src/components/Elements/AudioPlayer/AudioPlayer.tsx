'use client';
import { PlaybackStatus } from '@/types/audio';
import { cn } from '@/utils/cn';
import { formatTime } from '@/utils/time';
import { motion, useAnimationControls, useMotionValue } from 'motion/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Play from '@/assets/icons/play.svg';
import Pause from '@/assets/icons/pause.svg';
import Trash from '@/assets/icons/trash.svg';
import Button from '../Button/Button';
import { useBreakpoints } from '@/hooks';
interface AudioPlayerProps {
  audioUrl: string;
  onDelete?: () => void;
  pauseOthersWhenActivated?: boolean;
}

function AudioPlayer({ audioUrl, onDelete, pauseOthersWhenActivated }: AudioPlayerProps) {
  const x = useMotionValue(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playbackBarRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [clipDuration, setClipDuration] = useState<number | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus | null>(null);
  const controls = useAnimationControls();
  const playbackDuration = useMotionValue<string>('00:00');
  const { isBelow } = useBreakpoints();

  const handleDragEnd = useCallback(() => {
    // Get current position and convert to time
    const containerWidth = playbackBarRef.current?.offsetWidth || 0;
    const elementWidth = playbackBarRef.current?.offsetHeight || 0;
    const maxX = containerWidth - elementWidth;

    // You'll need to track the current x position - see below
    const currentX = x.get();
    const progress = currentX / maxX;

    if (audioPlayerRef.current && clipDuration) {
      audioPlayerRef.current.currentTime = progress * clipDuration;
    }
    setIsDragging(false);
  }, [clipDuration, x]);

  const handleBarClicked = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (audioPlayerRef.current && clipDuration) {
        if (playbackStatus === 'playback-stopped') {
          audioPlayerRef.current.pause();
          setPlaybackStatus('playback-paused');
        }

        const containerWidth = playbackBarRef.current?.offsetWidth || 0;
        const containerX = playbackBarRef?.current?.getBoundingClientRect()?.left || 0;
        const elementWidth = playbackBarRef.current?.offsetHeight || 0;
        const maxX = containerWidth - elementWidth;

        const target = e.nativeEvent.clientX - containerX - elementWidth;
        const normalizedTarget = Math.max(0, Math.min(target, maxX));
        x.set(normalizedTarget);
        const progress = normalizedTarget / maxX;
        audioPlayerRef.current.currentTime = progress * clipDuration;
      }
    },
    [clipDuration, playbackStatus, x],
  );

  const stopAllAudio = () => {
    if (!pauseOthersWhenActivated) {
      return;
    }
    const audios = document.getElementsByTagName('audio');
    for (let i = 0; i < audios.length; i++) {
      audios[i].pause();
    }
  };

  useEffect(() => {
    if (playbackStatus === null) {
      x.set(0);
      playbackDuration.set('00:00');
      return;
    }

    const audio = audioPlayerRef.current;
    if (!audio) return;
    const updateProgress = () => {
      const setProgressBarPosition = (progress: number) => {
        const containerWidth = playbackBarRef.current?.offsetWidth || 0;
        const elementWidth = playbackBarRef.current?.offsetHeight || 0; // assuming square
        const maxX = containerWidth - elementWidth;
        const targetX = maxX * progress;
        controls.start({
          x: targetX,
          transition: { ease: 'linear', duration: targetX > x.get() ? 0.33 : 0 },
        });
      };
      // Only update if user isn't currently dragging
      if (!isDragging && clipDuration) {
        const progress = audio.currentTime / clipDuration;
        setProgressBarPosition(progress);
      }
      playbackDuration.set(formatTime(audio.currentTime * 1000));
    };

    audio.addEventListener('timeupdate', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [clipDuration, controls, isDragging, playbackDuration, playbackStatus, x]);

  useEffect(() => {
    if (!pauseOthersWhenActivated) {
      return;
    }
    const audio = audioPlayerRef.current;
    if (!audio) return;
    function handlePlayStopped() {
      setPlaybackStatus('playback-stopped');
    }
    function handlePlayPaused() {
      setPlaybackStatus('playback-paused');
    }
    audio.addEventListener('pause', handlePlayPaused);
    audio.addEventListener('ended', handlePlayStopped);
    return () => {
      audio.removeEventListener('pause', handlePlayPaused);
      audio.removeEventListener('ended', handlePlayStopped);
    };
  }, [audioUrl, pauseOthersWhenActivated]);

  return (
    <div className={cn('flex items-center justify-center gap-3')}>
      <div className={cn('align-center flex grow items-center gap-2', 'md:gap-4')} ref={wrapperRef}>
        <Button
          icon={playbackStatus === 'playing' ? <Pause /> : <Play />}
          type="button"
          className="my-auto"
          onClick={() => {
            if (playbackStatus === 'playing') {
              audioPlayerRef.current?.pause();
              setPlaybackStatus('playback-paused');
            } else {
              stopAllAudio();
              audioPlayerRef.current?.play();
              setPlaybackStatus('playing');
            }
          }}
          size={isBelow('lg') ? 'small' : 'default'}
        />
        <div className="aspect-[36/5] grow">
          <div className="flex h-full items-center justify-center">
            <div
              onClick={handleBarClicked}
              className={cn('border-shine-1 h-5.5 grow overflow-clip rounded-full bg-zinc-800')}
              ref={playbackBarRef}>
              <motion.div
                className={cn(
                  'bg-mauveine-900 absolute top-0 left-0 h-full w-full -translate-x-[calc(100%-var(--spacing)*5.5)] rounded-full',
                )}
                style={{ x }}></motion.div>
              <motion.div
                drag="x"
                onDragEnd={handleDragEnd}
                onMouseDown={() => {
                  audioPlayerRef.current?.pause();
                  setPlaybackStatus('playback-paused');
                  setIsDragging(true);
                }}
                onDragStart={() => {
                  audioPlayerRef.current?.pause();
                  setPlaybackStatus('playback-paused');
                  setIsDragging(true);
                }}
                animate={controls}
                className="full bg-mauveine-900 aspect-square h-full translate-x-0 rounded-full"
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                dragMomentum={false}
                dragElastic={0}
                style={{ x }}
                dragConstraints={playbackBarRef}></motion.div>
            </div>
          </div>
        </div>

        <motion.div className="w-11 shrink-0 grow-0 text-center text-sm font-semibold">
          {playbackDuration}
        </motion.div>
        {onDelete && (
          <Button
            icon={<Trash />}
            type="button"
            className="my-auto"
            onClick={onDelete}
            size={isBelow('lg') ? 'small' : 'default'}
          />
        )}
      </div>
      <audio
        controls
        src={audioUrl}
        ref={audioPlayerRef}
        preload="auto"
        className="hidden"
        onDurationChange={() => {
          if (audioPlayerRef.current) {
            setClipDuration(audioPlayerRef.current.duration);
            audioPlayerRef.current.currentTime = 0;
          }
        }}
        onEnded={() => {
          setPlaybackStatus('playback-stopped');
        }}
        onLoadedMetadata={() => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.currentTime = 1e101;
          }
        }}
      />
    </div>
  );
}

export default AudioPlayer;
