import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { Session } from 'supertokens-nestjs';
import { MemorialContributionSortField } from '../interface/memorial.interface';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { PublishMemorialContributionResponse } from '../interface/memorial.dto';
import { PublicWithOptionalSession } from 'src/guard/optional-session.guard';
import { DonationService } from './donation.service';
import { CreateDonationRequest } from './interface/donation.dto';

@Controller('memorial/:slug/donation')
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @PublicWithOptionalSession()
  @Get()
  async getDonations(
    @Param('slug') slug: string,
    @Query('sort') sort: MemorialContributionSortField = MemorialContributionSortField.DATE,
    @Query('cursor') cursor?: string,
    @Session() session?: SessionContainer,
  ) {
    return await this.donationService.getDonations({ slug, sort, cursor }, session?.getUserId());
  }

  @PublicWithOptionalSession()
  @Get(':donationId')
  async getDonationById(
    @Param('donationId') donationId: string,
    @Session() session?: SessionContainer,
  ) {
    return this.donationService.getSingleDonation(donationId, session?.getUserId());
  }

  @Post()
  async createDonation(
    @Param('slug') slug: string,
    @Session() session: SessionContainer,
    @Body() request: CreateDonationRequest,
  ) {
    const userId = session.getUserId();
    return await this.donationService.createDonation({ ...request, slug, userId });
  }

  @Delete(':donationId')
  async deleteDonation(
    @Param('donationId') donationId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    return this.donationService.deleteDonation(userId, donationId);
  }

  @Post(':donationId/publish')
  async publishDonation(
    @Param('donationId') donationId: string,
    @Session() session: SessionContainer,
  ): Promise<PublishMemorialContributionResponse> {
    const userId = session.getUserId();
    return await this.donationService.publishDonation(userId, donationId);
  }

  @Post(':donationId/validate-purchase')
  async validatePurchase(
    @Param('slug') slug: string,
    @Param('donationId') donationId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return await this.donationService.validateDonationContributionPayment(
      slug,
      donationId,
      sessionId,
    );
  }

  @Post(':donationId/like')
  async likeDonation(
    @Param('donationId') donationId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    return this.donationService.likeDonation(userId, donationId);
  }

  @Delete(':donationId/like')
  async unlikeDonation(
    @Param('donationId') donationId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    return this.donationService.unlikeDonation(userId, donationId);
  }
}
