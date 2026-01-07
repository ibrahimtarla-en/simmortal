export type RecordingStatus =
  | 'idle'
  | 'recording'
  | 'recording-paused'
  | 'recording-completed'
  | 'error';

export type PlaybackStatus = 'playing' | 'playback-paused' | 'playback-stopped';

export type AudioRecorderStatus = RecordingStatus | PlaybackStatus;
