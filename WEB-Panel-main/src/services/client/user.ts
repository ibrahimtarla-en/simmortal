import { UpdateUserProfileRequest } from '@/types/user';
import { createFormData } from '@/utils/formdata';
import axios from 'axios';

export async function updateUserWithFile(
  payload: Partial<UpdateUserProfileRequest>,
): Promise<void> {
  const formdata = createFormData(payload);
  await axios.patch(`/api/user`, formdata, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
