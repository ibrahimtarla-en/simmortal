'use client';
import axios, { AxiosResponse } from 'axios';
import { createFormData } from '@/utils/formdata';
import { UpdateMemoryPayload, Memory, MemoryAboutForm } from '@/types/memory';

export async function createMemory(memorialId: string, data: MemoryAboutForm): Promise<Memory> {
  const formdata = createFormData(data);

  return axios
    .post(`/api//memorial/${memorialId}/memory/create`, formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res: AxiosResponse<Memory>) => {
      return res.data;
    });
}

export async function updateMemoryWithFile(
  memorialId: string,
  memoryId: string,
  payload: Partial<UpdateMemoryPayload>,
): Promise<void> {
  const formdata = createFormData(payload);
  await axios.patch(`/api/memorial/${memorialId}/memory/${memoryId}`, formdata, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
