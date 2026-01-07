import { getAccessToken } from '@/services/server/auth/sessionSSRHelper';
import { getBaseURL } from '@/services/env';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { DynamicRouteParams } from '@/types/util';

export async function POST(request: NextRequest, { params }: DynamicRouteParams<{ id: string }>) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const [{ id }] = await Promise.all([params]);

  if (origin && !origin.includes(host!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [accessToken, formData] = await Promise.all([getAccessToken(), request.formData()]);
  // Forward to backend
  const response = await axios.post(
    `${getBaseURL()}/api/v1/memorial/ai-greeting/image/${id}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${accessToken}` },
    },
  );

  return NextResponse.json(await response.data);
}
