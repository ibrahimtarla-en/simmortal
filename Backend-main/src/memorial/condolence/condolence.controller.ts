import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Session } from 'supertokens-nestjs';
import { CondolenceService } from './condolence.service';
import { MemorialContributionSortField } from '../interface/memorial.interface';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { CreateCondolenceRequest, UpdateCondolencePayload } from './interface/condolence.dto';
import { PublishMemorialContributionResponse } from '../interface/memorial.dto';
import { PublicWithOptionalSession } from 'src/guard/optional-session.guard';
import { Condolence } from './interface/condolence.interface';

@Controller('memorial/:slug/condolence')
export class CondolenceController {
  constructor(private readonly condolenceService: CondolenceService) {}

  @PublicWithOptionalSession()
  @Get()
  async getCondolences(
    @Param('slug') slug: string,
    @Query('sort') sort: MemorialContributionSortField = MemorialContributionSortField.DATE,
    @Query('cursor') cursor?: string,
    @Session() session?: SessionContainer,
  ) {
    return await this.condolenceService.getCondolences(
      { slug, sort, cursor },
      session?.getUserId(),
    );
  }

  @Post()
  async createCondolence(
    @Param('slug') slug: string,
    @Session() session: SessionContainer,
    @Body() request: CreateCondolenceRequest,
  ) {
    const userId = session.getUserId();
    return await this.condolenceService.createCondolence({ ...request, slug, userId });
  }

  @Patch(':condolenceId')
  async updateCondolence(
    @Param('slug') slug: string,
    @Param('condolenceId') condolenceId: string,
    @Session() session: SessionContainer,
    @Body() payload: Partial<UpdateCondolencePayload>,
  ) {
    const userId = session.getUserId();
    return await this.condolenceService.updateCondolence(userId, condolenceId, payload);
  }

  @Delete(':condolenceId')
  async deleteCondolence(
    @Param('condolenceId') condolenceId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    return this.condolenceService.deleteCondolence(userId, condolenceId);
  }

  @Post(':condolenceId/preview')
  async getCondolencePreview(
    @Param('condolenceId') condolenceId: string,
    @Session() session: SessionContainer,
    @Body() overrides: Partial<Condolence>,
  ) {
    return this.condolenceService.getCondolencePreview(
      session.getUserId(),
      condolenceId,
      overrides,
    );
  }

  @Post(':condolenceId/publish')
  async publishCondolence(
    @Param('condolenceId') condolenceId: string,
    @Session() session: SessionContainer,
  ): Promise<PublishMemorialContributionResponse> {
    const userId = session.getUserId();
    return await this.condolenceService.publishCondolence(userId, condolenceId);
  }

  @Post(':condolenceId/validate-purchase')
  async validatePurchase(
    @Param('slug') slug: string,
    @Param('condolenceId') condolenceId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return await this.condolenceService.validateCondolenceContributionPayment(
      slug,
      condolenceId,
      sessionId,
    );
  }

  @Post(':condolenceId/like')
  async likeCondolence(
    @Param('condolenceId') condolenceId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    return this.condolenceService.likeCondolence(userId, condolenceId);
  }

  @Delete(':condolenceId/like')
  async unlikeC(
    @Param('condolenceId') condolenceId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    return this.condolenceService.unlikeCondolence(userId, condolenceId);
  }
}
