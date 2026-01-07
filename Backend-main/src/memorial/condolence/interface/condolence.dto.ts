import { MemorialDecoration } from 'src/memorial/interface/memorial.interface';

export interface CreateCondolenceRequest {
  content: string;
}

export interface UpdateCondolencePayload {
  content: string;
  decoration: MemorialDecoration;
  donationCount: number;
}
