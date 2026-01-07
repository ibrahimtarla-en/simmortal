import { RecordingStatus } from '@/types/audio';
import { formatTime } from '@/utils/time';
import { MotionValue, useAnimationFrame, useMotionValue, useTransform } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioRecorderReturn {
  recordingStatus: RecordingStatus;
  error: string | null;
  audioBlob: Blob | null;
  isSupported: boolean;
  audioUrl: string | undefined;
  displayDuration: MotionValue<string>;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setStatus: (status: RecordingStatus) => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lastUpdatedTime = useRef<number>(0);
  const timer = useMotionValue<number>(0);

  useAnimationFrame(() => {
    if (recordingStatus === 'recording') {
      timer.set(Date.now() - lastUpdatedTime.current + timer.get());
      lastUpdatedTime.current = Date.now();
    }
  });

  const displayDuration = useTransform(timer, formatTime);

  const isSupported =
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator?.mediaDevices?.getUserMedia !== 'undefined';

  const reset = useCallback(() => {
    setRecordingStatus('idle');
    setError(null);
    setAudioBlob(null);
    timer.set(0);

    chunksRef.current = [];
    lastUpdatedTime.current = 0;
    mediaRecorderRef.current = null;
  }, [timer]);

  const start = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording not supported');
      setRecordingStatus('error');
      return;
    }

    try {
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];
      lastUpdatedTime.current = Date.now();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError('Recording failed');
        setRecordingStatus('error');
        reset();
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current);
        setAudioBlob(blob);
        setRecordingStatus('recording-completed');
      };

      recorder.start();
      setRecordingStatus('recording');
      lastUpdatedTime.current = Date.now();
      // Simple timer that accounts for paused time
    } catch {
      setError('Microphone access denied');
      setRecordingStatus('error');
    }
  }, [isSupported, reset]);

  const pause = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.pause();
      setRecordingStatus('recording-paused');
    }
  }, []);

  const resume = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'paused') {
      recorder.resume();
      lastUpdatedTime.current = Date.now();
      setRecordingStatus('recording');
    }
  }, []);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'recording' || recorder?.state === 'paused') {
      recorder.stop();
    }
  }, []);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(undefined);
    }
  }, [audioBlob]);

  return {
    recordingStatus,
    error,
    audioBlob,
    isSupported,
    audioUrl,
    displayDuration,
    start,
    pause,
    resume,
    stop,
    reset,
    setStatus: setRecordingStatus,
  };
}
