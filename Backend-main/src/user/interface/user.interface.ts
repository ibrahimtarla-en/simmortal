import { UserEntity } from 'src/entities/UserEntity';
import { Nullable } from 'src/types/util';

export interface UserMetadataRecord {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  profilePicturePath?: string;
  dateOfBirth?: string;
  location?: string;
}

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

export interface SendPhoneNumberValidationCodeRequest {
  phoneNumber: string;
}
export interface ConsumePhoneNumberValidationCodeRequest {
  phoneNumber: string;
  code: string;
}

export enum UserAccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export interface UserEntityWithCounts extends UserEntity {
  totalSpentInCents: string;
  memorialsCreated: number;
  memorialsPublished: number;
  premiumMemorials: number;
  memoriesCreated: number;
  condolencesCreated: number;
  donationsCreated: number;
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
