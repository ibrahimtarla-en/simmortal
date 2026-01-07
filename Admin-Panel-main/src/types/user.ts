import { Nullable } from './util';

export type SupportedLoginMethod = 'thirdparty' | 'emailpassword';

export interface SimmortalsUser {
  userId: string;
  loginMethod: SupportedLoginMethod;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: Nullable<string>;
  phoneNumberVerified: boolean;
  email: string;
  profilePictureUrl: Nullable<string>;
  location: Nullable<string>;
  dateOfBirth: Nullable<string>;
  joinedAt: string;
  status: UserAccountStatus;
}

export interface AdminUserDetails extends SimmortalsUser {
  totalSpent: string;
  memorialsCreated: number;
  memorialsPublished: number;
  premiumMemorials: number;
  memoriesCreated: number;
  condolencesCreated: number;
  donationsCreated: number;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  location?: string;
  image?: File;
  deleteAsset?: boolean;
}

export enum UserAccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}
