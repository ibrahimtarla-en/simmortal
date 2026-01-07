import { PlaybackStatus } from '@/types/audio';
import { formatTime } from '@/utils/time';
import { MotionValue, useAnimationFrame, useMotionValue, useTransform } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioPlayerReturn {
  playbackStatus: PlaybackStatus;
  audioUrl: string | undefined;
  duration: number | null;
  currentTime: MotionValue<number>;
  displayCurrentTime: MotionValue<string>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setAudioUrl: (url: string | undefined) => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('playback-stopped');
  const [audioUrl, setAudioUrlState] = useState<string | undefined>(undefined);
  const [duration, setDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTime = useMotionValue<number>(0);
  const displayCurrentTime = useTransform(currentTime, (latest) => formatTime(latest * 1000));

  useAnimationFrame(() => {
    if (playbackStatus === 'playing' && audioRef.current) {
      currentTime.set(audioRef.current.currentTime);
    }
  });

  const play = useCallback(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setPlaybackStatus('playing');
    }
  }, [audioUrl]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackStatus('playback-paused');
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      currentTime.set(0);
      setPlaybackStatus('playback-stopped');
    }
  }, [currentTime]);

  const seek = useCallback(
    (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        currentTime.set(time);
      }
    },
    [currentTime],
  );

  const setAudioUrl = useCallback(
    (url: string | undefined) => {
      setAudioUrlState(url);
      setPlaybackStatus('playback-stopped');
      setDuration(null);
      currentTime.set(0);
    },
    [currentTime],
  );

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      audio.currentTime = 0; // Reset to beginning
    };

    const handleTimeUpdate = () => {
      if (playbackStatus === 'playing') {
        currentTime.set(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setPlaybackStatus('playback-stopped');
      currentTime.set(0);
    };

    const handlePause = () => {
      if (playbackStatus === 'playing') {
        setPlaybackStatus('playback-paused');
      }
    };

    const handlePlay = () => {
      setPlaybackStatus('playing');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.pause();
      audio.src = '';
    };
  }, [currentTime, playbackStatus]); // Removed audioUrl from dependencies to prevent re-adding listeners

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl || '';
      if (!audioUrl) {
        setDuration(null);
        currentTime.set(0);
      }
    }
  }, [audioUrl, currentTime]);

  return {
    playbackStatus,
    audioUrl,
    duration,
    currentTime,
    displayCurrentTime,
    play,
    pause,
    stop,
    seek,
    setAudioUrl,
  };
}
