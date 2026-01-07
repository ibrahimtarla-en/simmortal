export interface GoEnchanceAICreateResponse {
  code: number;
  msg: string;
  data?: {
    img_uuid?: string;
  };
}

export interface GoEnchanceAIStatusResponse {
  code: number;
  msg: string;
  data?: {
    status: string;
    json?: {
      type: string;
      value: string;
    }[];
  };
}

export interface HeygenImageUploadResponse {
  code: number;
  data?: {
    id: string;
    name: string;
    file_type: 'image';
    created_ts: string;
    url: string;
    image_key: string;
  };
  msg: string;
  message: null;
}

export interface HeygenAudioUploadResponse {
  code: number;
  data?: {
    id: string;
    name: string;
    file_type: 'audio';
    created_ts: string;
    url: string;
    image_key?: string | null;
  };
  msg: string;
  message: null;
}

export interface HeygenAsset {
  id: string;
  type: 'image' | 'audio';
  image_key: string | null;
  url: string;
}

export interface HeygenVideoGenerateResponse {
  error: null | string;
  data?: { video_id?: string };
}

export interface HeygenVideoStatusResponse {
  error: null | string;
  data?: {
    status: 'processing' | 'completed' | 'failed' | 'pending';
    video_url?: string;
  };
}

export interface GenerateHeygenVideoConfig {
  imageKey: string;
  audioUrl: string;
  videoTitle: string;
  maxRetries: number;
}

export enum AiGreetingState {
  READY = 'ready',
  PROCESSING_AUDIO = 'processing-audio',
  PROCESSING_VIDEO = 'processing-video',
  ERROR = 'error',
  COMPLETED = 'completed',
}

export interface AiGreeting {
  memorialId: string;
  audioPath: string | null;
  imagePath: string | null;
  videoPath: string | null;
  state: AiGreetingState;
}
