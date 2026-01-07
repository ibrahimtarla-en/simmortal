import { MemorialDecoration, MemorialTribute } from 'src/memorial/interface/memorial.interface';

export interface UpdateMemoryPayload {
  content: string;
  date: string;
  decoration: MemorialDecoration;
  assetDecoration: MemorialTribute;
  deleteAsset: boolean;
  donationCount: number;
}
export interface CreateMemoryRequest {
  content: string;
  date: string;
}
