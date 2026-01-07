import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Nullable } from 'src/types/util';
import { getUser, deleteUser } from 'supertokens-node';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import UserRoles from 'supertokens-node/recipe/userroles';
import {
  AdminUserDetails,
  SimmortalsUser,
  UserAccountStatus,
  UserEntityWithCounts,
  UserMetadataRecord,
} from './interface/user.interface';
import { VerificationService } from 'src/verification/verification.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/UserEntity';
import { Repository } from 'typeorm';
import { ShopService } from 'src/shop/shop.service';
import { UpdateUserProfileRequest, UserDashboardUrlResponse } from './interface/user.dto';
import { generateVersionedFilePath } from 'src/util/asset';
import { StorageService } from 'src/storage/storage.service';
import { mapToSimmortalsUser } from './user.util';
import { MemorialStatus } from 'src/memorial/interface/memorial.interface';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly verificationService: VerificationService,
    private readonly shopService: ShopService,
    private readonly storageService: StorageService,
  ) {}

  private async getUserMetadata(userId: string): Promise<UserMetadataRecord> {
    const metadataResponse = await UserMetadata.getUserMetadata(userId);
    if (metadataResponse.status === 'OK') {
      return metadataResponse.metadata as UserMetadataRecord;
    }
    return {};
  }

  async ensureUserExists(userId: string): Promise<void> {
    try {
      const metadata = await this.getUserMetadata(userId);
      await this.userRepository.upsert(
        { userId, displayName: `${metadata.firstName ?? ''} ${metadata.lastName ?? ''}`.trim() },
        ['userId'],
      );
    } catch (error) {
      this.logger.error(`Failed to ensure user exists for ${userId}: ${error}`);
    }
  }

  async ensureThirdPartyUserInfo(
    userId: string,
    { firstName, lastName }: { firstName?: string; lastName?: string },
  ): Promise<void> {
    const currentMetadata = await this.getUserMetadata(userId);
    const update: Partial<UserMetadataRecord> = {};
    if (firstName && !currentMetadata.firstName) {
      update.firstName = firstName;
    }
    if (lastName && !currentMetadata.lastName) {
      update.lastName = lastName;
    }
    if (Object.keys(update).length > 0) {
      this.logger.log(`Updating third-party user info for ${userId}: ${JSON.stringify(update)}`);
      await UserMetadata.updateUserMetadata(userId, update);
    }
  }

  async markUserDeleted(userId: string): Promise<void> {
    await this.userRepository.update(
      { userId },
      { deletedAt: new Date(), displayName: null, status: UserAccountStatus.DELETED },
    );
    this.logger.log(`User ${userId} marked as deleted`);
  }

  async getUser(userId: string): Promise<Nullable<SimmortalsUser>> {
    const [metadata, supertokensUser, existingRecord] = await Promise.all([
      this.getUserMetadata(userId),
      getUser(userId),
      this.userRepository.findOne({ where: { userId } }),
    ]);
    if (!supertokensUser) return null;
    let userRecord = existingRecord;
    if (!userRecord) {
      await this.ensureUserExists(userId);
      userRecord = await this.userRepository.findOne({ where: { userId } });
      if (!userRecord) {
        this.logger.error(`Failed to create or find user record for ${userId}`);
        throw new HttpException(
          'User record could not be found or created',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return mapToSimmortalsUser(supertokensUser, metadata, userRecord);
  }

  async getAdminUserDetails(userId: string): Promise<Nullable<AdminUserDetails>> {
    const [metadata, supertokensUser, userRecord] = await Promise.all([
      this.getUserMetadata(userId),
      getUser(userId),
      this.userRepository
        .createQueryBuilder('user')
        .leftJoin('memorial', 'memorial', 'memorial.owner_id = user.user_id')
        .leftJoin('memory', 'memory', 'memory.owner_id = user.user_id')
        .leftJoin('condolence', 'condolence', 'condolence.owner_id = user.user_id')
        .leftJoin('donation', 'donation', 'donation.owner_id = user.user_id')
        .addSelect(
          '(SELECT COALESCE(SUM(value_in_cents), 0) FROM memorial_transaction WHERE user_id = user.user_id)',
          'totalSpentInCents',
        )
        .addSelect('COUNT(DISTINCT memorial.id)', 'memorialsCreated')
        .addSelect('COUNT(DISTINCT memory.id)', 'memoriesCreated')
        .addSelect('COUNT(DISTINCT condolence.id)', 'condolencesCreated')
        .addSelect('COUNT(DISTINCT donation.id)', 'donationsCreated')
        .addSelect(
          `COUNT(DISTINCT CASE WHEN memorial.status = '${MemorialStatus.PUBLISHED}' THEN memorial.id END)`,
          'memorialsPublished',
        )
        .addSelect(
          `COUNT(DISTINCT CASE WHEN memorial.is_premium = true THEN memorial.id END)`,
          'premiumMemorials',
        )
        .where('user.user_id = :userId', { userId })
        .groupBy('user.user_id')
        .getRawOne<UserEntityWithCounts>(),
    ]);

    if (!supertokensUser || !userRecord) return null;

    const totalSpentInCents = Number(userRecord.totalSpentInCents || 0);

    const baseUser = mapToSimmortalsUser(supertokensUser, metadata, userRecord);

    return {
      ...baseUser,
      totalSpent: (totalSpentInCents / 100).toFixed(2),
      memorialsCreated: Number(userRecord.memorialsCreated || 0),
      memoriesCreated: Number(userRecord.memoriesCreated || 0),
      condolencesCreated: Number(userRecord.condolencesCreated || 0),
      donationsCreated: Number(userRecord.donationsCreated || 0),
      memorialsPublished: Number(userRecord.memorialsPublished || 0),
      premiumMemorials: Number(userRecord.premiumMemorials || 0),
    };
  }

  async sendPhoneNumberVerificationCode(userId: string, phoneNumber: string): Promise<void> {
    const currentMetadata = await this.getUserMetadata(userId);
    if (!currentMetadata.phoneNumber) {
      await UserMetadata.updateUserMetadata(userId, {
        phoneNumber,
        phoneNumberVerified: false,
      });
    }
    await this.verificationService.sendSmsVerificationOtp(phoneNumber);
  }

  async verifyUserPhoneNumber(userId: string, phoneNumber: string, code: string): Promise<void> {
    const isCodeValid = await this.verificationService.validateSmsVerificationOtp(
      phoneNumber,
      code,
    );
    if (!isCodeValid) {
      throw new HttpException('Invalid verification code', HttpStatus.UNAUTHORIZED);
    }
    await UserMetadata.updateUserMetadata(userId, {
      phoneNumber,
      phoneNumberVerified: true,
    });
  }

  async getDashboardUrl(userId: string): Promise<UserDashboardUrlResponse> {
    const url = await this.shopService.createDashboardSessionUrl(userId);
    return { url };
  }

  async updateUserProfile(
    userId: string,
    payload: UpdateUserProfileRequest,
    image?: Express.Multer.File,
  ): Promise<void> {
    const [currentUser, currentUserMetadata] = await Promise.all([
      this.getUser(userId),
      this.getUserMetadata(userId),
    ]);
    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const update: UserMetadata.JSONObject = { ...payload };
    if (image) {
      // Upload image to storage and get URL
      const imagePath = generateVersionedFilePath(
        `users/${userId}/profile.${image.mimetype.split('/').pop() || 'png'}`,
      );
      await this.storageService.save(imagePath, image.buffer);
      if (currentUserMetadata.profilePicturePath) {
        await this.storageService.delete(currentUserMetadata.profilePicturePath).catch((e) => {
          this.logger.warn(`Failed to delete old profile picture for user ${userId}: ${e}`);
        });
      }
      update.profilePicturePath = imagePath;
    } else if (payload.deleteAsset && currentUserMetadata.profilePicturePath) {
      await this.storageService.delete(currentUserMetadata.profilePicturePath).catch((e) => {
        this.logger.warn(`Failed to delete profile picture for user ${userId}: ${e}`);
      });
      update.profilePicturePath = null;
    }
    update.deleteAsset = undefined; // Prevent storing this flag in metadata
    await UserMetadata.updateUserMetadata(userId, update);
    if (payload.firstName !== currentUser.firstName || payload.lastName !== currentUser.lastName) {
      const displayName = `${payload.firstName ?? currentUser.firstName} ${
        payload.lastName ?? currentUser.lastName
      }`.trim();
      await this.userRepository.update({ userId }, { displayName });
    }
  }

  async getAllUsers(): Promise<SimmortalsUser[]> {
    const users = await this.userRepository.find();
    const detailedUsers = await Promise.all(users.map((u) => this.getUser(u.userId)));
    return detailedUsers.filter((u): u is SimmortalsUser => u !== null);
  }

  async updateUserStatus(
    userId: string,
    status: UserAccountStatus,
    adminId: string,
  ): Promise<void> {
    await this.userRepository.upsert({ userId, status }, ['userId']);
    this.logger.log(`User ${userId} status updated to ${status} by admin ${adminId}`);
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const user = await getUser(userId);
    if (!user) {
      return false;
    }
    const { roles } = await UserRoles.getRolesForUser(user.tenantIds[0], userId);
    return roles.includes('admin');
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user?.status !== UserAccountStatus.ACTIVE) {
      throw new HttpException('User not found or not deletable', HttpStatus.NOT_FOUND);
    }
    const deleteResponse = await deleteUser(userId);
    if (deleteResponse.status !== 'OK') {
      this.logger.error(
        `Failed to delete user ${userId} from SuperTokens: ${JSON.stringify(deleteResponse)}`,
      );
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await this.markUserDeleted(userId);
  }
}
