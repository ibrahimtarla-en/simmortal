import { getBaseURL } from '@/services/env';
import { getAccessToken } from '@/services/server/auth/sessionSSRHelper';
import { DynamicRouteParams } from '@/types/util';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: DynamicRouteParams<{ id: string }>) {
  // Basic origin check
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const { id } = await params;

  if (origin && !origin.includes(host!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const [accessToken, formData] = await Promise.all([getAccessToken(), request.formData()]);
  // Forward to backend
  const response = await axios.patch(`${getBaseURL()}/api/v1/memorial/owned/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${accessToken}` },
  });

  return NextResponse.json(await response.data);
}
