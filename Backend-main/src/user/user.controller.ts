import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { Session } from 'supertokens-nestjs';
import {
  ConsumePhoneNumberValidationCodeRequest,
  SendPhoneNumberValidationCodeRequest,
} from './interface/user.interface';
import { UpdateUserProfileRequest } from './interface/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MemoryService } from 'src/memorial/memory/memory.service';
import { MemorialContributionSortField } from 'src/memorial/interface/memorial.interface';
import { CondolenceService } from 'src/memorial/condolence/condolence.service';
import { DonationService } from 'src/memorial/donation/donation.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly memoryService: MemoryService,
    private readonly condolenceService: CondolenceService,
    private readonly donationService: DonationService,
  ) {}

  @Get()
  async getUserInfo(@Session() session: SessionContainer) {
    const userId = session.getUserId();
    return this.userService.getUser(userId);
  }

  @Post('phone-number/send-validation-code')
  async sendPhoneNumberValidationCode(
    @Session() session: SessionContainer,
    @Body() body: SendPhoneNumberValidationCodeRequest,
  ) {
    const userId = session.getUserId();
    return this.userService.sendPhoneNumberVerificationCode(userId, body.phoneNumber);
  }

  @Post('phone-number/consume-validation-code')
  async consumePhoneNumberValidationCode(
    @Session() session: SessionContainer,
    @Body() body: ConsumePhoneNumberValidationCodeRequest,
  ) {
    const userId = session.getUserId();
    return this.userService.verifyUserPhoneNumber(userId, body.phoneNumber, body.code);
  }

  @Get('dashboard')
  async getDashboardUrl(@Session() session: SessionContainer) {
    const userId = session.getUserId();
    return this.userService.getDashboardUrl(userId);
  }

  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
      },
    }),
  )
  @Patch()
  async updateUserProfile(
    @Session() session: SessionContainer,
    @Body() body: UpdateUserProfileRequest,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const userId = session.getUserId();
    return this.userService.updateUserProfile(userId, body, image);
  }

  @Get('liked-memories')
  async getLikedMemories(
    @Session() session: SessionContainer,
    @Query('sort') sort?: MemorialContributionSortField,
    @Query('cursor') cursor?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = session.getUserId();
    return this.memoryService.getLikedMemories({ sort, cursor, order }, userId);
  }

  @Get('owned-memories')
  async getOwnedMemories(
    @Session() session: SessionContainer,
    @Query('sort') sort?: MemorialContributionSortField,
    @Query('cursor') cursor?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = session.getUserId();
    return this.memoryService.getOwnedMemories({ sort, cursor, order }, userId);
  }

  @Get('liked-condolences')
  async getLikedCondolences(
    @Session() session: SessionContainer,
    @Query('sort') sort?: MemorialContributionSortField,
    @Query('cursor') cursor?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = session.getUserId();
    return this.condolenceService.getLikedCondolences({ sort, cursor, order }, userId);
  }

  @Get('owned-donations')
  async getOwnedDonations(
    @Session() session: SessionContainer,
    @Query('sort') sort?: MemorialContributionSortField,
    @Query('cursor') cursor?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = session.getUserId();
    return this.donationService.getOwnedDonations({ sort, cursor, order }, userId);
  }

  @Get('liked-donations')
  async getLikedDonations(
    @Session() session: SessionContainer,
    @Query('sort') sort?: MemorialContributionSortField,
    @Query('cursor') cursor?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = session.getUserId();
    return this.donationService.getLikedDonations({ sort, cursor, order }, userId);
  }

  @Get('owned-condolences')
  async getOwnedCondolences(
    @Session() session: SessionContainer,
    @Query('sort') sort?: MemorialContributionSortField,
    @Query('cursor') cursor?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = session.getUserId();
    return this.condolenceService.getOwnedCondolences({ sort, cursor, order }, userId);
  }

  @Delete()
  async deleteUser(@Session() session: SessionContainer) {
    const userId = session.getUserId();
    return this.userService.deleteUser(userId);
  }
}
