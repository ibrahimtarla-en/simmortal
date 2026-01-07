import { User } from 'supertokens-node/types';
import { SimmortalsUser, SupportedLoginMethod, UserMetadataRecord } from './interface/user.interface';
import { UserEntity } from 'src/entities/UserEntity';
import { generateAssetUrl } from 'src/util/asset';

export function mapToSimmortalsUser(
  supertokensUser: User,
  metadata: UserMetadataRecord,
  userRecord: UserEntity,
): SimmortalsUser {
  return {
    userId: supertokensUser.id,
    loginMethod: supertokensUser.loginMethods[0].recipeId as SupportedLoginMethod,
    emailVerified: supertokensUser.loginMethods[0].verified,
    firstName: metadata.firstName ?? '',
    lastName: metadata.lastName ?? '',
    phoneNumber: metadata.phoneNumber ?? null,
    phoneNumberVerified: metadata.phoneNumberVerified ?? false,
    email: supertokensUser.loginMethods[0].email as string,
    location: metadata.location ?? null,
    dateOfBirth: metadata.dateOfBirth ?? null,
    joinedAt: new Date(supertokensUser.timeJoined).toISOString(),
    status: userRecord.status,
    profilePictureUrl: metadata.profilePicturePath
      ? generateAssetUrl(metadata.profilePicturePath)
      : null,
  };
}
