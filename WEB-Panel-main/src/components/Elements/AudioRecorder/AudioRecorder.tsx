'use client';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import soundWave from '@/assets/lottie/sounde-wave.json';
import type { DotLottie } from '@lottiefiles/dotlottie-web';
import { motion, useAnimationControls, useMotionValue, useTransform } from 'motion/react';
import { AudioRecorderStatus, PlaybackStatus } from '@/types/audio';
import AudioRecorderControlButton from './AudioRecorderControlButton';
import { formatTime } from '@/utils/time';
import { cn } from '@/utils/cn';

interface AudioRecorderProps {
  recorder: ReturnType<typeof useAudioRecorder>;
  onRecordStart?: () => void;
}

export default function AudioRecorder({ recorder, onRecordStart }: AudioRecorderProps) {
  const { recordingStatus, audioUrl, displayDuration } = recorder;

  const [player, setPlayer] = useState<DotLottie | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playbackBarRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [clipDuration, setClipDuration] = useState<number | null>(null);

  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus | null>(null);

  const playbackDuration = useMotionValue<string>('00:00');

  const status = useMemo<AudioRecorderStatus>(
    () => playbackStatus ?? recordingStatus,
    [recordingStatus, playbackStatus],
  );

  const controls = useAnimationControls();
  const x = useMotionValue(0);

  const duration = useTransform(() => {
    return audioUrl && clipDuration ? playbackDuration.get() : displayDuration.get();
  });

  useEffect(() => {
    audioPlayerRef.current?.addEventListener('ended', () => {
      setPlaybackStatus('playback-stopped');
    });
  }, [setPlaybackStatus]);

  useEffect(() => {
    function adjustPlayerSize() {
      if (player) {
        player.resize();
      }
    }
    window.addEventListener('resize', adjustPlayerSize);
    adjustPlayerSize();

    return () => {
      window.removeEventListener('resize', adjustPlayerSize);
    };
  }, [player]);

  useEffect(() => {
    if (recordingStatus === 'recording' && player) {
      player.play();
    } else if (player) {
      player.pause();
    }
  }, [player, recordingStatus]);

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

  return (
    <div className={cn('flex items-center justify-center gap-3')}>
      <div className={cn('align-center flex grow items-center gap-2', 'md:gap-4')} ref={wrapperRef}>
        <AudioRecorderControlButton
          audioRecorderStatus={status}
          controls={recorder}
          audioPlayerRef={audioPlayerRef}
          setPlaybackStatus={setPlaybackStatus}
          buttonSide="left"
        />
        <div className="aspect-[36/5] grow">
          {!audioUrl && <DotLottieReact data={soundWave} dotLottieRefCallback={setPlayer} loop />}
          {audioUrl && clipDuration && (
            <div className="flex h-full items-center justify-center">
              <div
                onClick={handleBarClicked}
                className={cn(
                  'border-shine-1 h-5.5 grow overflow-clip rounded-full bg-zinc-800',
                  'lg:h-11',
                )}
                ref={playbackBarRef}>
                <motion.div
                  className={cn(
                    'bg-mauveine-900 absolute top-0 left-0 h-full w-full -translate-x-[calc(100%-var(--spacing)*5.5)] rounded-full',
                    'lg:-translate-x-[calc(100%-var(--spacing)*11)]',
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
          )}
        </div>
        <AudioRecorderControlButton
          audioRecorderStatus={status}
          controls={recorder}
          audioPlayerRef={audioPlayerRef}
          setPlaybackStatus={setPlaybackStatus}
          buttonSide="right"
          onRecordStart={onRecordStart}
        />
      </div>
      <motion.div className="w-11 shrink-0 grow-0 text-center text-sm font-semibold">
        {duration}
      </motion.div>

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
