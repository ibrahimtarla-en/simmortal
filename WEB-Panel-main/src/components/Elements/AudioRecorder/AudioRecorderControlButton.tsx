'use client';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { AudioRecorderStatus, PlaybackStatus } from '@/types/audio';
import React, { useCallback, useMemo } from 'react';
import Play from '@/assets/icons/play.svg';
import Pause from '@/assets/icons/pause.svg';
import Microphone from '@/assets/icons/mic.svg';
import Stop from '@/assets/icons/stop.svg';
import Trash from '@/assets/icons/trash.svg';
import Button from '../Button/Button';
import { useBreakpoints } from '@/hooks';
import { cn } from '@/utils/cn';

interface AudioRecorderControlButtonProps {
  audioRecorderStatus: AudioRecorderStatus;
  controls: ReturnType<typeof useAudioRecorder>;
  audioPlayerRef: React.RefObject<HTMLAudioElement | null>;
  setPlaybackStatus: React.Dispatch<React.SetStateAction<PlaybackStatus | null>>;
  buttonSide: 'left' | 'right';
  onRecordStart?: () => void;
}

function AudioRecorderControlButton({
  audioRecorderStatus,
  controls,
  audioPlayerRef,
  setPlaybackStatus,
  buttonSide,
  onRecordStart,
}: AudioRecorderControlButtonProps) {
  const { pause, resume, start, stop, reset } = controls;
  const { isBelow } = useBreakpoints();

  const buttonIcon = useMemo(() => {
    if (buttonSide === 'right') {
      switch (audioRecorderStatus) {
        case 'idle':
          return <Microphone />;
        case 'recording':
        case 'recording-paused':
        case 'playback-paused':
        case 'playing':
          return <Stop />;
        case 'recording-completed':
        case 'playback-stopped':
        case 'error':
          return <Trash />;
      }
    } else {
      switch (audioRecorderStatus) {
        case 'recording':
        case 'playing':
          return <Pause />;
        case 'playback-paused':
        case 'recording-paused':
        case 'playback-stopped':
        case 'recording-completed':
          return <Play />;
        default:
          return undefined;
      }
    }
  }, [audioRecorderStatus, buttonSide]);

  const handleButtonClicked = useCallback(() => {
    if (buttonSide === 'left') {
      switch (audioRecorderStatus) {
        case 'recording':
          pause();
          break;
        case 'recording-paused':
          resume();
          break;
        case 'recording-completed':
          if (audioPlayerRef.current) {
            audioPlayerRef.current.currentTime = 0;
            audioPlayerRef.current.play();
            setPlaybackStatus('playing');
          }

          break;
        case 'playing':
          audioPlayerRef.current?.pause();
          setPlaybackStatus('playback-paused');
          break;
        case 'playback-paused':
          audioPlayerRef.current?.play();
          setPlaybackStatus('playing');
          break;
        case 'playback-stopped':
          if (audioPlayerRef.current) {
            audioPlayerRef.current.currentTime = 0;
            audioPlayerRef.current.play();
            setPlaybackStatus('playing');
          }
          break;
        default:
          break;
      }
    } else {
      switch (audioRecorderStatus) {
        case 'idle':
          start();
          break;
        case 'recording':
          onRecordStart?.();
          stop();
          break;
        case 'recording-completed':
        case 'playback-stopped':
          setPlaybackStatus(null);
          reset();
          break;
        case 'playing':
        case 'playback-paused':
          if (audioPlayerRef.current) {
            audioPlayerRef.current.currentTime = 0;
            audioPlayerRef.current.pause();
            setPlaybackStatus('playback-stopped');
          }
          break;
        default:
          break;
      }
    }
  }, [
    audioPlayerRef,
    audioRecorderStatus,
    buttonSide,
    onRecordStart,
    pause,
    reset,
    resume,
    setPlaybackStatus,
    start,
    stop,
  ]);

  return (
    <div className={cn('w-8 shrink-0 flex-col items-center justify-center', 'lg:w-11')}>
      {buttonIcon && (
        <Button
          icon={buttonIcon}
          type="button"
          className="my-auto"
          onClick={handleButtonClicked}
          size={isBelow('lg') ? 'small' : 'default'}
        />
      )}
    </div>
  );
}

export default AudioRecorderControlButton;
