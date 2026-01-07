'use client';
import axios, { AxiosResponse } from 'axios';
import {
  CreateMemorialResponse,
  MemorialIdentityForm,
  TranscribeAudioResponse,
  UpdateMemorialPayload,
  VoiceCloneResponse,
} from '@/types/memorial';
import { createFormData } from '@/utils/formdata';

export async function createMemorial(data: MemorialIdentityForm): Promise<CreateMemorialResponse> {
  const formdata = createFormData(data);
  return axios
    .post('/api/memorial', formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res: AxiosResponse<CreateMemorialResponse>) => {
      return res.data;
    });
}

export async function updateMemorialWithFile(
  memorialId: string,
  payload: UpdateMemorialPayload,
): Promise<void> {
  const formdata = createFormData(payload);
  await axios.patch(`/api/memorial/owned/${memorialId}`, formdata, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscribeAudioResponse> {
  const formdata = new FormData();
  const mimeType = audioBlob.type || 'audio/webm';
  const file = new File([audioBlob], 'audio', { type: mimeType });
  formdata.append('audio', file);

  return axios
    .post('/api/memorial/transcribe', formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res: AxiosResponse<TranscribeAudioResponse>) => {
      return res.data;
    });
}

export async function generateVoiceClone(
  memorialId: string,
  blobs: Blob[],
  locale?: string,
): Promise<VoiceCloneResponse> {
  const formdata = new FormData();
  blobs.forEach((blob) => formdata.append('files', blob));
  return axios
    .post(`/api/memorial/ai-greeting/voice/${memorialId}`, formdata, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { locale },
    })
    .then((res: AxiosResponse<VoiceCloneResponse>) => {
      return res.data;
    });
}

export async function uploadAiGreetingImage(memorialId: string, image: File): Promise<void> {
  const formdata = createFormData({ image });
  return axios
    .post(`/api/memorial/ai-greeting/image/${memorialId}`, formdata, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res: AxiosResponse<void>) => {
      return res.data;
    });
}
